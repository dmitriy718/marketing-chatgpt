# Final Coding Hours - Project Overhaul Log

## Phase 1: Initial Review
*Scan started at: Wednesday, January 21, 2026*

### Architecture Overview
- **Frontend**: Next.js 16 (React 19) in `apps/web`. Acts as the main UI and BFF (Backend for Frontend).
- **Backend API**: Python FastAPI in `apps/api`. Handles core business logic, analytics, and DB interactions.
- **Authentication**: Custom auth + GitHub OAuth (for CMS) in `apps/oauth`.
- **Infrastructure**: Dockerized (likely via `docker-compose.prod.yml`). Nginx reverse proxy.

### Codebase Health & Findings

#### 🟢 Strengths
- **Resiliency**: The `newsletter` API route (`apps/web/src/app/api/newsletter/route.ts`) uses a robust "Outbox" pattern to queue failed requests.
- **Modern Stack**: Next.js 16, React 19, FastAPI, Pydantic V2.
- **Monitoring**: PostHog integration is present in both Frontend and Backend.
- **Type Safety**: TypeScript and Python type hints are consistently used.

#### 🔴 Critical Issues
1.  **Security Headers**: Missing Content Security Policy (CSP) and duplicate headers observed in ZAP scan.
2.  **Secrets Management**: `apps/api/src/marketing_api/settings.py` contains default "change_me" values. While there is a production check, this is a risk.
3.  **Port Inconsistency**: Playwright and local config use port 3001, while documentation references 3000 and 3002. This causes confusion in CI/CD and testing.
4.  **Hydration Suppression**: `suppressHydrationWarning` is used on the root `html` tag. While necessary for some theme providers, it can mask real errors.

#### ⚠️ Warnings & Code Smells
- **Legacy References**: References to `server/services/email-templates.ts` exist in documentation/memory but the file is missing (likely migrated to `apps/api`).
- **Mixed Environment Variables**: Frontend uses `NEXT_PUBLIC_SITE_URL`, Backend uses `APP_URL`. Need to ensure consistency.

### Plan for Phase 2 (Fix & Refactor)
1.  **Security Hardening**: Implement strict CSP in `middleware.ts`.
2.  **Config Standardization**: Unify port usage and env var naming.
3.  **Cleanup**: Remove dead code references.

---
## Phase 2: Fix & Refactor
*Started implementation of fixes...*