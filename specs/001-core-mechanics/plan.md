# Implementation Plan: Core Game Mechanics (MVP)

**Branch**: `001-core-mechanics` | **Date**: 2025-11-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-core-mechanics/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement the core game loop for FishBowl: a tick-based simulation where players manage fish lifecycle (hunger, health, aging), economy (buying/selling fish, credits), and tank management. The system must support autonomous fish survival mechanics, feeding interactions, and dynamic fish valuation. This establishes the foundational gameplay loop required before adding breeding, genetics, or advanced features.

## Technical Context

**Language/Version**: TypeScript 5.9 (Strict Mode)  
**Primary Dependencies**: React 19, Pixi.js 8, Zustand (state management), Vite 7 (build tool)  
**Storage**: In-memory (no persistence for MVP - state lost on refresh)  
**Testing**: Vitest (unit/integration), Playwright (E2E), target >90% coverage for models/services  
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari - desktop priority)  
**Project Type**: Single-page web application with game engine integration  
**Performance Goals**: 60 FPS rendering, 1 tick/second simulation, support 50+ fish without degradation  
**Constraints**: Real-time simulation (no offline progression), client-side only (no backend for MVP)  
**Scale/Scope**: Single player, single tank, 10-50 fish capacity, 5-10 minute play sessions  
**State Management Pattern**: Zustand for UI/global application state (HUD, settings). The Pixi.js game loop remains authoritative for model updates (Fish/Tank). Controllers (in `src/game/controllers`) mediate between the authoritative model state and the UI/store to keep concerns separated.
**Game Loop Architecture**: Game simulation runs on a tick (e.g., 1 tick/sec) inside `RenderingEngine` or a `GameLoopService`. Rendering (Pixi.js) continues at 60 FPS and interpolates model state for smooth visuals; synchronization is done by letting the game loop update models and the views observe model state.
**Service Layer Design**: Business logic lives in `src/services/` (physics, spawn, economy, monitoring). Models remain pure and focused on domain logic; services implement higher-level workflows and are injected into controllers for testability.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Feature-Centric Architecture**: ✅ PASS

- Feature has dedicated spec (`001-core-mechanics/spec.md`)
- Follows Spec → Plan → Design → Impl workflow
- Independently testable through acceptance scenarios

**Test-First (TDD)**: ✅ PASS

- Spec defines acceptance scenarios for each user story
- Plan requires tests before implementation
- Target: >90% coverage for models/services documented

**Type Safety**: ✅ PASS

- TypeScript Strict Mode enforced
- Plan mandates interfaces in `src/models/types/` before logic implementation
- No `any` types allowed per constitution

**Separation of Concerns**: ✅ PASS

- Architecture clearly separates:
  - Models: Pure TypeScript logic (Fish, Tank)
  - Services: Business logic (hunger mechanics, economy)
  - Store: Zustand global state
  - Game: Pixi.js rendering (observers only)
  - Components: React UI (thin wrappers)

**Continuous Quality**: ✅ PASS

- `pnpm lint` must pass after each phase
- Zero warnings tolerance documented
- Quality gates: lint + test + coverage checks

**GATE STATUS**: ✅ ALL PASSED - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/001-core-mechanics/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── store-actions.md # Zustand store actions for game mechanics
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── types/            # TypeScript interfaces (existing + new)
│   ├── fish.ts       # IFish interface (ALREADY EXISTS - extend)
│   ├── tank.ts       # ITank interface (ALREADY EXISTS - extend)
│   ├── economy.ts    # NEW: IEconomy, IStore, ITransaction interfaces
│   └── game.ts       # NEW: IGameLoop, IGameState interfaces
│
├── models/           # Domain entities with pure logic (existing + new)
│   ├── Fish.ts       # ALREADY EXISTS - extend with hunger/health/age
│   ├── Tank.ts       # ALREADY EXISTS - extend with capacity/water quality
│   └── Store.ts      # NEW: Store entity for economy
│
├── services/         # NEW DIRECTORY - Business logic layer
│   ├── GameLoopService.ts    # Tick orchestration, time management
│   ├── HungerService.ts      # Hunger mechanics (increase, thresholds)
│   ├── HealthService.ts      # Health decline from starvation
│   ├── EconomyService.ts     # Credit management, transactions
│   └── ValuationService.ts   # Fish price calculation
│
├── store/            # NEW DIRECTORY - Zustand state management
│   └── useGameStore.ts       # Global game state (credits, fish, tank, tick)
│
├── components/       # React UI components (existing + new)
│   ├── AquariumCanvas.tsx    # ALREADY EXISTS
│   ├── HUD.tsx              # NEW: Display credits, time, stats
│   ├── FeedButton.tsx       # NEW: Feed action UI
│   └── StoreMenu.tsx        # NEW: Buy/sell fish interface
│
├── game/             # Pixi.js rendering + controllers (restructured)
│   ├── views/                # Visual Pixi components
│   │   ├── FishSprite.ts     # Sprite rendering and texture loading
│   │   └── TankContainer.ts  # Tank visuals and fish sprite management
│   ├── controllers/          # Orchestrators/facades used by RenderingEngine
│   │   └── FishController.ts
│   └── RenderingEngine.ts    # Game loop + integration point with controllers
│
└── lib/              # Utilities (existing)
  ├── constants.ts          # ALREADY EXISTS - add game constants
  ├── random.ts             # ALREADY EXISTS
  └── (keep small helpers)  # Prefer keeping heavy physics/collision logic in services

