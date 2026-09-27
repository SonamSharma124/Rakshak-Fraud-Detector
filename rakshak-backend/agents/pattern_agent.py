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
{{"verdict": "scam" or "safe" or "suspicious", "confidence": a number between 0 and 1, "reason": "one short line explaining why, referencing which pattern matched if relevant"}}"""

    pattern_model = select_model("complex")
    response = ollama.chat(
        model=pattern_model,
        format="json",
        messages=[{"role": "user", "content": prompt}]
    )

    result = json.loads(response["message"]["content"])
    result["retrieved_patterns"] = similar_patterns
    result["pattern_model_used"] = pattern_model

    groundedness_score, matched_keywords = calculate_groundedness(result["reason"], similar_patterns)
    result["groundedness_score"] = groundedness_score
    result["groundedness_matched_keywords"] = matched_keywords

    return result