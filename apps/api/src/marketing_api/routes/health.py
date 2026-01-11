from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from marketing_api.db.session import get_session

router = APIRouter()


@router.get("/health")
async def health_check() -> dict[str, str]:
    """Basic health check endpoint."""
    return {"status": "ok"}


@router.get("/health/detailed")
async def detailed_health_check(
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    """Comprehensive health check with database and system status."""
    health_status: dict[str, Any] = {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "checks": {},
    }

    # Database connectivity check
    try:
        result = await session.execute(text("SELECT 1"))
        result.scalar()
        health_status["checks"]["database"] = {
            "status": "healthy",
            "message": "Database connection successful",
        }
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["checks"]["database"] = {
            "status": "unhealthy",
            "message": f"Database connection failed: {str(e)}",
        }

    # Database version check
    try:
        result = await session.execute(text("SELECT version()"))
        version = result.scalar()
        health_status["checks"]["database_version"] = {
            "status": "healthy",
            "version": str(version).split(",")[0] if version else "unknown",
        }
    except Exception:
        health_status["checks"]["database_version"] = {
            "status": "unknown",
            "version": "unknown",
        }

    # Check critical tables exist
    try:
        result = await session.execute(
            text(
                """
                SELECT COUNT(*) 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name IN ('leads', 'users', 'customers')
                """
            )
        )
        table_count = result.scalar()
        health_status["checks"]["critical_tables"] = {
            "status": "healthy" if table_count >= 3 else "degraded",
            "tables_found": int(table_count),
            "expected": 3,
        }
    except Exception as e:
        health_status["checks"]["critical_tables"] = {
            "status": "unhealthy",
            "message": f"Table check failed: {str(e)}",
        }

    return health_status
