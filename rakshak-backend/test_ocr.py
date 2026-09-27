from ocr_reader import extract_text_from_image

test_image_path = "test_screenshot.png"

text = extract_text_from_image(test_image_path)

print("Extracted Text:")
print(text)