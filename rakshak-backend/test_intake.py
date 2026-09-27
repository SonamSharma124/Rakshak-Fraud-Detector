from agents.intake_agent import intake

# Test 1: Direct text
r1 = intake("Congratulations! You won Rs 50,000, click bit.ly/abc")
print("TEXT →", r1["input_type"], "|", r1["extracted_text"][:60])

# Test 2: Image
r2 = intake("test_screenshot.png", is_file_path=True)
print("IMAGE →", r2["input_type"], "|", r2["extracted_text"][:60])

# Test 3: Audio
r3 = intake("test_voice.wav", is_file_path=True)
print("AUDIO →", r3["input_type"], "|", r3["extracted_text"][:60])