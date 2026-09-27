import ollama
import json

def check_scam(message_text):
    response = ollama.chat(
        model="llama3.2",
        format="json",
        messages=[
            {
                "role": "user",
                "content": f"""Analyze this message and respond ONLY with valid JSON in this exact format:
{{"verdict": "scam" or "safe" or "suspicious", "confidence": a number between 0 and 1, "reason": "one short line explaining why"}}

Message: '{message_text}'"""
            }
        ]
    )
    return json.loads(response["message"]["content"])


# Testing with different messages
test1 = check_scam("Congratulations! You have won Rs 10,00,000. Click this link to claim: bit.ly/xyz123")
print(test1)

test2 = check_scam("Hey, are we still meeting for lunch tomorrow at 1pm?")
print(test2)