a# Tasks: Core Game Mechanics (MVP)

Feature: Core Game Mechanics (MVP)

Phase 1: Setup

- [x] T001 Create repository prerequisites check (run locally): command: `/.specify/scripts/bash/check-prerequisites.sh --json`
- [x] T002 [P] Create type definitions file: `src/models/types/index.ts`
- [x] T003 [P] Add game constants file: `src/lib/constants.ts`
- [x] T004 [P] Ensure dev tooling: verify `package.json` scripts and `vitest` config — files: `package.json`, `vitest.config.ts`

Phase 2: Foundational (blocking prerequisites)

- [x] T005 [P] Implement core interfaces and species config (`IFish`, `ITank`, `IGameState`, `FISH_SPECIES_CONFIG`) — file: `src/models/types/index.ts`
- [x] T006 [P] Implement `src/services/FishService.ts` (createFish, tickFish, calculateFishValue) — file: `src/services/FishService.ts`
- [x] T007 [P] Implement `src/services/EconomyService.ts` (buy/sell/clean/filter/upgrade helper signatures) — file: `src/services/EconomyService.ts`
- [x] T008 Implement `GameLoopService` abstraction (start/pause/resume/stop) — file: `src/services/GameLoopService.ts`
- [x] T009 [P] Add Zustand store skeleton with initial state and action signatures (`useGameStore.ts`) — file: `src/store/useGameStore.ts`
- [x] T010 [P] Add unit test skeletons for services and models (`tests/unit/*`) — files: `tests/unit/FishService.test.ts`, `tests/unit/EconomyService.test.ts`, `tests/unit/GameLoopService.test.ts`
- [x] T036 Implement multi-tank support: change game state to `tanks: ITank[]`, add per-tank actions (create/select/upgrade), and update tests/UI to support up to 2–3 tanks — files: `src/store/useGameStore.ts`, `src/models/types/index.ts`, `tests/integration/MultiTank.test.ts` **(COMPLETE — `tankSlice` refactor applied; `tests/integration/MultiTank.test.ts` added; domain types added; remaining docs/update tasks optional)**

Phase 3: User Story Phases (priority order)

**User Story 1 - Tank & Fish Management (P1)**

Independent test criteria: start game → default BOWL + 50 credits → buy fish reduces credits → fish exists in tank → tick increases age.

- [x] T011 [US1] Initialize game state with BOWL tank and 50 credits — file: `src/store/useGameStore.ts`
- [x] T012 [US1] Implement `buyFish(storeItemId)` action (validations: credits, capacity) that spawns fish via `FishService.createFish` — files: `src/store/useGameStore.ts`, `src/services/EconomyService.ts`
- [x] T013 [US1] Wire `tick()` action to increment `currentTick` and call `FishService.tickFish` for living fish — files: `src/store/useGameStore.ts`, `src/services/FishService.ts`
- [x] T014 [US1] Add integration test `tests/integration/BuyAndTick.test.ts` verifying buy → credits change → tick increments age — file: `tests/integration/BuyAndTick.test.ts`

**User Story 2 - Feeding & Survival (P1)**

Independent test criteria: hunger increases per tick; `feedTank` reduces hunger by 30 for all living fish, deducts cost `2 + livingFishCount`, and increases pollution.

- [x] T015 [US2] Implement per-tick hunger increase (species-specific) and starvation health decay when `hunger >= 80` — file: `src/services/FishService.ts`
- [x] T016 [US2] Implement `feedTank()` action: cost calc, deduct credits, reduce all living fish hunger by 30, set `lastFedAt`, and record `feedingsThisTick` for pollution — files: `src/store/useGameStore.ts`, `src/services/EconomyService.ts`
- [x] T017 [US2] Add unit test `tests/unit/Feeding.test.ts` for feed cost, hunger reduction and `lastFedAt` update — file: `tests/unit/Feeding.test.ts`
- [x] T018 [US2] Add integration test `tests/integration/FeedAndSurvive.test.ts` to accelerate ticks and verify feeding prevents death — file: `tests/integration/FeedAndSurvive.test.ts`

