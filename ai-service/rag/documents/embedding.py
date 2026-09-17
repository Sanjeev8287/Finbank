import os
from typing import List

from openai import OpenAI
from dotenv import load_dotenv


load_dotenv()


GROQ_API_KEY = os.getenv("GROQ_API_KEY")


if not GROQ_API_KEY:
    raise ValueError(
        "GROQ_API_KEY is not configured in .env"
    )


client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1",
)


def create_embedding(text: str) -> List[float]:
    """
    Create an embedding for the given text.

    Note:
    Groq's OpenAI-compatible chat API does not provide
    a general-purpose embedding endpoint, so this function
    uses a local sentence-transformers model.
    """

    try:
        from sentence_transformers import SentenceTransformer

    except ImportError:
        raise ImportError(
            "sentence-transformers is not installed. "
            "Run: pip install sentence-transformers"
        )

    model = SentenceTransformer(
        "all-MiniLM-L6-v2"
    )

    embedding = model.encode(
        text,
        normalize_embeddings=True,
    )

    return embedding.tolist()


def create_embeddings(
    texts: List[str],
) -> List[List[float]]:
    """
    Create embeddings for multiple text chunks.
    """

    if not texts:
        return []

    try:
        from sentence_transformers import SentenceTransformer

    except ImportError:
        raise ImportError(
            "sentence-transformers is not installed. "
            "Run: pip install sentence-transformers"
        )

    model = SentenceTransformer(
        "all-MiniLM-L6-v2"
    )

    embeddings = model.encode(
        texts,
        normalize_embeddings=True,
    )

    return [
        embedding.tolist()
        for embedding in embeddings
    ]