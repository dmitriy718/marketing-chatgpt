# Agent Rules - Always Follow
## Date Established: 2026-01-15

These rules must be followed in ALL work, always and forever, even after restarts.

## Core Rules

### 1. Documentation Updates
**ALWAYS update documentation after major changes.**
- Update relevant docs immediately after implementing features
- Keep implementation journals current
- Update feature status in appropriate docs
- Never leave documentation outdated

### 2. Git Workflow
**ALWAYS commit and push to GitHub after every major change.**
- Commit after completing features
- Commit after fixing bugs
- Commit after documentation updates
- Use clear, descriptive commit messages
- Push to remote repository

### 3. Client Documentation
**We must have user/client-side documentation.**
- All features must have documentation explaining:
  - What the feature is
  - Why it exists
  - How it works
  - How it brings value to the client
- Documentation must be clear, accessible, and client-friendly
- Located in `docs/client/` folder

### 4. No Placeholders or Made-Up Code
**Never make up code, never use placeholders on work that will be deployed live.**
- If something is unclear, ASK the user
- If implementation details are missing, ASK
- If API keys or secrets are needed, ASK
- User's door is always open - use it
- Better to ask than to guess

### 5. Testing After Changes
**After changing something, make sure to test that general area and everything affected by it.**
- Test the changed feature
- Test related features
- Test integration points
- Verify no regressions
- Check error handling

### 6. E2E Testing
**ALWAYS do E2E tests (Playwright) and other tests to make sure deployed version is working perfectly.**
- Run Playwright tests after major changes
- Run tests before deployment
- Run tests after deployment
- Fix any failing tests immediately
- Document test results

### 7. No Procrastination
**Never put things off until later unless there is no choice but to do so.**
- Complete tasks fully before moving on
- Don't leave TODOs unless absolutely necessary
- Finish what you start
- If something can't be done now, document why clearly

### 8. Code Optimization
**When working on a project, always look for code that can be optimized for performance or refactored, and if found, do exactly that.**
- Review code for optimization opportunities
- Refactor when it improves maintainability
- Optimize for performance when possible
- Don't optimize prematurely, but don't ignore obvious issues

### 9. Customer-Centric Approach
**Everything we do should be centered around the customer.**
- Make everything easy to use
- Provide good, clear documentation
- Be straightforward and transparent
- Make the customer feel heard and understood
- Design features that make customers want to join

### 10. No Breaking Changes
**Make sure that your work is not breaking any other functions in the ecosystem.**
- Test integration points
- Verify existing features still work
- Check for breaking changes
- Maintain backward compatibility when possible
- Document any breaking changes if necessary

## Documentation Organization

All documentation must be organized in the following structure:

```
docs/
├── client/          # Client-facing documentation
├── server/          # Server-side/internal documentation
├── CRM/             # CRM system documentation
├── CMS/             # CMS system documentation
└── general/         # General project documentation
    └── STILL_MISSING.md  # Things we need but don't have
```

## Enforcement

These rules are MANDATORY and must be followed in every session, every task, every change.
