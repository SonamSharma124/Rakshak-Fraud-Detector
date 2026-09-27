import chromadb
import ollama

client = chromadb.PersistentClient(path="./scam_db")
collection = client.get_or_create_collection(name="scam_patterns")

def retrieve_similar_patterns(message_text, top_k=3):
    # Naye message ki embedding banao
    response = ollama.embeddings(
        model="nomic-embed-text",
        prompt=message_text
    )
    query_embedding = response["embedding"]
    
    # ChromaDB mein sabse similar patterns dhundo
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )
    
    return results["documents"][0]  # sirf text wapas do