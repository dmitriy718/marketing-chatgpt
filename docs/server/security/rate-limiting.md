# Rate Limiting

## Overview
Rate limiting protects the API from abuse and ensures fair resource usage.

## Implementation
- Token-based rate limiting
- Per-endpoint limits
- IP-based fallback
- Configurable limits

## Rate Limits by Endpoint

### Public Endpoints
- Lead capture: 10/hour
- Chat: 20/hour
- SEO audit: 3/hour
- Competitor comparison: 2/hour
- Readiness assessment: 5/hour
- Intelligence report: 2/hour
- Lead potential: 10/hour
- Consultation: 5/hour
- Content generation: 3/hour

### Internal Endpoints
- Higher limits for authenticated users
- Token-based bypass for trusted services

## Error Response
```json
{
  "error": "Rate limit exceeded",
  "retry_after": 3600
}
```

## Bypass
- Internal API token bypasses limits
- For trusted server-to-server calls
- Use `X-Internal-Token` header
