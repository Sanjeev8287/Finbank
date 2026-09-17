import math
from typing import List, Dict


def cosine_similarity(
    vector_a: List[float],
    vector_b: List[float],
) -> float:
    """
    Calculate cosine similarity between two vectors.
    """

    if not vector_a or not vector_b:
        return 0.0

    if len(vector_a) != len(vector_b):
        return 0.0

    dot_product = sum(
        a * b
        for a, b in zip(vector_a, vector_b)
    )

    magnitude_a = math.sqrt(
        sum(a * a for a in vector_a)
    )

    magnitude_b = math.sqrt(
        sum(b * b for b in vector_b)
    )

    if magnitude_a == 0 or magnitude_b == 0:
        return 0.0

    return dot_product / (
        magnitude_a * magnitude_b
    )


def retrieve_documents(
    query_embedding: List[float],
    documents: List[Dict],
    top_k: int = 3,
) -> List[Dict]:
    """
    Find the most relevant document chunks.
    """

    if not query_embedding or not documents:
        return []

    scored_documents = []

    for document in documents:

        embedding = document.get("embedding")

        if not embedding:
            continue

        score = cosine_similarity(
            query_embedding,
            embedding,
        )

        scored_documents.append(
            {
                **document,
                "score": score,
            }
        )

    scored_documents.sort(
        key=lambda item: item["score"],
        reverse=True,
    )

    return scored_documents[:top_k]