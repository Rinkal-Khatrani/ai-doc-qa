from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, BackgroundTasks
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
import os, tempfile
from app.core.database import get_db
from app.models.document import Document
from app.models.user import User
from app.routers.auth import get_current_user
from app.services.ingestion import ingest_document
from app.core.config import settings
from app.utils.storage import upload_to_s3, delete_from_s3
from sqlalchemy import delete
from app.models.chunk import DocumentChunk
from app.models.chat import ChatMessage

router = APIRouter()

ALLOWED_TYPES = {
    "application/pdf",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
}

def use_s3() -> bool:
    return bool(settings.s3_bucket and settings.aws_access_key_id)

@router.post("/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, "Only PDF, DOCX, and TXT files are supported")

    file_bytes = await file.read()

    if use_s3():
        # ── S3 / R2 path ──────────────────────────────
        s3_key, file_url = await upload_to_s3(
            file_bytes, file.filename, file.content_type
        )
        # Write to a temp file so ingestion can read it locally
        suffix = "." + file.filename.rsplit(".", 1)[-1]
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        tmp.write(file_bytes)
        tmp.close()
        ingest_path = tmp.name

    else:
        # ── Local disk fallback ───────────────────────
        upload_dir = settings.upload_dir
        os.makedirs(upload_dir, exist_ok=True)
        ingest_path = os.path.join(upload_dir, f"{file.filename}")
        with open(ingest_path, "wb") as f:
            f.write(file_bytes)
        file_url = ingest_path
        s3_key   = None

    doc = Document(
        user_id=current_user.id,
        filename=file.filename,
        file_url=file_url,
        status="processing"
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    background_tasks.add_task(ingest_document, str(doc.id), ingest_path)

    return {"id": doc.id, "filename": doc.filename, "status": doc.status}

@router.get("/")
async def list_documents(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Document)
        .where(Document.user_id == current_user.id)
        .order_by(Document.created_at.desc())
    )
    return result.scalars().all()

@router.get("/{doc_id}")
async def get_document(
    doc_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Document).where(
            Document.id == doc_id,
            Document.user_id == current_user.id
        )
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(404, "Document not found")
    return doc

@router.delete("/{doc_id}")
async def delete_document(
    doc_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Document).where(
            Document.id == doc_id,
            Document.user_id == current_user.id
        )
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(404, "Document not found")

    # 1. Delete chunks first (foreign key dependency)
    await db.execute(
        delete(DocumentChunk).where(DocumentChunk.document_id == doc.id)
    )

    # 2. Delete chat messages for this doc
    await db.execute(
        delete(ChatMessage).where(ChatMessage.document_id == doc.id)
    )

    # 3. Delete from S3 if applicable
    if use_s3() and doc.file_url and (
        "amazonaws.com" in doc.file_url or
        "r2.cloudflarestorage.com" in doc.file_url
    ):
        key = "/".join(doc.file_url.split("/")[-2:])
        delete_from_s3(key)

    # 4. Finally delete the document
    await db.delete(doc)
    await db.commit()

    return {"deleted": True}