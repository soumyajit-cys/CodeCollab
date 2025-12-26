from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from app.models.message import Message

class ChatService:

    @staticmethod
    async def save_message(
        db: AsyncSession,
        sender_id: str,
        receiver_id: str,
        content: str
    ) -> Message:
        msg = Message(
            sender_id=sender_id,
            receiver_id=receiver_id,
            content=content
        )
        db.add(msg)
        await db.commit()
        await db.refresh(msg)
        return msg

    @staticmethod
    async def fetch_conversation(
        db: AsyncSession,
        user_id: str,
        peer_id: str
    ):
        result = await db.execute(
            select(Message)
            .where(
                or_(
                    and_(Message.sender_id == user_id, Message.receiver_id == peer_id),
                    and_(Message.sender_id == peer_id, Message.receiver_id == user_id)
                )
            )
            .order_by(Message.created_at)
        )
        return result.scalars().all()

    @staticmethod
    async def mark_read(db: AsyncSession, message_ids: list[str]):
        await db.execute(
            Message.__table__.update()
            .where(Message.id.in_(message_ids))
            .values(read=True)
        )
        await db.commit()