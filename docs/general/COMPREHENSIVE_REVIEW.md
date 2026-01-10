# Comprehensive Code Review (2026-01-10)

## Scope
- Web: `apps/web`
- API: `apps/api`
- Leadgen: `leadgen`
- Ops/deploy configs: `docker-compose*.yml`, `ops`

## Findings (Ordered by Severity)

### Critical
- None found in the reviewed code paths.

### High
- ✅ **FIXED**: Stripe webhook processing fails fast if `STRIPE_DATABASE_URL` is missing in production. This is correct for compliance but will stop webhook processing entirely until configured. **Status**: Configured in production environment.
  - `apps/api/src/marketing_api/routes/webhooks.py:360`
- ✅ **FIXED**: Turnstile verification uses blocking `urllib` inside async routes, which can block the event loop under load and delay responses for public endpoints. **Status**: Converted to async using `httpx`.
  - `apps/api/src/marketing_api/routes/public.py:93`

### Medium
- ✅ **FIXED**: Stripe subscription and payment-intent endpoints are not idempotent; rapid double-submit can create multiple intents/subscriptions. **Status**: Added idempotency keys using `request_id` parameter.
  - `apps/api/src/marketing_api/routes/public.py:437`
  - `apps/api/src/marketing_api/routes/public.py:488`
- ✅ **FIXED**: Chat submissions have no outbox/queue durability when the API is down; this can lose leads under transient API outages. **Status**: Added outbox pattern matching leads implementation.
  - `apps/web/src/app/api/chat/route.ts:20`
- ✅ **FIXED**: Lead emails are not unique in the database; duplicates can fragment customer history. **Status**: Added partial unique index on non-null emails via migration `197326810f81`.
  - `apps/api/src/marketing_api/db/models.py:127`

### Low
- None.

## Stripe Readiness Review
- Allowlisted plan keys and server-calculated amounts are now enforced via `stripe_catalog`.
- Turnstile validation + rate limiting are enforced on all public Stripe endpoints, with internal-token bypass for trusted server-to-server calls.
- Invoice creation is idempotent (request-based) to prevent duplicate invoice items/invoices.

## Feature/Component Readiness
Legend: ✅ ready, ⚠️ needs work

### Public Website (apps/web)
- Marketing pages & content rendering: ✅
- SEO config, sitemap/robots, static content: ✅
- Global error page + bug report UI: ✅

### Lead Capture & Forms
- Contact, Growth Audit, Growth Sprint, Paid Media Audit, Conversion Teardown, Lead Routing, Email Nurture, Local SEO, Retention/Referral, Proposal Wizard, Best-Fit Quiz, ROI Calculator, Revenue Forecast: ✅
- Newsletter / Lead Magnet: ✅
- Chat widget (Message Us): ✅ (outbox/queue durability added)

### Stripe Payments
- Checkout page & client flow: ✅ (server-side allowlist, Turnstile + rate limit)
- Subscription/Payment intent creation: ✅ (server-side allowlist)
- Deposit invoices (Pricing Builder): ✅ (server-calculated amount + idempotent)
- Webhooks (success + failure emails): ✅
- Transaction records (dedicated DB): ✅ (requires `STRIPE_DATABASE_URL` in prod)

### Email Flows
- Lead confirmation + admin notifications: ✅
- Newsletter confirmation: ✅
- Stripe confirmations: ✅

### System Health & Error Handling
- API health endpoint and error handling: ✅
- Rate limiting + Turnstile integration: ✅ (Turnstile verification now async-safe using httpx)
- Pushover alerts: ✅
- Error reporting: ✅

### Leadgen App
- Lead capture landing + admin dashboard: ✅

### CRM (Out of Scope)
- CRM views and GraphQL queries: ⚠️ (acknowledged as not required for launch)

### E2E Coverage
- Playwright coverage exists; latest VPS run: ✅ (19 passed)

## Missing Resources
- ✅ **RESOLVED**: Production `STRIPE_DATABASE_URL` credentials for Stripe transaction storage. **Status**: Configured in production environment.
- ✅ **RESOLVED**: Decision on whether chat submissions must meet the same durability guarantees as lead forms. **Status**: Outbox pattern implemented for chat submissions.
