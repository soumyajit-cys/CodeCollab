# app/dashboard/service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app import UserProfile
from app import UserSession
from app.dashboard.schemas import DashboardResponse
from app.presence.service import get_last_seen

async def get_dashboard_data(user_id, db: AsyncSession):
    profile = await db.get(UserProfile, user_id)

    sessions = (
        await db.execute(
            select(UserSession).where(UserSession.user_id == user_id)
        )
    ).scalars().all()

    connections_count = (
        await db.execute(
            select(func.count()).select_from("user_connections")
            .where("status='accepted'")
        )
    ).scalar()

    last_seen = await get_last_seen(str(user_id))

    return DashboardResponse(
        profile={
            "id": profile.id,
            "display_name": profile.display_name,
            "bio": profile.bio,
            "avatar_url": profile.avatar_url,
            "last_seen": last_seen,
        },
        active_sessions=[
            {
                "session_id": s.id,
                "ip_address": s.ip_address,
                "user_agent": s.user_agent,
                "last_active": s.last_active,
            }
            for s in sessions
        ],
        connections_count=connections_count,
    )
