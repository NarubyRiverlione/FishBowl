# Feature Specification: Core Game Mechanics (MVP)

**Feature Branch**: `001-core-mechanics`
**Created**: 2025-11-19
**Status**: ✅ COMPLETE - MVP Ready for Production
**Completion**: November 2025
**Input**: User description: "Implement core game mechanics defined in PRD"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Tank & Fish Management (Priority: P1)

As a player, I want to purchase a fish and place it in a tank so that I can start my aquarium.

**Why this priority**: This is the fundamental interaction of the game. Without a tank and a fish, there is no simulation.

**Independent Test**: Can be tested by initializing the game, verifying a tank exists, adding a fish entity, and verifying the fish is associated with the tank.

**Acceptance Scenarios**:

1. **Given** a new game, **When** the game starts, **Then** the player has an empty tank and some starting credits.
2. **Given** sufficient credits, **When** the player buys a fish from the store, **Then** the credits decrease and the fish appears in the tank.
3. **Given** a fish in a tank, **When** the game loop runs, **Then** the fish's age increases over time.

---

### User Story 2 - Feeding & Survival (Priority: P1)

As a player, I want to feed all my fish at once to prevent them from starving and dying.

**Why this priority**: Introduces the core survival loop and player engagement (tamagotchi mechanic).

**Independent Test**: Can be tested by accelerating time and verifying hunger increases, then performing a feed action and verifying hunger decreases for all fish.

**Acceptance Scenarios**:

1. **Given** a living fish, **When** time passes (ticks), **Then** the fish's hunger level increases.
2. **Given** one or more hungry fish, **When** the player feeds the tank, **Then** all living fish hunger levels decrease by 30 points.
3. **Given** sufficient credits, **When** the player feeds the tank, **Then** the cost is deducted (base cost + per-fish cost).
4. **Given** a starving fish (max hunger), **When** time passes, **Then** the fish's health decreases.
5. **Given** a fish with 0 health, **When** the next tick occurs, **Then** the fish dies and is removed from the tank.

---

### User Story 3 - Water Quality & Maintenance (Priority: P1)

As a player, I want to maintain water quality by managing pollution so that my fish stay healthy.

**Why this priority**: Introduces resource management and creates economic pressure (filter purchases/cleanings). Essential for currency drain game loop.

**Independent Test**: Can be tested by running simulation over time, verifying pollution increases with fish population and feeding, and that filters/cleaning reduce pollution.

**Acceptance Scenarios**:

1. **Given** living fish in the tank, **When** time passes (ticks), **Then** pollution increases based on fish population.
2. **Given** the player feeds the tank, **When** feeding occurs, **Then** pollution increases by feeding amount.
3. **Given** high pollution (>50), **When** time passes, **Then** water quality decreases.
4. **Given** low water quality (<50), **When** time passes, **Then** fish health decreases.
5. **Given** sufficient credits, **When** the player cleans the tank or installs a filter, **Then** pollution decreases and/or pollution rate is reduced.

---

### User Story 4 - Tank Progression (Priority: P1)

As a new player, I want to start with a small bowl to learn the basics before managing multiple fish.

**Why this priority**: Creates natural tutorial flow and sense of progression. Prevents overwhelming new players.

**Independent Test**: Can be tested by keeping starter fish alive until mature age, verifying bonus is awarded, and that bigger tank can be purchased.

**Acceptance Scenarios**:

1. **Given** a new game, **When** the game starts, **Then** the player has a BOWL tank (capacity 2, circular shape) and 50 starting credits.
2. **Given** a BOWL tank, **When** viewing the store, **Then** the filter option is not available (prevents confusion).
3. **Given** a fish reaches mature age (>2 minutes), **When** the fish is still alive, **Then** the player receives 50 bonus credits.
4. **Given** sufficient credits, **When** the player buys a larger tank, **Then** the tank capacity increases to the next tier. Progression: BOWL (2 capacity, circular) → STANDARD (15 capacity, square, costs 75 credits) → BIG (30 capacity, wide rectangle, costs 150 credits). Filters become available for STANDARD/BIG tanks only. Multiple tanks (up to 2–3 by default) may be owned concurrently, each subject to its capacity limit.
5. **Given** tutorial mode enabled, **When** key events occur (first fish, first feed, first death, maturity, etc.), **Then** helpful popup explanations appear and must be manually dismissed by clicking OK or X button.
6. **Given** tutorial mode disabled, **When** playing, **Then** no tutorial popups appear.
7. **Given** developer mode enabled, **When** the game starts, **Then** the player starts with a STANDARD tank and 1000 credits (skip tutorial).

