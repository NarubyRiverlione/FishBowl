<!--
SYNC IMPACT REPORT
- Version change: 0.0.0 (Template) → 1.0.0
- List of modified principles:
  - Added: I. Feature-Centric Architecture
  - Added: II. Type-Safe Code
  - Added: III. Test-First Development (TDD)
  - Added: IV. Observable & Auditable Systems
  - Added: V. Configurable Systems with Sensible Defaults
- Added sections: Architecture & Complexity Constraints, Development Workflow & Quality Gates
- Templates requiring updates: None
- Follow-up TODOs: None
-->

# FishBowl Constitution

<!-- Inherits from Eigen Development Constitution v1.0.1 -->

## Core Principles

### I. Feature-Centric Architecture

Every feature MUST be implemented as a cohesive, independently testable module. The development pipeline is strictly sequential: Specification → Clarification → Planning → Design → Implementation. No shortcuts or reordering permitted. Each step must validate quality gates and produce well-formed deliverables. This ensures architectural integrity across all projects.

### II. Type-Safe Code

All data structures MUST use the strongest type system available (TypeScript Strict Mode). No implicit `any` types permitted. All domain entities must be explicitly typed with clear constraints. Configuration objects are authoritative sources for runtime parameters. Input validation must happen at boundaries (parsing, API, CLI). This prevents silent data corruption and makes edge cases explicit.

### III. Test-First Development (TDD)

Every feature MUST start with failing tests. Tests MUST be written and approved BEFORE implementation begins. Red-Green-Refactor cycle is strictly enforced. Test types required: unit tests (individual functions), integration tests (feature workflows). Target: 90% coverage minimum for critical paths (genetics, economy, water chemistry). Tests serve as executable specifications and regression safeguards.

### IV. Observable & Auditable Systems

All features must emit structured logging for traceability. Decision points must be logged (what decision, why, alternatives considered). Results must be exportable in multiple formats. Critical decisions must be auditable: scores, rankings, filter thresholds must be transparently calculated and logged. Logging levels: info (milestones), warn (anomalies), error (failures). No silent failures.

### V. Configurable Systems with Sensible Defaults

All runtime parameters MUST be externalized (config files, environment variables). Hard-coded values are forbidden. Configuration objects are authoritative sources for thresholds. All defaults must be documented with rationale. Changes to defaults require documentation explaining why. This enables rapid calibration and experimentation without code changes.

## Architecture & Complexity Constraints

### Standard Project Structure

This project follows the mandated structure adapted for the game domain:

```
src/
├── types/       # Shared interfaces (IFish, ITank, IEconomy)
├── models/      # Domain entities (Fish.ts, Tank.ts) - Pure logic, no rendering
├── services/    # Business logic (BreedingService, WaterQualityService)
├── store/       # Zustand stores (useGameStore.ts)
├── components/  # React UI components (HUD, Menus)
├── game/        # Pixi.js rendering logic (FishSprite, TankView)
└── lib/         # Utilities (Math, Random generators)
```

### Separation of Concerns

- **Logic vs. View**: Models/Services handle the simulation (growth, hunger, pollution) completely decoupled from the view. Pixi.js components only _observe_ the state and render it.
- **State Management**: Use Zustand for the global game loop state. Actions should be defined in the store or delegated to Services.

### Complexity Justification

No exceptions to modular structure without documented approval. Business logic is separate from interfaces. External libraries preferred over custom implementations. Each service is independently testable.

## Development Workflow & Quality Gates

### Code Quality Gates

1. **Linting & Formatting**:
   - ESLint strict + Prettier (120 chars, single quotes, no semicolons).
   - Must be automated in CI/CD.
2. **Type Checking**:
   - TypeScript strict mode enabled.
   - Zero implicit `any`.
3. **Testing**:
   - **Vitest** is the required test runner.
   - 90% coverage minimum on critical paths.
   - Unit + integration tests mandatory.
   - Tests must pass before merge.
4. **Documentation**:
   - All projects must have: README, QUICKSTART, architecture diagram.
   - Every major decision documented in design docs.
   - Run `/updatedocs` after each implementation phase.
5. **Package Manager**:
   - **pnpm** is the required package manager.
6. **Version Control**:
   - Conventional commits mandatory (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`).
   - Branch per feature/story.
   - No force-push to main.

### Git Workflow

- **Branch Strategy**: ALWAYS create a new branch when starting a new phase, major feature, or refactoring.
- **Naming**: Use descriptive names like `phase-2-audio-capture`, `feature/speaker-detection`.

## Governance

**Inheritance**: This project adopts the **Eigen Development Constitution v1.0.1** as its base. This document represents the project-specific instantiation of those standards.

**Authority**: This document is the single source of truth for FishBowl development practices. All code, tests, and documentation must comply.

**Compliance Verification**:

- All PRs reviewed against constitution compliance.
- Violations require explicit justification or are rejected.
- `/speckit.plan` runs mandatory constitution check.

**Amendment Procedure**:

- Project-specific amendments must be documented in this file.
- Must document: "Extends Eigen Constitution vX.Y.Z with following additions: ..."
- Project amendments never override core principles.

**Version**: 1.0.0 | **Ratified**: 2025-11-01 | **Last Amended**: 2025-11-19
