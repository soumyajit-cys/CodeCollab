from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.services.chat_service import ChatService
from app.core import get_current_user
from app.schemas import MessageResponse

router = APIRouter(prefix="/chat", tags=["chat"])

@router.get("/{peer_id}", response_model=list[MessageResponse])
async def get_conversation(
    peer_id: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    return await ChatService.fetch_conversation(db, user.id, peer_id)