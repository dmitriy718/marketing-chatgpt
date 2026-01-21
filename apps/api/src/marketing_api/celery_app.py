from celery import Celery
from marketing_api.settings import settings

celery_app = Celery(
    "marketing_api",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    beat_schedule={
        "process-email-queue-every-5-minutes": {
            "task": "marketing_api.tasks.email.process_email_queue_task",
            "schedule": 300.0,  # 5 minutes
        },
    },
)
