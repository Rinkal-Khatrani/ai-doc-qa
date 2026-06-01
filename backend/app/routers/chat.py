import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.core.database import AsyncSessionLocal, get_db
from app.models.document import Document
from app.models.chat import ChatMessage
from app.models.user import User
from app.routers.auth import get_current_user
from app.services.retrieval import similarity_search
from app.services.generation import stream_answer

router = APIRouter()

class ChatRequest(BaseModel):
    question: str

@router.post("/{doc_id}")
async def chat(
    doc_id: str,
    body: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify document ownership and readiness
    result = await db.execute(
        select(Document).where(
            Document.id == doc_id,
            Document.user_id == current_user.id
        )
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(404, "Document not found")
    if doc.status != "ready":
        raise HTTPException(400, f"Document is not ready (status: {doc.status})")

    # Save user message
    user_msg = ChatMessage(
        document_id=doc_id,
        user_id=current_user.id,
        role="user",
        content=body.question
    )
    db.add(user_msg)
    await db.commit()

    # Retrieve relevant chunks
    chunks = await similarity_search(db, doc_id, body.question)

    if not chunks:
        async def no_context():
            yield f"data: {json.dumps({'token': 'No relevant content found in the document for this question.'})}\n\n"
            yield f"data: {json.dumps({'citations': [], 'done': True})}\n\n"
        return StreamingResponse(no_context(), media_type="text/event-stream")

    # Stream the answer
    full_answer = []

    async def event_stream():
        nonlocal full_answer
        async for token in stream_answer(body.question, chunks):
            full_answer.append(token)
            yield f"data: {json.dumps({'token': token})}\n\n"

        # After streaming: send citations and save assistant message
        citations = [
            {
                "id": c["id"],
                "chunk_index": c["chunk_index"],
                "text": c["text"],
                "page_number": c["page_number"],
                "score": c["score"]
            }
            for c in chunks
        ]
        yield f"data: {json.dumps({'citations': citations, 'done': True})}\n\n"

        # Persist assistant message (fire-and-forget style)
        async with AsyncSessionLocal() as save_db:
            assistant_msg = ChatMessage(
                document_id=doc_id,
                user_id=current_user.id,
                role="assistant",
                content="".join(full_answer),
                citations=citations
            )
            save_db.add(assistant_msg)
            await save_db.commit()

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no"
        }
    )

@router.get("/{doc_id}/history")
async def get_history(
    doc_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.document_id == doc_id, ChatMessage.user_id == current_user.id)
        .order_by(ChatMessage.created_at.asc())
    )
    return result.scalars().all()