**User Story 3 - Water Quality & Maintenance (P1)**

Independent test criteria: pollution formula applied per tick and on feeds; `waterQuality = 100 - pollution`; `cleanTank` and `buyFilter` reduce pollution and affect health decay.

- [x] T019 [US3] Implement pollution accumulation per tick: `pollution += (livingFishCount * 0.1) + (feedingsThisTick * 2)` and clamp — files: `src/store/useGameStore.ts`, `src/services/EconomyService.ts`
- [x] T020 [US3] Update `waterQuality` calculation (`100 - pollution`, clamp 0-100) and apply health penalty when `waterQuality < 50` — file: `src/store/useGameStore.ts`
- [x] T021 [US3] Implement `cleanTank()` action (cost 10, `pollution = max(0, pollution - 30)`) — files: `src/store/useGameStore.ts`, `src/services/EconomyService.ts`
- [x] T022 [US3] Implement `buyFilter()` action (precondition: `size === 'STANDARD'`, cost 50) and per-tick pollution reduction when installed — files: `src/store/useGameStore.ts`, `src/services/EconomyService.ts`
- [x] T023 [US3] Add unit test `tests/unit/Pollution.test.ts` for pollution accumulation, clean, and filter behavior — file: `tests/unit/Pollution.test.ts`

**User Story 4 - Tank Progression (P1)**

Independent test criteria: starts with BOWL capacity 1 and 50 credits; when first fish reaches age >= 120s award 50 credits (maturity bonus); `upgradeTank()` costs 75 and sets capacity=10 and unlocks filter.

- [x] T024 [US4] Implement maturity bonus awarding (one-time) when a living fish reaches age >= 120 for BOWL tanks — files: `src/store/useGameStore.ts`, `src/services/EconomyService.ts`
- [x] T025 [US4] Implement `upgradeTank()` action (cost 75) that changes tank `size` to `STANDARD`, sets `capacity = 10`, and makes filter purchasable — files: `src/store/useGameStore.ts`, `src/services/EconomyService.ts`
- [x] T026 [US4] Add integration test `tests/integration/Progression.test.ts` verifying maturity bonus and upgrade flow — file: `tests/integration/Progression.test.ts`

**User Story 5 - Economy & Progression (P2)**

Independent test criteria: selling a fish calculates value using baseValue × ageMultiplier × healthModifier and updates credits; purchases rejected on insufficient funds.

- [x] T027 [US5] Implement `sellFish(fishId)` action using `FishService.calculateFishValue` and update credits — files: `src/store/useGameStore.ts`, `src/services/EconomyService.ts`
- [x] T028 [US5] Add unit test `tests/unit/SellFish.test.ts` verifying value formula and credit update — file: `tests/unit/SellFish.test.ts`
- [x] T039 [US5] Create `FishInfoPanel` component: display selected fish stats (age, health, hunger, calculated value) and "Sell Fish" button that calls `sellFish(selectedFishId)` — file: `src/components/FishInfoPanel.tsx`

- [x] T035 [FR-012] Implement Developer Mode initialization (parse `?dev=true` & `?tutorial=false`), set starting state (100 credits, STANDARD tank), and add unit/integration tests — files: `src/store/useGameStore.ts`, `tests/unit/DeveloperMode.test.ts`
- [x] T041 [FR-015] Add life stage helper function: create `getLifeStage(age: number)` utility that returns 'young' | 'mature' | 'old' based on age thresholds (0-119, 120-299, 300+) — file: `src/lib/fishHelpers.ts`
- [x] T042 [FR-015] Implement life stage visual rendering in `FishSprite`: apply size multiplier (1.0x young, 1.3x mature/old) and color desaturation (0.8x for old fish only) based on fish age — file: `src/game/views/FishSprite.ts`
- [x] T043 [FR-015] Add unit test `tests/unit/LifeStage.test.ts` verifying age thresholds and visual parameters (size, saturation) for each life stage — file: `tests/unit/LifeStage.test.ts`
- [x] T045 [FR-016] Create `FishInfoPanel` component showing selected fish stats and actions (Sell/Inspect) — file: `src/components/FishInfoPanel.tsx`
- [x] T046 [FR-016] Add integration test `tests/integration/FishInspect.test.ts` verifying click → select → panel open → sell flow — file: `tests/integration/FishInspect.test.ts`

