from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "CollabCode"
    ENV: str = "production"

    DATABASE_URL: str
    JWT_SECRET_KEY: str
    JWT_REFRESH_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    COOKIE_DOMAIN: str | None = None
    COOKIE_SECURE: bool = True

    class Config:
        env_file = ".env"

settings = Settings()