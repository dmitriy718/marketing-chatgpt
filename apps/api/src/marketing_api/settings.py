from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


def resolve_root_dir() -> Path:
    current = Path(__file__).resolve()
    for parent in current.parents:
        if (parent / ".env").exists():
            return parent
        if (parent / "apps").exists():
            return parent
    return current.parents[2]


ROOT_DIR = resolve_root_dir()


class Settings(BaseSettings):
    app_env: str = "development"
    app_url: str = "http://localhost:3001"
    api_url: str = "http://localhost:8001"
    cors_origins: str = ""
    database_url: str = "postgresql+psycopg://marketing:change_me@localhost:5434/carolina_growth"
    jwt_secret: str = "change_me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    session_secret: str = "change_me"
    stripe_secret_key: str = "sk_test_change_me"
    stripe_webhook_secret: str = "whsec_change_me"
    stripe_api_version: str = "2024-06-20"
    posthog_api_key: str = "phc_change_me"
    posthog_host: str = "https://app.posthog.com"
    turnstile_secret_key: str | None = None
    disable_docs: bool = False
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_user: str | None = None
    smtp_password: str | None = None
    smtp_from: str | None = None
    admin_email: str | None = None
    admin_password: str | None = None
    pushover_app_token: str | None = None
    pushover_user_key: str | None = None
    pushover_group_key: str | None = None

    model_config = SettingsConfigDict(
        env_file=(str(ROOT_DIR / ".env"), ".env"), extra="ignore"
    )


settings = Settings()
