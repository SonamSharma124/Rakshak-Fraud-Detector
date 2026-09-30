import json
from agents.verification_agent import verify


DATASET_PATH = "evaluation/evaluation_dataset.json"


def calculate_metrics(results):
    tp = sum(
        1
        for r in results
        if r["expected_label"] == "scam"
        and r["predicted_binary"] == "scam"
    )

    tn = sum(
        1
        for r in results
        if r["expected_label"] == "safe"
        and r["predicted_binary"] == "safe"
    )

    fp = sum(
        1
        for r in results
        if r["expected_label"] == "safe"
        and r["predicted_binary"] == "scam"
    )

    fn = sum(
        1
        for r in results
        if r["expected_label"] == "scam"
        and r["predicted_binary"] == "safe"
    )

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0

    f1 = (
        2 * precision * recall / (precision + recall)
        if (precision + recall) > 0
        else 0
    )

    false_positive_rate = (
        fp / (fp + tn)
        if (fp + tn) > 0
        else 0
    )

    false_negative_rate = (
        fn / (fn + tp)
        if (fn + tp) > 0
        else 0
    )

    return {
        "true_positive": tp,
        "true_negative": tn,
        "false_positive": fp,
        "false_negative": fn,
        "precision": precision,
        "recall": recall,
        "f1_score": f1,
        "false_positive_rate": false_positive_rate,
        "false_negative_rate": false_negative_rate,
    }


def main():
    with open(DATASET_PATH, "r", encoding="utf-8") as file:
        dataset = json.load(file)

    print("=" * 70)
    print("RAKSHAK 50-CASE EVALUATION")
    print("=" * 70)
    print(f"Dataset size: {len(dataset)}")
    print()

    results = []

    for index, case in enumerate(dataset, start=1):
        print("-" * 70)
        print(f"CASE {index}/{len(dataset)}")
        print(f"Expected: {case['expected_label']}")
        print(f"Message: {case['message']}")

        result = verify(case["message"])

        predicted_verdict = result["final_verdict"]

        # Binary evaluation:
        # scam = positive class
        # safe/suspicious = non-scam
        predicted_binary = (
            "scam"
            if predicted_verdict == "scam"
            else "safe"
        )

        evaluation_result = {
            "id": case["id"],
            "expected_label": case["expected_label"],
            "predicted_verdict": predicted_verdict,
            "predicted_binary": predicted_binary,
            "risk_score": result["risk_score"],
            "confidence": result["confidence"],
            "contradiction_detected": result["contradiction_detected"],
        }

        results.append(evaluation_result)

        print(f"Predicted: {predicted_verdict}")
        print(f"Binary prediction: {predicted_binary}")
        print(f"Risk score: {result['risk_score']}")
        print(f"Confidence: {result['confidence']}")

    metrics = calculate_metrics(results)

    scam_count = sum(
        1 for r in results
        if r["predicted_verdict"] == "scam"
    )

    suspicious_count = sum(
        1 for r in results
        if r["predicted_verdict"] == "suspicious"
    )

    safe_count = sum(
        1 for r in results
        if r["predicted_verdict"] == "safe"
    )

    print("\n")
    print("=" * 70)
    print("EVALUATION SUMMARY")
    print("=" * 70)

    print(f"Total cases: {len(results)}")
    print()

    print("Predicted verdict distribution:")
    print(f"  Scam:       {scam_count}")
    print(f"  Suspicious: {suspicious_count}")
    print(f"  Safe:       {safe_count}")
    print()

    print("Confusion Matrix:")
    print(f"  True Positives (TP):   {metrics['true_positive']}")
    print(f"  True Negatives (TN):   {metrics['true_negative']}")
    print(f"  False Positives (FP):  {metrics['false_positive']}")
    print(f"  False Negatives (FN):  {metrics['false_negative']}")
    print()

    print("Metrics:")
    print(f"  Precision:             {metrics['precision']:.3f}")
    print(f"  Recall:                {metrics['recall']:.3f}")
    print(f"  F1 Score:              {metrics['f1_score']:.3f}")
    print(
        f"  False Positive Rate:   "
        f"{metrics['false_positive_rate']:.3f}"
    )
    print(
        f"  False Negative Rate:   "
        f"{metrics['false_negative_rate']:.3f}"
    )

    print("=" * 70)


if __name__ == "__main__":
    main()