# FishBowl AI Coding Instructions

You are an expert Game Developer and Software Architect working on "FishBowl", a web-based fish breeding simulation game.

## 1. Project Context & Tech Stack
- **Domain**: Fish breeding simulation (genetics, water quality, economy).
- **Stack**: 
  - **Runtime**: React + Vite
  - **Language**: TypeScript (Strict Mode)
  - **Game Engine**: Pixi.js (for the aquarium view)
  - **State Management**: Zustand
  - **Package Manager**: pnpm
- **Documentation**: 
  - `PRD.md`: Functional requirements.
  - `CONSTITUTION-SHARED.md`: Mandatory development standards.

## 2. Core Principles (Non-Negotiable)
- **Follow the Constitution**: Adhere strictly to `CONSTITUTION-SHARED.md`.
- **Sequential Workflow**: Specification → Clarification → Planning → Design → Implementation. Do not skip steps.
- **Test-First (TDD)**: Write failing tests *before* implementation. Target 90% coverage for critical paths (genetics, economy, water chemistry).
- **Type Safety**: No `any`. Define explicit interfaces in `src/types` before coding logic.

## 3. Architecture & Patterns

### Directory Structure
Follow the mandated structure from the Constitution, adapted for this game:
```
src/
├── types/       # Shared interfaces (IFish, ITank, IEconomy)
├── models/      # Domain entities (Fish.ts, Tank.ts) - Pure logic, no rendering
├── services/    # Business logic (BreedingService, WaterQualityService)
├── store/       # Zustand stores (useGameStore.ts)
├── components/  # React UI components (HUD, Menus)
├── game/        # Pixi.js rendering logic (FishSprite, TankView)
└── lib/         # Utilities (Math, Random generators)
```

### Separation of Concerns
- **Logic vs. View**: 
  - **Models/Services** handle the simulation (growth, hunger, pollution) completely decoupled from the view.
  - **Pixi.js** components only *observe* the state and render it. They do not contain game rules.
  - **React** handles the HUD (Head-Up Display), menus, and shop interface.

### State Management (Zustand)
- Use Zustand for the global game loop state.
- **Pattern**: Actions should be defined in the store or delegated to Services, keeping components dumb.
- **Performance**: Use selectors to avoid unnecessary re-renders in React components.

### Observability
- **Logging**: All critical game events (fish death, purchase, breeding) must be logged for debugging and balancing.
- **Audit**: Implement a simple log service to track economy changes (AquaCredits in/out).

## 4. Critical Workflows

### Development
- **Start**: `pnpm dev`
- **Test**: `pnpm test` (Ensure Vitest is configured)
- **Lint**: `pnpm lint`

### Game Loop Implementation
- The simulation runs on a "tick" system (independent of frame rate if possible).
- **Services** calculate the delta (time passed) and update models.
- **Pixi** interpolates positions for smooth rendering.

## 5. Known Issues / Immediate Tasks
- **Missing `package.json`**: The project appears to have `node_modules` but is missing `package.json`. **Priority 1**: Reconstruct `package.json` based on the installed modules (React, Pixi.js, Zustand, Vite, TypeScript).
- **Empty `src`**: The source directory is currently empty. Scaffolding is required following the Directory Structure above.

## 6. Example: Adding a Feature (e.g., "Fish Hunger")
1.  **Spec**: Define hunger decay rate and effects in `PRD.md`.
2.  **Type**: Add `hunger: number` to `IFish` in `src/types/fish.ts`.
3.  **Test**: Write a test ensuring `Fish.update()` increases hunger over time.
4.  **Model**: Implement the logic in `src/models/Fish.ts`.
5.  **Store**: Expose the updated fish state via Zustand.
6.  **View**: Update `FishSprite` to show a hunger icon if critical.
