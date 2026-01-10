"""PostHog middleware for error tracking and performance monitoring."""

import time
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from marketing_api.posthog_client import capture_api_error, capture_performance


class PostHogMiddleware(BaseHTTPMiddleware):
    """Middleware to track API errors and performance with PostHog."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process request and track metrics."""
        start_time = time.time()

        # Get user ID if available (from token or session)
        user_id = None
        if hasattr(request.state, "user") and request.state.user:
            user_id = str(getattr(request.state.user, "id", None))

        # Process request
        try:
            response = await call_next(request)
            status_code = response.status_code

            # Calculate duration
            duration_ms = (time.time() - start_time) * 1000

            # Track performance
            capture_performance(
                endpoint=str(request.url.path),
                method=request.method,
                duration_ms=duration_ms,
                user_id=user_id,
                additional_context={
                    "status_code": status_code,
                    "query_params": dict(request.query_params) if request.query_params else None,
                },
            )

            # Track errors (4xx and 5xx)
            if status_code >= 400:
                capture_api_error(
                    endpoint=str(request.url.path),
                    method=request.method,
                    status_code=status_code,
                    user_id=user_id,
                    additional_context={
                        "query_params": dict(request.query_params) if request.query_params else None,
                    },
                )

            return response

        except Exception as exc:
            # Calculate duration even on exception
            duration_ms = (time.time() - start_time) * 1000

            # Track exception
            capture_api_error(
                endpoint=str(request.url.path),
                method=request.method,
                status_code=500,
                error=exc,
                user_id=user_id,
                additional_context={
                    "duration_ms": duration_ms,
                    "query_params": dict(request.query_params) if request.query_params else None,
                },
            )

            # Re-raise exception
            raise
