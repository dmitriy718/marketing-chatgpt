# PostHog Monitoring & Error Tracking

## Overview

PostHog is configured for comprehensive error tracking, performance monitoring, and analytics across both frontend and backend.

## Features Enabled

### Error Tracking
- **Frontend**: JavaScript exceptions automatically captured
- **Backend**: API errors (4xx, 5xx) tracked with context
- **Exception Details**: Stack traces, error types, endpoints

### Performance Monitoring
- **API Response Times**: Tracked for all endpoints
- **Frontend Performance**: Page load and interaction metrics
- **Endpoint Breakdown**: Performance by route

### Analytics
- **Feature Usage**: Track which features are used
- **User Behavior**: Page views, events, conversions
- **Custom Events**: Business-specific tracking

## Configuration

### Frontend (Next.js)

**File**: `apps/web/src/components/PostHogProvider.tsx`

- Initializes PostHog on app load
- Captures page views automatically
- Sets up global error handlers
- Enables performance monitoring

**Environment Variables**:
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog project API key
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog host URL

### Backend (FastAPI)

**File**: `apps/api/src/marketing_api/posthog_client.py`

- PostHog Python client wrapper
- Error tracking functions
- Performance tracking functions
- Event capture utilities

**File**: `apps/api/src/marketing_api/middleware/posthog.py`

- Middleware automatically tracks all API requests
- Captures errors and performance metrics
- Associates events with user IDs when available

**Environment Variables**:
- `POSTHOG_API_KEY` - PostHog project API key
- `POSTHOG_HOST` - PostHog host URL

## Events Tracked

### Frontend Events
- `$exception` - JavaScript exceptions
- `$performance` - Performance metrics
- `api_call` - API call tracking
- `feature_used` - Feature usage
- `$pageview` - Page views (automatic)

### Backend Events
- `api_error` - API errors (4xx, 5xx)
- `api_performance` - API response times
- `$exception` - Backend exceptions

## PostHog Dashboard

**System Monitoring Dashboard**: https://us.posthog.com/project/280825/dashboard/1019922

### Insights Included
1. **API Errors by Endpoint** - Track problematic routes
2. **API Performance - Average Response Time** - Identify slow endpoints
3. **Frontend Exceptions** - JavaScript error tracking
4. **Feature Usage** - Most used features

## Usage

### Frontend Error Tracking

Errors are automatically tracked. For manual tracking:

```typescript
import { trackError } from "@/lib/posthog";

try {
  // Your code
} catch (error) {
  trackError(error, {
    component: "MyComponent",
    action: "submit_form",
  });
}
```

### Frontend Performance Tracking

```typescript
import { trackPerformance, trackApiCall } from "@/lib/posthog";

// Track custom performance
const start = performance.now();
// ... do work
trackPerformance("my_operation", performance.now() - start);

// Track API calls
trackApiCall("/api/endpoint", duration, status);
```

### Backend Error Tracking

Errors are automatically tracked via middleware. For manual tracking:

```python
from marketing_api.posthog_client import capture_exception, capture_api_error

try:
    # Your code
except Exception as exc:
    capture_exception(
        distinct_id="user_id_or_anonymous",
        exception=exc,
        context={"endpoint": "/api/route", "action": "process_data"},
    )
```

### Backend Performance Tracking

```python
from marketing_api.posthog_client import capture_performance

capture_performance(
    endpoint="/api/endpoint",
    method="POST",
    duration_ms=150.5,
    user_id="user_id_or_none",
    additional_context={"operation": "data_processing"},
)
```

## Monitoring Best Practices

1. **Check Dashboard Daily** - Review System Monitoring dashboard
2. **Set Up Alerts** - Configure PostHog alerts for critical errors
3. **Review Performance** - Identify slow endpoints weekly
4. **Track Feature Usage** - Understand what features are popular
5. **Error Trends** - Watch for error spikes

## Troubleshooting

### Events Not Appearing

1. **Check API Keys**: Verify environment variables are set
2. **Check Network**: Ensure PostHog host is accessible
3. **Check Logs**: Review application logs for PostHog errors
4. **Verify Initialization**: Confirm PostHog client is initialized

### Performance Impact

- PostHog events are sent asynchronously
- Minimal performance impact
- Failed events don't block application flow
- Events are batched when possible

## PostHog MCP Integration

The PostHog MCP server allows programmatic access to:
- Create insights
- Manage dashboards
- Query data
- Set up alerts

See PostHog MCP documentation for more details.

## Related Documentation

- [Error Handling](./../security/error-handling.md)
- [Performance Optimization](./../infrastructure/performance.md)
- [Analytics Setup](./../analytics.md)
