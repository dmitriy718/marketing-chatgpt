# Development Journal

## 2026-01-04
- Initialized monorepo structure and baseline documentation.
- Captured initial architecture and stack decisions.
- Added environment templates and initial Docker Compose services (Postgres).
- Documented initial infrastructure bring-up in README.
- Researched current versions for Next.js, FastAPI, and Strawberry GraphQL.
- Scaffolded Next.js frontend and built initial marketing pages with theming.
- Scaffolded FastAPI + Strawberry GraphQL API with health endpoint.
- Added SEO helpers (sitemap, robots) and updated repo guidelines for tooling.
- Added CRM database models, async SQLAlchemy session setup, and Alembic migration scaffolding.
- Added Decap CMS config and JSON collections for marketing content.
- Scaffolded auth utilities (JWT, hashing) and auth routes for admin/CRM.
- Added Alembic initial migration, seed script, and GraphQL CRUD for CRM entities.
- Added revalidation endpoint for content updates.
- Wired content data into services pages with local/Tina JSON fallback.
- Implemented JWT login, current-user context, and role checks for GraphQL mutations.
- Attempted Docker Compose start; failed due to Docker network iptables error.
- Attempted Alembic upgrade; failed due to database auth error on localhost.
- Adjusted ports to avoid conflicts and added start.sh for one-command startup.
- Switched Docker Compose to host networking to avoid iptables network creation.
- Verified Docker services start with local infrastructure.
- Ran Alembic migration and seeded CRM baseline data.
- Improved start.sh to install dependencies and run migrations/seed automatically.
- Added automatic port fallback in start.sh and fixed GraphQL auth error handling.
- Added email-validator dependency required by Pydantic EmailStr.
- Regenerated Poetry lock file to include email-validator and updated start.sh to refresh locks.
- Enhanced frontend content, added testimonials, improved mobile nav, and added 404 page.

## 2026-01-05
- Dockerized API and web services alongside Postgres for local dev.
- Added public lead/newsletter intake endpoints and persisted submissions in Postgres.
- Added GraphQL input validation guards for enum and UUID parsing.
- Expanded lead schema with company, budget, and details fields.
- Improved SEO metadata and schema markup on dynamic pages.
- Replaced TinaCMS with Decap CMS admin configuration.

## 2026-01-06
- Added Playwright E2E harness with smoke tests for key pages and flows.
- Implemented Growth Audit, ROI Calculator, and 4-Week Growth Sprint pages with lead capture.
- Implemented Conversion Teardown, Lead Routing Playbook, and Revenue Forecast pages.
- Implemented Paid Media Audit, Local SEO Authority, and Email Nurture pages.
- Implemented Retention + Referral Engine and Best-Fit Quiz.
- Implemented Proposal Wizard, UTM Builder + QR Generator, Landing Template Gallery, and Pricing Builder.
- Added interactive case study slider to Portfolio with new metrics content.
- Hardened UTM builder URL handling and clipboard resilience.

## 2026-01-07
- Added production and staging Docker Compose stacks plus prod Dockerfiles.
- Added nginx reverse proxy and systemd unit templates for VPS deployment.
- Switched Decap CMS to GitHub backend and added self-hosted OAuth service wiring.
- Added staging subdomain support (development.<domain>) and ops runbook updates.
- Added global error handling UI with bug report capture stored in Postgres.
- Simplified nav: grouped tools, added Web Design + Pricing pages.
- Replaced Best-Fit Quiz page with Web Design rentals/purchase offer and redirect.
- Adjusted pricing tiers to local-friendly monthly rates and $250 custom build deposit.
- Rebranded to Carolina Growth and set domain defaults to carolinagrowth.co.
