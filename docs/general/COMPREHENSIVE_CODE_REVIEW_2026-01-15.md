# Comprehensive Code Review - January 15, 2026

## Executive Summary
This review covers the entire codebase with focus on security, error handling, performance, code quality, and best practices. The codebase is generally well-structured, but several improvements are recommended.

## Review Scope
- **API**: `apps/api/src/marketing_api/`
- **Web**: `apps/web/src/`
- **Configuration**: `docker-compose*.yml`, `ops/nginx/`
- **Tests**: `apps/web/tests/`

---

## 🔴 Critical Issues

### None Found
No critical security vulnerabilities or critical bugs were identified.

---

## 🟠 High Priority Issues

### 1. Debug Logging in Production Code
**Location**: `apps/api/src/marketing_api/routes/webhooks.py:377-379`
**Issue**: Debug logging comment suggests removing logging in production, but the warning log is still active.
```python
# Log for debugging (remove in production if needed)
if not sig_header:
    logger.warning("Missing stripe-signature header. Available headers: %s", list(request.headers.keys()))
```
**Impact**: May expose header information in logs, though not critical.
**Recommendation**: Make this conditional on `app_env != "production"` or remove the header list from the log message.

### 2. Bare Exception Handling in Email Automation
**Location**: `apps/api/src/marketing_api/routes/email_automation.py:149-152`
**Issue**: Bare `pass` after exception catch may hide important errors.
```python
except Exception:
    # Log error but continue
    await session.rollback()
    pass
```
**Impact**: Email sending failures may go unnoticed.
**Recommendation**: Add proper logging before the `pass` statement.

### 3. Silent Exception Handling in Webhook Customer Details
**Location**: `apps/api/src/marketing_api/routes/webhooks.py:21-28`
**Issue**: Exception is caught but not logged, making debugging difficult.
```python
async def get_customer_details(customer_id: str | None) -> tuple[str | None, str | None]:
    if not customer_id:
        return None, None
    try:
        customer = stripe.Customer.retrieve(customer_id)
    except Exception:
        return None, None
    return customer.get("email"), customer.get("name")
```
**Impact**: Stripe API errors are silently ignored.
**Recommendation**: Add logging for exceptions to help diagnose Stripe API issues.

---

## 🟡 Medium Priority Issues

### 4. Type Safety - Use of `any` Type
**Location**: Multiple files in `apps/web/src/`
**Issue**: Found 63 instances of `any` type usage across 34 files.
**Impact**: Reduces type safety and can lead to runtime errors.
**Recommendation**: Replace `any` with proper types where possible. Prioritize API response types and form data.

### 5. Missing Error Context in Webhook Transaction Storage
**Location**: `apps/api/src/marketing_api/routes/webhooks.py:443`
**Issue**: Exception is caught but the original exception context may be lost when raising HTTPException.
```python
except Exception:  # noqa: BLE001
    logger.exception("Failed to persist Stripe transaction event %s", event.id)
    dispatch_admin(...)
    raise HTTPException(...)
```
**Impact**: Original exception details may not be preserved in logs.
**Recommendation**: Consider preserving exception chain or adding more context.

### 6. Potential Race Condition in Lead Upsert
**Location**: `apps/api/src/marketing_api/routes/public.py:141-171`
**Issue**: `upsert_lead` performs a SELECT then either UPDATE or INSERT without explicit locking.
**Impact**: Under high concurrency, duplicate leads could be created (though unique constraint should prevent this).
**Recommendation**: Consider using PostgreSQL `ON CONFLICT` or database-level locking for true upsert.

### 7. Missing Input Validation on Stripe Customer Retrieval
**Location**: `apps/api/src/marketing_api/routes/public.py:123-130`
**Issue**: `get_or_create_customer` doesn't validate email format before Stripe API call.
**Impact**: Invalid emails could cause Stripe API errors.
**Recommendation**: Email is already validated via Pydantic `EmailStr`, but consider adding explicit validation.

