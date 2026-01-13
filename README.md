# Carolina Growth Platform

Monorepo for the Carolina Growth marketing website ecosystem.

## Pillars
- Frontend: Public marketing site (Next.js).
- Middleware: API layer and business logic (FastAPI + Strawberry GraphQL).
- Backend: Admin/CRM/finance services (FastAPI) plus CMS-backed content editing (Decap CMS).

## Structure
- `apps/web`: Public marketing website.
- `apps/api`: GraphQL API and backend services.
- `apps/web/content`: CMS content collection files.
- `assets`: Static assets.
- `docs`: Architecture, decisions, and development journal.
- `leadgen`: Lead generation landing page + outbound collector.
- `tests`: Automated tests.
- `scripts`: Maintenance and helper scripts.

## Getting Started
### Docker (full stack)
```bash
docker compose up --build
```
Docker uses host networking in this repo to avoid local iptables issues. Configure
`WEB_PORT`, `API_PORT`, and `POSTGRES_PORT` in `.env` to prevent conflicts.
Run migrations and seed data:
```bash
docker compose exec api poetry run alembic upgrade head
docker compose exec api poetry run python3 /scripts/seed_data.py
```

### Infrastructure (Postgres only)
```bash
docker compose up -d postgres
```

### Frontend (apps/web)
```bash
cd apps/web
npm install
npm run dev
```

### Content Editing (Decap CMS)
Open `http://localhost:3001/admin` to edit content stored in `apps/web/content`.
For local Git-backed editing, run `npx decap-server` in another terminal.
For production, configure the `backend` in `apps/web/public/admin/config.yml` to match
your hosting provider (Git Gateway or GitHub) and ensure `/admin` is deployed as static assets.

### API (apps/api)
```bash
cd apps/api
poetry install
poetry run uvicorn marketing_api.main:app --reload --port 8001
```
Public intake endpoints live under `/public` for lead and newsletter capture.

### Testing
Frontend checks:
```bash
cd apps/web
npm run lint
npm run build
npm run test:e2e
```
E2E tests use Playwright and assume the Docker stack (API + web) is running.
If Turnstile is enabled, set `INTERNAL_API_TOKEN` so trusted test requests can bypass
bot verification. You can also set `E2E_TEST_EMAIL` to control the recipient for
email-triggering flows.

### One-shot startup (local, non-docker)
```bash
./start.sh
```
This installs dependencies (if needed), runs migrations/seed, and starts API + web.
If a port is already in use, the script auto-increments to the next available port.
The script also refreshes the Poetry lock file before installing API dependencies.

### Default Ports
- Web: 3001
- API: 8001
- Postgres: 5434

Application toolchains will be documented as they are introduced. Initial focus is on scaffolding and architecture.

## Environment
See `.env.example` for required configuration.
When running Docker, set `API_INTERNAL_URL` to the API container URL (default `http://api:8000`).
Production Stripe transaction storage requires `STRIPE_DATABASE_URL` in addition to
the primary `DATABASE_URL`.
Trusted server-to-server calls can use `INTERNAL_API_TOKEN` when Turnstile is enabled.
Do not commit plaintext `.env` files; use the templates and `secrets/.env.prod.enc` for production.
