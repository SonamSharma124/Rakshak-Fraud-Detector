from tool_calling_agent import check_scam_with_tools

tests = [
    "Your A/C will be BLOCKED. Update KYC now: http://sbi-kyc-update.in/verify",
    "Hey, are we still meeting for lunch tomorrow?",
]

for t in tests:
    print("\nMESSAGE:", t)
    answer, used_tool = check_scam_with_tools(t)
    print("Tool used:", used_tool)
    print("LLM response:", answer)