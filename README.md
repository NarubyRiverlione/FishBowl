# FishBowl

A web-based fish breeding simulation game built with React, Pixi.js, and TypeScript.

**Current Status**: 🚧 Core Mechanics In Progress (Milestone 2)

## Features

### ✅ Implemented

**Visual Prototype** (Milestone 1):

- Physics-based fish swimming with collision detection
- SVG graphics with 8 colors and varied sizes
- 60 FPS performance with 50+ fish
- Realistic open-top aquarium tank

**Core Mechanics** (Milestone 2 - In Progress):

- Game loop with pause/resume (1 tick/second)
- Fish lifecycle: aging, hunger, health, death
- Economy: buy/sell fish, credits system
- Tank management: BOWL → STANDARD upgrade, multi-tank support
- Water quality: pollution, cleaning, filters
- Feeding system with cost and pollution
- Full UI: HUD with stats, store menu, developer mode

### 🚧 In Progress

- Fish selection UI (click to select, info panel, sell button)
- Life stage visual rendering (young/mature/old with size and color variations)

### 🔮 Planned

- Breeding system with genetics
- Advanced water quality (oxygen, plants, stress)
- Expanded economy and equipment shop

## Tech Stack

- **Runtime**: React 19 + Vite 7
- **Language**: TypeScript 5.9 (Strict Mode)
- **Game Engine**: Pixi.js 8
- **Testing**: Vitest (unit/integration) + Playwright (E2E)
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js (v20+)
- pnpm

### Installation

```bash
pnpm install
```

### Development Commands

```bash
pnpm dev              # Start dev server (http://localhost:5173)
pnpm test             # Run unit & integration tests
pnpm test:e2e         # Run E2E tests (Playwright)
pnpm lint             # Lint code (ESLint)
pnpm build            # Build for production
```

**Developer Mode**: Add `?dev=true` to URL for 100 credits, STANDARD tank, no tutorial.

For detailed setup, see [QUICKSTART.md](./QUICKSTART.md).

## Project Structure

```
src/
├── types/       # TypeScript interfaces (IFish, ITank, IRender)
├── models/      # Domain entities with pure logic (Fish, Tank)
├── lib/         # Utility functions (physics, collision, random)
├── game/        # Pixi.js rendering (FishSprite, TankView, RenderingEngine)
├── components/  # React UI (AquariumCanvas wrapper)
└── assets/      # SVG graphics and images
```

## Architecture

**Tech Stack**: React 19, TypeScript 5.9, Pixi.js 8, Zustand (state), Vitest + Playwright (testing)

**Pattern**: Model-View-Controller (MVC)

- `src/models/` - Pure TypeScript domain logic (Fish, Tank)
- `src/services/` - Business logic (FishService, PhysicsService, EconomyService)
- `src/store/` - Zustand state management (game, tank, fish slices)
- `src/game/` - Pixi.js rendering (FishSprite, TankContainer, RenderingEngine)
- `src/components/` - React UI (HUD, StoreMenu, AquariumCanvas)
- `src/lib/` - Utilities (constants, random, physics helpers)

**Physics**: Custom engine with velocity/acceleration, friction (0.005), elastic collisions (restitution 0.8), and autonomous swimming behavior. See [docs/PHYSICS.md](./docs/PHYSICS.md) for detailed formulas and implementation.

## Testing

**Coverage**: 40+ tests passing (unit, integration, E2E)

- Models: 100%, Lib: 98.78%, Game: 74%, Components: 86.66%

**Strategy**: TDD approach with Vitest (unit/integration) and Playwright (E2E). See test files in `tests/` directory.

## Roadmap

- ✅ **Milestone 1**: Visual Prototype (swimming, physics, rendering)
- 🚧 **Milestone 2**: Core Mechanics (economy, survival, progression) - **Current**
- 🔮 **Milestone 3**: Breeding & Genetics
- 🔮 **Milestone 4**: Advanced Environment (oxygen, plants, stress)
- 🔮 **Milestone 5**: Extended Economy & Multi-tank

See [docs/IMPLEMENTATION_STATUS.md](./docs/IMPLEMENTATION_STATUS.md) for detailed progress.

## Governance

This project follows a strict constitution defined in `.specify/memory/constitution.md`.
Key principles:

1.  **Feature-Centric Architecture**
2.  **Test-First (TDD)**
3.  **Type Safety**
4.  **Separation of Concerns**
5.  **Continuous Quality**

## Documentation

- [QUICKSTART.md](./QUICKSTART.md) - Setup and troubleshooting
- [docs/IMPLEMENTATION_STATUS.md](./docs/IMPLEMENTATION_STATUS.md) - Implementation progress
- [docs/PHYSICS.md](./docs/PHYSICS.md) - Physics engine details
- [docs/PRD.md](./docs/PRD.md) - Product requirements (Dutch)
- [specs/001-core-mechanics/](./specs/001-core-mechanics/) - Core mechanics spec (in progress)
- [specs/002-visual-prototype/](./specs/002-visual-prototype/) - Visual prototype spec (complete)

## License

See LICENSE file for details.
