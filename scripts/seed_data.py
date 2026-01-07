import asyncio
import os
import sys
from pathlib import Path

from sqlalchemy import select

ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT / "apps" / "api" / "src"))

from marketing_api.auth.security import hash_password  # noqa: E402
from marketing_api.db.models import PipelineStage, Role, User  # noqa: E402
from marketing_api.db.session import SessionLocal  # noqa: E402


PIPELINE_STAGES = [
    ("Discovery", 1, 10),
    ("Qualified", 2, 30),
    ("Proposal", 3, 50),
    ("Negotiation", 4, 70),
    ("Won", 5, 100),
]

ROLES = [
    ("admin", "Full access to platform"),
    ("manager", "Manage teams, content, and reporting"),
    ("analyst", "View reporting and analytics"),
]


async def seed() -> None:
    async with SessionLocal() as session:
        for name, order, probability in PIPELINE_STAGES:
            existing_stage = await session.execute(
                select(PipelineStage).where(PipelineStage.name == name)
            )
            if existing_stage.scalar_one_or_none():
                continue
            session.add(PipelineStage(name=name, order=order, probability=probability))

        for name, description in ROLES:
            existing_role = await session.execute(select(Role).where(Role.name == name))
            if existing_role.scalar_one_or_none():
                continue
            session.add(Role(name=name, description=description))

        admin_email = os.getenv("ADMIN_EMAIL")
        admin_password = os.getenv("ADMIN_PASSWORD")
        if admin_email and admin_password and admin_password != "change_me":
            existing_user = await session.execute(select(User).where(User.email == admin_email))
            if existing_user.scalar_one_or_none() is None:
                admin_role_result = await session.execute(select(Role).where(Role.name == "admin"))
                admin_role = admin_role_result.scalar_one_or_none()
                user = User(
                    email=admin_email,
                    full_name="Admin",
                    hashed_password=hash_password(admin_password),
                    is_active=True,
                )
                if admin_role:
                    user.roles.append(admin_role)
                session.add(user)

        await session.commit()


if __name__ == "__main__":
    asyncio.run(seed())
