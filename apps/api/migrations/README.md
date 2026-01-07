# Database Migrations

Create a new migration after editing models:

```bash
poetry run alembic revision --autogenerate -m "init"
```

Apply migrations:

```bash
poetry run alembic upgrade head
```

Docker:
```bash
docker compose exec api poetry run alembic upgrade head
```

Seed baseline data:

```bash
poetry run python3 ../../scripts/seed_data.py
```

If Postgres is already running on another port, update `POSTGRES_PORT` and `DATABASE_URL`
in `.env` before running migrations.
