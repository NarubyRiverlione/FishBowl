# FishBowl - Claude Code Instructions

You are an expert Game Developer and Software Architect working on "FishBowl", a web-based fish breeding simulation game.

## 1. Project Context & Tech Stack

- **Domain**: Fish breeding simulation (genetics, water quality, economy)
- **Stack**:
  - **Runtime**: React + Vite
  - **Language**: TypeScript (Strict Mode)
  - **Game Engine**: Pixi.js (for the aquarium view)
  - **State Management**: Zustand
  - **Testing**: Vitest
  - **Package Manager**: pnpm
- **Governance**:
  - `.specify/memory/constitution.md`: **Primary Source of Truth** - Defines architecture, workflow, and quality gates
  - `PRD.md`: Functional requirements

## 2. Core Principles (Non-Negotiable)

- **Feature-Centric Architecture**: Implement features as cohesive, independently testable modules. Follow: Spec → Plan → Design → Impl
- **Test-First (TDD)**: Write failing tests _before_ implementation. Target 90% coverage for critical paths (genetics, economy)
- **Type Safety**: No `any`. Define explicit interfaces in `src/types` before coding logic
- **Separation of Concerns**:
  - **Logic**: Pure TypeScript models/services (no UI code)
  - **View**: Pixi.js components (observers only)
  - **UI**: React components (HUD, menus)
- **Continuous Quality**: The linter (`pnpm lint`) MUST be executed successfully after the completion of every implementation phase. Zero warnings allowed

## 3. Architecture & Patterns

### Directory Structure

Strictly follow the mandated structure:

```
src/
├── types/       # Shared interfaces (IFish, ITank, IEconomy)
├── models/      # Domain entities (Fish.ts, Tank.ts) - Pure logic
├── services/    # Business logic (BreedingService, WaterQualityService)
├── store/       # Zustand stores (useGameStore.ts)
├── components/  # React UI components (HUD, Menus)
├── game/        # Pixi.js rendering logic (FishSprite, TankView)
└── lib/         # Utilities (Math, Random generators)
```

### State Management (Zustand)

- **Global State**: Use Zustand for the game loop state
- **Actions**: Define actions in the store or delegate to Services. Keep components "dumb"
- **Selectors**: Use specific selectors to prevent unnecessary React re-renders

### Game Loop

- **Tick System**: Simulation runs on a "tick" (delta time), independent of frame rate
- **Interpolation**: Pixi.js renders the state by interpolating between ticks for smoothness

## 4. Development Workflows

### Running the Project

- **Start Dev Server**: `pnpm dev`
- **Run Tests**: `pnpm test` (Vitest)
- **Linting**: `pnpm lint` (ESLint Strict)
- **Formatting**: `pnpm format` (Prettier)

### Adding a New Feature (Workflow)

1. **Spec**: Define requirements in `PRD.md` or a feature spec
2. **Type**: Define interfaces in `src/types/`
3. **Test**: Write a failing test in `tests/` (or co-located)
4. **Model**: Implement domain logic in `src/models/`
5. **Store**: Update Zustand store if global state is needed
6. **View**: Implement visual representation in `src/game/` or `src/components/`
7. **Verify**: Run `pnpm lint` and `pnpm test` to ensure quality gates are passed

## 5. Code Quality Standards

### TypeScript

- **Strict Mode**: All strict options enabled
- **No `any`**: Use proper types or `unknown` with type guards
- **Explicit Return Types**: Always specify function return types
- **Interface First**: Define interfaces in `src/types/` before implementation

### Testing

- **Test-Driven Development**: Write tests before implementation
- **Coverage Target**: 90% for critical paths (genetics, economy, water quality)
- **Test Organization**:
  - Unit tests: `tests/unit/`
  - Integration tests: `tests/integration/`
  - Use descriptive test names that explain the behavior

### Linting

