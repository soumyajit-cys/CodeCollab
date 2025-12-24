from fastapi import HTTPException
from app.core.security import decode_token
from app.core.config import settings

def authenticate_socket(token: str) -> str:
    try:
        payload = decode_token(token, settings.JWT_SECRET_KEY)
        return payload["sub"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid socket token")