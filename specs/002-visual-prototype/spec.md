# Feature Specification: Visual Prototype - Swimming Fish in Tank

**Feature Branch**: `002-visual-prototype`
**Created**: 2025-11-19
**Status**: Draft
**Input**: User description: "POC: Render swimming fish in aquarium tank using Pixi.js"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Render Aquarium Tank (Priority: P1)

As a developer, I want to see an aquarium tank rendered on screen so that I have a canvas for rendering fish.

**Why this priority**: Foundation for all visual elements. Cannot proceed without a rendered tank.

**Independent Test**: Can be tested by initializing the application and verifying a tank appears on the screen with appropriate dimensions and styling.

**Acceptance Scenarios**:

1. **Given** the application loads, **When** the page is rendered, **Then** an aquarium tank is visible with a blue/teal background.
2. **Given** an aquarium tank, **When** the browser window resizes, **Then** the tank scales appropriately (or remains fixed).
3. **Given** a tank, **When** it is rendered, **Then** it has defined boundaries (edges are visible).

---

### User Story 2 - Render Swimming Fish with Physics (Priority: P1)

As a player, I want to see fish swimming with natural acceleration and deceleration so that movements feel realistic and alive.

**Why this priority**: Core visual interaction. Physics make the POC more engaging and demonstrate the rendering foundation.

**Independent Test**: Can be tested by verifying that fish entities are rendered as sprites, move smoothly across the tank area with acceleration, and respond to boundary collisions.

**Acceptance Scenarios**:

1. **Given** a tank with fish, **When** the application renders, **Then** fish are visible as colored sprites.
2. **Given** a fish in the tank, **When** the game loop runs, **Then** the fish moves across the screen with smooth animation and acceleration.
3. **Given** a swimming fish, **When** it reaches the tank edge, **Then** it bounces off and reverses direction.
4. **Given** multiple fish, **When** rendered, **Then** each fish is visible, animated independently, and applies velocity/acceleration.
5. **Given** two fish swimming toward each other, **When** they collide, **Then** they bounce off each other realistically.

---

### User Story 3 - Fish Visual Variety (Priority: P2)

As a player, I want to see different colored and sized fish so that they feel distinct and visually interesting.

**Why this priority**: Enhances visual appeal and sets foundation for later genetics/rarity system.

**Independent Test**: Can be tested by verifying that multiple fish can be spawned with different colors and sizes.

**Acceptance Scenarios**:

1. **Given** multiple fish, **When** they are rendered, **Then** each fish has a distinct color.
2. **Given** fish, **When** they are created, **Then** they have varied sizes (small, medium, large).
3. **Given** a fish, **When** it is rendered, **Then** its color and size are consistently displayed.

### Edge Cases

- **Tank Boundaries**: Fish bounce off edges with elastic collision response.
- **Performance**: Must maintain 30+ fps with 20 fish including physics calculations.
- **Fish-to-Fish Collisions**: Fish detect and respond to collisions with other fish (bounce apart).
- **Multiple Simultaneous Collisions**: What happens when 3+ fish collide at once? (Response: Each pair resolves independently).
- **Edge-Wall Collision**: What happens at exact corners of tank? (Response: Both x and y velocity reverse).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST render an aquarium tank as a rectangular container with visible boundaries.
- **FR-002**: The system MUST render fish as sprites within the tank using Pixi.js.
- **FR-003**: The system MUST implement smooth animation of fish movement with acceleration and deceleration physics.
- **FR-004**: The system MUST support multiple fish rendering simultaneously with independent physics simulation.
- **FR-005**: The system MUST generate fish with randomized colors and sizes for visual variety.
- **FR-006**: Fish MUST remain within tank boundaries with elastic bounce collision response.
- **FR-007**: The system MUST implement fish-to-fish collision detection and response (elastic bounce).
- **FR-008**: The system MUST calculate acceleration based on velocity changes and apply friction/drag.
- **FR-009**: The system MUST maintain a frame rate of at least 30fps when rendering 20+ fish with physics.

### Key Entities

- **Tank (Visual)**: A Pixi Container representing the aquarium. Dimensions: configurable (e.g., 800x600px).
- **Fish (Sprite)**: A Pixi sprite representing a single fish. Properties: position (x, y), velocity (vx, vy), acceleration (ax, ay), mass, radius (for collision), color, size.
- **Rendering Loop**: Pixi Application that updates and renders sprites every frame, including physics calculations.
- **Physics Engine**: Handles velocity updates, acceleration, friction/drag, boundary collisions, and fish-to-fish collisions.

## Success Criteria

- **Visual Rendering**: Tank and fish are clearly visible and identifiable.
- **Smooth Animation**: Fish move fluidly with no visible frame drops.
- **Variety**: At least 3 different fish colors visible on screen simultaneously.
- **Performance**: Application runs at 30+ fps with 20 fish on screen.

## Assumptions

- **Simple Physics**: Fish movement uses basic velocity, acceleration, and friction (no complex AI or steering behaviors).
- **Elastic Collisions**: Fish bounce off each other and tank walls; no damage or health system (POC only).
- **No Persistence**: State is not saved; page refresh resets the tank.
- **Tank Size**: Fixed dimensions (800x600px or adjustable via config).
- **Visual Only**: No game mechanics or player input beyond page load.
- **No Advanced Optimization**: Simple O(n²) collision detection; spatial hashing optional if >50 fish needed.
- **Coefficient of Restitution**: Simplified to 1.0 (perfect elastic bounce); friction coefficient fixed at 0.99 per frame.
