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


REASON GROUNDING RULES:
- The reason must contain only facts that are explicitly supported by the actual message.
- Retrieved patterns are reference evidence only. They do not establish that the actual message contains the behavior described in the pattern.
- Do not copy details from a retrieved pattern into the reason unless those details are actually present in the message.
- Do not mention a URL, link, website, verification link, payment link, or web address unless the actual message contains one.
- Do not say that urgency is absent when the actual message contains urgency signals such as "immediately", "urgent", "today", "within 24 hours", "as soon as possible", or similar wording.
- Do not mention a specific entity or mechanism such as Demat, FASTag, KYC, courier fee, OTP, PIN, CVV, payment, or account credentials unless it is actually present in the message.
- If the message contains only general risk signals, describe those signals directly instead of forcing a specific retrieved scam pattern into the reason.
- The reason should explain the classification using the actual message, not merely repeat the name or wording of a retrieved pattern.
- Distinguish between a behavior being requested or performed and the message merely mentioning or warning about that behavior.
- A message that warns the user not to perform a risky action must not be classified as containing that risky action.
- Do not infer a scam mechanism from the presence of a security term alone; the actual behavior associated with the mechanism must be present.
- Pay attention to negation and protective instructions such as "do not share", "never disclose", "do not click", "no payment required", or similar wording.
- When evaluating OTP or credential-related messages, distinguish requests from prohibitions. Phrases such as "do not share", "never share", "do not disclose", or "never disclose" mean the message is warning the user not to perform the risky action; they are not requests to perform it. A message that provides an OTP and tells the recipient not to share it should not be classified as an OTP-sharing scam.
"""

    pattern_model = select_model("complex")
    response = ollama.chat(
        model=pattern_model,
        format="json",
        options={"temperature": 0},
        messages=[{"role": "user", "content": prompt}]
    )

    result = json.loads(response["message"]["content"])
    # Protect against false positives where the message explicitly warns
# the recipient not to share an OTP.
    protective_otp_warning = (
        "otp" in message_text.lower()
         and any(
            phrase in message_text.lower()
            for phrase in [
                "do not share",
                "don't share",
                "never share",
                "do not disclose",
                "don't disclose",
                "never disclose",
           ]
        )
   )
    if protective_otp_warning and result.get("verdict") != "scam":
            result["verdict"] = "safe"
            result["confidence"] = 0.9
            result["reason"] = (
                "The message provides an OTP and explicitly warns the recipient "
                "not to share or disclose it; it does not request OTP disclosure."
           )

            # Protect legitimate payment confirmations from being classified
# as payment-request scams.
    lower_message = message_text.lower()

    payment_confirmation = (
        any(phrase in lower_message for phrase in [
            "payment was successfully received",
            "payment has been successfully received",
            "successfully received for your electricity bill",
            "payment received",
            "transaction successful",
            "payment successful",
        ])
        and "transaction id" in lower_message
    )

    if payment_confirmation and result.get("verdict") != "scam":
        result["verdict"] = "safe"
        result["confidence"] = 0.9
        result["reason"] = (
            "The message confirms that a payment was successfully received "
            "and provides a transaction ID; it does not request payment or "
            "contain a clear scam mechanism."
        )
    # Prevent unsupported URL/link claims when the actual message
# does not contain a URL.
    reason = result.get("reason", "")
    if "http://" not in message_text.lower() and "https://" not in message_text.lower():

        reason = reason.replace(
             "verification link",
             "verification request"
             )
        reason = reason.replace(
             "verification links",
             "verification requests"
             )
        reason = reason.replace(
             "suspicious link",
             "suspicious request"
             )
        reason = reason.replace(
             "suspicious links",
             "suspicious requests"
             )

    result["reason"] = reason
    result["retrieved_patterns"] = similar_patterns
    result["pattern_model_used"] = pattern_model

    groundedness_score, matched_keywords = calculate_groundedness(result["reason"], similar_patterns)
    result["groundedness_score"] = groundedness_score
    result["groundedness_matched_keywords"] = matched_keywords

    return result
