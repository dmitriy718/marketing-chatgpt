# Chat API

## Endpoint
- **Path**: `/public/chat`
- **Method**: POST
- **Rate Limit**: 6/minute
- **Turnstile**: Required

## Request Body
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "message": "Hello, I have a question",
  "page_url": "https://carolinagrowth.co",
  "user_agent": "Mozilla/5.0 ...",
  "referrer": "https://google.com",
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
- Message capture
- Lead creation (if email provided)
- AI response capability (separate endpoint)
- Session tracking for AI chats

## AI Chat Endpoint
- **Path**: `/public/chat/ai-response`
- **Method**: POST
- **Rate Limit**: 20/hour

```json
{
  "message": "What services do you offer?",
  "session_id": "optional-session-id",
  "name": "Jane",
  "email": "jane@example.com",
  "turnstile_token": "token-here"
}
```

## Durability
- Uses outbox pattern
- Survives API outages
- Automatic retry
- No message loss
