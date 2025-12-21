from datetime import timedelta, datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.core.security import (
    hash_password,
    verify_password,
    create_token
)
from app.core.config import settings
import secrets

class AuthService:

    @staticmethod
    async def create_user(db: AsyncSession, email: str, password: str) -> User:
        user = User(
            email=email,
            password_hash=hash_password(password)
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def authenticate(db: AsyncSession, email: str, password: str) -> User | None:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if not user or not verify_password(password, user.password_hash):
            return None
        return user

    @staticmethod
    async def issue_tokens(db: AsyncSession, user: User) -> tuple[str, str]:
        access = create_token(
            user.id,
            timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
            settings.JWT_SECRET_KEY
        )

        refresh_value = secrets.token_urlsafe(64)
        refresh = RefreshToken(
            user_id=user.id,
            token=refresh_value,
            expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        )

        db.add(refresh)
        await db.commit()

        return access, refresh_value