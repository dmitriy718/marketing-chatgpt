from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from marketing_api.auth.repository import get_user_by_email
from marketing_api.auth.schemas import LoginRequest, TokenResponse
from marketing_api.auth.security import verify_password
from marketing_api.auth.tokens import create_access_token


async def login(payload: LoginRequest, session: AsyncSession) -> TokenResponse:
    user = await get_user_by_email(session, payload.email)
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials.",
        )

    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token)
