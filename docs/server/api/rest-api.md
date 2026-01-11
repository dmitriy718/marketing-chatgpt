# REST API Documentation
## Carolina Growth Platform
## Last Updated: 2026-01-11

This document provides comprehensive documentation for the REST API endpoints available in the Carolina Growth platform.

## Base URL

- **Production**: `https://carolinagrowth.co`
- **Staging**: `https://development.carolinagrowth.co`
- **Local**: `http://localhost:8001`

## Authentication

Most public endpoints require Turnstile bot protection. Some endpoints support an internal token for trusted requests.

### Headers
```
Content-Type: application/json
x-internal-token: <token> (optional, for trusted requests)
```

## Public Endpoints

### Health Check

#### GET /health
Basic health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

#### GET /health/detailed
Comprehensive health check with system status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-11T12:00:00Z",
  "checks": {
    "database": {
      "status": "healthy",
      "message": "Database connection successful"
    },
    "database_version": {
      "status": "healthy",
      "version": "PostgreSQL 15.x"
    },
    "critical_tables": {
      "status": "healthy",
      "tables_found": 3,
      "expected": 3
    }
  }
}
```

### SEO Auditor

#### POST /public/seo/audit
Audit a website for SEO issues.

**Request Body:**
```json
{
  "url": "https://example.com",
  "email": "user@example.com",
  "turnstile_token": "token"
}
```

**Response:**
```json
{
  "url": "https://example.com",
  "score": 85,
  "findings": [
    {
      "type": "error",
      "category": "title",
      "message": "Missing or too short title tag"
    }
  ],
  "summary": {
    "total_images": 10,
    "images_without_alt": 2,
    "total_links": 25,
    "internal_links": 15,
    "has_structured_data": true
  },
  "cached": false
}
```

**Rate Limit:** 3 requests per hour

### Competitor Comparison

#### POST /public/competitor/compare
Compare your website against competitors.

**Request Body:**
```json
{
  "user_url": "https://example.com",
  "competitor_urls": ["https://competitor1.com", "https://competitor2.com"],
  "email": "user@example.com",
  "turnstile_token": "token"
}
```

**Response:**
```json
{
  "user": {
    "url": "https://example.com",
    "score": 75
  },
  "competitors": [
    {
      "url": "https://competitor1.com",
      "score": 80
    }
  ],
  "comparison": {
    "your_score": 75,
    "avg_competitor_score": 78,
    "rank": "below average",
    "gaps": [],
    "recommendation": "Focus on improving..."
  }
}
```

### Content Generator

#### POST /public/content/generate
Generate AI-powered content.

**Request Body:**
```json
{
  "content_type": "blog_post",
  "topic": "Local SEO Tips",
  "tone": "professional",
  "length": "medium",
  "email": "user@example.com",
  "turnstile_token": "token"
}
```

**Response:**
```json
{
  "content": "# Local SEO Tips\n\n...",
  "content_type": "blog_post",
  "topic": "Local SEO Tips",
  "usage_count": 1,
  "limit": 3
}
```

**Rate Limit:** 10 requests per hour  
**Free Tier:** 3 generations per month per email

### Marketing Readiness

#### GET /public/readiness/questions
Get assessment questions.

**Response:**
```json
{
  "questions": [
    {
      "id": "q1",
      "question": "Do you have a clear marketing strategy?",
      "options": {
        "0": "No strategy",
        "1": "Basic strategy",
        "2": "Comprehensive strategy"
      }
    }
  ]
}
```

#### POST /public/readiness/assess
Submit assessment answers.

**Request Body:**
```json
{
  "answers": {
    "q1": 2,
    "q2": 1
  },
  "email": "user@example.com",
  "turnstile_token": "token"
}
```

**Response:**
```json
{
  "score": 75,
  "level": "intermediate",
  "message": "You're on the right track...",
  "recommendations": [],
  "breakdown": {}
}
```

### Lead Potential Calculator

#### POST /public/lead-potential/calculate
Calculate lead generation potential.

**Request Body:**
```json
{
  "monthly_traffic": 10000,
  "current_conversion_rate": 2.5,
  "average_deal_value": 5000,
  "email": "user@example.com",
  "turnstile_token": "token"
}
```

**Response:**
```json
{
  "current": {
    "conversion_rate": 2.5,
    "leads_per_month": 250,
    "revenue_per_month": 1250000
  },
  "potential": {
    "conversion_rate": 5.0,
    "leads_per_month": 500,
    "revenue_per_month": 2500000
  },
  "improvement": {
    "conversion_lift": 100,
    "additional_leads": 250,
    "additional_revenue": 1250000
  }
}
```

### Competitive Intelligence

#### POST /public/intelligence/report
Generate competitive intelligence report.

**Request Body:**
```json
{
  "url": "https://example.com",
  "email": "user@example.com",
  "turnstile_token": "token"
}
```

**Response:**
```json
{
  "url": "https://example.com",
  "report": {
    "overview": "Company overview...",
    "strengths": ["Strong SEO", "Good content"],
    "weaknesses": ["Slow site speed"],
    "opportunities": ["Social media presence"],
    "threats": ["Competition"],
    "recommendations": ["Improve speed", "Expand social"]
  },
  "cached": false
}
```

### Free Consultation

#### POST /public/consultation/book
Book a free consultation.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Example Corp",
  "phone": "+1234567890",
  "preferred_date": "2026-01-15",
  "preferred_time": "10:00",
  "message": "I need help with SEO",
  "turnstile_token": "token"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Consultation request received",
  "consultation_id": "uuid"
}
```

