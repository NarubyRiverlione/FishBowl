# FishBowl AI Coding Instructions

You are an expert Game Developer and Software Architect working on "FishBowl", a web-based fish breeding simulation game.

## 1. Project Context & Tech Stack

- **Domain**: Fish breeding simulation (genetics, water quality, economy).
- **Stack**:
  - **Runtime**: React + Vite
  - **Language**: TypeScript (Strict Mode)
  - **Game Engine**: Pixi.js (for the aquarium view)
  - **State Management**: Zustand
  - **Testing**: Vitest
  - **Package Manager**: pnpm
- **Governance**:
  - `.specify/memory/constitution.md`: **Primary Source of Truth**. Defines architecture, workflow, and quality gates.
  - `PRD.md`: Functional requirements.

## 2. Core Principles (Non-Negotiable)

- **Feature-Centric Architecture**: Implement features as cohesive, independently testable modules. Follow: Spec → Plan → Design → Impl.
- **Test-First (TDD)**: Write failing tests _before_ implementation. Target 90% coverage for critical paths (genetics, economy).
- **Type Safety**: No `any`. Define explicit interfaces in `src/types` before coding logic.
- **Separation of Concerns**:
  - **Logic**: Pure TypeScript models/services (no UI code).
  - **View**: Pixi.js components (observers only).
  - **UI**: React components (HUD, menus).

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

- **Global State**: Use Zustand for the game loop state.
- **Actions**: Define actions in the store or delegate to Services. Keep components "dumb".
- **Selectors**: Use specific selectors to prevent unnecessary React re-renders.

### Game Loop

- **Tick System**: Simulation runs on a "tick" (delta time), independent of frame rate.
- **Interpolation**: Pixi.js renders the state by interpolating between ticks for smoothness.

## 4. Critical Workflows

### Development

- **Start Dev Server**: `pnpm dev`
- **Run Tests**: `pnpm test` (Vitest)
- **Linting**: `pnpm lint` (ESLint Strict)

### Adding a New Feature (Workflow)

1.  **Spec**: Define requirements in `PRD.md` or a feature spec.
2.  **Type**: Define interfaces in `src/types/`.
3.  **Test**: Write a failing test in `tests/` (or co-located).
4.  **Model**: Implement domain logic in `src/models/`.
5.  **Store**: Update Zustand store if global state is needed.
6.  **View**: Implement visual representation in `src/game/` or `src/components/`.

## 5. Immediate Tasks

- **Scaffold `src`**: The `src` directory is currently empty. Create the directory structure defined above.
- **Initial Setup**: Create the basic `GameLoop` and `Tank` model to get the simulation running.
