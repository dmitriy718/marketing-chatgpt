import logging

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from marketing_api.auth.security import hash_password
from marketing_api.db import models

logger = logging.getLogger(__name__)


async def ensure_admin_user(
    session: AsyncSession, *, email: str | None, password: str | None
) -> None:
    if not email or not password:
        logger.warning("Admin bootstrap skipped; ADMIN_EMAIL or ADMIN_PASSWORD missing.")
        return

    existing = await session.execute(select(models.User).where(models.User.email == email))
    if existing.scalar_one_or_none():
        return

    total = await session.execute(select(func.count()).select_from(models.User))
    if total.scalar_one() > 0:
        logger.warning("Admin bootstrap skipped; users already exist.")
        return

    user = models.User(
        email=email,
        full_name="Admin",
        hashed_password=hash_password(password),
        is_active=True,
    )
    session.add(user)
    await session.commit()
    logger.info("Admin user bootstrapped for %s", email)
