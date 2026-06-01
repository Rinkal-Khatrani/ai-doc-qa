import asyncio
import logging
from app.core.database import AsyncSessionLocal
from app.models.document import Document
from app.models.chunk import DocumentChunk
from app.utils.parser import parse_file
from app.utils.chunker import chunk_text, estimate_page
from app.utils.embedder import batch_embed
from sqlmodel import select

logger = logging.getLogger(__name__)

async def update_doc_status(doc_id: str, status: str, **kwargs):
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Document).where(Document.id == doc_id))
        doc = result.scalar_one_or_none()
        if doc:
            doc.status = status
            for k, v in kwargs.items():
                setattr(doc, k, v)
            await db.commit()

async def ingest_document(doc_id: str, file_path: str):
    """
    Full ingestion pipeline:
      1. Parse file to text
      2. Chunk text
      3. Batch-embed chunks
      4. Store chunks + embeddings in pgvector
      5. Mark document as ready
    """
    logger.info(f"Starting ingestion for doc {doc_id}")
    try:
        # Step 1: Parse
        text, page_count = parse_file(file_path)
        if not text.strip():
            await update_doc_status(doc_id, "failed")
            return

        # Step 2: Chunk
        chunks = chunk_text(text)
        logger.info(f"Doc {doc_id}: {len(chunks)} chunks created")

        # Step 3: Embed (batch)
        texts = [c["text"] for c in chunks]
        embeddings = await batch_embed(texts)

        # Step 4: Store chunks
        async with AsyncSessionLocal() as db:
            for chunk, embedding in zip(chunks, embeddings):
                page_num = estimate_page(chunk["index"], len(chunks), page_count)
                db_chunk = DocumentChunk(
                    document_id=doc_id,
                    chunk_index=chunk["index"],
                    text=chunk["text"],
                    page_number=page_num,
                    embedding=embedding
                )
                db.add(db_chunk)
            await db.commit()

        # Step 5: Mark ready
        await update_doc_status(
            doc_id, "ready",
            page_count=page_count,
            char_count=len(text)
        )
        logger.info(f"Doc {doc_id} ingestion complete")

    except Exception as e:
        logger.error(f"Ingestion failed for {doc_id}: {e}")
        await update_doc_status(doc_id, "failed")