### Chat & AI

#### POST /public/chat
Send a chat message.

**Request Body:**
```json
{
  "message": "Hello",
  "email": "user@example.com",
  "turnstile_token": "token"
}
```

**Response:**
```json
{
  "message": "Hello! How can I help?",
  "is_ai_response": true
}
```

#### POST /public/chat/ai-response
Get AI response to a message.

**Request Body:**
```json
{
  "message": "What services do you offer?",
  "session_id": "uuid",
  "turnstile_token": "token"
}
```

**Response:**
```json
{
  "response": "We offer SEO, content marketing...",
  "session_id": "uuid"
}
```

### Email Automation

#### POST /public/email/subscribe
Subscribe to email campaigns.

**Request Body:**
```json
{
  "email": "user@example.com",
  "tags": "newsletter,seo",
  "turnstile_token": "token"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Subscribed successfully"
}
```

#### POST /public/email/unsubscribe
Unsubscribe from email campaigns.

**Request Body:**
```json
{
  "email": "user@example.com",
  "turnstile_token": "token"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Unsubscribed successfully"
}
```

### Lead Capture

#### POST /public/leads
Submit a lead.

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "company": "Example Corp",
  "phone": "+1234567890",
  "message": "Interested in services",
  "source": "contact-form",
  "turnstile_token": "token"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Lead captured successfully",
  "lead_id": "uuid"
}
```

### Newsletter

#### POST /public/newsletter
Subscribe to newsletter.

**Request Body:**
```json
{
  "email": "user@example.com",
  "turnstile_token": "token"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Subscribed to newsletter"
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "detail": "Missing required field: url"
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid or missing authentication"
}
```

### 429 Too Many Requests
```json
{
  "detail": "Rate limit exceeded. Please try again later."
}
```

### 500 Internal Server Error
```json
{
  "detail": "An error occurred processing your request"
}
```

### 502 Bad Gateway
```json
{
  "detail": "Failed to reach the API"
}
```

## Rate Limiting

Most endpoints have rate limiting:
- **SEO Auditor**: 3 requests/hour
- **Content Generator**: 10 requests/hour
- **General endpoints**: Varies by endpoint

Rate limit headers:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1641900000
```

## Best Practices

1. **Always include Turnstile token** for public endpoints
2. **Handle rate limits** gracefully with exponential backoff
3. **Cache results** when possible (many endpoints support caching)
4. **Use appropriate content types** (application/json)
5. **Handle errors** appropriately based on status codes
6. **Respect rate limits** to avoid being blocked

## Support

For API support or questions:
- Email: help@carolinagrowth.co
- Documentation: See `/docs` endpoint (if enabled)
- GraphQL: See GraphQL API documentation
