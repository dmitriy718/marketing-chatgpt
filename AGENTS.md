# Repository Guidelines

## Project Structure & Module Organization
This repository is currently empty. When adding code, keep a clear separation between application logic, tests, and static assets. A common layout is:

- `src/` for source code
- `tests/` for automated tests
- `assets/` for images or static files
- `scripts/` for maintenance or build helpers

## Build, Test, and Development Commands
No build or test tooling is configured yet. Add a `README.md` or update this file once you introduce a toolchain. Example commands you might document:

- `npm run dev` to start a local dev server
- `npm test` to run the test suite
- `npm run build` to produce a production build

## Coding Style & Naming Conventions
Stacks and rules introduced:
- JavaScript/TypeScript: 2 spaces, `camelCase` for variables, `PascalCase` for components.
- Python: 4 spaces, `snake_case` for variables and functions, `PascalCase` for classes.
- Linting: ESLint for `apps/web`, Ruff for `apps/api`.

When you add another language stack, specify:

- Indentation (e.g., 2 spaces for JS/TS, 4 for Python)
- Naming patterns (e.g., `camelCase` for variables, `PascalCase` for components)
- Linting/formatting tools (e.g., ESLint, Prettier, Ruff)

## Testing Guidelines
No test framework is configured. Once added, document:

- Framework (e.g., Jest, Pytest)
- Test file naming (e.g., `*.test.ts`, `test_*.py`)
- How to run tests and any coverage targets

## Commit & Pull Request Guidelines
No commit history or conventions are available. Suggested defaults:

- Use short, imperative commit messages (e.g., "Add landing page layout")
- Keep commits focused and related to a single change
- Pull requests should include a brief summary, linked issues, and screenshots for UI changes

## Agent-Specific Instructions
See `AGENTS.md` for updates as the repository evolves. If you add automation or scripts that contributors should use, document them here.
