a# Tasks: Core Game Mechanics (MVP)

Feature: Core Game Mechanics (MVP)

Phase 1: Setup

- [ ] T001 Create repository prerequisites check (run locally): command: `/.specify/scripts/bash/check-prerequisites.sh --json`
- [ ] T002 [P] Create type definitions file: `src/models/types/index.ts`
- [ ] T003 [P] Add game constants file: `src/lib/constants.ts`
- [ ] T004 [P] Ensure dev tooling: verify `package.json` scripts and `vitest` config — files: `package.json`, `vitest.config.ts`

Phase 2: Foundational (blocking prerequisites)

- [ ] T005 [P] Implement core interfaces and species config (`IFish`, `ITank`, `IGameState`, `FISH_SPECIES_CONFIG`) — file: `src/models/types/index.ts`
- [ ] T006 [P] Implement `src/services/FishService.ts` (createFish, tickFish, calculateFishValue) — file: `src/services/FishService.ts`
- [ ] T007 [P] Implement `src/services/EconomyService.ts` (buy/sell/clean/filter/upgrade helper signatures) — file: `src/services/EconomyService.ts`
- [ ] T008 Implement `GameLoopService` abstraction (start/pause/resume/stop) — file: `src/services/GameLoopService.ts`
- [ ] T009 [P] Add Zustand store skeleton with initial state and action signatures (`useGameStore.ts`) — file: `src/store/useGameStore.ts`
- [ ] T010 [P] Add unit test skeletons for services and models (`tests/unit/*`) — files: `tests/unit/FishService.test.ts`, `tests/unit/EconomyService.test.ts`, `tests/unit/GameLoopService.test.ts`
- [ ] T010 [P] Add unit test skeletons for services and models (`tests/unit/*`) — files: `tests/unit/FishService.test.ts`, `tests/unit/EconomyService.test.ts`, `tests/unit/GameLoopService.test.ts`
- [x] T036 Implement multi-tank support: change game state to `tanks: ITank[]`, add per-tank actions (create/select/upgrade), and update tests/UI to support up to 2–3 tanks — files: `src/store/useGameStore.ts`, `src/models/types/index.ts`, `tests/integration/MultiTank.test.ts` **(COMPLETE — `tankSlice` refactor applied; `tests/integration/MultiTank.test.ts` added; domain types added; remaining docs/update tasks optional)**

Phase 3: User Story Phases (priority order)

**User Story 1 - Tank & Fish Management (P1)**

Independent test criteria: start game → default BOWL + 50 credits → buy fish reduces credits → fish exists in tank → tick increases age.

- [ ] T011 [US1] Initialize game state with BOWL tank and 50 credits — file: `src/store/useGameStore.ts`
- [ ] T012 [US1] Implement `buyFish(storeItemId)` action (validations: credits, capacity) that spawns fish via `FishService.createFish` — files: `src/store/useGameStore.ts`, `src/services/EconomyService.ts`
- [ ] T013 [US1] Wire `tick()` action to increment `currentTick` and call `FishService.tickFish` for living fish — files: `src/store/useGameStore.ts`, `src/services/FishService.ts`
- [ ] T014 [US1] Add integration test `tests/integration/BuyAndTick.test.ts` verifying buy → credits change → tick increments age — file: `tests/integration/BuyAndTick.test.ts`

**User Story 2 - Feeding & Survival (P1)**

Independent test criteria: hunger increases per tick; `feedTank` reduces hunger by 30 for all living fish, deducts cost `2 + livingFishCount`, and increases pollution.

- [ ] T015 [US2] Implement per-tick hunger increase (species-specific) and starvation health decay when `hunger >= 80` — file: `src/services/FishService.ts`
- [ ] T016 [US2] Implement `feedTank()` action: cost calc, deduct credits, reduce all living fish hunger by 30, set `lastFedAt`, and record `feedingsThisTick` for pollution — files: `src/store/useGameStore.ts`, `src/services/EconomyService.ts`
- [ ] T017 [US2] Add unit test `tests/unit/Feeding.test.ts` for feed cost, hunger reduction and `lastFedAt` update — file: `tests/unit/Feeding.test.ts`
- [ ] T018 [US2] Add integration test `tests/integration/FeedAndSurvive.test.ts` to accelerate ticks and verify feeding prevents death — file: `tests/integration/FeedAndSurvive.test.ts`

**User Story 3 - Water Quality & Maintenance (P1)**

Independent test criteria: pollution formula applied per tick and on feeds; `waterQuality = 100 - pollution`; `cleanTank` and `buyFilter` reduce pollution and affect health decay.

- [ ] T019 [US3] Implement pollution accumulation per tick: `pollution += (livingFishCount * 0.1) + (feedingsThisTick * 2)` and clamp — files: `src/store/useGameStore.ts`, `src/services/EconomyService.ts`
- [ ] T020 [US3] Update `waterQuality` calculation (`100 - pollution`, clamp 0-100) and apply health penalty when `waterQuality < 50` — file: `src/store/useGameStore.ts`
- [ ] T021 [US3] Implement `cleanTank()` action (cost 10, `pollution = max(0, pollution - 30)`) — files: `src/store/useGameStore.ts`, `src/services/EconomyService.ts`
- [ ] T022 [US3] Implement `buyFilter()` action (precondition: `size === 'STANDARD'`, cost 50) and per-tick pollution reduction when installed — files: `src/store/useGameStore.ts`, `src/services/EconomyService.ts`
- [ ] T023 [US3] Add unit test `tests/unit/Pollution.test.ts` for pollution accumulation, clean, and filter behavior — file: `tests/unit/Pollution.test.ts`

