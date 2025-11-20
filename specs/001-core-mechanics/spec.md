# Feature Specification: Core Game Mechanics (MVP)

**Feature Branch**: `001-core-mechanics`
**Created**: 2025-11-19
**Status**: Draft
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

1. **Given** a new game, **When** the game starts, **Then** the player has a small bowl (capacity 1) and 50 starting credits.
2. **Given** a small bowl, **When** viewing the store, **Then** the filter option is not available (prevents confusion).
3. **Given** a fish reaches mature age (>2 minutes), **When** the fish is still alive, **Then** the player receives 50 bonus credits.
4. **Given** sufficient credits, **When** the player buys a larger tank, **Then** the tank capacity increases to the next tier (STANDARD = 10 capacity). The project also supports a `BIG` tank tier (capacity = 20) for later progression; filters become available for non-BOWL tanks and breeding is unlocked on STANDARD/BIG. Multiple tanks (up to 2–3 by default) may be owned concurrently, each subject to its capacity limit.
5. **Given** tutorial mode enabled, **When** key events occur (first fish, first feed, first death, maturity, etc.), **Then** helpful popup explanations appear and must be manually dismissed by clicking OK or X button.
6. **Given** tutorial mode disabled, **When** playing, **Then** no tutorial popups appear.
7. **Given** developer mode enabled, **When** the game starts, **Then** the player starts with the larger tank and 100 credits (skip tutorial).

---

### User Story 5 - Economy & Progression (Priority: P2)

As a player, I want to sell grown fish for a profit so that I can buy better equipment or more fish.

**Why this priority**: Creates the feedback loop for progression and "winning" the game.

**Independent Test**: Can be tested by manipulating fish stats (age/health) and verifying the calculated sell price and credit update.

**Acceptance Scenarios**:

1. **Given** a fish in the tank, **When** the player selects "Sell", **Then** the fish is removed and credits are added to the player's balance.
2. **Given** a fish, **When** selling, **Then** the value is calculated based on species, size, and health (as per PRD).
3. **Given** insufficient credits, **When** trying to buy an item, **Then** the transaction is rejected.

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
- **FR-010**: The system MUST implement **Tank Progression**: Start with small bowl (capacity 1). Award 50 bonus credits when first fish reaches mature age. Allow purchasing larger tank (10 capacity) for 75 credits. BOWL tanks cannot have filters installed.
- **FR-011**: The system MUST implement **Tutorial System**: Show contextual popup explanations for key events (first buy, first feed, hunger warning, low water quality, fish death, maturity bonus, tank upgrade). Popups require manual dismissal (OK or X button click). Tutorial can be enabled/disabled via query param or UI toggle.
- **FR-012**: The system MUST implement **Developer Mode**: When enabled (query param or button), start with large tank, skip tutorial, and disable tutorial popups.
- **FR-013**: The system MUST calculate **Fish Value** dynamically based on species, size, health, and age.
- **FR-014**: The system MUST handle **Fish Death**: When health reaches zero, the fish is marked as dead and removed from the active population.

### Key Entities

- **Fish**: The primary agent. State includes hunger, health, age, and genetics.
- **Tank**: The environment containing fish and water properties (water quality, pollution). Comes in two sizes: Bowl (capacity 1) and Standard Tank (capacity 10).
- **Filter**: Equipment that reduces pollution rate. Can be installed in tank.
- **Store**: The interface for exchanging Credits for Entities (fish, filters, cleanings, tanks).
- **GameLoop**: The orchestrator of time and state updates.

## Success Criteria

- **Playable Loop**: A user can buy a fish, keep it alive for 5 minutes by feeding and maintaining water quality, and sell it for a profit.
- **Stability**: The game loop runs consistently for at least 10 minutes without performance degradation.
- **Economic Balance**: The combined cost of food and maintenance is lower than the profit from selling a healthy adult fish, ensuring a win condition is possible.
- **Resource Management**: Players must balance spending on feeding vs. water quality maintenance to maximize profit.

## Clarifications

### Session 2025-11-19

- Q: How should tutorial popups be dismissed? → A: Manual dismiss only - user must click "OK" or "X" button (no auto-hide)

## Assumptions

- **Starting State**: Player starts with 50 AquaCredits, 1 Small Bowl (capacity 1), and tutorial mode active.
- **Tutorial Mode**: Enabled by default. Can be disabled via URL query param `?tutorial=false` or UI toggle in settings. Shows popup explanations for key game events.
- **Developer Mode**: Accessible via URL query param `?dev=true` or debug button. Starts with 100 credits, Standard Tank (capacity 10), and tutorial disabled.
- **Filter Restriction**: BOWL tanks cannot have filters installed (option hidden in store). Prevents overwhelming new players with too many choices.
- **Mature Age**: Fish reach maturity at 120 seconds (2 minutes).
- **Tank Upgrade**: First mature fish awards 50 bonus credits. Standard Tank costs 75 credits and unlocks filters.
- **Time Scale**: 1 Tick = 1 Second (real-time).
- **Persistence**: State is lost on refresh (for MVP/Prototype phase).
