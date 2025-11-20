# Contributing to FishBowl

Thanks for contributing! This project follows a small set of conventions to keep the codebase maintainable and easy to review.

Please follow these guidelines when creating changes or opening pull requests.

## Architecture policy (MUST)

- This repository follows Model-View-Controller (MVC). New code MUST follow this separation:
  - `src/models` — domain logic and pure TypeScript models (no rendering).
  - `src/game/views` — Pixi.js rendering and view-layer code.
  - `src/game/controllers` (or `RenderingEngine`) — orchestration and game-loop code that coordinates models, views and services.
  - `src/services` — reusable business or simulation logic (physics, spawn, monitoring).
  - `src/lib` — pure utilities and helpers.

Keeping this separation improves testability and prevents accidental coupling between rendering and domain logic.

## Workflow & Branches

- Create a topic branch from `refactor/structure` (or `main` depending on task):
  - `feature/<short-description>`
  - `fix/<short-description>`
  - `refactor/<area>`
- Keep PRs small and focused — one feature or fix per PR.

## Pull Request Checklist

Before requesting review, ensure:

- All new features have corresponding tests (unit or integration) in `tests/`.
- `pnpm lint` passes locally (this runs ESLint, Prettier and TypeScript checks).
- `pnpm test` passes locally.
- You updated `README.md`, docs in `docs/`, or `QUICKSTART.md` for user-visible changes.
- Commit messages are clear and use the conventional style (e.g., `feat:`, `fix:`, `refactor:`, `docs:`, `test:`).

## Tests & Quality Gates

- Run tests:

```bash
pnpm test
```

- Run the linter and typecheck:

```bash
pnpm lint
```

- If adding or changing a model, prefer Test-First (write the failing test, then implement).

## Review Expectations

- Reviewers should focus on:
  - Correctness of model logic and edge cases.
  - Proper separation between model and view code.
  - Adequate tests and reasonable performance implications (collision complexity, loops).

## Tests & CI

- CI will run lint and tests. PRs that fail checks will not be merged.

## Styling & Formatting

- Use the project's formatting rules (`pnpm format`) and ESLint rules. The `pnpm lint` command will auto-fix many issues.

## Questions

If you're unsure where to place a new module, open a draft PR and add a note; we'll advise the correct location according to MVC.

Thank you for contributing!
