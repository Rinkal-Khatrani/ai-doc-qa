from typing import Optional

def chunk_text(
    text: str,
    chunk_size: int = 512,
    overlap: int = 50
) -> list[dict]:
    """
    Sliding window word-based chunker with overlap.
    Returns list of {text, index, start_word} dicts.
    """
    # Clean and normalise whitespace
    text = " ".join(text.split())
    words = text.split()

    if not words:
        return []

    chunks = []
    i = 0
    while i < len(words):
        chunk_words = words[i : i + chunk_size]
        chunks.append({
            "text": " ".join(chunk_words),
            "index": len(chunks),
            "start_word": i,
            "word_count": len(chunk_words),
        })
        i += chunk_size - overlap

    return chunks


def estimate_page(chunk_index: int, total_chunks: int, total_pages: int) -> Optional[int]:
    """Rough page estimate when exact mapping isn't available."""
    if total_pages <= 0 or total_chunks <= 0:
        return None
    return max(1, round((chunk_index / total_chunks) * total_pages))