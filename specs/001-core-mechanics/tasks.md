# Tasks: Core Game Mechanics (MVP)

Feature: Core Game Mechanics (MVP)

Phase 1: Setup

- [ ] T001 Create this tasks file at `specs/001-core-mechanics/tasks.md`
- [ ] T002 [P] Add `src/models/types/index.ts` (type definitions) — file: `src/models/types/index.ts`
- [ ] T003 [P] Ensure dev dependencies installed: run `pnpm install` from repo root — command: `pnpm install`
- [ ] T004 Add CI/test placeholders (Vitest config) — file: `vitest.config.ts` (if missing) or update existing test config

Phase 2: Foundational (blocking prerequisites)

- [ ] T005 [P] [US-] Implement `IFish` and `ITank` interfaces and `FISH_SPECIES_CONFIG` — file: `src/models/types/index.ts`
- [ ] T006 [P] [US-] Create `src/services/FishService.ts` (createFish, tickFish, calculateFishValue) — file: `src/services/FishService.ts`
- [ ] T007 [P] [US-] Create `src/services/EconomyService.ts` (buyFish, sellFish, feedTank, cleanTank, buyFilter, upgradeTank) — file: `src/services/EconomyService.ts`
- [ ] T008 [P] [US-] Create initial `useGameStore` Zustand hook with state and actions signatures (no full logic) — file: `src/store/useGameStore.ts`
- [ ] T009 [P] Add unit test skeletons for services: `tests/unit/FishService.test.ts`, `tests/unit/EconomyService.test.ts` — files: `tests/unit/FishService.test.ts`, `tests/unit/EconomyService.test.ts`

Phase 3: User Story Phases (priority order)

**User Story 1 - Tank & Fish Management (P1)**

Independent test criteria: initialize game, buy a fish, credits deducted, fish in tank, tick increases age.

- [ ] T010 [US1] Create `initializeGame` action and default game state (BOWL, credits 50) — file: `src/store/useGameStore.ts`
- [ ] T011 [US1] Implement `buyFish(storeItemId)` action with validations (credits, capacity) and spawn fish — files: `src/store/useGameStore.ts`, `src/services/EconomyService.ts`
- [ ] T012 [US1] Add unit test: `tests/integration/BuyFish.test.ts` verifying credits decrease and fish added — file: `tests/integration/BuyFish.test.ts`
- [ ] T013 [US1] Implement `tick()` action wiring: increment tick, increment fish.age for living fish — files: `src/store/useGameStore.ts`, `src/services/FishService.ts`
- [ ] T014 [US1] Add integration test: `tests/integration/GameLoopTick.test.ts` verifying age increments per tick — file: `tests/integration/GameLoopTick.test.ts`

**User Story 2 - Feeding & Survival (P1)**

Independent test criteria: hunger increases with ticks, feedTank reduces hunger by 30 for all living fish and deducts cost, feeding increases pollution.

- [ ] T015 [US2] Implement per-tick hunger increase and starvation health decay (hunger threshold ≥80 → health -1) — file: `src/services/FishService.ts`
- [ ] T016 [US2] Implement `feedTank()` action: cost calculation, hunger reduction, pollution increase — files: `src/store/useGameStore.ts`, `src/services/EconomyService.ts`
- [ ] T017 [US2] Add unit test: `tests/unit/Feeding.test.ts` for feed cost, hunger reduction and pollution effect — file: `tests/unit/Feeding.test.ts`
- [ ] T018 [US2] Add integration test: `tests/integration/FeedAndSurvive.test.ts` accelerate ticks and verify feed prevents death — file: `tests/integration/FeedAndSurvive.test.ts`

**User Story 3 - Water Quality & Maintenance (P1)**

Independent test criteria: pollution increases per tick and by feed, waterQuality = 100 - pollution, cleaning and filters reduce pollution and affect health decay.

- [ ] T019 [US3] Implement pollution accumulation formula in `tick()` and update `waterQuality` calculation — files: `src/store/useGameStore.ts`, `src/services/EconomyService.ts`
- [ ] T020 [US3] Implement `cleanTank()` action (cost 10, reduce pollution by 30) — files: `src/store/useGameStore.ts`, `src/services/EconomyService.ts`
- [ ] T021 [US3] Implement `buyFilter()` action with precondition (STANDARD tank) and apply per-tick pollution reduction — files: `src/store/useGameStore.ts`, `src/services/EconomyService.ts`
- [ ] T022 [US3] Add unit test: `tests/unit/Pollution.test.ts` for pollution accumulation, cleaning, and filter behavior — file: `tests/unit/Pollution.test.ts`

