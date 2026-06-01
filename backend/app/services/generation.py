from openai import AsyncOpenAI
from app.core.config import settings

client = AsyncOpenAI(
    api_key=settings.openrouter_api_key,
    base_url="https://openrouter.ai/api/v1",
)

SYSTEM_PROMPT = """You are a helpful assistant that answers questions based strictly
on the provided document context. Always cite your sources using [1], [2], etc.
If the answer is not in the context, say so honestly — do not make things up."""

def build_prompt(question: str, chunks: list[dict]) -> str:
    context_parts = []
    for i, chunk in enumerate(chunks):
        page_info = f" (page {chunk['page_number']})" if chunk.get("page_number") else ""
        context_parts.append(f"[{i+1}]{page_info}\n{chunk['text']}")
    context = "\n\n---\n\n".join(context_parts)
    return f"""Context from the document:

{context}

Question: {question}

Answer (cite sources as [1], [2] etc.):"""

async def stream_answer(question: str, chunks: list[dict]):
    prompt = build_prompt(question, chunks)

    # Try models in order, fall back if one fails
    models = [
        "openrouter/auto",              # auto-picks best available free model
        "qwen/qwen3-8b:free",           # strong, usually available
        "meta-llama/llama-3.2-3b-instruct:free",
        "google/gemma-3-4b-it:free",
    ]

    last_error = None
    for model in models:
        try:
            stream = await client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                stream=True,
                max_tokens=1000,
                temperature=0.1,
                extra_headers={
                    "HTTP-Referer": "http://localhost:5173",
                    "X-Title": "Doc Q&A"
                }
            )
            async for chunk in stream:
                delta = chunk.choices[0].delta.content
                if delta:
                    yield delta
            return   # success, stop trying
        except Exception as e:
            last_error = e
            continue

    # all models failed
    raise Exception(f"All models failed. Last error: {last_error}")