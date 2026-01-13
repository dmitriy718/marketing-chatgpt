# Platform Enhancements Documentation

**Date**: January 12, 2026  
**Version**: 1.0  
**Status**: Planning & Design Phase (with partial implementation underway)

## Overview

This document provides comprehensive implementation plans for five major enhancement areas to expand the Carolina Growth marketing platform. Each section includes detailed technical specifications, step-by-step implementation guides, tooling recommendations, and risk assessments.

### Implementation Status & Rollout Policy

- We have already begun implementing Tool 2 (Backlink Analyzer), Tool 3 (A/B Testing Platform), and Tool 4 (Keyword Research Tool), and these three will ship directly to production.
- All other enhancements described in this document must be tested on the development server before going live.

### Decision Log (Required Updates)

- **Social Media Scheduler**: The Instagram Basic Display API is read-only and cannot publish/schedule posts. The correct path for scheduling requires the Instagram Graph API with a connected Facebook Page and appropriate permissions.
- **A/B Testing Middleware**: Variant serving must include a cache-safe routing strategy (e.g., cookie-based variation with explicit cache-control and middleware matchers) to prevent variant leakage and caching issues.
- **Landing Page Builder**: The document references an existing `apps/web/src/app/landing/[slug]/page.tsx` route, but it does not exist in this repo. This should be created explicitly as a new route.
- **Cohort Analytics Source of Truth**: The plan currently mixes PostHog cohort queries and custom DB-backed cohorts. Pick one canonical source or define reconciliation rules to avoid metric divergence.
- **Background Jobs**: If introducing Celery/Redis, define infra, deployment, and migration from current BackgroundTasks usage. Otherwise, keep job execution within the existing async/background model.
- **OAuth Token Storage**: “Encrypted credentials” requires a concrete key management plan (KMS or envelope encryption, rotation, and access controls).

## Table of Contents

