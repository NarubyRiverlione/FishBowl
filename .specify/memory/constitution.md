<!--
Sync Impact Report:
- Version change: 0.0.0 -> 1.0.0 (Initial Ratification)
- Principles Defined:
  - Feature-Centric Architecture
  - Test-First (TDD)
  - Type Safety
  - Separation of Concerns
  - Continuous Quality (Added Linter Rule)
- Added Sections:
  - Tech Stack & Standards
  - Development Workflow (Includes mandatory linting step)
- Templates requiring updates: None (Initial setup)
-->

# FishBowl Constitution

## Core Principles

### I. Feature-Centric Architecture

Implement features as cohesive, independently testable modules. The workflow MUST follow: Spec → Plan → Design → Implementation. Do not start coding without a clear plan and task breakdown.

### II. Test-First (TDD)

Write failing tests _before_ implementation. Target 90% coverage for critical paths (genetics, economy). Tests serve as the primary verification mechanism for feature correctness.

### III. Type Safety

No `any`. Define explicit interfaces in `src/types` before coding logic. TypeScript Strict Mode must be enabled and adhered to. Runtime type checking should be used at system boundaries.

### IV. Separation of Concerns

- **Logic**: Pure TypeScript models/services (no UI code).
- **View**: Pixi.js components (observers only).
- **UI**: React components (HUD, menus).
  State must be managed centrally (Zustand), not scattered across components.

### V. Continuous Quality

The codebase must remain clean and error-free at all times. The linter (`pnpm lint`) MUST be executed successfully after the completion of every implementation phase and before marking the phase as complete. Zero warnings allowed.

## Tech Stack & Standards

- **Runtime**: React + Vite
- **Language**: TypeScript (Strict Mode)
- **Game Engine**: Pixi.js (for the aquarium view)
- **State Management**: Zustand
- **Testing**: Vitest
- **Package Manager**: pnpm

## Development Workflow

1.  **Spec**: Define requirements in `PRD.md` or a feature spec.
2.  **Type**: Define interfaces in `src/types/`.
3.  **Test**: Write a failing test in `tests/` (or co-located).
4.  **Model**: Implement domain logic in `src/models/`.
5.  **Store**: Update Zustand store if global state is needed.
6.  **View**: Implement visual representation in `src/game/` or `src/components/`.
7.  **Verify**: Run `pnpm lint` and `pnpm test` to ensure quality gates are passed before moving to the next phase.

## Governance

This Constitution is the primary source of truth for the FishBowl project. All code changes, pull requests, and architectural decisions must align with these principles. Amendments require a version bump and documentation in the Sync Impact Report.

**Version**: 1.0.0 | **Ratified**: 2025-11-19 | **Last Amended**: 2025-11-19
