import ollama
import json
from retriever import retrieve_similar_patterns
from groundedness_checker import calculate_groundedness
from model_router import select_model


def analyze_pattern(message_text):
    similar_patterns = retrieve_similar_patterns(message_text, top_k=3)
    evidence = "\n".join([f"- {p}" for p in similar_patterns])

    prompt = f"""You are a fraud pattern detection assistant. Analyze this message using the known scam patterns below as reference evidence.

Known scam patterns (reference):
{evidence}

Message to analyze: '{message_text}'

Respond ONLY with valid JSON in this exact format:
{{"verdict": "scam" or "safe" or "suspicious", "confidence": a number between 0 and 1, "reason": "one short line explaining why, referencing which pattern matched if relevant"}}

Classification guidance:
- Use the retrieved scam patterns as reference evidence, not as an automatic verdict.
- Classify as "scam" when the message itself clearly exhibits the scam behavior described by a retrieved pattern. The specific evidence required depends on the pattern. For FASTag/toll scams, an urgent reactivation, verification, recharge, or payment request combined with a link is sufficient; an OTP, PIN, or card-details request is not required.
- Classify as "suspicious" when the message contains some risk signals but the evidence is not strong enough to establish a clear scam.
- Classify as "safe" when the message is a normal informational or legitimate transaction/update and does not contain a clear scam mechanism.
- Base the verdict on both the actual message and the retrieved patterns.
- For a retrieved pattern describing a specific scam mechanism, classify as "scam" when the message contains the key behavior of that mechanism. For example, an unpaid traffic penalty combined with an immediate payment request and a link matches a fake e-challan/traffic-penalty scam pattern; do not require the message to explicitly mention the official government portal or to contain OTP/PIN/card details.
- Do not classify a message as a scam merely because it shares keywords or topic words with a retrieved scam pattern.
- A clear FASTag/toll scam should be classified as "scam" when it combines the FASTag/toll context with an urgent payment, reactivation, verification, blacklisting, or suspicious-link request.
- For KYC or account-update scams, a threat of service/account deactivation or blocking combined with a verification/update link is sufficient to classify the message as "scam". A stated deadline such as "within 24 hours" is an explicit urgency signal. Do not require a payment request, OTP, PIN, card details, or other financial credential request.
- When a message contains all three elements of a KYC scam mechanism—(1) a service/account deactivation or blocking threat, (2) a KYC/update request, and (3) a verification link—classify it as "scam", not "suspicious". These three elements together are sufficient evidence; do not downgrade the verdict because there is no payment, OTP, PIN, or card-details request.
- For delivery/courier scams, a delivery problem or hold combined with a fee/payment request and a link is sufficient to classify the message as "scam"; do not require OTP, card details, or a large payment amount.
"""

    pattern_model = select_model("complex")
    response = ollama.chat(
        model=pattern_model,
        format="json",
        options={"temperature": 0},
        messages=[{"role": "user", "content": prompt}]
    )

    result = json.loads(response["message"]["content"])
    result["retrieved_patterns"] = similar_patterns
    result["pattern_model_used"] = pattern_model

    groundedness_score, matched_keywords = calculate_groundedness(result["reason"], similar_patterns)
    result["groundedness_score"] = groundedness_score
    result["groundedness_matched_keywords"] = matched_keywords

    return result