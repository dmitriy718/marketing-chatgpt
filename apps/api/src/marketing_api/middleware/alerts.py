import logging
import traceback
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from marketing_api.notifications.pushover import send_pushover
from marketing_api.notifications.email import notify_admin
from marketing_api.settings import settings

logger = logging.getLogger(__name__)

class ErrorAlertMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        try:
            response = await call_next(request)
            if response.status_code >= 500:
                self._send_alert(request, response.status_code)
            return response
        except Exception as exc:
            self._send_alert(request, 500, exc)
            raise exc

    def _send_alert(self, request: Request, status_code: int, exc: Exception | None = None):
        if settings.app_env != "production":
            return

        method = request.method
        url = str(request.url)
        error_msg = f"Critical API Error: {status_code} {method} {url}"
        
        if exc:
            error_trace = "".join(traceback.format_exception(type(exc), exc, exc.__traceback__))
            full_msg = f"{error_msg}\n\nException: {str(exc)}\n\n{error_trace}"
        else:
            full_msg = error_msg

        # Throttling alerts could be added here to avoid spamming
        try:
            send_pushover(title="API Error Alert", message=error_msg)
            notify_admin(subject=f"🚨 API Error Alert: {status_code}", body=full_msg)
        except Exception:
            logger.exception("Failed to send error alerts")
