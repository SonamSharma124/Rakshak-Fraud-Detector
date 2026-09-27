from groundedness_checker import calculate_groundedness

# Test 1: Achha grounded case (reason evidence se match karta hai)
reason1 = "matches KYC update scam pattern, urgent request to verify account"
evidence1 = [
    "KYC update scam: Message pretends to be from your bank asking you to update KYC details urgently via a link, or your account will be blocked."
]
score1, matched1 = calculate_groundedness(reason1, evidence1)
print("Test 1 (should be HIGH):", score1, "| Matched:", matched1)

# Test 2: Ungrounded case (reason evidence se disconnected hai - hallucination simulate kiya)
reason2 = "matches lottery prize winning notification with cryptocurrency payment"
evidence2 = [
    "KYC update scam: Message pretends to be from your bank asking you to update KYC details urgently via a link, or your account will be blocked."
]
score2, matched2 = calculate_groundedness(reason2, evidence2)
print("Test 2 (should be LOW):", score2, "| Matched:", matched2)