# FishBowl

<!-- Test Coverage Badges -->

![Coverage: Statements](https://img.shields.io/badge/Statements-89.22%25-green)
![Coverage: Branches](https://img.shields.io/badge/Branches-70.99%25-yellow)
![Coverage: Functions](https://img.shields.io/badge/Functions-83.89%25-green)
![Coverage: Lines](https://img.shields.io/badge/Lines-92.20%25-brightgreen)
![Tests](https://img.shields.io/badge/Tests-127%20passing-brightgreen)
![Test Files](https://img.shields.io/badge/Test%20Files-35%20unit%20+%2010%20E2E-blue)

A web-based fish breeding simulation game built with React, Pixi.js, and TypeScript.

**Current Status**: ✅ Core Mechanics MVP Complete (Phases 1-3) | 🔄 Tank Rendering in Testing (Phase 4a-4f) | 📋 UI Polish Planned (Phase 4g-5)

> **📌 Note on Milestone Numbering**: Milestone numbering reflects execution order (POC first), not spec creation order:
> - **Milestone 1** = Spec 002 (Visual Prototype - built as POC)
> - **Milestone 2** = Spec 001 (Core Mechanics - initial spec, built after POC validation)

## ⚠️ Important Architecture Notes

- **[ARCHITECTURE_CONCERNS.md](./ARCHITECTURE_CONCERNS.md)** - Documents rendering engine responsibility mixing that needs future refactor
- Current implementation works correctly but has mixed concerns between rendering and game logic

## Recent Progress

### ✅ **Latest Achievements** (November 2025)

- **🎯 MVP Complete**: All core game mechanics implemented and tested
- **🔧 Boundary Physics**: Enhanced collision system with proper fish boundary enforcement
- **📊 Test Excellence**: 127 tests passing (35 unit + 10 E2E) with 89% statement coverage
- **🛠️ Code Quality**: Zero TypeScript errors, clean linting, constants-based architecture
- **⚡ Performance**: Stable 60 FPS with collision detection and physics simulation
- **🎮 Developer Experience**: Enhanced dev mode, test helpers, and debugging infrastructure

## Features

### ✅ Implemented

**Visual Prototype** (Milestone 1):

- Physics-based fish swimming with collision detection
- SVG graphics with 8 colors and varied sizes
- 60 FPS performance with 50+ fish
- Realistic open-top aquarium tank

**Core Mechanics** (Milestone 2 - Complete):

- Game loop with pause/resume (1 tick/second)
- Fish lifecycle: aging, hunger, health, death
- Economy: buy/sell fish, credits system
- Tank management: BOWL → STANDARD upgrade, multi-tank support
- Water quality: pollution, cleaning, filters
- Feeding system with cost and pollution
- Fish selection UI (click to select, info panel, sell button)
- Life stage visual rendering (young/mature/old with size and color variations)
- Full UI: HUD with stats, store menu, developer mode

**Quality Assurance**:

- Comprehensive collision physics with boundary enforcement
- Constants-based architecture for maintainability
- E2E test coverage for critical user flows
- Performance monitoring and metrics
- Cross-browser compatibility testing

### 🚀 Next Phase

**Phase 4: Tank Design & Rendering** (23 tasks defined):

- Tank shape system (circular BOWL, square STANDARD, rectangular BIG)
- Visual tank rendering with procedural graphics
- Multi-tank display layout (desktop grid, mobile tabs)
- Floor physics and visual effects
- Advanced collision system with shape abstraction

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
├── models/
│   ├── types/        # TypeScript interfaces
│   │   ├── fish.ts   # IFishData, IFishLogic, IFishGeometry
│   │   ├── tank.ts   # ITankData, ITankLogic, ITankGeometry
│   │   └── ...
│   ├── Fish.ts       # Fish class (implements IFishLogic)
│   └── Tank.ts       # Tank class (implements ITankLogic)
├── services/         # Business logic (FishService, Physics, Collision)
├── game/             # Pixi.js rendering (FishSprite, TankView, RenderingEngine)
├── store/            # Zustand state management (stores IFishData, ITankData)
├── components/       # React UI (AquariumCanvas wrapper)
└── assets/           # SVG graphics and images
```

**Key Design**: Separation of **Data** (IFishData, ITankData) and **Logic** (IFishLogic, ITankLogic)
- Data interfaces are serializable and stored in Zustand
- Logic interfaces extend data with behavioral methods for game simulation
- See [Data Model](./specs/001-core-mechanics/data-model.md) for full interface definitions

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

**Coverage**: 127 tests passing (35 unit + 10 E2E tests)

| Metric     | Coverage | Status                |
| ---------- | -------- | --------------------- |
| Statements | 89.22%   | 🟢 Near 90% target    |
| Functions  | 83.89%   | 🟡 Approaching target |
| Lines      | 92.20%   | ✅ Above 90% target   |
| Branches   | 70.99%   | 🟡 Good coverage      |

**Test Organization** (Updated November 2025):

- **Unit Tests** (35 files): Isolated component testing with mocked dependencies
- **E2E Tests** (10 files): Full user flow testing with Playwright
- **Integration Tests**: End-to-end feature testing within unit test suite
  - Game mechanics, UI workflows, System interactions
- **Performance Tests**: Stress testing with 50+ fish and boundary collision

**Key Coverage Areas**:

- Models: 100%, Physics: 98.41%, Services: 90%+
- Game Engine: 74%, Components: 86.6%, Store: 95%+
- E2E Coverage: Tank boundaries, fish interaction, core mechanics

**Recent Test Enhancements** (November 2025):

- ✅ **Boundary Physics Testing**: Comprehensive E2E tests for fish collision boundaries
- ✅ **Constants Integration**: E2E tests use same constants as implementation
- ✅ **Performance Monitoring**: FPS and collision metrics in E2E tests
- ✅ **Debug Infrastructure**: Test helpers and collision logging for development

**Strategy**: TDD approach with constants-based testing architecture. See `docs/TEST_ORGANIZATION_GUIDE.md` for patterns.

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

- [specs/001-core-mechanics/](./specs/001-core-mechanics/) - Core mechanics spec (MVP complete)
- [specs/002-visual-prototype/](./specs/002-visual-prototype/) - Visual prototype spec (complete)

## Recent Updates (November 2025)

### ✅ **Boundary Collision System Enhancement**

**Problem**: Fish could escape tank boundaries during rapid movement or edge cases.

**Solution**: Implemented comprehensive collision physics improvements:

- **Enhanced boundary detection** with 2px safety buffer (`COLLISION_BOUNDARY_BUFFER`)
- **Collision velocity forcing** to ensure fish bounce away from walls
- **Debug logging system** for collision tracking in test environment
- **Constants-based architecture** - E2E tests use same values as implementation

**Results**:

- 100% boundary compliance in E2E tests (12 fish, 4000ms simulation)
- Zero wall penetrations detected across all tank sizes
- Proper water surface boundary enforcement (95% tank height)
- Enhanced collision system with debug feedback

### ✅ **Testing Architecture Improvements**

**Constants Integration**: E2E tests now use imported constants instead of magic numbers:

```typescript
// Before: magic numbers that could diverge from code
const waterLevel = canvas.height * 0.85 // Hard-coded value

// After: constants-based consistency
const waterLevel = canvas.height * WATER_LEVEL // From src/lib/constants.ts
```

**Test Script Enhancement**: Added separate HTML report generation:

```bash
pnpm test:e2e      # Line reporter (CI-friendly)
pnpm test:e2e:html # Full HTML report (debugging)
```

**Performance**: All tests complete in <15 seconds with real physics simulation.

### 🔧 **Technical Debt Resolution**

- **TypeScript**: Zero `any` types, full strict mode compliance
- **Linting**: Zero warnings with enhanced ESLint rules
- **Test Coverage**: 127 tests passing (35 unit + 10 E2E)
- **Constants**: Single source of truth for all physics/collision values

## License

See LICENSE file for details.