- **Zero Warnings**: All code must pass `pnpm lint` with no warnings
- **ESLint**: Configured with TypeScript-aware strict rules
- **Pre-commit**: Ensure lint passes before committing

## 6. Architecture Patterns

### Models (Pure Logic)

- No framework dependencies (React, Pixi.js)
- Pure TypeScript classes with business logic
- Testable in isolation
- Example: `Fish.ts`, `Tank.ts`

### Services (Business Logic)

- Stateless operations
- Reusable across the application
- Example: `BreedingService`, `WaterQualityService`, `PhysicsService`

### Views (Pixi.js)

- Observer pattern: React to model changes
- No business logic
- Example: `FishSprite`, `TankView`, `TankContainer`

### Components (React UI)

- Presentational components
- No business logic
- Connected to Zustand store via selectors
- Example: HUD, menus, control panels

## 7. Current Project Status

### Implemented Features

- Core game loop with tick-based simulation
- Tank model with geometry and physics
- Fish model with lifecycle, movement, and genetics
- Collision detection and boundary handling
- Water quality and pollution system
- Basic economy (credits, buying fish, feeding)
- Rendering engine with Pixi.js integration
- Developer mode for testing

### Key Files

- **State**: `src/store/useGameStore.ts`
- **Models**: `src/models/Fish.ts`, `src/models/Tank.ts`
- **Types**: `src/models/types/` (fish.ts, tank.ts, tankShape.ts)
- **Services**: `src/services/physics/` (PhysicsService, CollisionService)
- **Game Engine**: `src/game/engine/RenderingEngine.ts`
- **Views**: `src/game/views/TankContainer.ts`, `src/game/views/FishSprite.ts`

## 8. Important Notes for Claude Code

### Store Architecture

The project uses a single-source-of-truth pattern with Zustand:
- The `RenderingEngine` syncs with the store, not the other way around
- Tank and Fish models are created from store data
- Store state includes geometry information (e.g., `tank.geometry.width`, `fish.geometry.position`)

### Testing Strategy

When refactoring models:
- Always check if tests need updates due to architectural changes
- Reset store state in tests to avoid cross-test contamination
- Example: `useGameStore.setState({ tank: null, tanks: [] })` in `beforeEach()`

### Geometry Pattern

Fish and Tank use a composition pattern for geometry:
- Fish has `geometry: IFishGeometry` with `position`, `velocity`, `radius`
- Tank has `geometry: ITankGeometry` with `width`, `height`, `centerX`, `centerY`
- Legacy properties (e.g., `fish.x`, `fish.y`) are getters/setters for backward compatibility

### Phase-Based Development

The project follows a phased approach:
- Each phase should be completed on a separate git branch
- After each phase: run tests, run linter, update docs
- Use the `loc-audit` skill to verify code quality after implementation

## 9. Common Tasks

### Running Tests for Specific Files

```bash
pnpm test tests/unit/Tank.test.ts
pnpm test tests/integration/RenderingEngine.test.ts
```

### Fixing Linting Issues

```bash
pnpm lint          # Check for issues
pnpm lint --fix    # Auto-fix where possible
```

### Adding a New Fish Species

1. Update `FishSpecies` enum in `src/models/types/fish.ts`
2. Add species-specific constants in `src/lib/constants.ts`
3. Update `FishController` spawn logic
4. Add tests for the new species
5. Run `pnpm lint` and `pnpm test`

### Refactoring Models

When refactoring core models (Fish, Tank):
1. Update the interfaces in `src/models/types/`
2. Update the model implementation
3. Check all tests that use the model
4. Update store slices if geometry/properties changed
5. Verify `RenderingEngine` sync logic
6. Run full test suite

## 10. References

- **Constitution**: `.specify/memory/constitution.md`
- **PRD**: `PRD.md`
- **Architecture Decisions**: Check git commit history for architectural changes
- **Test Examples**: `tests/unit/` and `tests/integration/` for patterns
