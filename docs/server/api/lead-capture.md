# Lead Capture API

## Endpoint
- **Path**: `/public/leads`
- **Method**: POST
- **Rate Limit**: 10/hour
- **Turnstile**: Required

## Request Body
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "Example Corp",
  "message": "Interested in services",
  "source": "contact-form",
  "turnstile_token": "token-here"
}
```

## Response
```json
{
  "success": true,
  "lead_id": "uuid-here"
}
```

## Features
- Automatic lead creation
- Email confirmation
- Admin notification
- Duplicate prevention (unique email)
- Source tracking

## Error Handling
- Invalid email format
- Missing required fields
- Rate limit exceeded
- Turnstile verification failed
