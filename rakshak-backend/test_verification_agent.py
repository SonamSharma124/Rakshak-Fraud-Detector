from agents.verification_agent import verify

tests = [
    "Your A/C will be BLOCKED. Update KYC now: http://sbi-kyc-update.in/verify",
    "Hey, are we still meeting for lunch tomorrow?",
]

for t in tests:
    print("\n" + "="*60)
    print("MESSAGE:", t)
    result = verify(t)
    print("Final Verdict:", result["final_verdict"])
    print("Confidence:", result["confidence"])
    print("Contradiction Detected:", result["contradiction_detected"])
    print("Explanation:", result["explanation"])
    print("Explanation Model Used:", result["explanation_model_used"])
    print("Tokens Used:", result["explanation_tokens"])
    print("Estimated Cost:", result["explanation_estimated_cost"])