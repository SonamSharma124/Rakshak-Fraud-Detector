import ollama
import json

from agents.link_agent import check_links





TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "check_links",
            "description": "Analyzes any URLs or links found in a message for scam red flags like URL shorteners, brand impersonation, missing HTTPS, or suspicious domains. Call this whenever the message contains a link or URL.",
            "parameters": {
                "type": "object",
                "properties": {
                    "text": {
                        "type": "string",
                        "description": "The full message text to scan for URLs"
                    }
                },
                "required": ["text"]
            }
        }
    }
]


def check_scam_with_tools(message_text):
    messages = [
        {
            "role": "user",
            "content": f"Analyze this message for fraud indicators. If it contains a link, use the check_links tool to inspect it before giving your analysis. Message: '{message_text}'"
        }
    ]

    response = ollama.chat(model="llama3.2", messages=messages, tools=TOOLS)

    tool_calls = response["message"].get("tool_calls")

    if tool_calls:
        messages.append(response["message"])

        for call in tool_calls:
            if call["function"]["name"] == "check_links":
                args = call["function"]["arguments"]
                tool_result = check_links(args["text"])

                messages.append({
                    "role": "tool",
                    "content": json.dumps(tool_result)
                })

        final_response = ollama.chat(model="llama3.2", messages=messages, tools=TOOLS)
        return final_response["message"]["content"], True
    else:
        return response["message"]["content"], False