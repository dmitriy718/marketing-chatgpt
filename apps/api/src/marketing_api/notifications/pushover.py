import json
import logging
import urllib.parse
import urllib.request

from marketing_api.settings import settings

logger = logging.getLogger(__name__)


def send_pushover(title: str, message: str) -> None:
    if not settings.pushover_app_token:
        logger.warning("Pushover app token missing; skipping push notification")
        return

    user_key = settings.pushover_group_key or settings.pushover_user_key
    if not user_key:
        logger.warning("Pushover user/group key missing; skipping push notification")
        return

    payload = {
        "token": settings.pushover_app_token,
        "user": user_key,
        "title": title,
        "message": message,
    }

    data = urllib.parse.urlencode(payload).encode("utf-8")
    req = urllib.request.Request("https://api.pushover.net/1/messages.json", data=data)
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status >= 400:
                body = response.read().decode("utf-8")
                logger.error("Pushover error %s: %s", response.status, body)
    except Exception:  # noqa: BLE001
        logger.exception("Failed to send pushover notification")