Phase 4: Tank Design & Rendering (P2–P3)

**Tank Visual Design & Collision Physics (New from Updated Spec)**

Independent test criteria: BOWL renders circular (300×300px), STANDARD square (500×500px), BIG wide-rect (800×400px); all procedurally drawn via Pixi.js Graphics; fish-to-fish collision removed (visual overlap allowed); floor renders visible/invisible per tank type with 0.2 restitution physics.

- [ ] T037 [P] [FR-016] Remove fish-to-fish collision logic: update `CollisionService` to skip fish-fish collision checks, allowing visual overlap for 3D depth illusion — files: `src/services/physics/CollisionService.ts`, `src/models/types/index.ts`
- [ ] T038 [P] [FR-016] Add unit test `tests/unit/FishCollision.test.ts` verifying fish-fish collision is disabled while boundary collisions remain — file: `tests/unit/FishCollision.test.ts`
- [ ] T039 [FR-017] Implement floor entity as `IFloor` interface in types and add to tank model: defines floor type (visible/invisible), dimensions (30px/40px/1px), collision restitution (0.2) — file: `src/models/types/index.ts`
- [ ] T040 [FR-017] Implement floor rendering in `TankContainer`: BOWL invisible 1px floor, STANDARD/BIG visible pebble/sand texture (procedurally generated, no assets) with color specs — files: `src/game/views/TankContainer.ts`, `src/lib/constants.ts`
- [ ] T041 [P] [FR-017] Update physics to apply 0.2 restitution for floor collisions vs 0.8 for wall collisions; add `FLOOR_RESTITUTION` and `WALL_RESTITUTION` constants — files: `src/services/physics/PhysicsService.ts`, `src/lib/constants.ts`
- [ ] T042 [P] [FR-017] Add integration test `tests/integration/FloorPhysics.test.ts` verifying fish settle naturally on floor with gentle 0.2 restitution — file: `tests/integration/FloorPhysics.test.ts`
- [ ] T043 [FR-018] Implement procedural tank rendering: BOWL as filled circle, STANDARD as filled square, BIG as filled rectangle (no SVG); use Pixi.js Graphics.drawCircle/drawRect with glass effect (semi-transparent border) — file: `src/game/views/TankContainer.ts`
- [ ] T044 [FR-018] Add tank dimension constants to `src/lib/constants.ts`: `TANK_BOWL_SIZE: 300`, `TANK_STANDARD_SIZE: 500`, `TANK_BIG_WIDTH: 800`, `TANK_BIG_HEIGHT: 400` — file: `src/lib/constants.ts`
- [ ] T045 [P] [FR-018] Implement responsive scaling in `TankContainer`: scale tank display (300–600px per tank desktop, full-width mobile) without affecting collision bounds or physics — file: `src/game/views/TankContainer.ts`
- [ ] T046 [FR-018] Add unit test `tests/unit/TankVisuals.test.ts` verifying tank dimensions and shape types (circular, square, rectangle) render correctly — file: `tests/unit/TankVisuals.test.ts`
- [ ] T047 [P] [FR-019] Implement multi-tank display layout: add `activeTabIndex` to game state, create responsive grid layout for desktop (all 2–3 tanks visible), tab navigation for mobile/tablet (one tank at a time) — files: `src/store/useGameStore.ts`, `src/components/AquariumCanvas.tsx`, `src/models/types/index.ts`
- [ ] T048 [FR-019] Add tab buttons with visual indicators: ● for BOWL, ◯ for STANDARD, ▭ for BIG; highlight active tank; wire keyboard shortcuts (1/2/3 keys, arrow keys) — file: `src/components/AquariumCanvas.tsx`
- [ ] T049 [P] [FR-019] Add responsive layout CSS/styles: use viewport queries to switch between grid (desktop ≥1024px), split layout (tablet 768–1024px), tabs (mobile <768px) — files: `src/index.css`, `src/components/AquariumCanvas.tsx`
- [ ] T050 [FR-019] Add integration test `tests/integration/MultiTankLayout.test.ts` verifying desktop grid, tablet split, and mobile tab layouts; keyboard shortcut switching — file: `tests/integration/MultiTankLayout.test.ts`

