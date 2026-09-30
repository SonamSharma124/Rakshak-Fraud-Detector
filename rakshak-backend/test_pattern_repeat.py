from agents.pattern_agent import analyze_pattern


messages = [
    "Your SIM card will be deactivated within 24 hours. Update your KYC details using the verification link.",
    "Your courier delivery is on hold because of an address problem. Pay Rs 50 through the link immediately to reschedule delivery."
]


for run_number in range(1, 4):
    print("\n" + "=" * 70)
    print(f"RUN {run_number}")
    print("=" * 70)

    for message in messages:
        print("\nMESSAGE:")
        print(message)

        result = analyze_pattern(message)

        print("\nVERDICT:", result["verdict"])
        print("CONFIDENCE:", result["confidence"])
        print("REASON:", result["reason"])
        print("GROUNDEDNESS:", result["groundedness_score"])
        print("RETRIEVED PATTERNS:")

        for pattern in result["retrieved_patterns"]:
            print("-", pattern)
