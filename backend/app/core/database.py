from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

# Fix: replace ?sslmode=require with ssl=require for asyncpg
db_url = settings.database_url.replace("?sslmode=require", "")

connect_args = {}
if "neon.tech" in settings.database_url:
    connect_args = {"ssl": "require"}

engine = create_async_engine(db_url, echo=True, connect_args=connect_args)

AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def init_db():
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await conn.run_sync(SQLModel.metadata.create_all)