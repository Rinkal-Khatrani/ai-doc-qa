from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")  # 384 dimensions, fast, free

EMBEDDING_DIM = 384  # different from OpenAI's 1536

async def embed_text(text: str) -> list[float]:
    embedding = model.encode(text, convert_to_numpy=True)
    return embedding.tolist()

async def batch_embed(texts: list[str], batch_size: int = 100) -> list[list[float]]:
    all_embeddings = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        embeddings = model.encode(batch, convert_to_numpy=True)
        all_embeddings.extend(embeddings.tolist())
    return all_embeddings