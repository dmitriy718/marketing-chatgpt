"""PostHog client for error tracking and analytics."""

import logging
from typing import Any

from posthog import Posthog

from marketing_api.settings import settings

logger = logging.getLogger(__name__)

# Initialize PostHog client
_posthog_client: Posthog | None = None


def get_posthog_client() -> Posthog | None:
    """Get or create PostHog client instance."""
    global _posthog_client

    if _posthog_client is not None:
        return _posthog_client

    if not settings.posthog_api_key or settings.posthog_api_key == "phc_change_me":
        logger.warning("PostHog API key not configured, skipping PostHog initialization")
        return None

    try:
        _posthog_client = Posthog(
            api_key=settings.posthog_api_key,
            host=settings.posthog_host,
        )
        return _posthog_client
    except Exception as exc:
        logger.error("Failed to initialize PostHog client: %s", exc)
        return None


def capture_event(
    distinct_id: str,
    event: str,
    properties: dict[str, Any] | None = None,
) -> None:
    """Capture an event to PostHog."""
    client = get_posthog_client()
    if not client:
        return

    try:
        client.capture(
            distinct_id=distinct_id,
            event=event,
            properties=properties or {},
        )
    except Exception as exc:
        logger.error("Failed to capture PostHog event: %s", exc)


def capture_exception(
    distinct_id: str,
    exception: Exception,
    context: dict[str, Any] | None = None,
) -> None:
    """Capture an exception to PostHog."""
    client = get_posthog_client()
    if not client:
        return

    try:
        properties = {
            "$exception_type": type(exception).__name__,
            "$exception_message": str(exception),
        }

        if hasattr(exception, "__traceback__") and exception.__traceback__:
            import traceback

            properties["$exception_stack"] = "".join(
                traceback.format_exception(
                    type(exception),
                    exception,
                    exception.__traceback__,
                )
            )

        if context:
            properties.update(context)

        client.capture(
            distinct_id=distinct_id,
            event="$exception",
            properties=properties,
        )
    except Exception as exc:
        logger.error("Failed to capture PostHog exception: %s", exc)


def capture_api_error(
    endpoint: str,
    method: str,
    status_code: int,
    error: Exception | None = None,
    user_id: str | None = None,
    additional_context: dict[str, Any] | None = None,
) -> None:
    """Capture API error to PostHog."""
    distinct_id = user_id or "anonymous"
    properties: dict[str, Any] = {
        "endpoint": endpoint,
        "method": method,
        "status_code": status_code,
        "error_type": type(error).__name__ if error else "HTTPError",
    }

    if error:
        properties["error_message"] = str(error)

    if additional_context:
        properties.update(additional_context)

    capture_event(
        distinct_id=distinct_id,
        event="api_error",
        properties=properties,
    )


def capture_performance(
    endpoint: str,
    method: str,
    duration_ms: float,
    user_id: str | None = None,
    additional_context: dict[str, Any] | None = None,
) -> None:
    """Capture performance metric to PostHog."""
    distinct_id = user_id or "anonymous"
    properties: dict[str, Any] = {
        "endpoint": endpoint,
        "method": method,
        "duration_ms": duration_ms,
    }

    if additional_context:
        properties.update(additional_context)

    capture_event(
        distinct_id=distinct_id,
        event="api_performance",
        properties=properties,
    )


def flush() -> None:
    """Flush pending PostHog events."""
    client = get_posthog_client()
    if client:
        try:
            client.shutdown()
        except Exception as exc:
            logger.error("Failed to flush PostHog events: %s", exc)