**User Story 4 - Tank Progression (P1)**

Independent test criteria: starts with BOWL capacity 1 and 50 credits; when first fish reaches age >= 120s award 50 credits (maturity bonus); `upgradeTank()` costs 75 and sets capacity=10 and unlocks filter.

- [ ] T024 [US4] Implement maturity bonus awarding (one-time) when a living fish reaches age >= 120 for BOWL tanks — files: `src/store/useGameStore.ts`, `src/services/EconomyService.ts`
- [ ] T025 [US4] Implement `upgradeTank()` action (cost 75) that changes tank `size` to `STANDARD`, sets `capacity = 10`, and makes filter purchasable — files: `src/store/useGameStore.ts`, `src/services/EconomyService.ts`
- [ ] T026 [US4] Add integration test `tests/integration/Progression.test.ts` verifying maturity bonus and upgrade flow — file: `tests/integration/Progression.test.ts`

**User Story 5 - Economy & Progression (P2)**

Independent test criteria: selling a fish calculates value using baseValue × ageMultiplier × healthModifier and updates credits; purchases rejected on insufficient funds.

- [ ] T027 [US5] Implement `sellFish(fishId)` action using `FishService.calculateFishValue` and update credits — files: `src/store/useGameStore.ts`, `src/services/EconomyService.ts`
- [ ] T028 [US5] Add unit test `tests/unit/SellFish.test.ts` verifying value formula and credit update — file: `tests/unit/SellFish.test.ts`

- [ ] T035 [FR-012] Implement Developer Mode initialization (parse `?dev=true` & `?tutorial=false`), set starting state (100 credits, STANDARD tank), and add unit/integration tests — files: `src/store/useGameStore.ts`, `tests/unit/DeveloperMode.test.ts`

Final Phase: Polish & Cross-Cutting Concerns

- [ ] T029 Add tutorial popup event wiring and storage (`tutorialEvents[]`, `showTutorial(eventId)` action) — file: `src/store/useGameStore.ts`
- [ ] T030 Add UI selectors for core data (`selectCredits`, `selectTankFish`, `selectStoreInventory`, `selectSelectedFish`) — file: `src/store/useGameStore.ts`
- [ ] T031 [P] Create minimal HUD and store UI hooks/components: `src/components/HUD.tsx`, `src/components/StoreMenu.tsx` (UI may be lightweight, tests focus on store/actions) — files: `src/components/HUD.tsx`, `src/components/StoreMenu.tsx`
- [ ] T032 [infra] Add E2E Playwright test `tests/e2e/core-mechanics.spec.ts` for buy → feed → mature → sell flow — file: `tests/e2e/core-mechanics.spec.ts`
- [ ] T033 [infra] Run lint and tests and fix issues: `pnpm lint` and `pnpm test` — commands: `pnpm lint`, `pnpm test`
- [ ] T034 [infra] Add performance profiling notes and harness placeholder (`tests/perf/README.md`, `tests/perf/harness.ts`) — files: `tests/perf/README.md`, `tests/perf/harness.ts`

Dependencies (user-story completion order)

- US1 → US2 → US3 → US4 → US5

Rationale: Basic tank/fish creation (US1) is required before feeding (US2); feeding/pollution (US3) depend on feeding; progression (US4) depends on survival; economy sell/buy (US5) depends on values implemented.

Parallel execution examples

- Tasks that are safe to run in parallel (different files, minimal blocking):
  - `T005` `src/models/types/index.ts` and `T006` `src/services/FishService.ts` — [P]
  - `T007` `src/services/EconomyService.ts` and `T009` `src/store/useGameStore.ts` — [P]
  - `T010` test skeletons and `T003` constants file — [P]

Implementation strategy (recommended)

- MVP-first: implement smallest end-to-end path for US1 (T011–T014) to have a runnable loop, then add US2 and US3. Follow TDD: add tests before implementing service logic.
- Incremental: complete one user story fully (including tests) before moving to the next.

Validation checklist

- All tasks follow the required checklist format with Task IDs.
- Each user story is paired with independent test criteria and implementation tasks.

Output summary (generated)

- Path to generated tasks file: `specs/001-core-mechanics/tasks.md`
- Total task count: 36 (T001–T036)
- Task count per user story:
  - US1: 4 tasks (T011–T014)
  - US2: 4 tasks (T015–T018)
  - US3: 5 tasks (T019–T023)
  - US4: 3 tasks (T024–T026)
  - US5: 2 tasks (T027–T028)
  - Setup/Foundational/Polish: remaining tasks (T001–T010, T029–T034)
- Parallel opportunities identified: T005/T006/T007/T009/T010
- Suggested MVP scope: Complete US1 (T011–T014) as Phase 1 MVP

```
- Parallel opportunities identified: T005/T006/T007/T008/T009 and test scaffolding
```
