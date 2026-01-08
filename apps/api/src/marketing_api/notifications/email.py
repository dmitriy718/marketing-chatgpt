import logging
import smtplib
from email.message import EmailMessage

from marketing_api.settings import settings

logger = logging.getLogger(__name__)


def send_email(
    *,
    to_address: str,
    subject: str,
    body: str,
    reply_to: str | None = None,
) -> None:
    if not settings.smtp_host or not settings.smtp_user or not settings.smtp_password:
        logger.warning("SMTP not configured; skipping email to %s", to_address)
        return

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.smtp_from or settings.smtp_user
    msg["To"] = to_address
    if reply_to:
        msg["Reply-To"] = reply_to
    msg.set_content(body)

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)
    except Exception:  # noqa: BLE001
        logger.exception("Failed to send email to %s", to_address)


def notify_admin(subject: str, body: str, reply_to: str | None = None) -> None:
    if not settings.admin_email:
        logger.warning("ADMIN_EMAIL not configured; skipping admin notification")
        return
    send_email(to_address=settings.admin_email, subject=subject, body=body, reply_to=reply_to)
