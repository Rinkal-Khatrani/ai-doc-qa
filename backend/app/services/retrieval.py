from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.models.chunk import DocumentChunk
from app.utils.embedder import embed_text

async def similarity_search(
    db: AsyncSession,
    document_id: str,
    query: str,
    top_k: int = 5,
    score_threshold: float = 0.2
) -> list[dict]:
    """
    Embed the query, then find the top-K most similar chunks
    from a specific document using pgvector cosine distance.
    """
    query_embedding = await embed_text(query)

    # pgvector cosine distance operator: <=>
    # Lower distance = more similar (0 = identical, 2 = opposite)
    sql = text("""
        SELECT
            id,
            chunk_index,
            text,
            page_number,
            embedding <=> CAST(:embedding AS vector) AS distance,
            1 - (embedding <=> CAST(:embedding AS vector)) AS score
        FROM documentchunk
        WHERE document_id = :doc_id
        ORDER BY embedding <=> CAST(:embedding AS vector)
        LIMIT :top_k
    """)

    result = await db.execute(sql, {
        "embedding": str(query_embedding),
        "doc_id": document_id,
        "threshold": score_threshold,
        "top_k": top_k
    })

    rows = result.fetchall()
    print(f"Similarity search found {len(rows)} chunks above threshold {score_threshold}")
    return [
        {
            "id": str(row.id),
            "chunk_index": row.chunk_index,
            "text": row.text,
            "page_number": row.page_number,
            "score": round(float(row.score), 4)
        }
        for row in rows
    ]