---

### User Story 5 - Economy & Progression (Priority: P2)

As a player, I want to sell grown fish for a profit so that I can buy better equipment or more fish.

**Why this priority**: Creates the feedback loop for progression and "winning" the game.

**Independent Test**: Can be tested by manipulating fish stats (age/health) and verifying the calculated sell price and credit update.

**Acceptance Scenarios**:

1. **Given** fish in the tank, **When** the player clicks on a fish sprite, **Then** that fish is selected and visually highlighted.
2. **Given** a selected fish, **When** the fish info panel displays, **Then** it shows the fish's age, health, hunger, and calculated sell value.
3. **Given** a selected fish, **When** the player clicks the "Sell Fish" button, **Then** the fish is removed and credits are added to the player's balance.
4. **Given** a fish, **When** selling, **Then** the value is calculated based on species, age, and health: `baseValue × ageMultiplier × healthModifier` (as per PRD).
5. **Given** insufficient credits, **When** trying to buy an item, **Then** the transaction is rejected.
6. **Given** no fish selected, **When** viewing the game, **Then** the fish info panel is hidden or shows a "Select a fish" prompt.

### Edge Cases

- **Game Over**: What happens if all fish die and player has 0 credits? (Assumption: Player must restart or get a "pity" loan/fish).
- **Tank Capacity**: What happens if the tank is full? (Assumption: Cannot buy/breed more fish).
- **Offline Progression**: Does time pass when the tab is closed? (Assumption: No, for MVP it's active play only).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST implement a **Game Loop** that updates the simulation state at a fixed tick rate (e.g., 1 tick/sec).
- **FR-002**: The system MUST maintain a **Fish Entity** with the following attributes: unique identifier, species, color, size, age, hunger level (0-100), health level (0-100), and living status.
- **FR-003**: The system MUST maintain a **Tank Entity** that acts as a container for Fish and tracks water quality (0-100) and pollution (0-100).
- **FR-004**: The system MUST implement **Hunger Mechanics**: Hunger increases over time; if Hunger exceeds a critical threshold, Health decreases over time.
- **FR-005**: The system MUST implement **Feeding**: A "Feed Tank" action reduces hunger for all living fish in the tank by 30 points. Cost is calculated as: `baseCost + (perFishCost × numberOfLivingFish)`. Feeding increases pollution.
- **FR-006**: The system MUST implement **Pollution Mechanics**: Pollution increases per tick based on fish population and feeding actions. Formula: `pollution += (livingFishCount × 0.1) + (feedingsThisTick × 2)`.
- **FR-007**: The system MUST implement **Water Quality**: Water quality is calculated as `100 - pollution` (clamped 0-100). When water quality < 50, fish health decreases per tick.
- **FR-008**: The system MUST implement **Tank Maintenance**: Allow "Clean Tank" action (manual, costs credits, reduces pollution) and "Install Filter" (one-time purchase, reduces pollution rate).
- **FR-009**: The system MUST implement an **Economy**: Track "AquaCredits" currency. Allow purchasing items (fish, filters, cleaning, tanks) and selling fish.
- **FR-010**: The system MUST implement **Tank Progression**: Start with BOWL tank (capacity 2, circular shape). Award 50 bonus credits when first fish reaches mature age. Allow purchasing STANDARD tank (15 capacity, square shape, costs 75 credits) and BIG tank (30 capacity, wide rectangular shape, costs 150 credits). Filters become available only for STANDARD and BIG tanks. Multiple tanks (2–3 concurrent) supported with independent management.
- **FR-011**: The system MUST implement **Tutorial System**: Show contextual popup explanations for key events (first buy, first feed, hunger warning, low water quality, fish death, maturity bonus, tank upgrade). Popups require manual dismissal (OK or X button click). Tutorial can be enabled/disabled via query param or UI toggle.
- **FR-012**: The system MUST implement **Developer Mode**: When enabled (query param or button), start with STANDARD tank and 1000 credits, skip tutorial, and disable tutorial popups.
- **FR-013**: The system MUST calculate **Fish Value** dynamically based on species, size, health, and age.
- **FR-014**: The system MUST handle **Fish Death**: When health reaches zero, the fish is marked as dead and removed from the active population.
- **FR-015**: The system MUST render **Life Stage Visual Variations**: Fish sprites must adjust size and appearance based on age. Young fish (0–119s) render at base size. Mature fish (120–299s) render at 1.3× base size. Old fish (≥300s) render at 1.3× base size with 0.8× color saturation (slight desaturation to indicate aging).
- **FR-016**: The system MUST implement **Fish-to-Fish Collision Removal**: Fish sprites are allowed to overlap visually (no collision detection between fish). This creates a 3D depth illusion while simplifying physics. Fish still collide with tank boundaries (walls, water surface, and decorative floor).
- **FR-017**: The system MUST implement **Decorative Tank Floor**: STANDARD and BIG tanks feature a visible floor with pebble/sand texture (base color with random specs). BOWL tank has an invisible 1-pixel floor boundary. All tank types use the floor as a "rest place" with gentle collision physics (0.2 restitution) encouraging fish to settle naturally. Fish-to-boundary collisions use 0.8 restitution; floor collisions use 0.2 restitution for peaceful settling behavior.
- **FR-018**: The system MUST implement **Tank Visual Design**: BOWL tanks render as circles (circular glass effect, 300×300px). STANDARD tanks render as squares (rectangular glass, 500×500px). BIG tanks render as wide rectangles (wide panoramic glass, 800×400px). All tanks are procedurally drawn using Pixi.js Graphics (no external SVG assets required). Tank rendering scales responsively to viewport size without affecting physics simulation.
- **FR-019**: The system MUST support **Multi-Tank Display (Responsive Layout)**: Desktop displays all 2–3 tanks simultaneously in a grid. Tablets and mobile devices display one tank at a time with tab-based navigation. Tab buttons indicate tank type (●=BOWL, ◯=STANDARD, ▭=BIG) and active state. Keyboard shortcuts (1/2/3 keys or arrow keys) allow switching between tanks.
- **FR-020**: The system MUST implement **Tank Shape Abstraction**: Support multiple tank geometries (circular, rectangular) through a unified ITankShape interface with consistent collision detection, boundary resolution, and spawn area calculation across all shapes.
- **FR-021**: The system MUST implement **Rendering Engine Lifecycle Management**: Ensure only one rendering engine instance exists per tank, properly destroy previous instances on tank changes, and prevent memory leaks or duplicate rendering.
- **FR-022**: The system MUST implement **Feature Flag Safety**: Provide feature flags for all Phase 4 functionality (circular tanks, shape collision, multi-tank display) allowing safe rollback to rectangular-only tank system if issues occur.
- **FR-023**: The system MUST implement **Debug Infrastructure**: Provide debugging tools to identify tank state inconsistencies, collision detection issues, and rendering engine problems during development and testing.
- **FR-024**: The system MUST maintain **Comprehensive E2E Test Coverage**: All major user workflows must be covered by end-to-end tests to achieve 90% overall test coverage. E2E tests must validate complete user journeys including tank management, fish lifecycle, economic transactions, and tank progression flows.
- **FR-025**: The system SHOULD provide **Water Visual Feedback** (Optional): Use a background image/texture behind tank rendering and apply dynamic blur/tint based on pollution grade. Provide performant shader or Canvas2D fallback and allow disabling on low-end devices.

### Key Entities

- **Fish**: The primary agent. State includes hunger, health, age, and genetics. Renders with overlapping allowed (no fish-to-fish collision).
- **Tank**: The environment containing fish and water properties (water quality, pollution). Comes in three sizes with distinct visual shapes:
  - **BOWL**: Circular tank, capacity 2, starting tank (free). Invisible 1px floor for gentle settling.
  - **STANDARD**: Square tank, capacity 15, costs 75 credits to upgrade. Visible pebble floor (30px).
  - **BIG**: Wide rectangular tank, capacity 30, costs 150 credits to upgrade. Visible pebble floor (40px).
- **Filter**: Equipment that reduces pollution rate. Can be installed in STANDARD and BIG tanks only.
- **Floor**: Decorative boundary layer with gentle collision physics (0.2 restitution) that encourages fish to rest naturally. Visible (with pebble texture) in STANDARD/BIG, invisible (1px) in BOWL.
- **Store**: The interface for exchanging Credits for Entities (fish, filters, cleanings, tanks).
- **GameLoop**: The orchestrator of time and state updates.

## Success Criteria

- **Playable Loop**: A user can buy a fish, keep it alive for 5 minutes by feeding and maintaining water quality, and sell it for a profit.
- **Stability**: The game loop runs consistently for at least 10 minutes without performance degradation.
- **Economic Balance**: The combined cost of food and maintenance is lower than the profit from selling a healthy adult fish, ensuring a win condition is possible.
- **Resource Management**: Players must balance spending on feeding vs. water quality maintenance to maximize profit.
- **Shape Abstraction**: Tank collision detection works identically for circular and rectangular tanks.
- **Engine Stability**: No dual rendering engines or duplicate tank rendering occurs.
- **Safe Rollback**: Feature flags allow immediate rollback to Phase 3 functionality.
- **Debug Visibility**: Debug tools can quickly identify the root cause of tank/collision issues.
- **E2E Test Coverage**: All major user flows must be covered by e2e tests to achieve 90% overall coverage target. E2E tests must be updated after each phase implementation to validate new functionality end-to-end.

## Clarifications

### Session 2025-11-19

- Q: How should tutorial popups be dismissed? → A: Manual dismiss only - user must click "OK" or "X" button (no auto-hide)

## Assumptions

- **Starting State**: Player starts with 50 AquaCredits, 1 BOWL tank (capacity 2, circular shape), and tutorial mode active.
- **Tank Types**:
  - BOWL (circular, 300×300px): Starting tank, capacity 2 fish, no filters.
  - STANDARD (square, 500×500px): Intermediate tank, capacity 15 fish, filters available, costs 75 credits.
  - BIG (wide rectangle, 800×400px): Advanced tank, capacity 30 fish, filters available, costs 150 credits.
- **Tank Visuals**: All tanks drawn procedurally using Pixi.js Graphics (no SVG assets). Rendering scales responsively without affecting physics simulation.
- **Floor Mechanic**: All tanks feature a floor boundary with gentle collision (0.2 restitution) creating a "rest place" where fish naturally settle. BOWL floor is invisible (1px). STANDARD/BIG floors are visible with pebble/sand texture (30px and 40px respectively).
- **Fish Collision**: Fish sprites overlap visually (no collision between fish). Creates 3D depth illusion. Fish collide with tank boundaries (walls, water surface, floor) with standard restitution (0.8 for walls, 0.2 for floor).
- **Multi-Tank Display**: Desktop shows 2–3 tanks simultaneously in a responsive grid. Tablets show 1–2 tanks. Mobile shows 1 tank at a time with tab navigation. Tab buttons use symbols: ● for BOWL, ◯ for STANDARD, ▭ for BIG.
- **Tutorial Mode**: Enabled by default. Can be disabled via URL query param `?tutorial=false` or UI toggle. Shows popup explanations for key game events requiring manual dismissal.
- **Developer Mode**: Accessible via URL query param `?dev=true` or debug button. Starts with STANDARD tank and 1000 credits with tutorial disabled.
- **Filter Restriction**: BOWL tanks cannot have filters installed (option hidden in store).
- **Life Stages**: Fish have three visual life stages based on age:
  - **Young**: Age 0–119 seconds. Renders at base size.
  - **Mature**: Age 120–299 seconds. Renders at 1.3× base size.
  - **Old**: Age ≥300 seconds. Renders at 1.3× base size with 0.8× color saturation.
- **Mature Age**: Fish reach maturity at 120 seconds (2 minutes).
- **Tank Upgrade**: First mature fish awards 50 bonus credits. Tank upgrades unlock at specific progression points.
- **Time Scale**: 1 Tick = 1 Second (real-time).
- **Persistence**: State is lost on refresh (for MVP/Prototype phase).
- **Responsive Scaling**: Tank display sizes scale based on viewport (300–600px per tank on desktop, full-width on mobile) without affecting physics simulation or collision bounds.

## Implementation Status Notes

### FR-014: Fish Death — Current Partial Implementation

**Current State**: INCOMPLETE

Fish lifecycle currently implements health tracking and the `isAlive` flag, but does **NOT** automatically remove dead fish from the tank.

**What's Implemented**:

- ✅ Health degradation when starving (hunger ≥ 80) or water quality < 50
- ✅ Health clamped to 0 when damage accumulated
- ✅ `isAlive` boolean flag automatically set to `false` when health reaches 0
- ✅ Dead fish no longer consume resources (don't participate in feeding costs, pollution penalties, etc.)
- ✅ Integration test verifies starvation prevents death via feeding

**What's Missing**:

- ❌ Automatic removal of dead fish from `tank.fish` array during game tick
- ❌ Dead fish corpses persist indefinitely in the tank unless manually sold
- ❌ No visual feedback when fish dies (no death animation or corpse marker)
- ❌ Integration test doesn't verify automatic corpse removal

**Impact**:

- Dead fish remain in game state and count toward tank array size
- May affect UI displays that show fish count
- Manual sell action is required to remove dead fish (workaround exists)

**Related Tasks**: T018a, T018b, T018c (in progress — marked as BUGFIX)

See `tasks.md` for implementation roadmap.

## Collision Detection Design: Composite Shapes for Complex Bowls

### Problem Statement

With the bowl redesign adding a flat floor, the bowl is no longer purely circular. It now consists of:

- **Curved sidewalls** (circular collision boundary)
- **Flat floor** (horizontal line collision boundary)
- **Water surface** (horizontal line at 95% height)

Each surface requires different collision handling:

- **Sidewalls**: Circular collision math, 0.8 restitution (bounce)
- **Floor**: Horizontal line collision, 0.2 restitution (gentle settle)
- **Water surface**: Horizontal line boundary, acts as barrier/ceiling

### Design Solution: Multi-Surface Collision System

#### Architecture Overview

```
ISurfaceCollider (interface)
├── CircularWallCollider (curved wall)
├── FloorCollider (flat bottom)
└── WaterSurfaceCollider (water level boundary)

ITankShape (updated)
└── surfaces: ISurfaceCollider[]
    ├── checkBoundary(fish, surface): boolean
    ├── resolveBoundary(fish, surface): Fish
    └── getRestitution(surface): number

BowlTankShape (new)
├── sidewall: CircularWallCollider
├── floor: FloorCollider
└── waterSurface: WaterSurfaceCollider

CollisionService (updated)
├── For each fish:
│   └── For each surface:
│       ├── Check collision (checkBoundary)
│       ├── Resolve collision (resolveBoundary)
│       └── Apply restitution (per-surface)
```

#### Surface Collider Interface

```typescript
interface ISurfaceCollider {
  type: 'wall' | 'floor' | 'water-surface'
  restitution: number
  checkBoundary(fish: Fish, tankShape: ITankShape): boolean
  resolveBoundary(fish: Fish, tankShape: ITankShape): Fish
  getBoundaryPoints(): { min: number; max: number } // For each axis
}
```

#### Key Design Principles

1. **Separation of Concerns**: Each surface handles its own collision logic
2. **Restitution Per-Surface**: 0.8 for walls, 0.2 for floor, 0 for water ceiling
3. **No Double-Collisions**: Track which surfaces were hit in a single tick to avoid double-resolution
4. **Backward Compatibility**: Pure circles (old `CircularTankShape`) work with single-surface system
5. **Order Independence**: Surface collision order shouldn't matter (surfaces don't intersect)

#### Implementation Strategy

1. **Phase 4e-Advanced Tasks** (T041e–T041k):
   - T041e: Define `ISurfaceCollider` interface
   - T041f: Implement `BowlTankShape` with 3 surfaces
   - T041g: Refactor `CircularTankShape` to use new interface
   - T041h: Update `CollisionService` for multi-surface detection
   - T041i–k: Comprehensive testing (unit, integration, E2E)

2. **Testing Strategy**:
   - **Unit tests**: Each surface collider independently
   - **Integration tests**: Bowl with all surfaces interacting
   - **E2E tests**: Visual validation of bounce/settle behavior

### Related Specifications

- **Restitution values**: `WALL_RESTITUTION = 0.8`, `FLOOR_RESTITUTION = 0.2` (constants in `src/lib/constants.ts`)
- **Water surface**: Always at `WATER_LEVEL = 0.95 * tankHeight` (prevents fish escape)
- **Floor dimensions**: Invisible (1px) for BOWL, visible (30–40px) for STANDARD/BIG
- **Collision safety buffer**: 2px boundary buffer to prevent escape
