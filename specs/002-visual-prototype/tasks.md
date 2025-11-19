# Tasks: Visual Prototype - Swimming Fish in Tank with Physics & Collisions

**Input**: Design documents from `/specs/002-visual-prototype/`
**Prerequisites**: plan.md ✅, spec.md ✅

**Organization**: Tasks grouped by user story (US1, US2, US3) to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story designation (US1, US2, US3)
- Exact file paths included

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Scaffold src/ directory structure per plan.md
- [ ] T002 Create main entry point and Vite configuration in `src/App.tsx` and `vite.config.ts`
- [ ] T003 [P] Configure ESLint and Prettier rules in `.eslintrc.json` and `.prettierrc`
- [ ] T004 [P] Configure Vitest in `vitest.config.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that blocks all rendering work

**⚠️ CRITICAL**: No rendering work can begin until this phase completes

- [ ] T005 [P] Create type definitions for Fish in `src/types/fish.ts` (properties: id, color, size, position, velocity, acceleration, mass, radius)
- [ ] T006 [P] Create type definitions for Tank in `src/types/tank.ts` (properties: width, height, backgroundColor)
- [ ] T007 [P] Create type definitions for rendering in `src/types/render.ts` (Animation frames, sprite config, collision data)
- [ ] T008 Create base Fish model in `src/models/Fish.ts` with physics properties (velocity, acceleration, mass, radius)
- [ ] T009 Create base Tank model in `src/models/Tank.ts` as a container with collision tracking
- [ ] T010 [P] Create physics utility functions in `src/lib/physics.ts` (velocity update, acceleration calc, friction/drag, boundary detection, AABB collision)
- [ ] T011 [P] Create collision response functions in `src/lib/collision.ts` (elastic bounce for walls and fish-to-fish)
- [ ] T012 [P] Create random utility functions in `src/lib/random.ts` (randomColor, randomSize, randomVelocity)

**Checkpoint**: Type definitions and utilities ready - rendering implementation can begin in parallel

---

## Phase 3: User Story 1 - Render Aquarium Tank (Priority: P1) 🎯 MVP

**Goal**: Display a visible aquarium tank container on screen with defined boundaries

**Independent Test**: Initialize app and verify tank is rendered with blue background and visible edges

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T013 [P] [US1] Unit test for Tank model in `tests/unit/Tank.test.ts` (dimensions, properties)
- [ ] T014 [P] [US1] Unit test for TankView rendering in `tests/unit/TankView.test.ts` (canvas creation, dimensions)
- [ ] T015 [US1] Integration test for AquariumCanvas in `tests/integration/AquariumCanvas.test.tsx` (tank appears on mount)

### Implementation for User Story 1

- [ ] T016 [P] [US1] Create TankView Pixi container in `src/game/TankView.ts` (extends Pixi.Container)
- [ ] T017 [US1] Create RenderingEngine Pixi Application in `src/game/RenderingEngine.ts` (Pixi.Application setup)
- [ ] T018 [US1] Create AquariumCanvas React component wrapper in `src/components/AquariumCanvas.tsx` (useEffect/useRef for Pixi)
- [ ] T019 [US1] Update `src/App.tsx` to render AquariumCanvas as main entry point
- [ ] T020 [US1] Add styles for tank container in `src/components/AquariumCanvas.tsx` (width, height, borders)
- [ ] T021 [US1] Add logging for tank initialization in RenderingEngine

**Checkpoint**: Tank renders on screen with visible boundaries - US1 complete and testable independently

---

## Phase 4: User Story 2 - Render Swimming Fish with Physics & Collisions (Priority: P1)

**Goal**: Display fish as sprites in the tank with physics-based movement (velocity, acceleration, friction) and realistic collision responses

**Independent Test**: Verify fish appear in tank, move with acceleration, respond to tank boundaries, and collide realistically with each other

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T022 [P] [US2] Unit test for Fish model in `tests/unit/Fish.test.ts` (position, velocity, acceleration, mass properties)
- [ ] T023 [P] [US2] Unit test for physics calculations in `tests/unit/physics.test.ts` (velocity update, acceleration, friction, boundary detection)
- [ ] T024 [P] [US2] Unit test for collision detection in `tests/unit/collision.test.ts` (AABB detection, wall collision, fish-to-fish collision)
- [ ] T025 [P] [US2] Unit test for collision response in `tests/unit/collision.test.ts` (elastic bounce, velocity reversal)
- [ ] T026 [P] [US2] Unit test for FishSprite in `tests/unit/FishSprite.test.ts` (sprite creation, position/velocity sync)
- [ ] T027 [US2] Integration test for animation loop with physics in `tests/integration/RenderingEngine.test.ts` (fish animate with acceleration over time)
- [ ] T028 [US2] Integration test for collision response in `tests/integration/AquariumCanvas.test.tsx` (fish bounce off walls and each other)

### Implementation for User Story 2

- [ ] T029 [P] [US2] Implement velocity update in physics.ts `updateVelocity(velocity, acceleration, friction)`
- [ ] T030 [P] [US2] Implement acceleration calculation in physics.ts `calculateAcceleration(mass, forces)`
- [ ] T031 [P] [US2] Implement boundary collision detection in physics.ts `detectBoundaryCollision(position, radius, tankBounds)`
- [ ] T032 [P] [US2] Implement fish-to-fish collision detection in collision.ts `detectFishCollision(fish1, fish2)` using AABB
- [ ] T033 [P] [US2] Implement boundary collision response in collision.ts `resolveBoundaryCollision(fish, tankBounds)`
- [ ] T034 [P] [US2] Implement fish-to-fish collision response in collision.ts `resolveFishCollision(fish1, fish2)` (elastic bounce)
- [ ] T035 [US2] Create FishSprite class in `src/game/FishSprite.ts` (extends Pixi.Sprite, update method with physics)
- [ ] T036 [US2] Implement spawn fish logic in Tank model in `src/models/Tank.ts` (addFish with initial velocity/acceleration)
- [ ] T037 [US2] Implement physics update loop in `src/game/RenderingEngine.ts` (calculate forces, update velocity/position, detect/resolve collisions)
- [ ] T038 [US2] Update TankView to render FishSprite instances in `src/game/TankView.ts`
- [ ] T039 [US2] Update RenderingEngine to initialize fish on startup with random velocities (create 5-10 default fish)
- [ ] T040 [US2] Add frame rate monitoring and physics metrics logging in `src/game/RenderingEngine.ts`

**Checkpoint**: Fish render and animate smoothly; tank boundaries enforced - US1 + US2 both functional

---

## Phase 5: User Story 3 - Fish Visual Variety (Priority: P2)

**Goal**: Generate fish with different colors and sizes for visual distinction

**Independent Test**: Spawn multiple fish and verify at least 3 distinct colors and multiple sizes visible

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T032 [P] [US3] Unit test for random color generation in `tests/unit/random.test.ts` (generates distinct colors)
- [ ] T033 [P] [US3] Unit test for random size generation in `tests/unit/random.test.ts` (generates varied sizes)
- [ ] T034 [US3] Integration test for fish variety in `tests/integration/AquariumCanvas.test.tsx` (multiple colors visible)

### Implementation for User Story 3

- [ ] T035 [P] [US3] Implement `randomColor()` function in `src/lib/random.ts` (palette of 3+ distinct colors)
- [ ] T036 [P] [US3] Implement `randomSize()` function in `src/lib/random.ts` (small, medium, large variations)
- [ ] T037 [US3] Update Fish model in `src/models/Fish.ts` to accept color and size in constructor
- [ ] T038 [US3] Update FishSprite in `src/game/FishSprite.ts` to render with color tint and scale based on size
- [ ] T039 [US3] Update spawn logic in Tank to generate random colors/sizes when creating fish
- [ ] T040 [US3] Adjust fish rendering to ensure sizes remain proportional (scale 0.5x - 1.5x)

**Checkpoint**: All 3 user stories complete - fish have visual variety, physics-based animation, and collision response

---

## Phase 6: Performance & Polish

**Purpose**: Optimization and refinement for physics simulation

- [ ] T041 [P] Monitor frame rate and physics metrics (collision checks, velocity updates) in `src/game/RenderingEngine.ts`
- [ ] T042 [P] Stress test with 20+ fish and verify 30+ fps with physics in `tests/integration/performance.test.ts`
- [ ] T043 [P] Profile collision detection performance (O(n²) cost) and log collision counts
- [ ] T044 [P] Implement optional spatial hashing in `src/lib/collision.ts` if needed for >50 fish
- [ ] T045 Adjust fish mass and friction coefficients for natural-feeling movement
- [ ] T046 Tune collision elasticity (coefficient of restitution) for realistic bouncing
- [ ] T047 Add responsive tank sizing (adjust canvas size on window resize)

**Checkpoint**: Application runs smoothly at target 30+ fps with 20+ fish including physics/collisions

---

## Phase 7: Testing & Documentation

**Purpose**: Comprehensive test coverage and user-facing documentation

- [ ] T048 [P] Achieve >90% code coverage for `src/models/` and `src/lib/`
- [ ] T049 [P] Achieve >85% code coverage for `src/game/` and `src/components/`
- [ ] T050 Review all test results and add missing physics edge case tests (corner collisions, simultaneous collisions)
- [ ] T051 Create QUICKSTART.md with:
  - How to run dev server (`pnpm dev`)
  - How to run tests (`pnpm test`)
  - How to build (`pnpm build`)
  - Expected output (screenshot/description of visual with physics)
- [ ] T052 Document physics implementation in project README (velocity/acceleration formulas, collision math, performance notes)
- [ ] T053 Document architecture in README with physics simulation flow diagram

**Checkpoint**: All tests passing, >90% coverage, documentation complete - READY FOR DELIVERY

---

## Summary

**Total Tasks**: 53 (increased from 50 due to physics + collisions)
**Parallel Opportunities**: ~18 tasks can run in parallel (marked [P])
**User Story Breakdown**:

- US1 (Tank Rendering): T013-T021 (9 tasks)
- US2 (Swimming Fish + Physics + Collisions): T022-T040 (19 tasks, +8 from physics/collisions)
- US3 (Fish Variety): T041-T053 (same scope, included in polish phase)
- Setup: T001-T012 (12 foundational tasks)
- Performance/Testing: T041-T053 (13 tasks)

**Recommended MVP Scope**: Complete Phases 1-5 (T001-T047) for a working physics-enabled visual prototype.

**Next Steps**: Begin Phase 1 setup tasks, then proceed through phases sequentially. Physics implementation is now a core feature, not optional.
