import chromadb
import ollama
from scam_patterns import SCAM_PATTERNS

# ChromaDB client banao - yeh data ko laptop pe hi ek folder mein save karega
client = chromadb.PersistentClient(path="./scam_db")

# Ek "collection" banao - jaise ek table/folder database ke andar
collection = client.get_or_create_collection(name="scam_patterns")

# Har scam pattern ki embedding banake collection mein daalo
for pattern in SCAM_PATTERNS:
    response = ollama.embeddings(
        model="nomic-embed-text",
        prompt=pattern["text"]
    )
    embedding = response["embedding"]
    
    collection.add(
        ids=[pattern["id"]],
        embeddings=[embedding],
        documents=[pattern["text"]]
    )
    print(f"Added pattern {pattern['id']}: {pattern['text'][:50]}...")

print("\nDone! Total patterns in database:", collection.count())