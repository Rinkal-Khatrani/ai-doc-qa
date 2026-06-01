from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional

class ChatMessage(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    document_id: UUID = Field(foreign_key="document.id", index=True)
    user_id: UUID = Field(foreign_key="user.id")
    role: str           # user | assistant
    content: str
    citations: Optional[list] = Field(
        default=None, sa_column=Column(JSON)
    )
    created_at: datetime = Field(default_factory=datetime.utcnow)