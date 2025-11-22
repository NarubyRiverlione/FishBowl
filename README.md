# FishBowl

<!-- Test Coverage Badges -->

![Coverage: Statements](https://img.shields.io/badge/Statements-89.22%25-green)
![Coverage: Branches](https://img.shields.io/badge/Branches-70.99%25-yellow)
![Coverage: Functions](https://img.shields.io/badge/Functions-83.89%25-green)
![Coverage: Lines](https://img.shields.io/badge/Lines-92.20%25-brightgreen)
![Tests](https://img.shields.io/badge/Tests-103%20passing-brightgreen)
![Test Files](<https://img.shields.io/badge/Test%20Files-31%20(18%20unit%20+%2013%20integration)-blue>)

A web-based fish breeding simulation game built with React, Pixi.js, and TypeScript.

**Current Status**: 🚧 Core Mechanics In Progress (Milestone 2 - 90% Complete)

## Recent Progress

### ✅ **Latest Achievements** (November 2025)

- **Test Suite Reorganization**: Established clear unit vs integration test patterns
- **Comprehensive Test Coverage**: Added AquariumCanvas integration tests (83.6% coverage)
- **Code Quality**: Eliminated all duplicate tests and `any` type usage
- **TypeScript Strict Mode**: 1000% compliance with no explicit `any` types
- **Test Organization**: Clear separation of 18 unit tests vs 13 integration tests

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
pnpm test --coverage  # Run tests with coverage report
pnpm test:e2e         # Run E2E tests (Playwright)
pnpm lint             # Lint code (ESLint + TypeScript strict)
pnpm build            # Build for production
```

**Developer Mode**: Add `?dev=true` to URL for 1000 credits, STANDARD tank, no tutorial.

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

**Coverage**: 103 tests passing across 31 test files

| Metric     | Coverage | Status                    |
| ---------- | -------- | ------------------------- |
| Statements | 87.28%   | 🟡 Approaching 90% target |
| Functions  | 87.26%   | 🟡 Approaching 90% target |
| Lines      | 90.9%    | ✅ Above 90% target       |
| Branches   | 66.33%   | 🔴 Needs improvement      |

**Test Organization** (Reorganized November 2025):

- **Unit Tests** (18 files): Isolated component testing with mocked dependencies
  - Models, Services, Physics, Utilities, State Management
- **Integration Tests** (13 files): Multi-component workflow testing
  - Game mechanics, UI workflows, System interactions
- **E2E Tests**: Playwright browser testing
- **Performance Tests**: Stress testing with 50+ fish

**Key Coverage Areas**:

- Models: 1000%, Physics: 98.41%, Services: 83.33%
- Game Engine: 64.7%, Components: 83.6%, Store: 87.3%

**Strategy**: TDD approach with clear test classification. See `docs/TEST_ORGANIZATION_GUIDE.md` for patterns.

## Roadmap

See `docs/roadmap.md` for the milestone plan and high-level feature allocation. For implementation progress, see `docs/IMPLEMENTATION_STATUS.md`.

## Governance

This project follows a strict constitution defined in `.specify/memory/constitution.md`.
Key principles:

1.  **Feature-Centric Architecture**
2.  **Test-First (TDD)**
3.  **Type Safety**
4.  **Separation of Concerns**
5.  **Continuous Quality**

## Documentation

### Setup & Development

- [QUICKSTART.md](./QUICKSTART.md) - Setup and troubleshooting
- [docs/IMPLEMENTATION_STATUS.md](./docs/IMPLEMENTATION_STATUS.md) - Implementation progress

### Testing & Quality

- [docs/TEST_ORGANIZATION_GUIDE.md](./docs/TEST_ORGANIZATION_GUIDE.md) - Test classification patterns
- [docs/TEST_ANALYSIS_REPORT.md](./docs/TEST_ANALYSIS_REPORT.md) - Test suite analysis

### Technical Documentation

- [docs/PHYSICS.md](./docs/PHYSICS.md) - Physics engine details
- [docs/PRD_Eng.md](./docs/PRD_Eng.md) - Product requirements

### Specifications

- [specs/001-core-mechanics/](./specs/001-core-mechanics/) - Core mechanics spec (in progress)
- [specs/002-visual-prototype/](./specs/002-visual-prototype/) - Visual prototype spec (complete)

## License

See LICENSE file for details.
