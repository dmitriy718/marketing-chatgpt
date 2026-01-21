import asyncio
from marketing_api.celery_app import celery_app
from marketing_api.db.session import get_session
from marketing_api.routes.email_automation import process_email_queue

@celery_app.task
def process_email_queue_task():
    """Celery task to process the email queue."""
    async def _run():
        async for session in get_session():
            await process_email_queue(session)
            break

    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    loop.run_until_complete(_run())
