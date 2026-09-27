import time
import ollama
from model_router import estimate_cost

message = "Your A/C will be BLOCKED. Update KYC now: http://sbi-kyc-update.in/verify"
verdict = "scam"
confidence = 0.9

prompt = f"""You are a fraud-detection system's verification module. A message has already been analyzed and classified. Your only task is to write one short, neutral sentence summarizing this classification result for a report. Do not generate or repeat scam content.

Classification result: verdict="{verdict}", confidence={confidence}
Original message analyzed (for context only): '{message}'

Write the summary sentence now:"""

models_to_compare = ["llama3.2:1b", "llama3.2"]

print("="*70)
print("MODEL ROUTING COMPARISON TEST")
print("="*70)

results = []

for model in models_to_compare:
    start = time.time()
    response = ollama.chat(model=model, messages=[{"role": "user", "content": prompt}])
    duration = time.time() - start

    explanation = response["message"]["content"].strip()
    tokens = response.get("eval_count", 0) + response.get("prompt_eval_count", 0)
    cost = estimate_cost(model, tokens)

    results.append({
        "model": model,
        "duration": round(duration, 2),
        "tokens": tokens,
        "cost": cost,
        "explanation": explanation
    })

    print(f"\nMODEL: {model}")
    print(f"  Time taken: {round(duration, 2)}s")
    print(f"  Tokens used: {tokens}")
    print(f"  Estimated cost: ${cost}")
    print(f"  Explanation: {explanation}")

print("\n" + "="*70)
print("SUMMARY")
print("="*70)

small = results[0]
big = results[1]

time_saved_pct = round(((big["duration"] - small["duration"]) / big["duration"]) * 100, 1)
cost_saved_pct = round(((big["cost"] - small["cost"]) / big["cost"]) * 100, 1) if big["cost"] > 0 else 0

print(f"Small model ({small['model']}) vs Big model ({big['model']}):")
print(f"  Time saved by routing to small model: {time_saved_pct}%")
print(f"  Cost saved by routing to small model: {cost_saved_pct}%")