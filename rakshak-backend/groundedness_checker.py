import re

STOP_WORDS = {
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "to", "of", "and", "or", "in", "on", "at", "for", "with", "by",
    "this", "that", "it", "as", "from", "via", "via", "matches", "match"
}


def extract_keywords(text):
    text = text.lower()
    words = re.findall(r'\b[a-z]+\b', text)
    keywords = [w for w in words if w not in STOP_WORDS and len(w) > 2]
    return set(keywords)


def calculate_groundedness(reason, evidence_list):
    reason_keywords = extract_keywords(reason)

    if not reason_keywords:
        return 0.0, []

    evidence_text = " ".join(evidence_list)
    evidence_keywords = extract_keywords(evidence_text)

    matched = reason_keywords.intersection(evidence_keywords)

    score = len(matched) / len(reason_keywords)
    return round(score, 2), list(matched)