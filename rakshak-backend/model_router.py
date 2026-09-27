MODELS = {
    "simple": "llama3.2:1b",
    "complex": "llama3.2"
}


def select_model(task_type):
    if task_type not in MODELS:
        raise ValueError(f"Unknown task_type: {task_type}. Use 'simple' or 'complex'.")
    return MODELS[task_type]


# Approximate cost per 1000 tokens (based on typical API pricing, for demonstration)
COST_PER_1K_TOKENS = {
    "llama3.2:1b": 0.0001,   # chhota model - hypothetically sasta
    "llama3.2": 0.0006       # bada model - hypothetically mehenga
}


def estimate_cost(model_name, total_tokens):
    rate = COST_PER_1K_TOKENS.get(model_name, 0.0005)
    cost = (total_tokens / 1000) * rate
    return round(cost, 6)