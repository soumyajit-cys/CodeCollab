# app/dashboard/router.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app import get_current_user
from app import get_db
from app.dashboard.service import get_dashboard_data

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("")
async def dashboard(
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_dashboard_data(user.id, db)