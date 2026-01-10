from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from marketing_api.settings import settings

_stripe_sessionmaker: async_sessionmaker[AsyncSession] | None = None


def get_stripe_sessionmaker() -> async_sessionmaker[AsyncSession]:
    global _stripe_sessionmaker
    if _stripe_sessionmaker:
        return _stripe_sessionmaker

    if settings.app_env == "production" and not settings.stripe_database_url:
        raise RuntimeError("STRIPE_DATABASE_URL not configured.")

    stripe_url = settings.stripe_database_url or settings.database_url
    stripe_engine = create_async_engine(stripe_url, pool_pre_ping=True)
    _stripe_sessionmaker = async_sessionmaker(
        bind=stripe_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    return _stripe_sessionmaker


async def get_stripe_session() -> AsyncGenerator[AsyncSession, None]:
    sessionmaker = get_stripe_sessionmaker()
    async with sessionmaker() as session:
        yield session
