# Feature Implementation Plans
## Date: 2026-01-15

## Feature 1: AI Content Generator

### Overview
AI-powered content generation for blog posts, social media, and email campaigns. Uses OpenAI API or similar to generate marketing content.

### Why We Need It
- High demand from clients who want content but lack time/resources
- Differentiates us from competitors
- Can be offered as a premium service
- Increases client retention

### What We Gain
- New revenue stream (premium feature)
- Competitive advantage
- Client retention tool
- Lead magnet (free limited version)

### What We Sacrifice
- API costs (OpenAI usage)
- Development time (~2-3 days)
- Ongoing moderation needs

### Compatibility Check
✅ Compatible with existing:
- FastAPI backend can add new routes
- Next.js frontend can add new pages
- Existing auth system can protect premium features
- Database can store generated content
- Stripe can handle premium subscriptions

### Implementation Steps

1. **Backend API Route** (`apps/api/src/marketing_api/routes/content.py`)
   - Add OpenAI integration (or similar)
   - Create `/public/content/generate` endpoint
   - Support: blog posts, social media, email campaigns
   - Rate limiting and Turnstile protection
   - Store generated content in database

2. **Database Models** (`apps/api/src/marketing_api/db/models.py`)
   - `GeneratedContent` table:
     - id, user_id (nullable for public), content_type, prompt, generated_text, created_at
   - Migration: `0006_generated_content.py`

3. **Frontend Page** (`apps/web/src/app/content-generator/page.tsx`)
   - Form for content type selection
   - Prompt input
   - Display generated content
   - Copy to clipboard
   - Download as text/markdown

4. **API Integration** (`apps/web/src/app/api/content/route.ts`)
   - Proxy to backend API
   - Handle authentication for premium features
   - Error handling

5. **Pricing Integration**
   - Free tier: 3 generations/month
   - Premium: Unlimited (via Stripe subscription)

### Technical Details
- Use OpenAI GPT-4 or GPT-3.5-turbo
- Environment variable: `OPENAI_API_KEY`
- Rate limiting: 10 requests/hour for free, unlimited for premium
- Content moderation: Basic profanity filter

---

## Feature 2: Client Dashboard/Portal

### Overview
White-label client portal where clients can view their marketing reports, analytics, project status, and communicate with the team.

### Why We Need It
- Professional offering that increases perceived value
- Reduces support burden (self-service)
- Increases client retention
- Differentiates from competitors

### What We Gain
- Professional image
- Client satisfaction
- Reduced support time
- Upsell opportunities

### What We Sacrifice
- Development time (~3-4 days)
- Maintenance overhead
- Need to keep data updated

### Compatibility Check
✅ Compatible with existing:
- CRM system already has customer/lead models
- GraphQL API can be extended
- Auth system can handle client logins
- Can reuse CRM UI components

### Implementation Steps

1. **Database Models** (extend existing)
   - Add `ClientPortal` model linking to `Customer`
   - Add `PortalReport` model for storing reports
   - Add `PortalMessage` for client-team communication
   - Migration: `0007_client_portal.py`

2. **GraphQL Schema** (`apps/api/src/marketing_api/graphql/schema.py`)
   - Add client portal queries:
     - `clientReports`, `clientProjects`, `clientMessages`
   - Add mutations:
     - `sendClientMessage`, `updateClientPreferences`

3. **Client Auth System**
   - Extend existing auth to support client logins
   - Client tokens separate from admin tokens
   - Password reset for clients

4. **Frontend Portal** (`apps/web/src/app/portal/page.tsx`)
   - Client login page
   - Dashboard with:
     - Recent reports
     - Project status
     - Analytics summary
     - Message center
   - Reuse CRM shell components

5. **Report Generation**
   - API endpoint to generate PDF reports
   - Store in database, serve via portal
   - Auto-generate monthly reports

### Technical Details
- Client login: email + password (separate from admin)
- Reports: PDF generation using reportlab or similar
- Real-time updates: WebSocket or polling (start with polling)

---

## Feature 3: Website SEO Auditor

### Overview
Free tool that analyzes a website URL and provides SEO score, recommendations, and actionable insights. Great lead magnet.

### Why We Need It
- Excellent lead generation tool
- Demonstrates expertise
- Low cost to operate
- High demand

### What We Gain
- Lead generation (email capture required)
- SEO authority (backlinks when shared)
- Brand awareness
- Client acquisition tool

### What We Sacrifice
- Development time (~2-3 days)
- API costs (if using external SEO APIs)
- Server resources (crawling)

### Compatibility Check
✅ Compatible with existing:
- Can add new public route
- Lead capture system already exists
- Can store results in database

### Implementation Steps

1. **SEO Analysis Library**
   - Use `beautifulsoup4` for HTML parsing
   - Check: meta tags, headings, alt text, page speed, mobile-friendliness
   - Generate score (0-100)

2. **Backend API Route** (`apps/api/src/marketing_api/routes/seo.py`)
   - `/public/seo/audit` endpoint
   - Accept URL, analyze, return JSON
   - Rate limiting: 3 audits/day per IP
   - Require email for full report (lead capture)