**User Story 4 - Tank Progression (P1)**

Independent test criteria: start with BOWL (capacity 1) and 50 credits, maturity bonus awarded when fish age ≥ 120s, tank upgrade increases capacity and unlocks filter.

- [ ] T023 [US4] Implement maturity bonus check in `tick()` (for BOWL only) — files: `src/store/useGameStore.ts`, `src/services/EconomyService.ts`
- [ ] T024 [US4] Implement `upgradeTank()` action (cost 75) to set size STANDARD and capacity=10 — files: `src/store/useGameStore.ts`, `src/services/EconomyService.ts`
- [ ] T025 [US4] Add integration test: `tests/integration/Progression.test.ts` verifying maturity bonus and upgrade flow — file: `tests/integration/Progression.test.ts`

**User Story 5 - Economy & Progression (P2)**

Independent test criteria: selling fish calculates value correctly and updates credits; purchases rejected on insufficient funds.

- [ ] T026 [US5] Implement `sellFish(fishId)` action using FishService.calculateFishValue — files: `src/store/useGameStore.ts`, `src/services/EconomyService.ts`
- [ ] T027 [US5] Add unit test: `tests/unit/SellFish.test.ts` verifying value formula and credit update — file: `tests/unit/SellFish.test.ts`

Final Phase: Polish & Cross-Cutting Concerns

- [ ] T028 [US-] Add tutorial popup events wiring and UI contract (store action `showTutorial(eventId)`) — file: `src/store/useGameStore.ts`
- [ ] T029 [US-] Add selectors for UI: `selectCredits`, `selectTankFish`, `selectStoreInventory`, `selectSelectedFish` — file: `src/store/useGameStore.ts`
- [ ] T030 [US-] Add E2E Playwright test: `tests/e2e/core-mechanics.spec.ts` for buy → feed → mature → sell flow — file: `tests/e2e/core-mechanics.spec.ts`
- [ ] T031 [US-] Run lint and tests, fix any issues discovered (`pnpm lint`, `pnpm test`) — commands: `pnpm lint`, `pnpm test`

Dependencies (User story completion order)

- US1 → US2 → US3 → US4 → US5
- Rationale: Basic tank/fish create (US1) is required before feeding (US2), pollution mechanics (US3) depend on feeding/pollution, progression (US4) depends on survival, economy sell/buy (US5) depends on values implemented.

Parallel Execution Examples

- Files that can be implemented in parallel (no cross-file blocking):
  - `src/services/FishService.ts` (T006) and `src/services/EconomyService.ts` (T007) — [P]
  - Type definitions `src/models/types/index.ts` (T005) and store skeleton `src/store/useGameStore.ts` (T008) — [P]
  - Unit tests generation (T009) can be created in parallel with service implementations

Implementation Strategy

- MVP-first: Implement smallest end-to-end path for US1 (types → fish spawn → tick → test) to have a runnable loop. Then add feeding (US2) and pollution (US3). Prioritize tests (TDD) for each service before implementation.
- Incremental delivery: complete one user story fully (including tests) before moving to the next.

Validation Checklist

- All tasks follow checklist format with Task IDs.
- Each user story phase contains independent test criteria and tasks to implement models/services/store/actions.

Output Summary (to be filled out after tasks created)

- Path to generated tasks file: `specs/001-core-mechanics/tasks.md`
- Total task count: 31 (T001–T031)
- Task count per user story:
  - US1: 5 tasks (T010–T014)
  - US2: 4 tasks (T015–T018)
  - US3: 4 tasks (T019–T022)
  - US4: 3 tasks (T023–T025)
  - US5: 2 tasks (T026–T027)
  - Setup/Foundational/Polish: remaining tasks
- Parallel opportunities identified: T005/T006/T007/T008/T009 and test scaffolding
- Suggested MVP scope: Complete US1 (T010–T014) first
