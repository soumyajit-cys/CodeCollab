from sqlalchemy import String, DateTime, ForeignKey, func, Index
from sqlalchemy.orm import Mapped, mapped_column
from app.db import Base
import uuid

class CallSession(Base):
    __tablename__ = "call_sessions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    caller_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    callee_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    started_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    ended_at: Mapped[DateTime | None]

    __table_args__ = (
        Index("ix_call_users", "caller_id", "callee_id"),
    )