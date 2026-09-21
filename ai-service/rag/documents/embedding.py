import re
import math
import hashlib
from typing import List


EMBEDDING_DIMENSION = 768


def _tokenize(text: str) -> List[str]:
    text = text.lower()

    words = re.findall(r"[a-z0-9]+", text)

    stop_words = {
        "the", "is", "are", "a", "an", "and", "or", "of",
        "to", "for", "in", "on", "at", "by", "with", "from",
        "what", "which", "how", "can", "do", "does", "i",
        "my", "me", "you", "your", "be", "this", "that"
    }

    return [
        word
        for word in words
        if word not in stop_words and len(word) > 1
    ]


def _hash_index(token: str) -> int:
    digest = hashlib.md5(token.encode("utf-8")).digest()
    number = int.from_bytes(digest[:8], byteorder="big")
    return number % EMBEDDING_DIMENSION


def create_embedding(text: str) -> List[float]:
    if not text or not text.strip():
        return [0.0] * EMBEDDING_DIMENSION

    tokens = _tokenize(text)

    vector = [0.0] * EMBEDDING_DIMENSION

    # Word features
    for token in tokens:
        index = _hash_index(token)
        vector[index] += 1.0

    # Two-word phrase features
    for index in range(len(tokens) - 1):
        phrase = f"{tokens[index]}_{tokens[index + 1]}"
        vector[_hash_index(phrase)] += 1.5

    # Normalize vector
    magnitude = math.sqrt(sum(value * value for value in vector))

    if magnitude == 0:
        return vector

    return [value / magnitude for value in vector]


def create_embeddings(texts: List[str]) -> List[List[float]]:
    if not texts:
        return []

    return [create_embedding(text) for text in texts]