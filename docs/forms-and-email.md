# Forms and Email Status

This document lists every form or email-enabled workflow on the site and its current status.

## Main Website (apps/web)

All lead-capture forms submit to `POST /api/leads`, which forwards to the API at
`POST /public/leads` and now triggers:
- Admin notification email (to `ADMIN_EMAIL`, reply-to the lead email).
- Lead confirmation email (to the submitted email).

Forms using `/api/leads`:
- Contact form (`apps/web/src/components/ContactForm.tsx`): Live.
- Paid Media Audit (`apps/web/src/components/PaidMediaAuditForm.tsx`): Live.
- Conversion Teardown (`apps/web/src/components/ConversionTeardownForm.tsx`): Live.
- Growth Audit (`apps/web/src/components/GrowthAuditForm.tsx`): Live.
- Growth Sprint (`apps/web/src/components/GrowthSprintForm.tsx`): Live.
- Lead Routing (`apps/web/src/components/LeadRoutingForm.tsx`): Live.
- Email Nurture (`apps/web/src/components/EmailNurtureForm.tsx`): Live.
- Local SEO Authority (`apps/web/src/components/LocalSeoAuthorityForm.tsx`): Live.
- Retention + Referral (`apps/web/src/components/RetentionReferralForm.tsx`): Live.
- Proposal Wizard (`apps/web/src/components/ProposalWizard.tsx`): Live.
- Pricing Builder (`apps/web/src/components/PricingPackageBuilder.tsx`): Live.
  Also triggers a Stripe invoice for a 20% deposit (requires Stripe keys).
- ROI Calculator (`apps/web/src/components/RoiCalculator.tsx`): Live.
- Revenue Forecast (`apps/web/src/components/RevenueForecastCalculator.tsx`): Live.
- Best Fit Quiz (`apps/web/src/components/BestFitQuiz.tsx`): Live (if used on any page).

Newsletter / lead magnet:
- Lead Magnet form (`apps/web/src/components/LeadMagnetForm.tsx`) posts to `POST /api/newsletter`
  which forwards to `POST /public/newsletter` and triggers:
  - Admin notification email.
  - Subscriber confirmation email.
  Status: Live.

Bug reporting:
- Global error report button posts to `POST /api/bug-report`, which forwards to
  `POST /public/bug-reports` and triggers an admin notification email.
  Status: Live.

Message us:
- Floating message widget posts to `POST /api/chat`, which forwards to
  `POST /public/chat` and triggers:
  - Admin email notification.
  - Pushover notification (if configured).
  Status: Live.

## Leadgen App (leadgen)

- Leadgen landing page (`leadgen/public/index.html`) posts to `POST /lead` in
  `leadgen/src/server.js`.
- Stores lead data to JSON + CSV on disk and sends a notification email to `ALERT_EMAIL`.
- Forwards the lead to `LEADS_API_URL` and optional webhook if configured.
Status: Live if the leadgen app is deployed and running.

## Required Email Settings

The following environment variables must be set in production:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM`
- `ADMIN_EMAIL`

If SMTP is missing, forms still store data but email notifications are skipped.

## Pushover

For live chat phone notifications:
- `PUSHOVER_APP_TOKEN`
- `PUSHOVER_USER_KEY` or `PUSHOVER_GROUP_KEY`
