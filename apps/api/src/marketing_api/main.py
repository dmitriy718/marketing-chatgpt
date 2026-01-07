from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter

from marketing_api.auth.dependencies import extract_bearer_token, resolve_user_from_token
from marketing_api.graphql.schema import schema
from marketing_api.routes.auth import router as auth_router
from marketing_api.routes.health import router as health_router
from marketing_api.routes.public import router as public_router
from marketing_api.db.session import get_session
from marketing_api.settings import settings


def build_cors_origins() -> list[str]:
    origins = {settings.app_url}
    if settings.cors_origins:
        for raw in settings.cors_origins.split(","):
            value = raw.strip()
            if value:
                origins.add(value)
    return sorted(origins)


def create_app() -> FastAPI:
    app = FastAPI(title="Carolina Growth API", version="0.1.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=build_cors_origins(),
        allow_credentials=True,
        allow_methods=["*"] if settings.app_env != "production" else ["GET", "POST"],
        allow_headers=["*"],
    )

    async def get_context(request: Request):
        async for session in get_session():
            token = extract_bearer_token(request)
            user = await resolve_user_from_token(session, token)
            return {"session": session, "current_user": user}

    graphql_app = GraphQLRouter(schema, context_getter=get_context)

    app.include_router(health_router)
    app.include_router(auth_router)
    app.include_router(public_router)
    app.include_router(graphql_app, prefix="/graphql")

    return app


app = create_app()
