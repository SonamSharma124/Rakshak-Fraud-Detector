import ollama

text = "Congratulations! You won Rs 50,000, click here to claim"

response = ollama.embeddings(
    model="nomic-embed-text",
    prompt=text
)

embedding = response["embedding"]

print("Embedding length:", len(embedding))
print("First 5 numbers:", embedding[:5])