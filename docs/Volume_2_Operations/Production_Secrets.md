# Final Requirements

## Secrets for Testing
To run the full E2E test suite against the live production environment, the following secrets are required:

- **INTERNAL_API_TOKEN**: `7a4ebd3ce8e0840bf4eb613876a68a9f2cede7cbd79649b5eaee1dae38a6321f`
  - **Usage**: Allows Playwright tests to bypass Cloudflare Turnstile CAPTCHA on forms.
  - **Injection**: `INTERNAL_API_TOKEN=... npm run test:e2e`

## Deployment Secrets
The production environment (`.env`) is managed on the VPS at `/opt/marketing/.env`.
Key secrets include:
- `POSTGRES_PASSWORD`
- `STRIPE_SECRET_KEY`
- `OPENAI_API_KEY`
- `TURNSTILE_SECRET_KEY`

Ensure these are rotated periodically.
