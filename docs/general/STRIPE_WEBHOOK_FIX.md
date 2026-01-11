# Stripe Webhook 400 Error Fix

## Date: 2026-01-11

## Problem
All Stripe webhook events were failing with HTTP 400 errors. The webhook endpoint was receiving requests but returning 400 Bad Request.

## Root Cause
The nginx reverse proxy was not forwarding the `stripe-signature` header from Stripe to the FastAPI backend. The webhook handler requires this header to verify the webhook signature and ensure the request is authentic.

## Solution

### 1. Updated Nginx Configuration
Added explicit forwarding of the `stripe-signature` header in all webhook location blocks:

```nginx
location ~ ^/(graphql|public|health|webhooks|openapi.json|docs|redoc) {
  proxy_pass http://carolina_growth_api;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header X-Forwarded-Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_pass_request_headers on;
  proxy_set_header stripe-signature $http_stripe_signature;
}
```

### 2. Updated Webhook Handler
Made the webhook handler check for both lowercase and original case header names:

```python
# Try both lowercase and original case for stripe-signature header
sig_header = request.headers.get("stripe-signature") or request.headers.get("Stripe-Signature")
```

## Files Modified
- `ops/nginx/marketing.conf` - Added `stripe-signature` header forwarding to all webhook location blocks
- `apps/api/src/marketing_api/routes/webhooks.py` - Updated to check both header name cases

## Webhook URL
**Production**: `https://carolinagrowth.co/webhooks/stripe`

## Verification
After deploying the fix:
1. Nginx configuration tested successfully
2. Nginx reloaded without errors
3. API container restarted
4. Webhook endpoint should now receive and process Stripe events correctly

## Next Steps
1. Test webhook delivery in Stripe Dashboard
2. Monitor webhook logs for successful processing
3. Verify events are being stored in the database
4. Check that email notifications are being sent

## Notes
- The `stripe-signature` header is critical for webhook security
- Nginx converts incoming headers to lowercase with underscores (e.g., `Stripe-Signature` → `$http_stripe_signature`)
- The webhook handler validates the signature using the webhook secret from environment variables
- All webhook events are idempotent (duplicate events are ignored based on event ID)
