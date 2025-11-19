<!--
REPOSITORY CONSTITUTION - SHARED ACROSS ALL PROJECTS
Version: 1.0.1
- Ratified: 2025-11-01
- Governance Model: Organization-wide (applies to all projects)
- Purpose: Unified standards, principles, and quality gates for all development
-->

# Eigen Development Constitution

**Scope**: All projects in this repository MUST comply with this constitution.

**Inheritance**: New projects automatically adopt this constitution. Project-specific amendments require explicit governance approval and must be documented in project-local `.specify/memory/constitution.md` with inheritance chain noted.

## Core Principles

### I. Feature-Centric Architecture (Previously: Transaction-Centric)

Every feature MUST be implemented as a cohesive, independently testable module. The development pipeline is strictly sequential: Specification → Clarification → Planning → Design → Implementation. No shortcuts or reordering permitted. Each step must validate quality gates and produce well-formed deliverables. This ensures architectural integrity across all projects.

**Project-Specific Overrides**: Individual projects MAY define domain-specific architectures (e.g., transaction pipelines for crypto, data flows for analytics) but MUST follow this sequential process.

### II. Type-Safe Code (Language-Agnostic)

All data structures MUST use the strongest type system available for the chosen language. No implicit `any` types permitted. All domain entities must be explicitly typed with clear constraints. Configuration objects are authoritative sources for runtime parameters. Input validation must happen at boundaries (parsing, API, CLI). This prevents silent data corruption and makes edge cases explicit.

**Language Guidance**: TypeScript (strict mode)

### III. Test-First Development (TDD)

Every feature MUST start with failing tests. Tests MUST be written and approved BEFORE implementation begins. Red-Green-Refactor cycle is strictly enforced. Test types required: unit tests (individual functions), integration tests (feature workflows), contract tests (API/CLI boundaries). Target: 90% coverage minimum for critical paths. Tests serve as executable specifications and regression safeguards.

### IV. Observable & Auditable Systems

All features must emit structured logging for traceability. Decision points must be logged (what decision, why, alternatives considered). Results must be exportable in multiple formats (JSON for machines, human-readable for analysis). Critical decisions must be auditable: scores, rankings, filter thresholds must be transparently calculated and logged. Logging levels: info (milestones), warn (anomalies), error (failures). No silent failures.

### V. Configurable Systems with Sensible Defaults

All runtime parameters MUST be externalized (config files, environment variables, CLI flags). Hard-coded values are forbidden. Configuration objects are authoritative sources for thresholds. CLI MUST allow runtime overrides for experimentation. All defaults must be documented with rationale. Changes to defaults require documentation explaining why. This enables rapid calibration and experimentation without code changes.

## Architecture & Complexity Constraints

### Standard Project Structure (Language-Agnostic)

Single project (or monorepo with clear packages):

```
src/
├── types/       # Interfaces and type definitions
├── models/      # Data class implementations
├── services/    # Business logic
├── cli/         # CLI interface (if applicable)
└── lib/         # Utilities

tests/
├── unit/        # Unit tests
├── integration/ # Integration tests
└── fixtures/    # Test data
```


### Complexity Justification

No exceptions to modular structure without documented approval. Business logic is separate from interfaces. External libraries preferred over custom implementations. Each service is independently testable.

## Development Workflow

### Code Quality Gates (All Projects)

1. **Linting & Formatting**:

   - TypeScript: ESLint strict + Prettier (120 chars, single quotes, no semicolons)
   - Must be automated in CI/CD

2. **Type Checking**:

   - Strongest type system for language (strict mode if available)
   - Zero implicit `any` (TypeScript)

3. **Testing**:

   - 90% coverage minimum on critical paths
   - Unit + integration + contract tests mandatory
   - Tests must pass before merge
   - Test runner documented in plan.md

4. **Documentation**:

   - All projects must have: README, QUICKSTART, architecture diagram
   - Every major decision documented in design docs
   - API contracts or CLI contracts documented

5. **Package Manager & Build Tools**:

   - MUST be explicitly documented in plan.md Technical Context
   - Default: pnpm (JS/TS)
   - Documentation MUST consistently use chosen manager (no mixing)

6. **Version Control**:
   - Conventional commits mandatory (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`)
   - Descriptive commit messages required
   - Branch per feature/story
   - No force-push to main

### User-Facing Interfaces (CLI/API)

Every public feature MUST expose contracts:

- **CLI**: Text I/O (args → stdout/stderr), JSON support, documented exit codes
- **API**: OpenAPI/GraphQL documented, version strategy defined
- **Errors**: Meaningful messages, structured when possible
- **Help**: --help flag, examples, link to docs

### Development Process

- **Branch Strategy**: Feature branch per story/task, descriptive names (001-feature-name)
- **Commits**: Conventional commits enforced (feat:, fix:, test:, docs:, refactor:)
- **PR Reviews**: Must verify constitution compliance, test coverage, documentation
- **Merging**: Squash or rebase (no force-push to main)

## Governance

**Constitution Authority**: This document is the single source of truth for all development practices across ALL projects in the Eigen organization. All code, tests, and documentation must comply.

**Scope**:

- **Mandatory**: All 5 core principles + all code quality gates apply to every project
- **Mandatory**: All projects must pass constitution check before planning phase
- **Adaptable**: Language-specific guidance allows TypeScript
- **Project-Specific**: Individual projects MAY add amendments (must document inheritance chain)

**Amendment Procedure** (for repository-level changes):

1. Proposed change documented with rationale and impact analysis
2. Identify affected projects/teams
3. Version bump decision:
   - MAJOR: Backward-incompatible principle removals/redefinitions
   - MINOR: New principle, gate added, or significant constraint expansion
   - PATCH: Clarifications, wording fixes, examples added
4. Update CONSTITUTION.md + all dependent templates + all projects' local constitutions
5. Commit with message: `docs: amend CONSTITUTION to vX.Y.Z (reason)`

**Project-Level Amendments**:

- Each project's local `.specify/memory/constitution.md` MAY add domain-specific constraints
- Must document: "Extends Eigen Constitution vX.Y.Z with following additions: ..."
- Project amendments never override core principles
- Project amendments are subject to PR review

**Compliance Verification**:

- `/speckit.plan` runs mandatory constitution check (GATE)
- All PRs reviewed against constitution compliance
- Violations require explicit justification or are rejected
- Annual audit of all projects for compliance

**Version**: 1.0.1 (Organization-wide) | **Ratified**: 2025-11-01 | **Last Amended**: 2025-11-01

---

## Amendment Log

### v1.0.0 → v1.0.1 (PATCH - 2025-11-01)

**Changes**: Converted to organization-wide constitution

- Principles made language-agnostic (was TypeScript-specific)
- Architecture examples for TypeScript
- Code quality gates expanded with language-specific tools
- Package manager requirement explicitly added to gates
- Governance clarified for multi-project inheritance

**Key Additions**:

- Inheritance model: Projects adopt repo constitution + may extend locally
- Scope definition: Mandatory principles vs. adaptable implementation
- Compliance verification process for multi-project organization
- Project-specific amendment procedure with documentation requirements
