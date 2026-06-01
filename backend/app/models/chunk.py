from sqlmodel import SQLModel, Field, Column
from sqlalchemy import Text
from pgvector.sqlalchemy import Vector
from uuid import UUID, uuid4
from typing import Optional

class DocumentChunk(SQLModel, table=True):
    __tablename__ = "documentchunk"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    document_id: UUID = Field(foreign_key="document.id", index=True)
    chunk_index: int
    text: str = Field(sa_column=Column(Text))
    page_number: Optional[int] = None
    embedding: list = Field(
        default=None,
        sa_column=Column(Vector(384))
    )