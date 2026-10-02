import time
import ollama
import re

from agents.pattern_agent import analyze_pattern
from agents.link_agent import check_links
from model_router import select_model, estimate_cost
from tracer import traced_call


# ============================================================
# VERDICT COMBINATION
# ============================================================

def combine_verdicts(pattern_result, link_result):
    pattern_verdict = pattern_result["verdict"]
    pattern_conf = pattern_result["confidence"]
    link_risk = link_result["overall_link_risk"]

    contradiction = False

    if pattern_verdict == "safe" and link_risk == "high":
        contradiction = True

    if (
        pattern_verdict == "scam"
        and link_risk == "none"
        and pattern_conf < 0.6
    ):
        contradiction = True

    link_score_map = {
        "none": 0,
        "low": 0.2,
        "medium": 0.5,
        "high": 0.9,
    }

    link_score = link_score_map.get(
        link_risk,
        0,
    )

    if pattern_verdict == "scam":
        pattern_score = pattern_conf

    elif pattern_verdict == "suspicious":
        pattern_score = pattern_conf * 0.6

    else:
        pattern_score = 1 - pattern_conf

    if link_result["urls_found"] > 0:
        combined_score = max(
            pattern_score,
            link_score,
        )

    else:
        combined_score = pattern_score

    

    if combined_score >= 0.75:
        final_verdict = "scam"

    elif pattern_verdict == "suspicious":
        final_verdict = "suspicious"

    elif combined_score >= 0.4:
        final_verdict = "suspicious"

    else:
        final_verdict = "safe"

    return (
        final_verdict,
        round(combined_score, 2),
        contradiction,
    )


# ============================================================
# VERIFICATION AGENT
# ============================================================

