from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool        # ✅ Fix 2
from sqlalchemy import text
from app.core.config import settings

# ✅ Fix 1 — clean URL conversion for Neon + asyncpg
def build_async_url(url: str) -> str:
    url = url.replace("?sslmode=require", "")
    url = url.replace("postgres://", "postgresql+asyncpg://")
    url = url.replace("postgresql://", "postgresql+asyncpg://")
    return url

db_url = build_async_url(settings.database_url)

# ✅ SSL only for Neon
connect_args = {}
if "neon.tech" in settings.database_url:
    connect_args = {"ssl": "require"}

# ✅ Fix 2 — NullPool is essential for Neon serverless
engine = create_async_engine(
    db_url,
    echo=settings.db_echo,                # set True only for local debugging
    poolclass=NullPool,        # ✅ prevents stale connection reuse
    connect_args=connect_args,
)

AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# ✅ Fix 3 — proper session lifecycle with rollback on error
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def init_db():
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await conn.run_sync(SQLModel.metadata.create_all)