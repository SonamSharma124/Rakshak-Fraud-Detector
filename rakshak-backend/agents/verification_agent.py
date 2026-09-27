import time
import ollama

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

    final_verdict, confidence, contradiction = combine_verdicts(
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

    prompt = f"""
You are a verification agent reviewing two pieces of evidence about a message.

Pattern Analysis:
verdict={pattern_result['verdict']},
confidence={pattern_result['confidence']},
reason="{pattern_result['reason']}"

Link Analysis:
{link_result['urls_found']} URL(s) found,
overall risk={link_result['overall_link_risk']}

Based on BOTH pieces of evidence, write one short sentence explaining
the final verdict "{final_verdict}" (confidence {confidence}).

{"Note: there is a contradiction between the two analyses - mention this."
 if contradiction
 else ""}
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

    if (
        len(explanation) < 15
        or any(
            signal in explanation.lower()
            for signal in refusal_signals
        )
    ):
        explanation = (
            f"Pattern analysis: "
            f"{pattern_result['reason']}. "
            f"Link analysis: "
            f"{link_result['urls_found']} URL(s) "
            f"found with "
            f"{link_result['overall_link_risk']} risk."
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

        "confidence": confidence,

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