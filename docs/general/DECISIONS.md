# Decisions

## 2026-01-04
- Selected Next.js for the public marketing site for modern SSR/SSG and performance.
- Selected FastAPI + Strawberry GraphQL for Python-based API services.
- Selected Decap CMS for Git-based content workflows and editorial UI.
- Chosen monorepo layout to coordinate shared tooling and deployments.
- Validated current versions: Next.js 16.1.1 (npm), FastAPI 0.128.0, Strawberry 0.288.2.
- Using Poetry for Python dependency management and Docker Compose for local infra.
- Added Alembic for schema migrations and SQLAlchemy async for data access.
- Added Decap CMS config and content collections for marketing pages.
- Added JWT + Argon2 scaffolding for upcoming auth flows.
- Added initial CRM migration/seed and async GraphQL CRUD operations.
- Added Next.js revalidation endpoint for CMS-driven updates.
- Added JWT login endpoint and enforced auth on CRM GraphQL queries/mutations.
- Added role gating for pipeline stage mutations (admin/manager).

## 2026-01-05
- Dockerized web and API alongside Postgres for consistent local testing.
- Moved lead/newsletter intake to Postgres-backed public API endpoints.
- Added schema validation guards for GraphQL enum/UUID inputs.
- Replaced TinaCMS with Decap CMS for content editing.

## 2026-01-06
- Added Playwright E2E harness for smoke testing the public website.
- Expanded marketing feature pages with interactive calculators, quizzes, and builders.

## 2026-01-07
- Added VPS-focused deployment assets (prod/staging Compose, nginx, systemd).
- Adopted self-hosted Decap OAuth with GitHub backend.
- Added global error handling with bug report capture stored in Postgres.
- Simplified navigation with grouped tools and new Web Design/Pricing pages.
- Rebranded to Carolina Growth and secured carolinagrowth.co.

## 2026-01-09
- Separated Stripe transaction storage into a dedicated database with its own migrations to support reporting and compliance.
- Enforced transaction persistence (webhook fails fast if Stripe DB is missing or write fails).
- Added durable lead outbox persistence with file locking for concurrent requests.
- Introduced a non-public internal API token for trusted calls; removed public-token Turnstile bypass.

## 2026-01-10
- Standardized Decap OAuth flow on the required handshake message (`authorizing:github`) before redirecting to GitHub.
- Added OAuth fallback via localStorage + admin page forwarding to handle blocked `window.opener` cases.
- Disabled Decap `local_backend` in production to avoid subsystem failures.
