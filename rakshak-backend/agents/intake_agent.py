import os
from ocr_reader import extract_text_from_image
from transcriber import transcribe_audio

IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".bmp", ".webp"]
AUDIO_EXTENSIONS = [".wav", ".mp3", ".m4a", ".ogg", ".flac"]


def detect_input_type(input_data, is_file_path=False):
    if not is_file_path:
        return "text"

    extension = os.path.splitext(input_data)[1].lower()

    if extension in IMAGE_EXTENSIONS:
        return "image"
    elif extension in AUDIO_EXTENSIONS:
        return "audio"
    else:
        return "unknown"


def intake(input_data, is_file_path=False):
    input_type = detect_input_type(input_data, is_file_path)

    if input_type == "text":
        extracted_text = input_data
    elif input_type == "image":
        extracted_text = extract_text_from_image(input_data)
    elif input_type == "audio":
        extracted_text = transcribe_audio(input_data)
    else:
        raise ValueError(f"Unsupported file type: {input_data}")

    return {
        "input_type": input_type,
        "extracted_text": extracted_text
    }