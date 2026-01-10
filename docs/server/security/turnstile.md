# Turnstile Integration

## Overview
Cloudflare Turnstile provides bot protection and spam prevention.

## Implementation
- Client-side widget
- Server-side verification
- Async verification (httpx)
- Non-blocking

## Configuration
- Site key: `TURNSTILE_SITE_KEY`
- Secret key: `TURNSTILE_SECRET_KEY`
- Required on all public endpoints

## Verification Flow
1. Client generates token
2. Token sent with request
3. Server verifies with Cloudflare
4. Request processed if valid

## Error Handling
- Invalid token rejected
- Expired token rejected
- Network errors handled gracefully
- Fallback behavior defined

## Performance
- Async verification (< 200ms)
- Non-blocking
- Cached results (when applicable)
