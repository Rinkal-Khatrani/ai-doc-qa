from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional

class Document(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", index=True)
    filename: str
    file_url: str
    status: str = "processing"   # processing | ready | failed
    page_count: Optional[int] = None
    char_count: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)