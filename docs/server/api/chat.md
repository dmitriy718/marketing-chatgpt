# Chat API

## Endpoint
- **Path**: `/public/chat/message`
- **Method**: POST
- **Rate Limit**: 20/hour
- **Turnstile**: Required

## Request Body
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello, I have a question",
  "turnstile_token": "token-here"
}
```

## Response
```json
{
  "success": true,
  "message_id": "uuid-here"
}
```

## Features
- Message capture
- Lead creation (if email provided)
- Outbox pattern for durability
- AI response capability
- Session tracking

## Durability
- Uses outbox pattern
- Survives API outages
- Automatic retry
- No message loss
