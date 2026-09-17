from fastapi import FastAPI
from pydantic import BaseModel

from ai import (
    ask_customer_ai,
    ask_rm_ai,
)

from rag.documents.loader import (
    load_policy_documents,
)

from rag.documents.rag_service import (
    ask_rag,
    get_document_count,
)


app = FastAPI(
    title="FinBank AI Service",
    version="1.0.0",
)


class ChatRequest(BaseModel):
    customer_id: int
    question: str


class RMChatRequest(BaseModel):
    relationship_manager_id: int
    question: str


class RAGRequest(BaseModel):
    question: str


@app.on_event("startup")
def startup_event():
    """
    Load and index FinBank policy documents
    when the AI service starts.
    """

    try:
        total_chunks = load_policy_documents()

        print(
            f"FinBank RAG ready: "
            f"{total_chunks} chunks indexed"
        )

    except Exception as error:

        print(
            "RAG startup error:",
            str(error),
        )


@app.get("/")
def root():

    return {
        "success": True,
        "service": "FinBank AI Service",
        "status": "running",
        "rag_chunks": get_document_count(),
    }


@app.post("/ai/chat")
def customer_chat(
    request: ChatRequest,
):

    answer = ask_customer_ai(
        request.question,
        request.customer_id,
    )

    return {
        "success": True,
        "answer": answer,
    }


@app.post("/ai/rm-chat")
def rm_chat(
    request: RMChatRequest,
):

    answer = ask_rm_ai(
        request.question,
        request.relationship_manager_id,
    )

    return {
        "success": True,
        "answer": answer,
    }


@app.post("/rag/test")
def rag_test(
    request: RAGRequest,
):

    answer = ask_rag(
        question=request.question,
        top_k=3,
    )

    return {
        "success": True,
        "answer": answer,
        "indexed_chunks": get_document_count(),
    }