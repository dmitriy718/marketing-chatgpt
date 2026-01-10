# Status

## Where We Left Off
- Implemented all 16 requested marketing features with UI, copy, and analytics hooks.
- Added Playwright E2E harness with smoke tests and Docker-friendly browser install.
- Added interactive case study slider metrics and landing template gallery content.
- Updated docs (README, ARCHITECTURE, DECISIONS, JOURNAL) for new tooling and features.
- Simplified navigation with Tools grouping; added Web Design and Pricing pages.
- Rebranded to Carolina Growth with updated domain defaults and logo.
- Added production/staging deployment assets, nginx/systemd configs, and self-hosted Decap OAuth.
- Added global error handling with a bug report endpoint and DB storage.
- Added public chat-style "Message Us" widget with Pushover alerting.
- Added lead capture, newsletter, and bug report email notifications via SMTP.
- Deployed leadgen micro-app to `leadgen.carolinagrowth.co`.
- Added Stripe API endpoints and checkout pages for subscriptions/one-time payments, including dedicated Stripe transactions DB + migrations.
- Added Turnstile bot protection hooks and rate limiting on public intake endpoints.
- Added durable lead outbox handling on web + leadgen with file locks.
- Added non-public internal token for trusted API calls; removed Turnstile bypass from public token.
- Fixed Decap CMS OAuth flow and disabled local backend in production.
- Deployed fixes to VPS and verified core public endpoints.

## Implemented Feature List
1) Growth Audit
2) ROI Calculator
3) 4-Week Growth Sprint
4) Conversion Rate Teardown + Fix Plan
5) Lead Capture Playbook + Routing Automation
6) Revenue Forecast Dashboard Snapshot
7) Paid Media Audit + Creative Refresh
8) Local SEO Authority Stack
9) Email Nurture System Build
10) Retention & Referral Engine Setup
11) Best-Fit Client Quiz
12) Proposal Wizard
13) UTM Builder + QR Generator
14) Interactive Case Study Slider
15) Landing Template Gallery
16) Price & Package Builder
17) Web Design (rentals + purchase options)
18) Pricing (new tiered pricing with builder)

## Key Paths
- `apps/web/src/app` for feature pages
- `apps/web/src/components` for calculators/forms/builders
- `apps/web/content` for CMS JSON content
- `apps/web/tests/e2e` for Playwright smoke tests
- `ops` for VPS deployment, nginx, and systemd assets
- `leadgen` for leadgen app + collector services

## Open Items
- Configure Stripe price IDs + publishable key in production secrets (if not already set).
- Configure `STRIPE_DATABASE_URL` in production `.env` (required for Stripe transaction storage).
- Ensure Stripe allowlist env vars (price IDs) are set for the API service.

## E2E + Build Checks
```bash
docker compose exec api poetry run alembic upgrade head
docker compose exec api pytest -q
docker compose exec web npm run lint
docker compose run --rm web npm run build
docker compose exec web npm run test:e2e
```

## Recent E2E Status (VPS)
- 19 passed / 0 failed on latest VPS run.
- Report saved to `/opt/marketing/PLAYWRIGHT_REPORT.md` and `/opt/marketing/apps/web/playwright-report/index.html`.
