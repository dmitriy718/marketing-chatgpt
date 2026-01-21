# Carolina Growth API

FastAPI + Strawberry GraphQL services for CRM, billing, and analytics.

## Development

```bash
poetry install
poetry run uvicorn marketing_api.main:app --reload --port 8001
```

GraphQL endpoint: `http://localhost:8001/graphql`.

Docker runs the API on the host network; set `API_PORT` in `.env` if needed.

## Migrations
See `apps/api/migrations/README.md` for Alembic commands.

## Seed Data
```bash
poetry run python3 ../../scripts/seed_data.py
```

## Auth
`POST /auth/login` accepts email/password and returns a bearer token for CRM queries.

## Public intake
- `POST /public/leads` accepts name, email, company, budget, details, source.
- `POST /public/newsletter` accepts email and optional lead_magnet.
