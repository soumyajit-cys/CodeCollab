# app/dashboard/schemas.py
from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class ProfileResponse(BaseModel):
    id: UUID
    display_name: str
    bio: Optional[str]
    avatar_url: Optional[HttpUrl]
    last_seen: Optional[datetime]

class DashboardSession(BaseModel):
    session_id: str
    ip_address: str
    user_agent: str
    last_active: datetime

class DashboardResponse(BaseModel):
    profile: ProfileResponse
    active_sessions: List[DashboardSession]
    connections_count: int