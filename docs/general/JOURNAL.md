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

## 2026-01-08
- Added SMTP-backed email notifications for leads, newsletter signups, and bug reports.
- Added Message Us widget with Pushover notifications and DB storage.
- Deployed leadgen app and collectors to `leadgen.carolinagrowth.co`.
- Added Stripe subscription, payment-intent, and invoice endpoints.
- Added Stripe checkout flow for subscriptions and one-time payments (waiting on price IDs).
- Added Turnstile hooks + rate limiting for public intake endpoints.
- Added PostHog proxy support via `/ph` and build-time env wiring for NEXT_PUBLIC values.

## 2026-01-09
- Fixed Stripe public endpoints by injecting the DB session into checkout handlers so `/public/stripe/*` no longer crash.
- Fixed newsletter/chat lead upserts by importing `select` in `apps/api/src/marketing_api/routes/public.py`.
- Added Stripe transaction storage in a dedicated database with separate Alembic config/migrations (`apps/api/alembic_stripe.ini`, `apps/api/stripe_migrations`).
- Added `stripe_transactions` canonical table and kept raw webhook events in `stripe_webhook_events`.
- Added Stripe DB session module and base model (`apps/api/src/marketing_api/db/stripe_session.py`, `stripe_base.py`).
- Hardened Stripe webhook handling:
  - Added failure alerts for `payment_intent.payment_failed` and `invoice.payment_failed`.
  - Fail fast if Stripe transaction writes fail (required for finance reporting).
  - Moved SMTP send/notify into background threads to avoid blocking async webhooks.
- Added non-public internal API token (`INTERNAL_API_TOKEN`) for trusted calls; removed Turnstile bypass from public `RATE_LIMIT_TOKEN`.
- Added file-locking to web outbox and leadgen outbox to prevent concurrent writes from clobbering queued leads.
- Added leadgen outbox update helper to serialize flush operations.
- Ensured lead capture is durable when API is unavailable with outbox persistence and retry.
- Added production env wiring for `TURNSTILE_SECRET_KEY`, `RATE_LIMIT_TOKEN`, `INTERNAL_API_TOKEN`, `ADMIN_PASSWORD`.
- Added web outbox volume mount (`./apps/web/data:/app/data`) for persistence.
- Deployed to VPS (74.208.153.193), built containers, ran primary + Stripe migrations, and verified health + lead endpoints.
- Installed Node 20 + Playwright deps on VPS, ran E2E suite, and captured failures in `PLAYWRIGHT_REPORT.md`.
- Adjusted Playwright test emails to a real mailbox (now `qa@carolinagrowth.co`) to prevent SMTP bounces.
- Updated review report with resolved critical/high findings and readiness status.

## 2026-01-10
- Fixed Decap CMS OAuth flow (self-hosted):
  - Added allowed-origin and cookie-domain handling for OAuth state.
  - Stored OAuth origin and token payload in localStorage as fallback if `window.opener` is unavailable.
  - Added admin page bridge to forward stored auth payload to Decap.
  - Added required Decap handshake message (`authorizing:github`) before redirecting to GitHub.
  - Disabled `local_backend` in Decap config for production.
- Redeployed web + oauth services on VPS after CMS fixes.
- Verified `/admin/config.yml` served correct settings.
- Confirmed CMS login now works after GitHub + 2FA.

## 2026-01-11
- Updated Playwright E2E expectations for new redirects (best-fit quiz -> `/web-design`, pricing builder -> `/pricing`).
- Standardized E2E email usage to `qa@carolinagrowth.co`.
- Added Turnstile stubs and internal token injection for E2E runs.
- Added internal header helper for lead forms and wired it into growth sprint, proposal wizard, and pricing builder submissions.
- Added server-side internal token bypass for `/api/leads` (Turnstile) to support trusted/E2E requests.
- Updated Playwright Turnstile stub to return the internal token when available.
- Current state: E2E needs rerun to confirm bot verification issues are resolved on VPS.

## 2026-01-12
- Deployed latest E2E fixes to VPS `/opt/marketing` and rebuilt the web container.
- Reran Playwright with `INTERNAL_API_TOKEN` from `/opt/marketing/.env` and `E2E_TEST_EMAIL=qa@carolinagrowth.co`.
- Updated `/opt/marketing/PLAYWRIGHT_REPORT.md` with results (16 passed, 3 failed: proposal wizard, pricing builder, growth sprint submissions).

## 2026-01-13
- Fixed Stripe invoice lead upsert crash by selecting the most recent lead when duplicates exist.
- Added internal-token auto-verify in `TurnstileWidget` to unblock trusted/E2E submissions.
- Set `INTERNAL_API_TOKEN` in VPS `/opt/marketing/.env` and restarted web + API.
- Reran Playwright on VPS: all 19 tests passed and reports were updated (local + VPS).

