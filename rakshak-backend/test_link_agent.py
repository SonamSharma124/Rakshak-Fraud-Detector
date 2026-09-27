from agents.link_agent import check_links

tests = [
    "Congratulations! You won Rs 50,000. Claim at bit.ly/claim-prize-now",
    "Your A/C will be BLOCKED. Update KYC: http://sbi-kyc-update.in/verify",
    "Hey, check out the docs at https://docs.python.org/3/tutorial",
    "Meeting tomorrow at 3pm, no links here",
]

for t in tests:
    result = check_links(t)
    print("\nMESSAGE:", t[:55])
    print("  URLs found:", result["urls_found"], "| Risk:", result["overall_link_risk"])
    for r in result["results"]:
        print("  →", r["domain"], "|", r["risk"])
        for f in r["flags"]:
            print("     🚩", f)