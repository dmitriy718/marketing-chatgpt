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
      "id": "seo",
      "question": "How would you rate your website's SEO optimization?",
      "options": {
        "1": "We don't have SEO",
        "2": "Basic SEO, not optimized",
        "3": "Some optimization, needs work",
        "4": "Well optimized",
        "5": "Expertly optimized"
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
  "level": "Intermediate",
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
  "industry": "services",
  "monthly_website_visitors": 10000,
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
    "lead_increase": 250,
    "revenue_increase": 1250000,
    "improvement_percentage": 100
  },
  "benchmark": {
    "industry_average": 3.0,
    "your_current": 2.5
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
  "seo_score": 82,
  "seo_summary": {
    "total_images": 10,
    "images_without_alt": 2,
    "total_links": 25,
    "internal_links": 12,
    "has_structured_data": true
  },
  "social_presence": {
    "social_links_found": 3,
    "platforms": ["facebook", "instagram"]
  },
  "contact_accessibility": {
    "has_phone": true,
    "has_email": false,
    "has_address": true
  },
  "trust_signals": {
    "has_testimonials": true,
    "has_certifications": false,
    "has_case_studies": false
  },
  "recommendations": [
    "Improve SEO score to match or exceed competitors",
    "Enhance social media presence",
    "Add trust signals like testimonials and certifications",
    "Ensure contact information is easily accessible"
  ]
}
```

### Free Consultation

#### POST /public/consultation/book
Book a free consultation.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "company": "Example Corp",
  "phone": "+1234567890",
  "preferred_date": "2026-01-15",
  "preferred_time": "afternoon",
  "message": "I need help with SEO",
  "turnstile_token": "token"
}
```

**Response:**
```json
{
  "status": "ok",
  "message": "Consultation request received. We'll contact you within 24 hours."
}
```

### Chat & AI

#### POST /public/chat
Send a chat message.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "message": "Hello",
  "page_url": "https://carolinagrowth.co",
  "user_agent": "Mozilla/5.0 ...",
  "referrer": "https://google.com",
  "turnstile_token": "token"
}
```

**Response:**
```json
{
  "status": "ok"
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
  "session_id": "uuid",
  "needs_escalation": false
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
  "status": "ok",
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
  "status": "ok",
  "message": "Unsubscribed successfully"
}
```

### Lead Capture

#### POST /public/leads
Submit a lead.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "company": "Example Corp",
  "budget": "$5,000/mo",
  "details": "Interested in services",
  "source": "contact-form",
  "turnstile_token": "token"
}
```

**Response:**
```json
{
  "status": "ok"
}
```

### Newsletter

#### POST /public/newsletter
Subscribe to newsletter.

**Request Body:**
```json
{
  "email": "user@example.com",
  "lead_magnet": "Local Growth Playbook",
  "turnstile_token": "token"
}
```

**Response:**
```json
{
  "status": "ok"
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
