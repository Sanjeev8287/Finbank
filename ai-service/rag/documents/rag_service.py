import os
from typing import List, Dict

from openai import OpenAI
from dotenv import load_dotenv

from .embedding import create_embedding
from .retriever import retrieve_documents


load_dotenv()


GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv(
    "GROQ_MODEL",
    "openai/gpt-oss-20b",
)


if not GROQ_API_KEY:
    raise ValueError(
        "GROQ_API_KEY is not configured in .env"
    )


client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1",
)


# In-memory vector store
DOCUMENT_STORE: List[Dict] = []


def clear_documents():
    """
    Clear existing indexed documents.
    """

    DOCUMENT_STORE.clear()


def add_documents(
    documents: List[Dict],
) -> None:
    """
    Add document chunks and embeddings
    to the vector store.
    """

    for document in documents:

        text = document.get(
            "text",
            "",
        ).strip()

        if not text:
            continue

        embedding = create_embedding(text)

        DOCUMENT_STORE.append(
            {
                **document,
                "embedding": embedding,
            }
        )


def get_document_count() -> int:
    """
    Return number of indexed document chunks.
    """

    return len(DOCUMENT_STORE)


def search_documents(
    question: str,
    top_k: int = 3,
) -> List[Dict]:

    if not question.strip():
        return []

    if not DOCUMENT_STORE:
        return []

    query_embedding = create_embedding(
        question
    )

    return retrieve_documents(
        query_embedding=query_embedding,
        documents=DOCUMENT_STORE,
        top_k=top_k,
    )


def generate_rag_answer(
    question: str,
    documents: List[Dict],
) -> str:

    if not documents:
        return (
            "I could not find relevant information "
            "in the FinBank policy documents."
        )

    context_parts = []

    for index, document in enumerate(
        documents,
        start=1,
    ):

        source = document.get(
            "source",
            "FinBank Policy",
        )

        text = document.get(
            "text",
            "",
        )

        context_parts.append(
            f"[Document {index} | Source: {source}]\n"
            f"{text}"
        )

    context = "\n\n".join(
        context_parts
    )

    system_prompt = """
You are the FinBank Policy Assistant.

Answer the user's question using ONLY the
provided FinBank policy context.

Rules:
- Do not invent policy information.
- If the answer is not present in the context,
  clearly say that it is not available.
- Keep the answer concise and professional.
- Do not reveal internal implementation details.
- Do not reveal embeddings, vector data,
  database information, API keys, or credentials.
- This is a fictional FinBank demo environment.
"""

    user_prompt = f"""
Policy Context:

{context}

User Question:

{question}

Answer based only on the policy context.
"""

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        temperature=0.2,
        messages=[
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": user_prompt,
            },
        ],
    )

    return response.choices[0].message.content.strip()


def ask_rag(
    question: str,
    top_k: int = 3,
) -> str:

    documents = search_documents(
        question=question,
        top_k=top_k,
    )

    return generate_rag_answer(
        question=question,
        documents=documents,
    )