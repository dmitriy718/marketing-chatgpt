# Lead Capture API

## Endpoint
- **Path**: `/public/leads`
- **Method**: POST
- **Rate Limit**: 6/minute
- **Turnstile**: Required

## Request Body
```json
{
  "name": "Jane Doe",
  "email": "john@example.com",
  "company": "Example Corp",
  "budget": "$5,000/mo",
  "details": "Interested in services",
  "source": "contact-form",
  "turnstile_token": "token-here"
}
```

## Response
```json
{
  "status": "ok"
}
```

## Features
- Automatic lead creation
- Email confirmation
- Admin notification
- Source tracking

## Error Handling
- Invalid email format
- Missing required fields
- Rate limit exceeded
- Turnstile verification failed
