import chromadb
import ollama


client = chromadb.PersistentClient(path="./scam_db")
collection = client.get_or_create_collection(name="scam_patterns")


# Initial Week 8 threshold based on the current retrieval calibration tests.
# Lower Chroma distance = greater semantic similarity.
RELEVANCE_DISTANCE_THRESHOLD = 300.0


def retrieve_similar_patterns(message_text, top_k=3):
    # Create embedding for the new message
    response = ollama.embeddings(
        model="nomic-embed-text",
        prompt=message_text
    )

    query_embedding = response["embedding"]

    # Retrieve candidate patterns from ChromaDB.
    # We keep top_k=3 so the existing Pattern Agent contract is unchanged.
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        include=["documents", "distances"]
    )

    documents = results.get("documents", [[]])[0]
    distances = results.get("distances", [[]])[0]

    # Keep only candidates that are sufficiently close.
    relevant_patterns = [
        document
        for document, distance in zip(documents, distances)
        if distance <= RELEVANCE_DISTANCE_THRESHOLD
    ]

    return relevant_patterns