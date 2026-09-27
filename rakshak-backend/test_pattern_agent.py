from agents.pattern_agent import analyze_pattern

result = analyze_pattern("Please send the documents to my new email address as soon as possible, it's urgent.")

print("Verdict:", result["verdict"])
print("Confidence:", result["confidence"])
print("Reason:", result["reason"])
print("\nGroundedness Score:", result["groundedness_score"])
print("Groundedness Matched Keywords:", result["groundedness_matched_keywords"])

print("\nRetrieved patterns:")
for p in result["retrieved_patterns"]:
    print(" -", p)