## 2026-01-14
- Hardened Stripe endpoints with server-side allowlists and server-calculated amounts via `stripe_catalog`.
- Added Turnstile checks + rate limiting for Stripe endpoints with internal-token bypass.
- Added invoice idempotency keys to prevent duplicate invoice item/invoice creation.
- Updated web Stripe API routes to pass plan keys, builder state, and internal token header.
- Passed Stripe price IDs into API containers via docker-compose for allowlist validation.

## 2026-01-11
- Verified `carolina_growth_stripe` database exists on VPS and set `STRIPE_DATABASE_URL` in `/opt/marketing/.env`.
- Set a fresh `INTERNAL_API_TOKEN` on VPS and restarted API + web services.
- Ran Stripe migrations with `alembic_stripe.ini` on the VPS.
- Deployed Stripe hardening changes to VPS (allowlist, server-calculated amounts, idempotency).

## 2026-01-11
- Fixed Turnstile verification to use async HTTP (httpx) instead of blocking urllib to prevent event loop blocking.
- Added outbox/queue durability to chat submissions matching leads implementation for API downtime resilience.
- Added idempotency keys to Stripe subscription and payment-intent endpoints using request_id parameter.
- Added partial unique index on Lead.email (non-null emails) via migration `197326810f81` to prevent duplicate leads.
- Updated comprehensive review reports marking all identified issues as fixed.
- Completed thorough code review: verified error handling, transaction management, and security practices.

## 2026-01-11 (Evening) - Top 5 Features Implementation
- **Feature 1: Website SEO Auditor** ✅
  - Created SEO audit tool with BeautifulSoup4 analysis
  - Database model `SeoAudit` with 30-day caching
  - Frontend page `/seo-audit` with full UI
  - Lead capture integration
  - Migration: `d7f8c2b211d3`
  
- **Feature 2: Chatbot/AI Assistant** ✅
  - Enhanced chat widget with AI conversation capability
  - OpenAI GPT-3.5-turbo integration
  - Conversation history and session tracking
  - Human handoff support
  - Migration: `e99d8c83f77d`
  
- **Feature 3: AI Content Generator** ✅
  - Blog posts, social media, and email campaign generation
  - Free tier (3/month) and premium support
  - Usage tracking and lead capture
  - Migration: `220646cbf9d4`
  
- **Feature 4: Email Marketing Automation** ✅
  - Drip campaign system with sequences
  - Subscriber management (subscribe/unsubscribe)
  - Background scheduler (runs every 5 minutes)
  - Email tracking (sent/opened/clicked)
  - Migration: `fe0ae519a216`
  
- **Feature 5: Client Dashboard/Portal** ✅
  - Client login and dashboard interface
  - Account status, projects, and reports display
  - Ready for CRM integration
  - Added to main navigation

- All features integrated with existing codebase
- No linter errors
- Dependencies updated: beautifulsoup4, lxml, openai
- Comprehensive documentation in `JOB_COMPLETE_REVIEW.md`

## 2026-01-11 (Evening) - Round 2: "Eager to Join" Features
- **Feature 1: Competitor Comparison Tool** ✅
  - Side-by-side comparison vs up to 3 competitors
  - Gap analysis showing where user is falling behind
  - Creates FOMO and urgency
  - Migration: `e42f0e3a3206`
  
- **Feature 2: Marketing Readiness Assessment** ✅
  - Interactive 8-question quiz
  - Personalized scoring (0-100%) with 4 levels
  - Recommendations for improvement
  - Step-by-step UI with progress
  
- **Feature 3: Competitive Intelligence Report** ✅
  - Comprehensive website analysis
  - Email required (exclusive value)
  - SEO, social, contact, trust signals
  - Detailed email reports
  
- **Feature 4: Lead Generation Potential Calculator** ✅
  - Shows revenue potential with optimization
  - Industry benchmarks
  - Current vs potential comparison
  - Creates urgency with money left on table
  
- **Feature 5: Free Consultation Scheduler** ✅
  - Direct booking form
  - Low barrier to entry
  - High-priority lead capture
  - Added to main navigation

- All Round 2 features designed to create urgency and drive sign-ups
- No new dependencies required
- All features integrated with existing systems
- Comprehensive documentation updated in `JOB_COMPLETE_REVIEW.md`

## Process Rule (2026-01-10)
- After each major change (or every 20 small changes), update this journal with what changed, where, and current state so recovery is fast after any crash.
