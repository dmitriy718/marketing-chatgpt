from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from strawberry.fastapi import GraphQLRouter

from marketing_api.auth.bootstrap import ensure_admin_user
from marketing_api.auth.dependencies import extract_bearer_token, resolve_user_from_token
from marketing_api.graphql.schema import schema
from marketing_api.limits import limiter
from marketing_api.middleware.posthog import PostHogMiddleware
from marketing_api.routes.auth import router as auth_router
from marketing_api.routes.chat_ai import router as chat_ai_router
from marketing_api.routes.competitor import router as competitor_router
from marketing_api.routes.consultation import router as consultation_router
from marketing_api.routes.consultation_admin import router as consultation_admin_router
from marketing_api.routes.content import router as content_router
from marketing_api.routes.email_automation import router as email_automation_router
from marketing_api.routes.email_admin import router as email_admin_router
from marketing_api.routes.health import router as health_router
from marketing_api.routes.intelligence import router as intelligence_router
from marketing_api.routes.lead_potential import router as lead_potential_router
from marketing_api.routes.public import router as public_router
from marketing_api.routes.readiness import router as readiness_router
from marketing_api.routes.seo import router as seo_router
from marketing_api.routes.webhooks import router as webhooks_router
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
    docs_disabled = settings.app_env == "production" or settings.disable_docs
    app = FastAPI(
        title="Carolina Growth API",
        version="0.1.0",
        docs_url=None if docs_disabled else "/docs",
        redoc_url=None if docs_disabled else "/redoc",
        openapi_url=None if docs_disabled else "/openapi.json",
    )
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    
    # PostHog middleware for error tracking and performance monitoring
    app.add_middleware(PostHogMiddleware)
    
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
    app.include_router(chat_ai_router)
    app.include_router(competitor_router)
    app.include_router(consultation_router)
    app.include_router(consultation_admin_router)
    app.include_router(content_router)
    app.include_router(email_automation_router)
    app.include_router(email_admin_router)
    app.include_router(intelligence_router)
    app.include_router(lead_potential_router)
    app.include_router(readiness_router)
    app.include_router(seo_router)
    app.include_router(webhooks_router)
    app.include_router(graphql_app, prefix="/graphql")

    @app.on_event("startup")
    async def bootstrap_admin() -> None:
        async for session in get_session():
            await ensure_admin_user(
                session,
                email=settings.admin_email,
                password=settings.admin_password,
            )
            break

    # Background task for email automation (runs every 5 minutes)
    @app.on_event("startup")
    async def start_email_scheduler() -> None:
        import asyncio
        from marketing_api.routes.email_automation import process_email_queue

        async def run_scheduler():
            while True:
                try:
                    async for session in get_session():
                        await process_email_queue(session)
                        break
                except Exception:
                    pass  # Log error but continue
                await asyncio.sleep(300)  # 5 minutes

        asyncio.create_task(run_scheduler())

    return app


app = create_app()