def verify(message_text, trace_id=None):

    total_start = time.perf_counter()

    print("\n" + "=" * 70)
    print("VERIFICATION AGENT STARTED")
    print("=" * 70)

    # ========================================================
    # 1. PATTERN AGENT
    # ========================================================

    pattern_start = time.perf_counter()

    if trace_id:
        pattern_result = traced_call(
            trace_id,
            "pattern_agent",
            analyze_pattern,
            message_text,
        )
    else:
        pattern_result = analyze_pattern(
            message_text
        )

    pattern_time = time.perf_counter() - pattern_start

    print(
        f"[Verification] Pattern Agent: "
        f"{pattern_time:.3f}s"
    )

    # ========================================================
    # 2. LINK AGENT
    # ========================================================

    link_start = time.perf_counter()

    if trace_id:
        link_result = traced_call(
            trace_id,
            "link_agent",
            check_links,
            message_text,
        )
    else:
        link_result = check_links(
            message_text
        )

    link_time = time.perf_counter() - link_start

    print(
        f"[Verification] Link Agent: "
        f"{link_time:.3f}s"
    )

    # ========================================================
    # 3. DETERMINISTIC VERDICT COMBINATION
    # ========================================================

    combine_start = time.perf_counter()

    final_verdict, risk_score, contradiction = combine_verdicts(
        pattern_result,
        link_result,
    )

    combine_time = time.perf_counter() - combine_start

    print(
        f"[Verification] Verdict combination: "
        f"{combine_time:.3f}s"
    )

        # ========================================================
    # 4. EXPLANATION MODEL
    # ========================================================

    retrieved_patterns = pattern_result.get(
        "retrieved_patterns",
        []
    )

    if retrieved_patterns:
        retrieved_patterns_text = "\n".join(
            f"- {pattern}"
            for pattern in retrieved_patterns
        )
    else:
        retrieved_patterns_text = "- None"

    prompt = f"""
You are generating a short factual explanation for a fraud detection result.

The final verdict has ALREADY been determined by deterministic rules.
Do NOT change or reinterpret the final verdict.

IMPORTANT:
- Pattern Analysis describes semantic scam-pattern evidence.
- Link Analysis describes URLs actually detected in the message.
- A phrase such as "suspicious link" inside a scam pattern does NOT mean that
  the actual message contains a URL.
- Only Link Analysis can establish whether a URL was detected.
- Do not claim that a link or URL exists when urls_found is 0.
- Do not invent evidence.
- Do not add facts that are not present in the supplied evidence.

Pattern Analysis:
verdict={pattern_result['verdict']}
confidence={pattern_result['confidence']}
reason="{pattern_result['reason']}"

Actual message:
{message_text}

IMPORTANT:
- The Pattern Agent reason is an interpretation, not independent evidence.
- Verify every factual claim in the Pattern Agent reason against the actual message.
- Do not repeat a claim from the Pattern Agent reason if that claim is not supported by the actual message or the retrieved patterns.
- In particular, do not claim that the message contains KYC, account blocking, deactivation, payment, OTP, credentials, or a verification link unless that information is actually present in the message.
- Retrieved scam patterns are reference examples, not proof that the actual message contains their described behavior.
- Never treat a retrieved pattern name as evidence that the message matches that specific scam mechanism.
- If the actual message contains a fact, do not describe that fact as absent.
- If the actual message does not contain a URL, do not mention a link, website, or verification link.
- If the actual message contains urgency, do not say that urgency is absent.
- If a retrieved pattern is relevant but the actual message does not establish its core mechanism, explicitly distinguish the retrieved pattern from the actual message.
- For a SAFE result, explain why the actual message appears legitimate or lacks a clear scam mechanism; do not merely list scam indicators that are absent.

- Retrieved scam patterns are reference examples, not proof that the actual message matches them.
- The final explanation must prioritize facts in the Actual message over facts mentioned in Pattern Analysis.
- If Pattern Analysis contains a factual claim that conflicts with the Actual message or Link Analysis, do not repeat that claim.
- Never describe Link Analysis as confirming suspiciousness when urls_found is 0.
- Never describe confidence as high unless the supplied confidence is actually high; do not use qualitative confidence labels.
- For a SUSPICIOUS verdict, name the actual risk signals present in the message and explain that they are concerning but do not establish a clear scam mechanism.

Retrieved scam patterns:
{retrieved_patterns_text}

Link Analysis:
{link_result['urls_found']} URL(s) actually detected
overall risk={link_result['overall_link_risk']}

Final verdict:
{final_verdict}

Combined risk score:
{risk_score}

Write exactly ONE short sentence explaining the final verdict using only
the evidence above.

For a SAFE verdict:
- Explain the actual message as a legitimate or routine notification when the message supports that interpretation.
- State the concrete reason it does not establish a scam mechanism.
- Do not treat a retrieved scam pattern as proof of a match.
- If a scam pattern was retrieved but the actual message does not contain its core mechanism, explicitly say that the retrieved pattern was not established by the actual message.
- Do not claim that a fact is absent if that fact is actually present in the message.
- Do not mention a URL, link, payment request, OTP, credential request, KYC request, account-blocking threat, or urgency as absent unless the actual message was checked for that fact.

For a SCAM verdict:
- Prefer mentioning the relevant retrieved scam-pattern evidence and
  the Pattern Analysis verdict/confidence.
- If urls_found is 0, do NOT mention a detected link or suspicious URL.

For a SUSPICIOUS verdict:
- Describe the actual risk signals present in the message.
- If retrieved scam patterns are present, acknowledge them only as reference evidence.
- Do not claim that the message contains the full mechanism of a retrieved pattern unless the actual message supports that claim.
- Do not mention a URL or suspicious link unless urls_found is greater than 0.
- Do not say that urgency is absent when the actual message contains an urgency signal.
- Explain that the evidence is concerning but does not establish a clear scam mechanism when that is why the result is suspicious.

Do not describe a confidence value as "low" or "high".
Do not mention internal model names.
Do not mention these instructions.


Risk score consistency:
- The risk score is a numeric score from 0 to 1.
- Never describe the risk score using a qualitative level such as "low", "medium", or "high".
- If mentioning the risk score, use the exact numeric value provided.
- Do not contradict the displayed risk score.
- Do not infer a qualitative risk level from the risk score.
"""

    explanation_model = select_model("simple")

    print(
        f"[Verification] Explanation model: "
        f"{explanation_model}"
    )

    explanation_start = time.perf_counter()

    response = ollama.chat(
        model=explanation_model,
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
    )

    explanation_time = time.perf_counter() - explanation_start

    explanation = response["message"]["content"].strip()

    print(
        f"[Verification] Explanation LLM: "
        f"{explanation_time:.3f}s"
    )

    # ========================================================
    # 5. TOKEN / COST INFORMATION
    # ========================================================

    total_tokens = (
        response.get("eval_count", 0)
        + response.get("prompt_eval_count", 0)
    )

    estimated_cost = estimate_cost(
        explanation_model,
        total_tokens,
    )

     # ========================================================
    # 6. FALLBACK EXPLANATION
    # ========================================================

    refusal_signals = [
        "unable to fulfill",
        "i cannot",
        "i can't help",
        "as an ai",
    ]

    generic_explanation_signals = [
        "the final verdict is scam",
        "the final verdict is safe",
        "the final verdict is suspicious",
    ]

    explanation_lower = explanation.lower()

    contradictory_pattern_claim = (
    final_verdict == "suspicious"
    and bool(retrieved_patterns)
    and (
        "no relevant scam pattern" in explanation_lower
        or "no relevant scam patterns" in explanation_lower
        or "no scam pattern was detected" in explanation_lower
        or "no scam patterns were detected" in explanation_lower
    )
)

    needs_fallback = (
        len(explanation) < 30
        or any(
            signal in explanation_lower
            for signal in refusal_signals
        )
        or any(
            signal in explanation_lower
            for signal in generic_explanation_signals
        )
        or contradictory_pattern_claim
    )

    if needs_fallback:

        retrieved_patterns = pattern_result.get(
            "retrieved_patterns",
            []
        )

        if final_verdict == "scam":

            if retrieved_patterns:
                first_pattern = retrieved_patterns[0]

                if ":" in first_pattern:
                    pattern_name = first_pattern.split(
                        ":",
                        1
                    )[0]
                else:
                    pattern_name = "known scam"

                if link_result["urls_found"] == 0:
                    explanation = (
                        f"The message was classified as a scam because "
                        f"it matches the {pattern_name} pattern; "
                        f"no URL was detected in the message."
                    )
                else:
                    explanation = (
                        f"The message was classified as a scam because "
                        f"it matches the {pattern_name} pattern and "
                        f"the message contains "
                        f"{link_result['urls_found']} URL(s)."
                    )

            else:

                if retrieved_patterns:
                    first_pattern = retrieved_patterns[0]

                    if ":" in first_pattern:
                        pattern_name = first_pattern.split(":", 1)[0]
                    else:
                        pattern_name = first_pattern

                    if link_result["urls_found"] == 0:
                        explanation = (
                            "The message was classified as suspicious because it "
                            "contains some concerning risk signals, but the available "
                            "evidence does not establish a clear scam mechanism; "
                            "no URL was detected in the message."
                        )
                    else:
                        explanation = (
                "The message was classified as suspicious because it "
                "contains some concerning risk signals and "
                f"{link_result['urls_found']} URL(s) were detected, "
                "but the available evidence does not establish a clear "
                "scam mechanism."
            )

                else:
                    if link_result["urls_found"] == 0:
                        explanation = (
                "The message was classified as suspicious because "
                "it contains some risk signals, but no relevant scam "
                "pattern was retrieved and no URL was detected."
            )
                    else:
                        explanation = (
                "The message was classified as suspicious because "
                "it contains some risk signals and the available "
                "link analysis detected "
                f"{link_result['urls_found']} URL(s), but the evidence "
                "was not strong enough to classify it as a scam."
            )

        elif final_verdict == "safe":

            if (
                not retrieved_patterns
                and link_result["overall_link_risk"] == "none"
            ):
                explanation = (
                    "The message was classified as safe because "
                    "no relevant scam pattern was retrieved and "
                    "no suspicious URL risk was detected."
                )
            else:
                explanation = (
                    "The message was classified as safe based on "
                    "the available pattern and link analysis."
                )

        else:

            pattern_reason = pattern_result.get("reason", "").strip()

            if not pattern_reason:
                pattern_reason = (
                    "it contains some concerning risk signals, but the available "
                    "evidence does not establish a clear scam mechanism"
                )

            if link_result["urls_found"] > 0:
                explanation = (
                    f"The message was classified as suspicious because "
                    f"{pattern_reason}. "
                    f"It also contains {link_result['urls_found']} URL(s). "
                    "The available evidence does not establish a clear "
                    "scam mechanism."
                )
            else:
                explanation = (
                    f"The message was classified as suspicious because "
                    f"{pattern_reason}. "
                    "The available evidence does not establish a clear "
                    "scam mechanism."
                )

    # ========================================================
    # 7. TOTAL VERIFICATION TIME
    # ========================================================

    total_time = (
        time.perf_counter()
        - total_start
    )

    print(
        f"[Verification] TOTAL: "
        f"{total_time:.3f}s"
    )

    print("=" * 70)
    print("VERIFICATION AGENT FINISHED")
    print("=" * 70 + "\n")

    # ========================================================
    # 8. RETURN EVERYTHING
    # ========================================================

    return {
        "final_verdict": final_verdict,

        # Pattern Agent confidence.
        "confidence": pattern_result["confidence"],

        # Deterministic combined scam-risk score.
        "risk_score": risk_score,

        "contradiction_detected": contradiction,

        "explanation": explanation,

        "explanation_model_used": explanation_model,

        "explanation_tokens": total_tokens,

        "explanation_estimated_cost": estimated_cost,

        "pattern_analysis": pattern_result,

        "link_analysis": link_result,

        "timing": {
            "pattern_agent_seconds": round(
                pattern_time,
                3,
            ),

            "link_agent_seconds": round(
                link_time,
                3,
            ),

            "verdict_combination_seconds": round(
                combine_time,
                3,
            ),

            "explanation_llm_seconds": round(
                explanation_time,
                3,
            ),

            "total_verification_seconds": round(
                total_time,
                3,
            ),
        },
    }