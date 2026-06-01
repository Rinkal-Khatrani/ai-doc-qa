markdown

# Doc Q&A — Chat with your documents

Upload a PDF, DOCX, or TXT and ask questions. Answers are grounded
in your document with highlighted source citations.

**Live demo:** update soon

## Tech stack

FastAPI · React TypeScript · PostgreSQL + pgvector
OpenAI Embeddings · GPT-4o mini · Docker

## How it works

1. **Upload** — file is parsed and split into 512-word chunks
2. **Embed** — each chunk is embedded via text-embedding-3-small
3. **Store** — embeddings stored in pgvector (native Postgres)
4. **Query** — your question is embedded and matched to top-5 chunks
5. **Answer** — GPT-4o mini streams a cited answer from those chunks

## Local setup

cp .env.example .env # add your OPENAI_API_KEY
docker-compose up --build

# Frontend: http://localhost:5173

# API docs: http://localhost:8000/docs

## Technical highlights

- pgvector for vector search inside Postgres — no Pinecone needed
- SSE streaming so answers appear token-by-token
- Citation grounding — every answer shows exact source chunks
- Async ingestion with status polling
- Row-level document ownership — users only see their files
