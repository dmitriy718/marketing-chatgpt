# Architecture

## Overview
The system is a three-pillar marketing platform with shared infrastructure and strict separation of concerns.

## Pillars
1) Frontend (apps/web)
- Next.js App Router.
- SEO-first structure, performance optimization, and theming.

2) Middleware & Backend (apps/api)
- FastAPI + Strawberry GraphQL.
- Domain modules: CRM, billing, content, analytics, user management.
- PostgreSQL for persistent data.

3) Content Management (apps/web)
- Decap CMS for Git-backed content editing.
- JSON content collections stored in `apps/web/content`.

## Data & Integrations
- PostgreSQL primary database.
- Stripe for billing and subscriptions.
- PostHog for analytics.

## Runtime
- Docker Compose runs Postgres, API, and web together for local development using host networking.
- Public intake endpoints accept lead and newsletter submissions and persist them in Postgres.

## Testing
- Playwright provides E2E smoke coverage for the public website.
- E2E runs assume the Docker stack is up and target the running web service.

## Security
- Role-based access control for admin/CRM.
- Strict environment-based configuration.
- Stripe keys stored in `.env` and never committed.
