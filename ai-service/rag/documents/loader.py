from pathlib import Path

from .chunker import chunk_document
from .rag_service import add_documents


DOCUMENTS_DIR = Path(__file__).resolve().parent


def load_policy_documents():
    """
    Load all FinBank policy documents,
    split them into chunks and create embeddings.
    """

    policy_files = [
        "loan_policy.txt",
        "credit_card_policy.txt",
        "account_policy.txt",
        "service_request_policy.txt",
    ]

    all_chunks = []

    for filename in policy_files:

        file_path = DOCUMENTS_DIR / filename

        if not file_path.exists():
            print(
                f"Policy document not found: {filename}"
            )
            continue

        text = file_path.read_text(
            encoding="utf-8"
        )

        chunks = chunk_document(
            text=text,
            source=filename,
        )

        all_chunks.extend(chunks)

        print(
            f"Loaded {filename}: "
            f"{len(chunks)} chunks"
        )

    if all_chunks:
        add_documents(all_chunks)

    print(
        f"RAG indexing completed. "
        f"Total chunks: {len(all_chunks)}"
    )

    return len(all_chunks)