**Developer Mode Update (Updated Spec Value)**

Independent test criteria: dev mode initializes with STANDARD tank (was just "large tank") and 1000 credits (was 100); tutorial disabled.

- [ ] T051 [FR-012-Update] Update Developer Mode constants: change starting credits from 100 to 1000 in `src/lib/constants.ts` and verify `DeveloperMode.test.ts` — files: `src/lib/constants.ts`, `tests/unit/DeveloperMode.test.ts`
- [ ] T052 [P] [FR-012-Update] Update tank progression code: verify BOWL capacity is 2 (was 1), STANDARD capacity is 15 (was 10), BIG is 30 (was 20); costs 75 (STANDARD) and 150 (BIG) — files: `src/store/useGameStore.ts`, `src/lib/constants.ts`, `tests/integration/Progression.test.ts`

Phase 5: Enhanced UX & Polish (P2–P3)

**User Story 5 - Fish Selection & Interaction (P2)**

Independent test criteria: click on fish → fish is selected and highlighted → info panel updates; selection persists until new fish clicked; sell button in panel works.

- [ ] T053 [US5] Implement fish selection mechanism: add `selectedFishId` to game state, add `selectFish(fishId)` action, wire click handlers in `FishSprite` to detect fish clicks — files: `src/store/slices/gameSlice.ts`, `src/game/views/FishSprite.ts`, `src/models/types/index.ts`
- [ ] T054 [US5] Add visual highlight for selected fish: modify `FishSprite` to render selection indicator (outline/glow) when fish is selected — file: `src/game/views/FishSprite.ts`
- [ ] T055 [US5] Add integration test `tests/integration/FishSelection.test.ts` verifying click → select → display info → sell flow — file: `tests/integration/FishSelection.test.ts`
- [ ] T056 [FR-016] Implement `selectFish(fishId)` state and `selectedFishId` in store; wire click events from `FishSprite` to dispatch selection — files: `src/store/slices/gameSlice.ts`, `src/game/views/FishSprite.ts`

**Water Visuals & Aesthetic Polish (P3 - Optional)**

Independent test criteria: water background renders with opacity based on pollution level; blur/tint effects are optional and gracefully degrade on low-end devices; performance impact is minimal (<5% CPU overhead).

- [ ] T057 [FR-017] Add PRD/spec entry and design notes for water background + pollution-driven blur/tint; include performance constraints and fallback behavior — files: `docs/PRD_Eng.md`, `specs/001-core-mechanics/spec.md`
- [ ] T058 [FR-017] Implement background rendering + shader or Canvas2D blur in `RenderingEngine` with a toggle and LOD (disable on low-end devices); expose API to set blur/tint by pollution grade — files: `src/game/RenderingEngine.ts`, `src/game/views/TankContainer.ts`
- [ ] T059 [FR-017] Add integration/perf tests `tests/integration/WaterVisuals.test.ts` to ensure visual changes reflect pollution and that performance remains acceptable (FPS/CPU thresholds) — file: `tests/integration/WaterVisuals.test.ts`

Final Phase: Polish & Cross-Cutting Concerns