src/services/        # Business logic layer (migrated from lib where appropriate)
  ├── physics/              # Physics & collision services (CollisionService, PhysicsService)
  ├── simulation/           # SpawnService and other simulation helpers
  └── monitoring/           # Performance/metrics services

tests/
├── unit/                     # Existing directory
│   ├── Fish.test.ts          # ALREADY EXISTS - extend
│   ├── Tank.test.ts          # ALREADY EXISTS - extend
│   ├── Store.test.ts         # NEW
│   ├── GameLoopService.test.ts    # NEW
│   ├── HungerService.test.ts      # NEW
│   ├── HealthService.test.ts      # NEW
│   ├── EconomyService.test.ts     # NEW
│   └── ValuationService.test.ts   # NEW
│
├── integration/              # Existing directory
│   ├── GameLoop.test.ts      # NEW: Full simulation cycle test
│   └── Economy.test.ts       # NEW: Buy → Feed → Sell flow
│
└── e2e/                      # Existing directory
    └── core-mechanics.spec.ts # NEW: Playwright full playthrough
```

**Structure Decision**: Web application (single project) structure selected. FishBowl is a client-side React + Pixi.js game with no backend. The architecture follows the mandated pattern from `.github/copilot-instructions.md`:

- **NEW**: `src/services/` for business logic (hunger, health, economy)
- **NEW**: `src/store/` for Zustand global state
- **EXTEND**: Existing `src/models/` (Fish, Tank) with game mechanics properties
- **EXTEND**: Existing `src/models/types/` with game loop and economy interfaces
- **EXTEND**: Existing `src/components/` with HUD and store UI
- **RESTRUCTURE**: `src/game/` reorganized for clearer separation of view vs controller:
  - `src/game/views/` — Pixi.js visual components (TankContainer, FishSprite)
  - `src/game/controllers/` — Orchestrators and facades (e.g., `FishController`) used by `RenderingEngine`
- **MOVE**: Collision and physics helpers migrated from `src/lib/` into `src/services/physics/` (pure services). Keep `src/lib/` for small utilities like `random.ts`, `constants.ts`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations detected.** All constitution checks passed. No complexity justification required.

---

## Post-Phase 1 Constitution Re-Check

_After design phase (research, data-model, contracts, quickstart complete)_

### Re-evaluation Results

**Feature-Centric Architecture**: ✅ PASS

- Data model clearly defines entities (Fish, Tank, Store, GameLoop)
- Contracts specify all store actions with preconditions/postconditions
- Quickstart provides implementation workflow
- All artifacts independently testable

**Test-First (TDD)**: ✅ PASS

- Data model includes validation rules for test case generation
- Contracts define expected inputs/outputs for test assertions
- Quickstart mandates writing tests before implementation
- Test coverage targets documented (>90% for services/models)

-**Type Safety**: ✅ PASS

- All entities have explicit TypeScript interfaces in `src/models/types/`
- No `any` types in contracts
- Strict mode enforced in `tsconfig.json`
- Discriminated unions for state machines (Fish lifecycle)

**Separation of Concerns**: ✅ PASS

- Clear layer boundaries in structure:
  - Types → Models → Services → Store → UI
- Services are stateless pure functions
- Models contain only domain logic
- Store handles global state via Zustand
- UI components are observers only

**Continuous Quality**: ✅ PASS

- Quickstart includes quality gate checkpoints
- Lint + Test commands defined for each phase
- Zero warnings tolerance reaffirmed
- Coverage thresholds specified

**GATE STATUS**: ✅ ALL PASSED - Design complies with constitution

### Design Quality Validation

**Completeness**:

- ✅ All entities from spec have interfaces
- ✅ All functional requirements have store actions
- ✅ All NEEDS CLARIFICATION items resolved in research.md
- ✅ Implementation path documented in quickstart.md

**Testability**:

- ✅ Acceptance scenarios map to test cases
- ✅ Services are pure functions (easily mockable)
- ✅ Models support dependency injection
- ✅ State transitions explicitly defined

**Maintainability**:

- ✅ Single Responsibility: Each service/model has one purpose
- ✅ Open/Closed: Services extensible without modification
- ✅ No circular dependencies in design
- ✅ Clear ownership boundaries

**No regressions or violations introduced by design phase.**

---

## Phase 2 Readiness

**Status**: ✅ READY FOR IMPLEMENTATION (`/speckit.tasks` command)

All planning artifacts complete:

- ✅ Technical Context filled (no NEEDS CLARIFICATION remaining)
- ✅ Constitution Check passed (pre and post design)
- ✅ research.md complete (all architectural decisions documented)
- ✅ data-model.md complete (all entities defined)
- ✅ contracts/store-actions.md complete (all actions specified)
- ✅ quickstart.md complete (developer onboarding ready)
- ✅ Agent context updated (technologies registered)

**Next Command**: `/speckit.tasks` to generate implementation tasks from this plan.
