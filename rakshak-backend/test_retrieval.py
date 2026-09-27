from retriever import retrieve_similar_patterns

test_message = "Sir aapka parcel customs mein atka hai, 200 rupay bhejo release karne ke liye"

similar = retrieve_similar_patterns(test_message)

print("Query:", test_message)
print("\nSimilar patterns found:")
for i, pattern in enumerate(similar, 1):
    print(f"{i}. {pattern}")