- [x] T029 Add tutorial popup event wiring and storage (`tutorialEvents[]`, `showTutorial(eventId)` action) — file: `src/store/useGameStore.ts`
- [x] T030 Add UI selectors for core data (`selectCredits`, `selectTankFish`, `selectStoreInventory`, `selectSelectedFish`) — file: `src/store/useGameStore.ts`
- [x] T031 [P] Create minimal HUD and store UI hooks/components: `src/components/HUD.tsx`, `src/components/StoreMenu.tsx` (UI may be lightweight, tests focus on store/actions) — files: `src/components/HUD.tsx`, `src/components/StoreMenu.tsx`
- [x] T032 [infra] Add E2E Playwright test `tests/e2e/core-mechanics.spec.ts` for buy → feed → mature → sell flow — file: `tests/e2e/core-mechanics.spec.ts`
- [x] T033 [infra] Run lint and tests and fix issues: `pnpm lint` and `pnpm test` — commands: `pnpm lint`, `pnpm test`
- [x] T034 [infra] Add performance profiling notes and harness placeholder (`tests/perf/README.md`, `tests/perf/harness.ts`) — files: `tests/perf/README.md`, `tests/perf/harness.ts`

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
- Total task count: 59 (T001–T059)
- Task count per phase:
  - Phase 1 (Setup): 4 tasks (T001–T004) — ✅ COMPLETE
  - Phase 2 (Foundational): 7 tasks (T005–T010, T036) — ✅ COMPLETE
  - Phase 3 (User Stories 1–5): 30 tasks (T011–T035, T039, T041–T043, T045–T046) — ✅ COMPLETE (MVP)
  - Phase 4 (Tank Design & Rendering): 16 tasks (T037–T052) — 🚀 NEW (from updated spec FR-016 through FR-020, executable before Phase 5)
  - Phase 5 (Enhanced UX & Polish): 7 tasks (T053–T059) — 📋 PLANNED (Fish selection & water visuals)
- Task count breakdown:
  - US1 (Tank & Fish Management): 4 tasks (T011–T014) — ✅
  - US2 (Feeding & Survival): 4 tasks (T015–T018) — ✅
  - US3 (Water Quality): 5 tasks (T019–T023) — ✅
  - US4 (Tank Progression): 3 tasks (T024–T026) — ✅
  - US5 (Economy & Progression): 10 tasks (T027–T028, T035, T039, T041–T043, T045–T046) — ✅ MVP
  - Tank Design & Rendering (New): 16 tasks (T037–T052) — 🚀 NEW (Phase 4, independent execution)
  - Fish Selection (P2): 4 tasks (T053–T056) — 📋 PLANNED (Phase 5)
  - Water Visuals (Optional): 3 tasks (T057–T059) — 📋 PLANNED (Phase 5)
  - Infrastructure & Polish: 9 tasks (T001–T004, T029–T034) — ✅
- Remaining incomplete tasks: 23 (T037–T052 in Phase 4; T053–T059 in Phase 5)
- Parallel opportunities identified:
  - Phase 4: T037/T038/T041/T042 (collision and physics updates)
  - Phase 4: T043/T044/T045 (tank rendering and dimensions)
  - Phase 4: T047/T049 (multi-tank layout)
  - Phase 4: T051/T052 (developer mode updates)

## Test Strategy Recommendations

**Issue**: Tests break when constants are updated for better game experience due to magic numbers.

**Solution**: Hybrid approach documented in `docs/TEST_STRATEGY.md`:

- ✅ **Use constants in unit/integration tests** for business logic and calculations
- ❌ **Keep magic numbers in E2E tests** for user experience verification
- 🔄 **Create test configuration** for common scenarios (dev mode, normal mode)

**Next Steps**:

- [ ] **T060** Create `tests/config/testConstants.ts` with scenario-based test data
- [ ] **T061** Refactor unit tests to import and use business logic constants
- [ ] **T062** Add regression protection tests for critical user-facing values
- [ ] **T063** Update integration tests to use constant-based calculations
- [ ] **T064** Document which values are "contracts" vs "tuneable parameters"

```
- Parallel opportunities identified: T005/T006/T007/T008/T009 and test scaffolding
```