3. **Database Models**
   - `SeoAudit` table:
     - id, url, email (nullable), score, findings_json, created_at
   - Migration: `0008_seo_audits.py`

4. **Frontend Page** (`apps/web/src/app/seo-audit/page.tsx`)
   - URL input form
   - Turnstile protection
   - Email capture for full report
   - Display results:
     - Overall score
     - Issues found
     - Recommendations
     - Downloadable PDF report

5. **Email Integration**
   - Send full report via email
   - Add to newsletter list
   - Follow-up sequence

### Technical Details
- Use `requests` + `beautifulsoup4` for basic analysis
- For advanced: integrate with PageSpeed Insights API (free)
- Cache results for 30 days (same URL)
- PDF generation for downloadable reports

---

## Feature 4: Chatbot/AI Assistant

### Overview
AI-powered chatbot that answers questions, qualifies leads, and provides 24/7 support. Upgrade existing "Message Us" widget.

### Why We Need It
- 24/7 availability
- Lead qualification
- Reduces support burden
- Modern, expected feature

### What We Gain
- Better lead qualification
- Reduced support time
- Professional image
- Higher engagement

### What We Sacrifice
- Development time (~2-3 days)
- API costs (OpenAI)
- Initial training/setup

### Compatibility Check
✅ Compatible with existing:
- Already have chat widget (`MessageUs` component)
- Chat messages stored in database
- Can enhance with AI responses

### Implementation Steps

1. **Enhance Chat Widget** (`apps/web/src/components/MessageUs.tsx`)
   - Add AI response capability
   - Show typing indicator
   - Handle AI vs human handoff

2. **Backend AI Integration** (`apps/api/src/marketing_api/routes/chat.py`)
   - New endpoint: `/public/chat/ai-response`
   - Use OpenAI for responses
   - Context: FAQ, services, pricing
   - Lead qualification questions

3. **Database Models** (extend existing)
   - Add `is_ai_response` flag to `ChatMessage`
   - Add `chat_session_id` for conversation tracking
   - Migration: `0009_chat_enhancements.py`

4. **AI Prompt Engineering**
   - Create system prompt with company info
   - FAQ knowledge base
   - Lead qualification flow
   - Escalation to human when needed

5. **Admin Dashboard**
   - View AI conversations
   - Handoff to human option
   - Analytics on AI performance

### Technical Details
- Use OpenAI GPT-3.5-turbo (cost-effective)
- Conversation context: last 10 messages
- Escalation triggers: "speak to human", complex questions
- Rate limiting: 20 messages/hour per session

---

## Feature 5: Email Marketing Automation

### Overview
Drip campaigns, segmentation, and automated email sequences for lead nurturing and client communication.

### Why We Need It
- Essential for modern marketing
- Increases conversion rates
- Client retention tool
- Revenue opportunity (premium feature)

### What We Gain
- Better lead nurturing
- Automated client communication
- New service offering
- Increased conversions

### What We Sacrifice
- Development time (~3-4 days)
- Email deliverability management
- Template creation/maintenance

### Compatibility Check
✅ Compatible with existing:
- Already have SMTP setup
- Newsletter system exists
- Lead capture in place
- Can extend with automation

### Implementation Steps

1. **Database Models**
   - `EmailCampaign` table: id, name, type, status, created_at
   - `EmailSequence` table: id, campaign_id, step_number, delay_days, subject, body
   - `EmailSubscriber` table: id, email, status, tags, subscribed_at
   - `EmailSend` table: id, subscriber_id, sequence_id, sent_at, opened_at, clicked_at
   - Migration: `0010_email_automation.py`

2. **Backend API Routes** (`apps/api/src/marketing_api/routes/email.py`)
   - Campaign management endpoints
   - Sequence creation/editing
   - Subscriber management
   - Send tracking

3. **Email Scheduler**
   - Background task (Celery or similar, or simple cron)
   - Check for emails to send
   - Process sequences
   - Track opens/clicks (pixel tracking)

4. **Frontend Admin** (`apps/web/src/app/crm/email/page.tsx`)
   - Campaign list
   - Create/edit campaigns
   - Sequence builder (drag-and-drop UI)
   - Subscriber management
   - Analytics dashboard

5. **Email Templates**
   - Template system (HTML + variables)
   - Preview before sending
   - A/B testing support

6. **Integration Points**
   - Auto-subscribe new leads
   - Tag based on form submissions
   - Trigger sequences on events

### Technical Details
- Use existing SMTP for sending
- Background job: Python scheduler or Celery
- Email tracking: 1x1 pixel for opens, link parameters for clicks
- Unsubscribe: One-click unsubscribe link
- Compliance: CAN-SPAM compliant

---

## Implementation Order

1. **Website SEO Auditor** (Easiest, highest lead gen value)
2. **Chatbot/AI Assistant** (Enhances existing feature)
3. **AI Content Generator** (High value, moderate complexity)
4. **Email Marketing Automation** (Complex but essential)
5. **Client Dashboard/Portal** (Most complex, but high value)

## Notes
- All features will be tested with E2E tests
- All features will respect existing auth/rate limiting
- All features will use existing database patterns
- All features will follow existing code style
