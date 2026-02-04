from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # =====================
    # Core / Security
    # =====================
    DATABASE_URL: str
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    JWT_SECRET: str | None = None
    JWT_ALGORITHM: str | None = "HS256"

    # =====================
    # OpenAI
    # =====================
    OPENAI_API_KEY: str | None = None
    OPENAI_MODEL: str | None = "gpt-4o-mini"

    # =====================
    # SMTP / Email
    # =====================
    SMTP_USERNAME: str | None = None
    SMTP_PASSWORD: str | None = None
    SMTP_FROM: str | None = None
    SMTP_SERVER: str | None = None
    SMTP_PORT: int | None = None

    class Config:
        env_file = ".env"
        extra = "ignore"  # ← IMPORTANT safety net


settings = Settings()