1. [Additional Marketing Tools](#1-additional-marketing-tools)
2. [Advanced Analytics Features](#2-advanced-analytics-features)
3. [Mobile App Development](#3-mobile-app-development)
4. [Additional Integrations](#4-additional-integrations)
5. [Enhanced Reporting System](#5-enhanced-reporting-system)

---

## 1. Additional Marketing Tools

This section proposes five new marketing tools to complement the existing platform features. Each tool is designed to provide value to clients while generating leads and demonstrating platform capabilities.

### Current Platform Tools

The platform currently includes:
- Website SEO Auditor
- AI Content Generator
- Competitor Comparison Tool
- Marketing Readiness Assessment
- Competitive Intelligence Report
- Lead Generation Potential Calculator
- Email Marketing Automation
- Client Dashboard/Portal
- AI Chatbot/Assistant
- Free Consultation Scheduler

### Tool 1: Social Media Scheduler

#### Feature Summary

A multi-platform social media content scheduling tool that allows users to create, schedule, and manage posts across major social networks (Facebook, Twitter/X, LinkedIn, Instagram). The tool includes content calendar visualization, bulk upload capabilities, and performance tracking.

#### Technical Approach

**Architecture:**
- Backend: FastAPI routes for scheduling logic and API integrations
- Frontend: React calendar component with drag-and-drop scheduling
- Database: PostgreSQL tables for scheduled posts, social accounts, and analytics
- External APIs: Platform-specific APIs (Facebook Graph API, Twitter API v2, LinkedIn API, Instagram Basic Display API)

**Libraries & Tools:**
- `requests` or `httpx` for API calls
- `celery` or `apscheduler` for background job scheduling
- `python-social-auth` for OAuth flows
- FullCalendar (already in use) for calendar UI
- React DnD for drag-and-drop

#### Implementation Plan

**Step 1: Database Schema Design**

Create migration file: `apps/api/migrations/versions/XXXX_add_social_media_tables.py`

```python
# Models to create:
# - SocialAccount: OAuth credentials per platform per user
# - ScheduledPost: Post content, schedule time, platform, status
# - PostAnalytics: Engagement metrics after posting
```

**Step 2: OAuth Integration Backend**

Create: `apps/api/src/marketing_api/routes/social_auth.py`

- Implement OAuth flows for each platform
- Store encrypted credentials in database
- Handle token refresh automatically
- Support multiple accounts per platform

**Step 3: Scheduling Engine**

Create: `apps/api/src/marketing_api/routes/social_scheduler.py`

- REST API endpoints for CRUD operations on scheduled posts
- Background worker to publish posts at scheduled times
- Retry logic for failed posts
- Webhook handlers for platform callbacks

**Step 4: Frontend Calendar Interface**

Create: `apps/web/src/app/social-scheduler/page.tsx` and `client.tsx`

- FullCalendar integration for visual scheduling
- Post creation modal with platform selector
- Bulk upload interface (CSV import)
- Preview functionality before scheduling

**Step 5: Analytics Integration**

- Track post performance via platform APIs
- Store metrics in PostAnalytics table
- Display engagement data in dashboard
- Export reports

#### Dependencies

- OAuth apps registered with each platform
- API rate limits understanding
- Background job queue (Redis recommended for Celery)
- Secure credential storage (encryption at rest)

#### Considerations

**Benefits:**
- High-value feature for clients
- Increases platform stickiness
- Can be monetized as premium feature
- Generates consistent usage data

**Risks:**
- Complex OAuth flows across multiple platforms
- API rate limits may restrict usage
- Platform API changes require maintenance
- Credential security is critical

**Estimated Complexity:** High (8/10)  
**Timeline:** 3-4 weeks  
**Dependencies:** Redis for job queue, OAuth app registrations

---

### Tool 2: Backlink Analyzer

#### Feature Summary

An SEO tool that analyzes a website's backlink profile, identifies linking opportunities, and provides actionable insights for link building campaigns. Includes competitor backlink analysis and domain authority scoring.

#### Technical Approach

**Architecture:**
- Backend: FastAPI routes for backlink data fetching and analysis
- Frontend: Data visualization dashboard with tables and charts
- External APIs: Ahrefs API, Moz API, or Majestic API (or web scraping with rate limiting)
- Database: Cache backlink data to reduce API costs

**Libraries & Tools:**
- `beautifulsoup4` and `lxml` (already in use) for web scraping
- `httpx` for API calls
- Chart.js or Recharts for visualizations
- Background tasks for long-running analyses

#### Implementation Plan

**Step 1: Database Schema**

Create migration: `apps/api/migrations/versions/XXXX_add_backlink_tables.py`

```python
# Models:
# - BacklinkAnalysis: Analysis sessions
# - Backlink: Individual backlink records
# - CompetitorComparison: Side-by-side comparisons
```

**Step 2: Backend Analysis Engine**

Create: `apps/api/src/marketing_api/routes/backlink_analyzer.py`

- Endpoint to initiate analysis
- Background task to fetch backlink data
- Data processing and scoring algorithms
- Competitor comparison logic

**Step 3: API Integration or Scraping**

- Integrate with Ahrefs/Moz API (preferred) or
- Implement respectful web scraping with delays
- Cache results to minimize API calls
- Handle rate limiting gracefully

**Step 4: Frontend Dashboard**

Create: `apps/web/src/app/backlink-analyzer/page.tsx` and `client.tsx`

- URL input and analysis trigger
- Results visualization:
  - Backlink quality score
  - Top referring domains
  - Anchor text distribution
  - Competitor comparison charts
- Export functionality (CSV, PDF)

**Step 5: Reporting**

- Generate comprehensive backlink reports
- Email reports to users
- Store historical data for trend analysis

#### Dependencies

- API keys for Ahrefs/Moz (or scraping infrastructure)
- Sufficient API quota or scraping capacity
- Background job processing

#### Considerations

**Benefits:**
- High-value SEO tool
- Complements existing SEO Auditor
- Strong lead magnet
- Demonstrates technical expertise

**Risks:**
- API costs can be high
- Scraping may violate ToS of some services
- Data freshness requires regular updates
- Competitor analysis adds complexity

**Estimated Complexity:** Medium-High (7/10)  
**Timeline:** 2-3 weeks  
**Dependencies:** Third-party API access or robust scraping infrastructure

---

### Tool 3: A/B Testing Platform

#### Feature Summary

A built-in A/B testing platform that allows users to test variations of landing pages, email campaigns, and CTAs. Includes statistical significance calculations, winner determination, and integration with existing tools.

#### Technical Approach

**Architecture:**
- Backend: FastAPI routes for test management and variant serving
- Frontend: Test builder UI and results dashboard
- Database: Test definitions, variant assignments, conversion tracking
- Middleware: Variant assignment logic (cookie-based or user-based)

**Libraries & Tools:**
- Statistical libraries: `scipy` for significance testing
- PostHog (already integrated) for event tracking
- React for test builder UI
- Chart.js for results visualization

#### Implementation Plan

**Step 1: Database Schema**

Create migration: `apps/api/migrations/versions/XXXX_add_ab_testing_tables.py`

```python
# Models:
# - ABTest: Test definition, status, dates
# - TestVariant: Variant content and configuration
# - TestAssignment: User-to-variant mapping
# - TestConversion: Conversion events per variant
```

**Step 2: Backend Test Management API**

Create: `apps/api/src/marketing_api/routes/ab_testing.py`

- CRUD endpoints for tests
- Variant assignment logic (random or weighted)
- Conversion tracking endpoints
- Statistical analysis endpoints

**Step 3: Variant Serving Middleware**

Create: `apps/web/src/middleware.ts` (Next.js middleware)

- Check for active tests
- Assign variants based on user ID or cookie
- Inject variant content into pages
- Track assignments

**Step 4: Frontend Test Builder**

Create: `apps/web/src/app/ab-testing/page.tsx` and `client.tsx`

- Visual test builder interface
- Variant editor (WYSIWYG or code)
- Traffic split configuration
- Test activation controls

**Step 5: Results Dashboard**

- Real-time conversion tracking
- Statistical significance calculator
- Winner determination logic
- Export test results

#### Dependencies

- PostHog integration for event tracking
- Statistical analysis library
- Middleware infrastructure

#### Considerations

**Benefits:**
- High-value feature for data-driven clients
- Increases engagement with platform
- Can improve client conversion rates
- Demonstrates analytical capabilities

**Risks:**
- Statistical complexity requires careful implementation
- Variant serving adds latency
- Test pollution if not properly isolated
- Requires significant traffic for meaningful results

**Estimated Complexity:** High (8/10)  
**Timeline:** 3-4 weeks  
**Dependencies:** PostHog event tracking, statistical libraries

---

### Tool 4: Keyword Research Tool

#### Feature Summary

An SEO keyword research tool that provides keyword suggestions, search volume estimates, competition analysis, and content gap identification. Integrates with existing SEO tools for comprehensive SEO workflow.

#### Technical Approach

**Architecture:**
- Backend: FastAPI routes for keyword data fetching
- Frontend: Keyword search interface and results table
- External APIs: Google Keyword Planner API, SEMrush API, or Ahrefs API
- Database: Cache keyword data and user research sessions

**Libraries & Tools:**
- `httpx` for API calls
- `pandas` (optional) for data processing
- React Data Grid for keyword tables
- Chart.js for trend visualization

#### Implementation Plan

**Step 1: Database Schema**

Create migration: `apps/api/migrations/versions/XXXX_add_keyword_research_tables.py`

```python
# Models:
# - KeywordResearch: Research sessions
# - Keyword: Keyword data (volume, difficulty, etc.)
# - KeywordGroup: Organized keyword clusters
```

**Step 2: Backend Keyword API**

Create: `apps/api/src/marketing_api/routes/keyword_research.py`

- Keyword suggestion endpoint
- Search volume lookup
- Competition analysis
- Related keywords discovery
- Content gap analysis

**Step 3: External API Integration**

- Integrate with Google Keyword Planner (requires Google Ads account)
- Or use SEMrush/Ahrefs API
- Implement caching to reduce API costs
- Handle rate limiting

**Step 4: Frontend Research Interface**

Create: `apps/web/src/app/keyword-research/page.tsx` and `client.tsx`

- Seed keyword input
- Results table with sortable columns
- Filters (volume range, difficulty, etc.)
- Export functionality
- Keyword grouping/clustering

**Step 5: Integration with SEO Tools**

- Link to SEO Auditor results
- Suggest keywords based on current content
- Track keyword rankings over time

#### Dependencies

- Google Ads account or third-party API access
- API quota management
- Data caching infrastructure

#### Considerations

**Benefits:**
- Complements SEO Auditor perfectly
- High demand from SEO-focused clients
- Can be offered as premium feature
- Generates valuable lead data

**Risks:**
- Google Keyword Planner requires Google Ads account
- Third-party APIs can be expensive
- Data accuracy depends on API source
- Requires regular updates for fresh data

**Estimated Complexity:** Medium (6/10)  
**Timeline:** 2-3 weeks  
**Dependencies:** API access (Google Ads or third-party)

---

### Tool 5: Landing Page Builder

#### Feature Summary

A drag-and-drop landing page builder that allows users to create high-converting landing pages without coding. Includes template library, A/B testing integration, and analytics tracking.

#### Technical Approach

**Architecture:**
- Backend: FastAPI routes for page storage and rendering
- Frontend: React-based page builder with drag-and-drop
- Database: Page definitions (JSON schema), templates, published pages
- Rendering: Server-side rendering for published pages

**Libraries & Tools:**
- `react-dnd` or `@dnd-kit/core` for drag-and-drop
- `react-json-view` for schema editing
- Next.js dynamic routes for page rendering
- Template engine for page generation

#### Implementation Plan

**Step 1: Database Schema**

Create migration: `apps/api/migrations/versions/XXXX_add_landing_page_builder_tables.py`

```python
# Models:
# - LandingPage: Page metadata and schema
# - PageTemplate: Reusable templates
# - PageVersion: Version history
# - PageAnalytics: Performance data
```

**Step 2: Backend Page Management API**

Create: `apps/api/src/marketing_api/routes/landing_page_builder.py`

- CRUD endpoints for pages
- Template management
- Page publishing logic
- Analytics endpoints

**Step 3: Page Builder Frontend**

Create: `apps/web/src/app/landing-page-builder/page.tsx` and `client.tsx`

- Drag-and-drop interface
- Component library (headers, forms, CTAs, etc.)
- Live preview
- Responsive design controls
- Template selector

**Step 4: Page Rendering System**

Create: `apps/web/src/app/landing/[slug]/page.tsx` (enhance existing)

- Dynamic page rendering from JSON schema
- SEO optimization
- Analytics integration
- A/B testing variant support

**Step 5: Template System**

- Pre-built template library
- Template marketplace (future)
- Custom template creation
- Template import/export

#### Dependencies

- Drag-and-drop library
- Component library
- Template system

#### Considerations

**Benefits:**
- Extremely high-value feature
- Increases platform stickiness significantly
- Can be major differentiator
- Opens new revenue streams

**Risks:**
- Very complex to build well
- Requires extensive UI/UX work
- Performance considerations for complex pages
- Maintenance burden for component library

**Estimated Complexity:** Very High (9/10)  
**Timeline:** 6-8 weeks  
**Dependencies:** Drag-and-drop library, component design system

---

## 2. Advanced Analytics Features

This section outlines five advanced analytics capabilities to enhance data insights and decision-making. All features integrate with the existing PostHog infrastructure.

### Current Analytics Setup

- PostHog integration for event tracking
- Basic feature usage tracking
- Conversion tracking
- Page engagement metrics
- Form submission tracking

### Feature 1: Cohort Analysis Dashboard

#### Purpose and Value

Cohort analysis segments users by acquisition date and tracks their behavior over time. This reveals retention patterns, identifies high-value user segments, and helps optimize marketing strategies.

**Value Proposition:**
- Understand user retention by acquisition cohort
- Identify which marketing channels bring most valuable users
- Optimize onboarding based on cohort performance
- Measure long-term customer value

#### Integration Approach

**PostHog Integration:**
- Use PostHog's cohort API to create dynamic cohorts
- Leverage PostHog's retention analysis features
- Custom queries for advanced cohort metrics

**Custom Implementation:**
- Store cohort assignments in database
- Calculate retention metrics server-side
- Build custom visualization dashboard

#### Implementation Plan

**Step 1: Backend Cohort Service**

Create: `apps/api/src/marketing_api/routes/analytics/cohorts.py`

- Endpoint to define cohorts (by acquisition date, source, etc.)
- Retention calculation logic
- Cohort comparison endpoints
- Export functionality

**Step 2: Database Schema**

Extend existing analytics tables or create:
- `UserCohort`: User-to-cohort assignments
- `CohortDefinition`: Cohort criteria
- `CohortMetrics`: Calculated metrics per cohort

**Step 3: PostHog Integration**

Enhance: `apps/api/src/marketing_api/posthog_client.py`

- Add cohort creation functions
- Implement retention queries
- Sync cohort data with PostHog

**Step 4: Frontend Dashboard**

Create: `apps/web/src/app/crm/analytics/cohorts/page.tsx` and `client.tsx`

- Cohort selector
- Retention curve visualization (Chart.js or D3)
- Cohort comparison table
- Time period filters
- Export options

**Step 5: Automated Reporting**

- Scheduled cohort reports
- Email delivery to stakeholders
- Alert on retention drops

#### Metrics and Libraries

**Metrics:**
- Retention rate (Day 1, Day 7, Day 30)
- Revenue per cohort
- Feature adoption by cohort
- Churn rate by cohort

**Libraries:**
- PostHog Python SDK (already in use)
- Chart.js or Recharts for visualizations
- D3.js for advanced charts (optional)

#### Considerations

**Benefits:**
- Deep insights into user behavior
- Data-driven marketing decisions
- Identifies high-value acquisition channels
- Improves retention strategies

**Risks:**
- Requires sufficient historical data
- Complex calculations can be slow
- PostHog API rate limits
- Requires data science expertise for interpretation

**Estimated Complexity:** Medium-High (7/10)  
**Timeline:** 2-3 weeks

---

### Feature 2: Funnel Visualization

#### Purpose and Value

Multi-step conversion funnel tracking visualizes user progression through defined steps (e.g., landing page → signup → trial → paid). Identifies drop-off points and optimization opportunities.

**Value Proposition:**
- Visualize conversion paths
- Identify bottlenecks in user journey
- Measure step-by-step conversion rates
- A/B test funnel improvements

#### Integration Approach

**PostHog Integration:**
- Use PostHog Funnels API
- Leverage existing event tracking
- Custom funnel definitions

**Custom Implementation:**
- Store funnel definitions in database
- Calculate conversion rates server-side
- Build custom visualization

#### Implementation Plan

**Step 1: Backend Funnel Service**

Create: `apps/api/src/marketing_api/routes/analytics/funnels.py`

- Funnel definition CRUD
- Conversion rate calculation
- Drop-off analysis
- Funnel comparison endpoints

**Step 2: Database Schema**

Create: `apps/api/migrations/versions/XXXX_add_funnel_tables.py`

```python
# Models:
# - Funnel: Funnel definition
# - FunnelStep: Individual steps in funnel
# - FunnelConversion: User progression tracking
```

**Step 3: PostHog Integration**

- Use PostHog Funnels API for data
- Map custom events to funnel steps
- Handle time windows and filters

**Step 4: Frontend Visualization**

Create: `apps/web/src/app/crm/analytics/funnels/page.tsx` and `client.tsx`

- Funnel builder interface
- Visual funnel diagram (custom or library)
- Conversion rate display
- Drop-off analysis
- Time period filters

**Step 5: Funnel Builder UI**

- Drag-and-drop step builder
- Event selection for each step
- Filter configuration
- Save and share funnels

#### Metrics and Libraries

**Metrics:**
- Step conversion rates
- Overall funnel conversion rate
- Drop-off percentages
- Time between steps
- Funnel completion time

**Libraries:**
- PostHog Funnels API
- React Flow or custom SVG for visualization
- Chart.js for conversion rate charts

#### Considerations

**Benefits:**
- Clear visualization of user journey
- Identifies optimization opportunities
- Supports A/B testing decisions
- Improves conversion rates

**Risks:**
- Requires well-defined event tracking
- Complex funnels can be confusing
- PostHog API limitations
- Real-time updates can be expensive

**Estimated Complexity:** Medium (6/10)  
**Timeline:** 2 weeks

---

### Feature 3: Attribution Modeling

#### Purpose and Value

Multi-touch attribution analysis determines which marketing touchpoints contribute to conversions. Moves beyond last-click to understand full customer journey.

**Value Proposition:**
- Understand full customer journey
- Optimize marketing spend allocation
- Identify high-value touchpoints
- Measure true marketing ROI

#### Integration Approach

**PostHog Integration:**
- Use PostHog's session recording and event data
- Leverage UTM parameter tracking
- Custom attribution logic

**Custom Implementation:**
- Store touchpoint data in database
- Implement attribution models (first-touch, last-touch, linear, time-decay, position-based)
- Calculate attribution weights

#### Implementation Plan

**Step 1: Backend Attribution Service**

Create: `apps/api/src/marketing_api/routes/analytics/attribution.py`

- Touchpoint tracking endpoints
- Attribution model calculation
- Conversion attribution assignment
- ROI calculation by channel

**Step 2: Database Schema**

Create: `apps/api/migrations/versions/XXXX_add_attribution_tables.py`

```python
# Models:
# - Touchpoint: Marketing interaction record
# - AttributionModel: Model definition
# - AttributionResult: Calculated attributions
```

**Step 3: Touchpoint Tracking**

Enhance existing UTM tracking:
- Store all touchpoints per user
- Track across sessions
- Link touchpoints to conversions

**Step 4: Attribution Models**

Implement multiple models:
- First-touch attribution
- Last-touch attribution
- Linear attribution
- Time-decay attribution
- Position-based attribution (U-shaped)

**Step 5: Frontend Dashboard**

Create: `apps/web/src/app/crm/analytics/attribution/page.tsx` and `client.tsx`

- Attribution model selector
- Channel performance visualization
- Touchpoint journey view
- ROI by channel
- Model comparison

#### Metrics and Libraries

**Metrics:**
- Attribution by channel
- Touchpoint count per conversion
- Time to conversion
- Channel ROI
- Model comparison metrics

**Libraries:**
- PostHog for event data
- Chart.js for visualizations
- Custom attribution algorithms

#### Considerations

**Benefits:**
- Accurate marketing ROI measurement
- Optimizes budget allocation
- Understands full customer journey
- Data-driven marketing decisions

**Risks:**
- Complex to implement correctly
- Requires comprehensive tracking
- Attribution models are approximations
- Can be computationally expensive

**Estimated Complexity:** High (8/10)  
**Timeline:** 3-4 weeks

---

### Feature 4: Real-time Event Streaming

#### Purpose and Value

Live activity monitoring dashboard shows real-time user actions, conversions, and system events as they happen. Enables immediate response to issues and opportunities.

**Value Proposition:**
- Monitor platform activity in real-time
- Immediate issue detection
- Live conversion tracking
- Enhanced operational awareness

#### Integration Approach

**PostHog Integration:**
- Use PostHog's live events API
- WebSocket connection for real-time updates
- Event filtering and aggregation

**Custom Implementation:**
- WebSocket server for real-time updates
- Event streaming from PostHog
- Client-side event aggregation

#### Implementation Plan

**Step 1: Backend WebSocket Service**

Create: `apps/api/src/marketing_api/routes/analytics/streaming.py`

- WebSocket endpoint for real-time events
- Event filtering and transformation
- Connection management
- Rate limiting

**Step 2: PostHog Integration**

- Subscribe to PostHog live events
- Transform events to standard format
- Filter events based on user permissions
- Aggregate events server-side

**Step 3: Frontend Streaming Dashboard**

Create: `apps/web/src/app/crm/analytics/live/page.tsx` and `client.tsx`

- WebSocket client connection
- Real-time event feed
- Event filtering UI
- Activity metrics (events/minute, etc.)
- Alert system for important events

**Step 4: Event Types and Visualization**

- User actions (page views, clicks, form submissions)
- Conversions (signups, purchases, etc.)
- System events (errors, API calls)
- Custom event types

**Step 5: Historical Context**

- Show recent events alongside live stream
- Event search functionality
- Export event logs
- Event replay for debugging

#### Metrics and Libraries

**Metrics:**
- Events per minute/second
- Active users count
- Conversion rate (real-time)
- Error rate
- API response times

**Libraries:**
- WebSocket library (FastAPI WebSockets)
- PostHog live events API
- React for real-time UI updates
- Chart.js for live charts

#### Considerations

**Benefits:**
- Immediate issue detection
- Enhanced monitoring capabilities
- Real-time business insights
- Improved operational efficiency

**Risks:**
- High server load for many connections
- WebSocket connection management complexity
- PostHog API rate limits
- Requires efficient event filtering

**Estimated Complexity:** Medium-High (7/10)  
**Timeline:** 2-3 weeks

---

### Feature 5: Custom KPI Builder

#### Purpose and Value

User-defined metric calculation system that allows users to create custom KPIs from available data. Supports complex calculations, comparisons, and goal tracking.

**Value Proposition:**
- Flexible metric definition
- Business-specific KPIs
- Goal tracking and alerts
- Custom dashboards

#### Integration Approach

**PostHog Integration:**
- Query PostHog data via API
- Use PostHog insights API
- Custom metric calculations

**Custom Implementation:**
- KPI definition language (JSON schema)
- Metric calculation engine
- Goal tracking system
- Alert system

#### Implementation Plan

**Step 1: Backend KPI Service**

Create: `apps/api/src/marketing_api/routes/analytics/kpis.py`

- KPI definition CRUD
- Metric calculation engine
- Goal tracking
- Alert triggers

**Step 2: Database Schema**

Create: `apps/api/migrations/versions/XXXX_add_kpi_tables.py`

```python
# Models:
# - KPI: KPI definition and formula
# - KPICalculation: Calculated values over time
# - KPIGoal: Target values and alerts
# - KPIAlert: Alert history
```

**Step 3: Calculation Engine**

- Formula parser (support basic math, aggregations)
- Data source integration (PostHog, database)
- Caching for performance
- Scheduled calculations

**Step 4: Frontend KPI Builder**

Create: `apps/web/src/app/crm/analytics/kpis/page.tsx` and `client.tsx`

- Visual KPI builder interface
- Formula editor with autocomplete
- Data source selector
- Goal configuration
- Alert setup

**Step 5: KPI Dashboard**

- KPI cards with current values
- Trend visualization
- Goal progress indicators
- Alert notifications
- Export functionality

#### Metrics and Libraries

**Metrics:**
- Custom calculations (revenue per user, LTV, etc.)
- Goal progress
- Trend analysis
- Comparative metrics

**Libraries:**
- Formula parser (custom or library)
- PostHog API for data
- Chart.js for visualization
- React for builder UI

#### Considerations

**Benefits:**
- Highly flexible analytics
- Business-specific insights
- Goal tracking and accountability
- Customizable dashboards

**Risks:**
- Complex formula validation
- Performance for complex calculations
- User education required
- Potential for incorrect formulas

**Estimated Complexity:** High (8/10)  
**Timeline:** 3-4 weeks

---

## 3. Mobile App Development

This section provides a comprehensive roadmap for developing a mobile application with full feature parity to the web platform.

### Architecture Decision Matrix

#### Option 1: React Native

**Pros:**
- Code sharing with web (React components)
- Single codebase for iOS and Android
- Large ecosystem and community
- Hot reload for fast development
- Can leverage existing React knowledge

**Cons:**
- Performance limitations for complex animations
- Native module dependencies
- Larger app size
- Platform-specific code still needed

#### Option 2: Native Development (Swift/Kotlin)

**Pros:**
- Best performance
- Full platform feature access
- Native UI/UX
- Platform-specific optimizations

**Cons:**
- Two separate codebases
- Higher development cost
- Longer development time
- Requires platform-specific expertise

#### Option 3: Progressive Web App (PWA)

**Pros:**
- Single codebase (web)
- Fast development
- Easy updates
- No app store approval

**Cons:**
- Limited native features
- Performance limitations
- App store distribution challenges
- Offline functionality constraints

#### Recommended Approach: React Native with Expo

**Rationale:**
- Best balance of code sharing and native capabilities
- Expo simplifies deployment and updates
- Can leverage existing React/TypeScript codebase
- Good performance for business applications
- Easier maintenance with single codebase

### Monorepo Code Sharing Strategy

**Shared Code Structure:**

```
apps/
  web/          # Next.js web app
  api/          # FastAPI backend
  mobile/       # React Native app
  shared/       # Shared code (NEW)
    types/      # TypeScript types
    utils/      # Utility functions
    constants/  # Shared constants
    api/        # API client (shared)
```

**Code Sharing Approach:**

1. **API Client**: Extract API client to `apps/shared/api/`
   - Use `fetch` or `axios` (works in both web and React Native)
   - Shared request/response types
   - Error handling utilities

2. **Type Definitions**: Move to `apps/shared/types/`
   - User types
   - API response types
   - Business logic types

3. **Business Logic**: Extract to `apps/shared/utils/`
   - Data transformation functions
   - Validation logic
   - Calculation utilities

4. **Constants**: Shared constants in `apps/shared/constants/`
   - API endpoints
   - Configuration values
   - Enums

### Feature Parity Mapping

#### Core Features (Phase 1 - MVP)

| Web Feature | Mobile Implementation | Priority |
|------------|----------------------|----------|
| Authentication | React Native Auth0 or custom JWT | High |
| Client Portal | Native navigation with tab bar | High |
| Dashboard | Responsive mobile dashboard | High |
| Lead Management | List view with filters | High |
| Email Automation | Simplified mobile interface | Medium |
| Consultation Calendar | FullCalendar React Native | Medium |

#### Marketing Tools (Phase 2)

| Web Feature | Mobile Implementation | Priority |
|------------|----------------------|----------|
| SEO Auditor | Mobile-optimized form | Medium |
| Content Generator | Simplified input/output | Medium |
| Competitor Comparison | Mobile-friendly results | Low |
| Readiness Assessment | Mobile quiz interface | Medium |
| Lead Calculator | Mobile calculator UI | Low |

#### Advanced Features (Phase 3)

| Web Feature | Mobile Implementation | Priority |
|------------|----------------------|----------|
| Analytics Dashboard | Mobile charts (Victory Native) | Medium |
| Reporting | PDF viewer and export | Low |
| A/B Testing | Mobile variant serving | Low |
| Social Scheduler | Mobile calendar interface | Low |

### Authentication Flow

**Implementation:**

1. **JWT Token Storage**
   - Use `@react-native-async-storage/async-storage` for secure storage
   - Implement token refresh logic
   - Handle token expiration gracefully

2. **OAuth Integration**
   - Support social login (Google, Apple)
   - Use `expo-auth-session` for OAuth flows
   - Store credentials securely

3. **Biometric Authentication**
   - Face ID / Touch ID for quick login
   - Use `expo-local-authentication`
   - Fallback to password

**Code Structure:**

```typescript
// apps/mobile/src/auth/
  - AuthContext.tsx      # Auth state management
  - useAuth.ts          # Auth hook
  - LoginScreen.tsx     # Login UI
  - BiometricAuth.tsx   # Biometric wrapper
```

### API Integration Patterns

**Shared API Client:**

```typescript
// apps/shared/api/client.ts
export class ApiClient {
  private baseUrl: string;
  private token: string | null;

  async request<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    // Shared request logic
  }
}
```

**Mobile-Specific Considerations:**

- Network state detection (`@react-native-community/netinfo`)
- Offline queue for requests
- Request retry logic
- Background sync

### Testing Strategy

#### Unit Testing

- **Framework**: Jest
- **Coverage**: Business logic, utilities, API client
- **Location**: `apps/mobile/__tests__/`

#### Integration Testing

- **Framework**: React Native Testing Library
- **Focus**: Component integration, API calls
- **Mock**: API responses, native modules

#### E2E Testing

- **Framework**: Detox or Maestro
- **Coverage**: Critical user flows
- **CI/CD**: Run on every PR

**Test Structure:**

```
apps/mobile/
  __tests__/
    unit/
      utils.test.ts
      api.test.ts
    integration/
      components.test.tsx
    e2e/
      auth.spec.ts
      dashboard.spec.ts
```

### Deployment Strategy

#### Development

- **Expo Go**: For rapid development and testing
- **Development Build**: For custom native code testing
- **Simulators**: iOS Simulator, Android Emulator

#### Staging

- **Expo EAS Build**: Cloud builds for testing
- **TestFlight (iOS)**: Beta testing
- **Internal Testing (Android)**: Google Play internal track

#### Production

- **App Store (iOS)**:
  - Use Expo Application Services (EAS)
  - Automated submission
  - Version management

- **Google Play (Android)**:
  - EAS Build for APK/AAB
  - Automated submission
  - Staged rollouts

### CI/CD Pipeline

**GitHub Actions Workflow:**

```yaml
# .github/workflows/mobile-ci.yml
name: Mobile CI/CD

on:
  push:
    branches: [main]
    paths:
      - 'apps/mobile/**'
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test --workspace=apps/mobile

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Expo
        uses: expo/expo-github-action@v8
      - name: Build iOS
        run: eas build --platform ios --non-interactive
      - name: Build Android
        run: eas build --platform android --non-interactive
```

### Versioning Strategy

**Semantic Versioning:**

- **Major**: Breaking API changes
- **Minor**: New features, backward compatible
- **Patch**: Bug fixes

**Version Management:**

- `apps/mobile/app.json`: Expo version
- `apps/mobile/package.json`: NPM version
- Sync versions across platforms

**Update Strategy:**

- **OTA Updates**: For JavaScript changes (Expo Updates)
- **Native Updates**: Require app store submission
- **Version Checking**: Prompt users to update

### Implementation Timeline

**Phase 1: Foundation (Weeks 1-4)**
- Set up React Native project with Expo
- Implement authentication
- Create shared API client
- Basic navigation structure
- Core dashboard

**Phase 2: Core Features (Weeks 5-8)**
- Client portal features
- Lead management
- Email automation (simplified)
- Consultation calendar

**Phase 3: Marketing Tools (Weeks 9-12)**
- SEO Auditor
- Content Generator
- Readiness Assessment
- Other tools

**Phase 4: Polish & Launch (Weeks 13-16)**
- UI/UX refinement
- Performance optimization
- Testing and bug fixes
- App store submission
- Launch preparation

### Considerations

**Benefits:**
- Extended platform reach
- Improved user engagement
- Native mobile experience
- Push notifications capability
- Offline functionality

**Risks:**
- Significant development effort
- Maintenance overhead
- App store approval process
- Platform-specific issues
- User adoption challenges

**Estimated Complexity:** Very High (9/10)  
**Timeline:** 16-20 weeks  
**Team Size:** 2-3 developers recommended

---

## 4. Additional Integrations

This section outlines five strategic integrations to expand platform capabilities and streamline workflows.

### Integration 1: HubSpot CRM

#### Overview

Bidirectional synchronization between Carolina Growth platform and HubSpot CRM for leads, contacts, deals, and activities. Enables seamless data flow and eliminates manual data entry.

**Use Cases:**
- Automatic lead sync from platform to HubSpot
- Deal creation from platform conversions
- Activity logging in HubSpot
- Contact enrichment from HubSpot

#### Integration Method

**OAuth 2.0 Authentication:**
- HubSpot OAuth app registration
- Token storage and refresh
- Multi-account support (if needed)

**REST API Integration:**
- HubSpot CRM API v3
- Webhooks for real-time updates
- Batch operations for efficiency

#### Implementation Steps

**Step 1: HubSpot App Setup**

1. Register OAuth app in HubSpot Developer Portal
2. Configure redirect URIs
3. Request scopes: `contacts`, `deals`, `timeline`, `crm.objects.contacts.read`
4. Store client ID and secret in environment variables

**Step 2: Backend OAuth Service**

Create: `apps/api/src/marketing_api/routes/integrations/hubspot.py`

```python
@router.get("/hubspot/oauth/authorize")
async def hubspot_authorize():
    # Redirect to HubSpot OAuth
    pass

@router.get("/hubspot/oauth/callback")
async def hubspot_callback(code: str):
    # Exchange code for tokens
    # Store tokens securely
    pass
```

**Step 3: HubSpot API Client**

Create: `apps/api/src/marketing_api/integrations/hubspot_client.py`

- Wrapper for HubSpot API calls
- Token refresh logic
- Error handling and retries
- Rate limit management

**Step 4: Sync Service**

Create: `apps/api/src/marketing_api/integrations/hubspot_sync.py`

- Lead sync: Platform → HubSpot
- Contact sync: HubSpot → Platform (optional)
- Deal creation on conversions
- Activity logging

**Step 5: Webhook Handlers**

- Handle HubSpot webhooks for updates
- Sync changes back to platform
- Conflict resolution logic

**Step 6: Frontend Integration UI**

Create: `apps/web/src/app/crm/integrations/hubspot/page.tsx`

- OAuth connection flow
- Sync status dashboard
- Sync configuration
- Manual sync trigger

#### Technical Requirements

**Dependencies:**
- `hubspot-api-client` Python package
- OAuth 2.0 flow implementation
- Background job queue for sync operations
- Webhook endpoint security

**Database Schema:**

```python
# Models:
# - HubSpotIntegration: OAuth tokens and config
# - HubSpotSync: Sync history and status
# - HubSpotMapping: Field mappings
```

#### Benefits and Limitations

**Benefits:**
- Eliminates manual data entry
- Single source of truth
- Enhanced lead management
- Improved sales workflow

**Limitations:**
- API rate limits (100 requests/10 seconds)
- Field mapping complexity
- Sync conflicts possible
- Requires HubSpot subscription

**Estimated Complexity:** Medium-High (7/10)  
**Timeline:** 2-3 weeks

---

### Integration 2: Google Ads API

#### Overview

Integration with Google Ads API to manage campaigns, retrieve performance data, and automate bid adjustments. Enables comprehensive paid media management within the platform.

**Use Cases:**
- Campaign performance monitoring
- Automated bid management
- Budget optimization
- Performance reporting

#### Integration Method

**OAuth 2.0 Authentication:**
- Google Cloud Project setup
- OAuth consent screen configuration
- Developer token from Google Ads account

**REST API Integration:**
- Google Ads API (v14+)
- Reporting API for metrics
- Campaign management API

#### Implementation Steps

**Step 1: Google Cloud Setup**

1. Create Google Cloud Project
2. Enable Google Ads API
3. Create OAuth 2.0 credentials
4. Request developer token from Google Ads account
5. Store credentials securely

**Step 2: Backend OAuth Service**

Create: `apps/api/src/marketing_api/routes/integrations/google_ads.py`

- OAuth authorization flow
- Token storage and refresh
- Multi-account support

**Step 3: Google Ads API Client**

Create: `apps/api/src/marketing_api/integrations/google_ads_client.py`

- Use `google-ads` Python library
- Campaign query builder
- Report generation
- Error handling

**Step 4: Campaign Management**

- Campaign creation and updates
- Ad group management
- Keyword management
- Bid adjustments

**Step 5: Performance Data Sync**

- Daily performance sync
- Store metrics in database
- Generate reports
- Alert on performance issues

**Step 6: Frontend Dashboard**

Create: `apps/web/src/app/crm/integrations/google-ads/page.tsx`

- Campaign list and details
- Performance metrics visualization
- Budget and spend tracking
- Quick actions (pause, enable, etc.)

#### Technical Requirements

**Dependencies:**
- `google-ads` Python library
- Google Cloud credentials
- Developer token
- Background jobs for data sync

**Database Schema:**

```python
# Models:
# - GoogleAdsIntegration: OAuth tokens
# - GoogleAdsCampaign: Campaign data
# - GoogleAdsPerformance: Daily metrics
```

#### Benefits and Limitations

**Benefits:**
- Centralized campaign management
- Automated optimization
- Performance insights
- Budget control

**Limitations:**
- Complex API (steep learning curve)
- Developer token approval process
- Rate limits and quotas
- Requires Google Ads account

**Estimated Complexity:** High (8/10)  
**Timeline:** 3-4 weeks

---

### Integration 3: Zapier

#### Overview

Webhook-based integration with Zapier to enable automation workflows with 5000+ apps. Provides flexibility for users to create custom integrations without code.

**Use Cases:**
- Trigger workflows from platform events
- Send data to external services
- Automate repetitive tasks
- Custom integrations per client

#### Integration Method

**Webhook-Based:**
- Outgoing webhooks from platform
- Incoming webhooks to platform
- Webhook authentication (API keys)

**No OAuth Required:**
- Simple HTTP POST requests
- JSON payloads
- API key authentication

#### Implementation Steps

**Step 1: Webhook Infrastructure**

Create: `apps/api/src/marketing_api/routes/integrations/webhooks.py`

- Webhook endpoint registration
- Webhook delivery service
- Retry logic for failed deliveries
- Webhook history and logging

**Step 2: Event System**

Enhance existing event tracking:
- Lead created events
- Conversion events
- Form submission events
- Custom event triggers

**Step 3: Webhook Delivery Service**

Create: `apps/api/src/marketing_api/integrations/webhook_delivery.py`

- Queue webhook deliveries
- Retry failed webhooks
- Rate limiting
- Delivery status tracking

**Step 4: Incoming Webhook Handler**

- Accept webhooks from Zapier
- Validate webhook signatures
- Process incoming data
- Trigger platform actions

**Step 5: Frontend Configuration UI**

Create: `apps/web/src/app/crm/integrations/zapier/page.tsx`

- Webhook URL generation
- Event selection
- Webhook testing
- Delivery logs

#### Technical Requirements

**Dependencies:**
- Background job queue
- Webhook signature validation
- Rate limiting
- Secure API key generation

**Database Schema:**

```python
# Models:
# - Webhook: Webhook configuration
# - WebhookDelivery: Delivery history
# - WebhookEvent: Event subscriptions
```

#### Benefits and Limitations

**Benefits:**
- Massive integration ecosystem
- No-code automation
- User flexibility
- Rapid deployment

**Limitations:**
- Webhook reliability concerns
- Limited real-time capabilities
- Dependency on Zapier platform
- Potential costs for high volume

**Estimated Complexity:** Medium (6/10)  
**Timeline:** 1-2 weeks

---

### Integration 4: Facebook/Meta Ads

#### Overview

Integration with Facebook Marketing API to manage ad campaigns, retrieve performance data, and automate ad management tasks.

**Use Cases:**
- Campaign creation and management
- Performance monitoring
- Audience management
- Budget optimization

#### Integration Method

**OAuth 2.0 Authentication:**
- Facebook App registration
- OAuth flow
- Long-lived tokens
- Token refresh

**Graph API Integration:**
- Facebook Marketing API
- Ad account management
- Campaign CRUD operations
- Insights API for metrics

#### Implementation Steps

**Step 1: Facebook App Setup**

1. Create Facebook App in Meta Business
2. Add Marketing API product
3. Request permissions: `ads_management`, `ads_read`, `business_management`
4. Configure OAuth redirect URIs

**Step 2: Backend OAuth Service**

Create: `apps/api/src/marketing_api/routes/integrations/facebook_ads.py`

- OAuth authorization
- Token exchange and storage
- Long-lived token conversion
- Token refresh logic

**Step 3: Facebook API Client**

Create: `apps/api/src/marketing_api/integrations/facebook_ads_client.py`

- Use `facebook-business` Python SDK
- Ad account operations
- Campaign management
- Insights retrieval

**Step 4: Campaign Sync**

- Sync campaign data
- Store performance metrics
- Handle campaign updates
- Error recovery

**Step 5: Frontend Dashboard**

Create: `apps/web/src/app/crm/integrations/facebook-ads/page.tsx`

- Campaign overview
- Performance metrics
- Budget tracking
- Quick actions

#### Technical Requirements

**Dependencies:**
- `facebook-business` Python SDK
- Facebook App credentials
- Ad account access
- Background sync jobs

**Database Schema:**

```python
# Models:
# - FacebookAdsIntegration: OAuth tokens
# - FacebookAdsCampaign: Campaign data
# - FacebookAdsPerformance: Metrics
```

#### Benefits and Limitations

**Benefits:**
- Unified ad management
- Performance insights
- Automation capabilities
- Budget control

**Limitations:**
- Complex API structure
- Frequent API changes
- Rate limits
- Requires Facebook Business account

**Estimated Complexity:** High (8/10)  
**Timeline:** 3-4 weeks

---

### Integration 5: Slack

#### Overview

Slack integration for team notifications, alerts, and collaboration. Enables real-time communication and team coordination around platform events.

**Use Cases:**
- Lead notifications
- Alert alerts
- Team updates
- Report sharing
- Workflow automation

#### Integration Method

**OAuth 2.0 Authentication:**
- Slack App creation
- OAuth flow
- Bot token storage

**Webhook and API:**
- Incoming Webhooks for simple notifications
- Web API for advanced features
- Event subscriptions (optional)

#### Implementation Steps

**Step 1: Slack App Setup**

1. Create Slack App in Slack API portal
2. Configure OAuth & Permissions
3. Request scopes: `chat:write`, `channels:read`, `users:read`
4. Set up incoming webhooks (optional)

**Step 2: Backend OAuth Service**

Create: `apps/api/src/marketing_api/routes/integrations/slack.py`

- OAuth authorization
- Token storage
- Workspace connection management

**Step 3: Slack Notification Service**

Create: `apps/api/src/marketing_api/integrations/slack_notifications.py`

- Send messages to channels
- Format notifications
- Handle errors
- Rate limiting

**Step 4: Event Subscriptions (Optional)**

- Subscribe to platform events
- Send notifications automatically
- Custom notification rules

**Step 5: Frontend Configuration**

Create: `apps/web/src/app/crm/integrations/slack/page.tsx`

- Workspace connection
- Channel selection
- Notification preferences
- Test notifications

#### Technical Requirements

**Dependencies:**
- `slack-sdk` Python package
- Slack App credentials
- Webhook URLs (if using webhooks)

**Database Schema:**

```python
# Models:
# - SlackIntegration: OAuth tokens and config
# - SlackNotification: Notification history
```

#### Benefits and Limitations

**Benefits:**
- Real-time team communication
- Centralized notifications
- Improved collaboration
- Workflow automation

**Limitations:**
- Notification fatigue risk
- Channel management
- Message formatting limitations
- Rate limits

**Estimated Complexity:** Low-Medium (5/10)  
**Timeline:** 1 week

---

## 5. Enhanced Reporting System

This section describes the design and implementation of a comprehensive reporting system for both internal team members and client users.

### System Architecture

#### Data Pipeline Options

**Option 1: Direct Database Queries**

**Pros:**
- Real-time data
- No ETL overhead
- Simple implementation
- Low latency

**Cons:**
- Production database load
- Complex queries can be slow
- Limited historical data
- Performance concerns

**Option 2: ETL Pipeline**

**Pros:**
- Optimized data warehouse
- Historical data retention
- Better performance
- Data transformation capabilities

**Cons:**
- Additional infrastructure
- Data latency
- ETL maintenance
- Higher complexity

**Recommended: Hybrid Approach**

- **Real-time Reports**: Direct queries for current data
- **Historical Reports**: ETL pipeline to data warehouse
- **Scheduled Reports**: Pre-aggregated data

### Report Builder UI/UX Design

#### User Interface Components

**1. Report Builder Interface**

- Drag-and-drop report builder
- Data source selector
- Metric and dimension picker
- Filter configuration
- Visualization type selector
- Layout customization

**2. Report Templates**

- Pre-built report templates
- Industry-specific templates
- Customizable templates
- Template marketplace (future)

**3. Report Viewer**

- Interactive charts and tables
- Drill-down capabilities
- Export options
- Sharing functionality
- Scheduled delivery

### Export Options

#### CSV Export

**Implementation:**
- Generate CSV from query results
- Include metadata headers
- Support large datasets (streaming)
- Custom field selection

**Technical Details:**
- Use `csv` module (Python) or `papaparse` (JavaScript)
- Streaming for large files
- Compression for downloads

#### PDF Export

**Implementation:**
- Generate PDF reports with charts
- Include branding and styling
- Multi-page support
- Table of contents

**Technical Details:**
- Backend: `reportlab` or `weasyprint` (Python)
- Frontend: `jsPDF` with `html2canvas` (JavaScript)
- Chart rendering: Convert charts to images

#### Email Scheduling

**Implementation:**
- Schedule report generation
- Email delivery with attachments
- Custom email templates
- Recipient management

**Technical Details:**
- Background job scheduler (Celery or APScheduler)
- Email service integration (existing SMTP)
- Template engine for emails

### Role-Based Access Control (RBAC)

#### Access Levels

**Internal Team:**
- Full access to all reports
- Can create and edit reports
- Can share reports externally
- Admin controls

**Client Users:**
- Access to client-specific reports
- Can view pre-configured reports
- Limited customization
- No access to internal metrics

#### Implementation

**Database Schema:**

```python
# Models:
# - Report: Report definition
# - ReportAccess: User access permissions
# - ReportShare: Shared report links
# - ReportSchedule: Scheduled reports
```

**Backend Authorization:**

```python
@router.get("/reports/{report_id}")
async def get_report(
    report_id: UUID,
    user: User = Depends(get_current_user)
):
    # Check user access
    if not has_report_access(user, report_id):
        raise HTTPException(403, "Access denied")
    # Return report
```

**Frontend Guards:**

- Route protection
- Conditional UI rendering
- Permission checks

### Implementation Breakdown

#### Step 1: Database Schema

Create migration: `apps/api/migrations/versions/XXXX_add_reporting_tables.py`

```python
# Models:
# - Report: Report definition (name, description, query, visualization)
# - ReportTemplate: Pre-built templates
# - ReportExecution: Execution history
# - ReportSchedule: Scheduled reports
# - ReportAccess: RBAC permissions
# - ReportExport: Export history
```

#### Step 2: Backend Report Service

Create: `apps/api/src/marketing_api/routes/reports.py`

**Endpoints:**
- `GET /reports` - List reports (filtered by access)
- `POST /reports` - Create report
- `GET /reports/{id}` - Get report definition
- `PUT /reports/{id}` - Update report
- `DELETE /reports/{id}` - Delete report
- `POST /reports/{id}/execute` - Execute report
- `GET /reports/{id}/export` - Export report
- `POST /reports/{id}/schedule` - Schedule report

#### Step 3: Query Builder

Create: `apps/api/src/marketing_api/services/report_query_builder.py`

- Build SQL queries from report definition
- Support multiple data sources
- Parameter substitution
- Query optimization
- Security (SQL injection prevention)

#### Step 4: Visualization Engine

Create: `apps/api/src/marketing_api/services/report_visualization.py`

- Generate chart configurations
- Support multiple chart types
- Data transformation for visualization
- Export chart images

#### Step 5: Frontend Report Builder

Create: `apps/web/src/app/crm/reports/builder/page.tsx` and `client.tsx`

**Components:**
- Data source selector
- Metric/dimension picker
- Filter builder
- Visualization selector
- Layout editor
- Preview pane

#### Step 6: Report Viewer

Create: `apps/web/src/app/crm/reports/[id]/page.tsx` and `client.tsx`

- Interactive charts (Chart.js or Recharts)
- Data tables
- Filters and drill-downs
- Export buttons
- Share functionality

#### Step 7: Export Services

**CSV Export:**

Create: `apps/api/src/marketing_api/services/report_export.py`

```python
async def export_csv(report_id: UUID) -> bytes:
    # Execute report query
    # Convert to CSV
    # Return bytes
```

**PDF Export:**

```python
async def export_pdf(report_id: UUID) -> bytes:
    # Generate report HTML
    # Convert to PDF
    # Return bytes
```

#### Step 8: Scheduling System

Create: `apps/api/src/marketing_api/services/report_scheduler.py`

- Schedule report generation
- Email delivery
- Failure handling
- Retry logic

### Tools and Libraries

#### Backend

- **Database**: PostgreSQL (existing)
- **Query Builder**: SQLAlchemy (existing)
- **PDF Generation**: `reportlab` or `weasyprint`
- **Scheduling**: Celery or APScheduler
- **Data Processing**: `pandas` (optional)

#### Frontend

- **Charts**: Chart.js or Recharts
- **Tables**: React Data Grid or TanStack Table
- **PDF Generation**: `jsPDF` with `html2canvas`
- **Drag-and-Drop**: `react-dnd` or `@dnd-kit/core`
- **Date Pickers**: React DatePicker

### Report Templates

#### Pre-Built Templates

1. **Executive Summary**
   - High-level KPIs
   - Trend analysis
   - Key insights

2. **Lead Generation Report**
   - Lead sources
   - Conversion rates
   - Cost per lead

3. **Campaign Performance**
   - Campaign metrics
   - ROI analysis
   - Channel comparison

4. **Client Activity Report**
   - Feature usage
   - Engagement metrics
   - Growth trends

5. **Financial Report**
   - Revenue metrics
   - Cost analysis
   - Profitability

### Considerations

**Benefits:**
- Comprehensive reporting
- Self-service analytics
- Reduced manual reporting
- Improved decision-making
- Client transparency

**Risks:**
- Complex query performance
- Data accuracy concerns
- Report maintenance
- User training required
- Export file sizes

**Estimated Complexity:** Very High (9/10)  
**Timeline:** 6-8 weeks  
**Team Size:** 2-3 developers recommended

---

## Conclusion

This document outlines comprehensive enhancement plans for five major areas of the Carolina Growth platform. Each enhancement is designed to:

- Provide value to clients and internal teams
- Integrate seamlessly with existing infrastructure
- Follow established patterns and best practices
- Scale with platform growth
- Maintain code quality and security standards

### Implementation Priority Recommendations

**Phase 1 (High Priority):**
1. Enhanced Reporting System (internal need)
2. HubSpot Integration (client demand)
3. Advanced Analytics - Cohort Analysis (data insights)

**Phase 2 (Medium Priority):**
4. Keyword Research Tool (complements SEO tools)
5. Backlink Analyzer (SEO completeness)
6. Advanced Analytics - Funnel Visualization

**Phase 3 (Lower Priority):**
7. Social Media Scheduler (feature completeness)
8. A/B Testing Platform (advanced feature)
9. Mobile App Development (long-term)
10. Remaining integrations and analytics features

### Next Steps

1. **Review and Prioritize**: Evaluate each enhancement against business goals
2. **Resource Planning**: Allocate development resources
3. **Technical Spikes**: Conduct proof-of-concept for complex features
4. **Stakeholder Approval**: Get buy-in from key stakeholders
5. **Implementation**: Begin with Phase 1 priorities

### Maintenance Considerations

- Regular API updates for integrations
- Performance monitoring for analytics features
- User feedback collection and iteration
- Documentation updates
- Security audits for new features

---

**Document Version**: 1.0  
**Last Updated**: January 12, 2026  
**Next Review**: Quarterly or as priorities change
