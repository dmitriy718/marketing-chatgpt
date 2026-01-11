# Server Documentation
## Internal/Technical Documentation

This section contains technical documentation for server-side features, APIs, and internal systems that clients don't need to know about.

## API Documentation

### REST API
- [REST API Documentation](./api/rest-api.md) - Comprehensive REST API reference

### Public Endpoints
- [Lead Capture API](./api/lead-capture.md)
- [Newsletter API](./api/newsletter.md)
- [Chat API](./api/chat.md)
- [Stripe Integration](./api/stripe.md)
- [SEO Tools API](./api/seo-tools.md)
- [Content Generation API](./api/content-generation.md)
- [Email Automation API](./api/email-automation.md)

### Authentication
- [JWT Authentication](./auth/jwt.md)
- [Role-Based Access Control](./auth/rbac.md)
- [Internal API Tokens](./auth/internal-tokens.md)

### Database
- [Database Models](./database/models.md)
- [Migrations](./database/migrations.md)
- [Stripe Database](./database/stripe-db.md)

## Features

### Round 1 Features
- [SEO Auditor Implementation](./features/seo-auditor.md)
- [AI Chatbot Implementation](./features/ai-chatbot.md)
- [Content Generator Implementation](./features/content-generator.md)
- [Email Automation Implementation](./features/email-automation.md)
- [Client Portal Implementation](./features/client-portal.md)

### Round 2 Features
- [Competitor Comparison Implementation](./features/competitor-comparison.md)
- [Readiness Assessment Implementation](./features/readiness-assessment.md)
- [Intelligence Report Implementation](./features/intelligence-report.md)
- [Lead Potential Calculator Implementation](./features/lead-potential-calculator.md)
- [Consultation Scheduler Implementation](./features/consultation-scheduler.md)

## Infrastructure

- [Docker Setup](./infrastructure/docker.md)
- [Database Setup](./infrastructure/database.md)
- [Deployment](./infrastructure/deployment.md)
- [Monitoring](./infrastructure/monitoring.md)

## Monitoring

- [PostHog Monitoring & Error Tracking](./monitoring/posthog.md)

## Admin Interfaces

- **Email Automation Admin** (`/crm/email-automation`) - Manage email campaigns, sequences, and subscribers
- **Consultation Calendar** (`/crm/consultations`) - View and manage consultation bookings with calendar interface

## API Endpoints

### Email Automation Admin
- `GET /admin/email/campaigns` - List all campaigns
- `POST /admin/email/campaigns` - Create campaign
- `PUT /admin/email/campaigns/{id}` - Update campaign
- `DELETE /admin/email/campaigns/{id}` - Delete campaign
- `GET /admin/email/campaigns/{id}/sequences` - List sequences for campaign
- `POST /admin/email/sequences` - Create sequence
- `GET /admin/email/subscribers` - List subscribers
- `GET /admin/email/analytics` - Get email analytics
- `GET /admin/email/form-sources` - Get form sources for mapping

### Consultation Admin
- `GET /admin/consultation/bookings` - List bookings
- `POST /admin/consultation/bookings` - Create booking
- `PUT /admin/consultation/bookings/{id}` - Update booking
- `DELETE /admin/consultation/bookings/{id}` - Delete booking
- `GET /admin/consultation/availability` - Get available time slots

All admin endpoints require JWT authentication.

## Security

- [Rate Limiting](./security/rate-limiting.md)
- [Turnstile Integration](./security/turnstile.md)
- [Input Validation](./security/validation.md)
- [Error Handling](./security/error-handling.md)
