from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from marketing_api.auth.schemas import LoginRequest, TokenResponse
from marketing_api.auth.service import login
from marketing_api.db.session import get_session

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login_user(
    payload: LoginRequest, session: AsyncSession = Depends(get_session)
) -> TokenResponse:
    return await login(payload, session)
