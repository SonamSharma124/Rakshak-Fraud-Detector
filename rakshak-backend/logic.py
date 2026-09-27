import ollama
import json
from retriever import retrieve_similar_patterns

def check_scam(message_text):
    # Step 1: Relevant patterns dhundo
    similar_patterns = retrieve_similar_patterns(message_text, top_k=3)
    evidence = "\n".join([f"- {p}" for p in similar_patterns])
    
    # Step 2: LLM ko evidence ke saath prompt do
    prompt = f"""You are a fraud detection assistant. Analyze this message using the known scam patterns below as reference evidence.

Known scam patterns (reference):
{evidence}

Message to analyze: '{message_text}'

Respond ONLY with valid JSON in this exact format:
{{"verdict": "scam" or "safe" or "suspicious", "confidence": a number between 0 and 1, "reason": "one short line explaining why, referencing which pattern matched if relevant"}}"""

    response = ollama.chat(
        model="llama3.2",
        format="json",
        messages=[{"role": "user", "content": prompt}]
    )
    
    return json.loads(response["message"]["content"])

from ocr_reader import extract_text_from_image

def check_scam_from_image(image_path):
    extracted_text = extract_text_from_image(image_path)
    result = check_scam(extracted_text)
    result["extracted_text"] = extracted_text  # taaki pata chale OCR ne kya padha
    return result


from transcriber import transcribe_audio

def check_scam_from_audio(audio_path):
    transcribed_text = transcribe_audio(audio_path)
    result = check_scam(transcribed_text)
    result["transcribed_text"] = transcribed_text
    return result