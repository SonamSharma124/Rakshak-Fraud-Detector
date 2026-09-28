from retriever import retrieve_similar_patterns


tests = [
    (
        "SAFE",
        "Your grocery order has been delivered. Thanks for shopping with us. Have a great day!",
    ),
    (
        "SAFE",
        "Hi Rahul, our team meeting is scheduled for tomorrow at 10:30 AM. Please bring the project notes.",
    ),
    (
        "SAFE",
        "The office will remain closed this Saturday for routine maintenance. Regular working hours resume Monday.",
    ),
    (
        "SCAM",
        "Your bank KYC has expired. Update your details immediately using the link below or your account will be blocked.",
    ),
    (
        "SCAM",
        "Congratulations! You have won a cash prize of 5 lakh rupees. Pay the processing fee to claim your prize.",
    ),
    (
        "SCAM",
        "Congratulations, you have been selected for a high paying work from home job. Pay a small registration fee to complete your joining.",
    ),
]


for label, message in tests:
    print("\n========================================")
    print(f"TEST: {label}")
    print(f"Message: {message}")
    print("========================================")

    similar_patterns = retrieve_similar_patterns(message)

    if similar_patterns:
        print(f"Relevant patterns found: {len(similar_patterns)}")

        for i, pattern in enumerate(similar_patterns, 1):
            print(f"{i}. {pattern}")
    else:
        print("Relevant patterns found: 0")
        print("No sufficiently similar scam pattern retrieved.")