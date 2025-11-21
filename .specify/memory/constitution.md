<!--
Sync Impact Report:
- Version change: 1.1.0 -> 1.2.0 (Added No Magic Numbers Principle + Milestone Quality Gate)
- Modified sections: Continuous Quality (enhanced with magic numbers policy)
- Added sections:
  - VI. No Magic Numbers (New Core Principle)
  - Milestone Completion Quality Gate (New Governance Step)
- Removed sections: None
- Templates requiring updates: ⚠️ Pending
  - .specify/templates/tasks-template.md: Add magic number scan step to completion checklist
  - .specify/templates/plan-template.md: Reference quality gate requirements
- Follow-up TODOs: None
- Rationale: MINOR version bump (1.2.0) - New principle added (magic numbers) + enhanced quality gate procedure. Non-breaking change to existing architecture.
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

### VI. No Magic Numbers

All numeric constants MUST have meaningful, self-documenting names. Define them centrally in `src/lib/constants.ts` using descriptive identifiers. Numeric literals in code (conditionals, calculations, comparisons) are prohibited.

**Examples of correct usage:**

- ❌ `if (fish.age > 120)` → ✅ `if (fish.age > MATURE_AGE_SECONDS)`
- ❌ `pollution *= 0.8` → ✅ `pollution *= FILTER_EFFICIENCY_RATE`
- ❌ `radius = 25` → ✅ `radius = FISH_BASE_RADIUS`

**Rationale**: Magic numbers create technical debt, reduce readability, and make refactoring error-prone. Named constants self-document code intent and enable easy parameterization. All numeric values must be centralizable and intentional.

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

## Project Organization Standards

### Milestone vs Phase Terminology

To avoid confusion in project planning and execution:

- **Milestone**: Use for high-level project roadmap and feature delivery checkpoints
  - Example: "Milestone 1: Visual Prototype", "Milestone 2: Core Mechanics"
  - Represents major feature sets or product increments
  - Tracked in README.md roadmap

- **Phase**: Use for task execution stages within a single feature specification
  - Example: "Phase 1: Setup", "Phase 2: Tests", "Phase 3: Implementation"
  - Represents sequential work stages within a spec's tasks.md
  - Appears in feature branch specifications (e.g., `specs/001-core-mechanics/tasks.md`)

**Rationale**: Consistent terminology prevents ambiguity when discussing project progress. "Are we in Phase 2?" could mean either the second milestone OR the second execution phase of current work. Separating these concepts improves communication clarity.

## Governance

### Milestone Completion Quality Gate

At the completion of each milestone (after all features are implemented), the following quality checks MUST be performed BEFORE merging to main:

1. **Automated Checks**
   - Run `pnpm test` – All tests must pass with target coverage maintained
   - Run `pnpm lint` – Zero lint warnings allowed

2. **Manual Magic Number Scan**
   - Search codebase for remaining numeric literals in logic files (not config/constants)
   - Pattern: Numbers appearing in conditionals, calculations, comparisons
   - Example scan command:
     ```bash
     grep -r "[0-9]\+" src/ --include="*.ts" --include="*.tsx" | grep -v "constants.ts" | head -20
     ```
   - For each match: Move to `src/lib/constants.ts` with a meaningful name, update all references in code

3. **Code Review Checklist**
   - All numeric constants are self-documenting (names clearly indicate purpose)
   - Constants are logically grouped by domain (Physics, Tank, Fish, Economy, etc.)
   - No numeric literals remain in business logic or calculations
   - Test coverage for critical paths maintained or improved

**Rationale**: Magic numbers are technical debt that accumulate over time. Proactive scanning at milestone boundaries prevents the codebase from becoming unmaintainable. Named constants enable easier feature iteration and reduce bugs from inconsistent values.

### Constitution Amendments

This Constitution is the primary source of truth for the FishBowl project. All code changes, pull requests, and architectural decisions must align with these principles. Amendments require:

1. Version bump following semantic versioning (see version history in Sync Impact Report)
2. Detailed documentation of changes in the Sync Impact Report header comment
3. Ratification date update in the Version line

**Version**: 1.2.0 | **Ratified**: 2025-11-19 | **Last Amended**: 2025-11-21
