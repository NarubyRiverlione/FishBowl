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

As a player, I want to feed my fish to prevent them from starving and dying.

**Why this priority**: Introduces the core survival loop and player engagement (tamagotchi mechanic).

**Independent Test**: Can be tested by accelerating time and verifying hunger increases, then performing a feed action and verifying hunger decreases.

**Acceptance Scenarios**:

1. **Given** a living fish, **When** time passes (ticks), **Then** the fish's hunger level increases.
2. **Given** a hungry fish, **When** the player feeds the fish, **Then** the hunger level decreases.
3. **Given** a starving fish (max hunger), **When** time passes, **Then** the fish's health decreases.
4. **Given** a fish with 0 health, **When** the next tick occurs, **Then** the fish dies and is removed from the tank.

---

### User Story 3 - Economy & Progression (Priority: P2)

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
- **FR-003**: The system MUST maintain a **Tank Entity** that acts as a container for Fish and tracks water quality (0-100).
- **FR-004**: The system MUST implement **Hunger Mechanics**: Hunger increases over time; if Hunger exceeds a critical threshold, Health decreases over time.
- **FR-005**: The system MUST implement **Feeding**: A "Feed" action reduces hunger for fish in the tank.
- **FR-006**: The system MUST implement an **Economy**: Track "AquaCredits" currency. Allow purchasing items and selling fish.
- **FR-007**: The system MUST calculate **Fish Value** dynamically based on species, size, health, and age.
- **FR-008**: The system MUST handle **Fish Death**: When health reaches zero, the fish is marked as dead and removed from the active population.

### Key Entities

- **Fish**: The primary agent. State includes hunger, health, age, and genetics.
- **Tank**: The environment containing fish and water properties.
- **Store**: The interface for exchanging Credits for Entities.
- **GameLoop**: The orchestrator of time and state updates.

## Success Criteria

- **Playable Loop**: A user can buy a fish, keep it alive for 5 minutes by feeding, and sell it for a profit.
- **Stability**: The game loop runs consistently for at least 10 minutes without performance degradation.
- **Economic Balance**: The cost of food is lower than the profit from selling a healthy adult fish, ensuring a win condition is possible.

## Assumptions

- **Starting State**: Player starts with 100 AquaCredits and 1 Empty Tank.
- **Time Scale**: 1 Tick = 1 Second (real-time).
- **Persistence**: State is lost on refresh (for MVP/Prototype phase).
