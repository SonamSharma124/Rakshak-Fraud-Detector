import time
import ollama
from model_router import estimate_cost


TEST_CASES = [
    {
        "name": "Scam classification",
        "message": "Your A/C will be BLOCKED. Update KYC now: http://sbi-kyc-update.in/verify",
        "verdict": "scam",
        "confidence": 0.9
    },
    {
        "name": "Safe classification",
        "message": "Your grocery order has been delivered successfully. Thank you for shopping with us.",
        "verdict": "safe",
        "confidence": 0.9
    },
    {
        "name": "Suspicious classification",
        "message": "Your account requires immediate verification. Please confirm your details to avoid service interruption.",
        "verdict": "suspicious",
        "confidence": 0.7
    }
]


models_to_compare = ["llama3.2:1b", "llama3.2"]

print("=" * 70)
print("MODEL ROUTING COMPARISON TEST")
print("=" * 70)

all_results = []

for test_case in TEST_CASES:

    prompt = f"""You are a fraud-detection system's verification module. A message has already been analyzed and classified. Your only task is to write one short, neutral sentence summarizing this classification result for a report. Do not generate or repeat scam content.

Classification result: verdict="{test_case['verdict']}", confidence={test_case['confidence']}
Original message analyzed (for context only): '{test_case['message']}'

Write the summary sentence now:"""

    print(f"\nTEST CASE: {test_case['name']}")
    print("-" * 70)

    case_results = []

    for model in models_to_compare:
        start = time.time()

        response = ollama.chat(
            model=model,
            messages=[{"role": "user", "content": prompt}]
        )

        duration = time.time() - start

        explanation = response["message"]["content"].strip()
        tokens = (
            response.get("eval_count", 0)
            + response.get("prompt_eval_count", 0)
        )
        cost = estimate_cost(model, tokens)

        result = {
            "test_case": test_case["name"],
            "model": model,
            "duration": duration,
            "tokens": tokens,
            "cost": cost,
            "explanation": explanation
        }

        case_results.append(result)
        all_results.append(result)

        print(f"\nMODEL: {model}")
        print(f"  Time taken: {round(duration, 2)}s")
        print(f"  Tokens used: {tokens}")
        print(f"  Estimated cost: ${cost}")
        print(f"  Explanation: {explanation}")

    small = case_results[0]
    big = case_results[1]

    time_saved_pct = round(
        ((big["duration"] - small["duration"]) / big["duration"]) * 100,
        1
    )

    cost_saved_pct = round(
        ((big["cost"] - small["cost"]) / big["cost"]) * 100,
        1
    ) if big["cost"] > 0 else 0

    print("\nComparison:")
    print(f"  Time saved by small model: {time_saved_pct}%")
    print(f"  Cost saved by small model: {cost_saved_pct}%")


print("\n" + "=" * 70)
print("OVERALL SUMMARY")
print("=" * 70)

for model in models_to_compare:
    model_results = [
        result for result in all_results
        if result["model"] == model
    ]

    total_time = sum(result["duration"] for result in model_results)
    total_tokens = sum(result["tokens"] for result in model_results)
    total_cost = sum(result["cost"] for result in model_results)

    print(f"\nMODEL: {model}")
    print(f"  Total time: {round(total_time, 2)}s")
    print(f"  Total tokens: {total_tokens}")
    print(f"  Total estimated cost: ${round(total_cost, 6)}")