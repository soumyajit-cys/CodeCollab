from sqlalchemy import String, Text, DateTime, Boolean, ForeignKey, Index, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db import Base
import uuid

class Message(Base):
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    sender_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    receiver_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))

    content: Mapped[str] = mapped_column(Text, nullable=False)

    delivered: Mapped[bool] = mapped_column(Boolean, default=False)
    read: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())

    __table_args__ = (
        Index("ix_messages_conversation", "sender_id", "receiver_id"),
        Index("ix_messages_receiver_read", "receiver_id", "read"),
    )