---

## 🟢 Low Priority / Code Quality

### 8. Console.log in Test Files
**Location**: `apps/web/tests/e2e/stripe.spec.ts:98, 118`
**Issue**: Console.log statements in test files (acceptable for tests, but could use test framework logging).
**Impact**: Minimal - tests are not production code.
**Recommendation**: Consider using Playwright's built-in logging or remove if not needed.

### 9. dangerouslySetInnerHTML Usage
**Location**: `apps/web/src/components/ThemeScript.tsx:11`
**Issue**: Uses `dangerouslySetInnerHTML` for theme script.
**Impact**: Low - the code is static and safe, but could be refactored.
**Recommendation**: Consider using Next.js Script component or moving to a safer pattern.

### 10. Hardcoded Default Values in Settings
**Location**: `apps/api/src/marketing_api/settings.py`
**Issue**: Default values like "change_me" are acceptable for development but should be documented.
**Impact**: Low - these are development defaults.
**Recommendation**: Already well-handled with environment variable overrides.

---

## ✅ Positive Findings

### Security
- ✅ No SQL injection vulnerabilities (using SQLAlchemy ORM)
- ✅ No XSS vulnerabilities (React escapes by default, only safe use of dangerouslySetInnerHTML)
- ✅ No hardcoded secrets in code
- ✅ Proper password hashing with Argon2
- ✅ JWT authentication properly implemented
- ✅ Turnstile bot protection on public endpoints
- ✅ Rate limiting implemented
- ✅ Input validation via Pydantic models

### Error Handling
- ✅ Comprehensive error handling in most routes
- ✅ Proper HTTP status codes
- ✅ Admin notifications for critical failures
- ✅ Transaction rollback on errors
- ✅ Idempotency keys for Stripe operations

### Code Quality
- ✅ Type hints used throughout Python code
- ✅ Async/await properly used
- ✅ Database transactions properly managed
- ✅ Separation of concerns (routes, models, services)
- ✅ Comprehensive E2E tests

### Architecture
- ✅ Clean separation between API and web
- ✅ Proper use of dependency injection
- ✅ Background tasks for async operations
- ✅ Outbox pattern for chat durability

---

## Recommendations Summary

### Immediate Actions
1. **Fix debug logging in webhooks** - Make conditional on environment
2. **Add logging to email automation exceptions** - Don't silently pass
3. **Add logging to get_customer_details** - Help diagnose Stripe issues

### Short-term Improvements
4. **Reduce `any` type usage** - Improve TypeScript type safety
5. **Improve error context preservation** - Better exception chaining
6. **Consider database-level upsert** - For true atomicity

### Long-term Enhancements
7. **Add structured logging** - Use structured log format
8. **Add request ID tracking** - For better debugging
9. **Add performance monitoring** - Track slow queries/endpoints
10. **Add integration tests** - Beyond E2E tests

---

## Testing Status
- ✅ E2E tests: 8/8 Stripe tests passing
- ✅ Linter: No errors found
- ✅ Type checking: TypeScript types generally good (some `any` usage)

---

## Overall Assessment

**Grade: A-**

The codebase is production-ready with solid security practices, good error handling, and clean architecture. The issues identified are mostly minor improvements rather than critical flaws. The code follows best practices for:
- Security (authentication, authorization, input validation)
- Error handling (comprehensive try/catch, proper status codes)
- Database operations (transactions, async operations)
- API design (RESTful, proper status codes)

**Main Strengths:**
- Strong security posture
- Good separation of concerns
- Comprehensive error handling
- Proper use of async/await
- Good test coverage

**Areas for Improvement:**
- Better logging in exception handlers
- Reduce TypeScript `any` usage
- Add more context to error messages
- Consider database-level upsert operations

---

## Next Steps
1. Address high-priority issues (items 1-3)
2. Create tickets for medium-priority improvements
3. Schedule code quality improvements for next sprint
4. Continue monitoring in production
