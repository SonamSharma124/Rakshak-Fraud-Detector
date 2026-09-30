from agents.verification_agent import verify

tests = [
    "Your monthly bank statement is now available. Please review it in your usual banking app.",
    "You can update your account security settings from the official banking app at any time.",
    "Your electricity payment was successfully processed. Thank you.",
    "HR has scheduled your annual employee verification meeting for next week.",
    "The HR team will conduct the routine annual KYC review for all employees.",
    "The school office has updated the parent contact information for this academic year.",
    "Your account verification appointment is confirmed for Monday at 10 AM.",
    "The payment portal will be unavailable tonight for scheduled maintenance.",
    "All employees must complete the annual HR compliance training by Friday.",
]

for message in tests:
    print("\n" + "=" * 70)
    print("MESSAGE:")
    print(message)

    result = verify(message)

    print("VERDICT:", result["final_verdict"])
    print("CONFIDENCE:", result["confidence"])
    print("RISK SCORE:", result["risk_score"])
    print("CONTRADICTION:", result["contradiction_detected"])
    print("REASON:", result["pattern_analysis"]["reason"])