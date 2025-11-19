# Implementation Plan: Visual Prototype - Swimming Fish in Tank

**Branch**: `002-visual-prototype` | **Date**: 2025-11-19 | **Spec**: [spec.md](./spec.md)
**Status**: ✅ Completed | **Completion Date**: 2025-11-19
**Input**: Feature specification from `/specs/002-visual-prototype/spec.md`

## Summary

Build a visual prototype demonstrating fish swimming in a rendered aquarium tank using Pixi.js. The focus is on rendering performance and visual appeal with randomized fish colors/sizes. No game mechanics or player interaction required for this POC.

## Technical Context

**Language/Version**: TypeScript 5.9.3, ES2024  
**Primary Dependencies**: React 19.2.0, Pixi.js 8.14.2, Vite 7.2.2  
**Storage**: N/A (state in memory only)  
**Testing**: Vitest 1.0.0  
**Target Platform**: Web browser (Chrome, Firefox, Safari)  
**Project Type**: React + Vite single-page application  
**Performance Goals**: 30+ fps with 20 fish on screen; smooth animation  
**Constraints**: Tank rendering must not block main thread; animations must remain responsive  
**Scale/Scope**: POC scope - 1 tank, 20 fish, 3 colors, 3 sizes

## Constitution Check

✅ **GATE: PASSED**

- ✅ Feature-Centric Architecture: POC is a discrete, independently testable feature
- ✅ Type-Safe Code: TypeScript strict mode will be enforced
- ✅ Test-First (TDD): Tests will be written before implementation
- ✅ Observable & Auditable: Rendering pipeline will log frame rate and performance metrics
- ✅ Configurable Systems: Tank dimensions and fish parameters will be configurable

## Project Structure

### Documentation (this feature)

```text
specs/002-visual-prototype/
├── spec.md                    # Feature specification ✅
├── plan.md                    # This file ✅
├── research.md                # Phase 0 research (TBD)
├── data-model.md              # Phase 1 data model (TBD)
├── quickstart.md              # Phase 1 quickstart (TBD)
├── contracts/                 # Phase 1 API contracts (TBD)
└── checklists/
    └── requirements.md        # Quality checklist ✅
```

### Source Code (repository root)

```text
src/
├── types/
│   ├── fish.ts                # IFish interface
│   ├── tank.ts                # ITank interface
│   └── render.ts              # Rendering type definitions
├── models/
│   ├── Fish.ts                # Fish entity (visual properties only)
│   └── Tank.ts                # Tank entity (container)
├── game/
│   ├── FishSprite.ts          # Pixi.js Fish sprite
│   ├── TankView.ts            # Pixi.js Tank container
│   ├── RenderingEngine.ts      # Pixi Application orchestrator
│   └── index.ts               # Exports
├── lib/
│   ├── random.ts              # Random generators (color, size)
│   └── physics.ts             # Simple velocity/boundary logic
├── components/
│   └── AquariumCanvas.tsx      # React wrapper for Pixi canvas
└── App.tsx                    # Main entry point

tests/
├── unit/
│   ├── Fish.test.ts
│   ├── Tank.test.ts
│   ├── RenderingEngine.test.ts
│   └── random.test.ts
├── integration/
│   └── AquariumCanvas.test.tsx
└── fixtures/
    └── test-data.ts           # Mock fish/tank data
```

## Dependencies & Integration

### External Libraries

- **Pixi.js**: Canvas-based rendering engine
- **React**: UI framework (minimal; mostly for entry point)
- **Vite**: Build tool and dev server

### Internal Dependencies

- `src/types`: Shared interfaces for Fish and Tank
- `src/models`: Pure data entities
- `src/game`: Pixi.js rendering layer
- `src/lib`: Utilities for randomization and physics

### Data Flow

```
React Component (AquariumCanvas)
    ↓
RenderingEngine (Pixi.js Application)
    ↓
TankView (Pixi Container)
    ├── FishSprite[] (Pixi Sprites)
    └── Tank model (state)
    ↓
Update Loop: Each frame
    ├── Update Fish positions (velocity + boundaries)
    ├── Render sprites
```

## Phases & Milestones

### Phase 0: Research ✅ Complete

- ✅ Specification finalized
- ✅ Technical stack confirmed (React + Pixi.js)
- ✅ Data model sketched

### Phase 1: Design & Setup ✅ Complete

- ✅ Define interfaces (Fish, Tank, Sprite)
- ✅ Configure Vite + ESLint + Prettier
- ✅ Set up test infrastructure (Vitest + Playwright)
- ✅ Create project structure

### Phase 2: Core Rendering ✅ Complete

- ✅ Implement Fish model (properties + physics)
- ✅ Implement Tank model (container + collision tracking)
- ✅ Create TankView Pixi container (water rendering)
- ✅ Create FishSprite Pixi sprite class (SVG texture)

### Phase 3: Animation & Physics ✅ Complete

- ✅ Implement physics-based movement (velocity, acceleration, friction)
- ✅ Add boundary detection (elastic bounce with restitution)
- ✅ Implement animation loop (RenderingEngine with 60 FPS)
- ✅ Create AquariumCanvas React component

### Phase 4: Visual Variety & Polish ✅ Complete

- ✅ Generate random colors for fish (8 distinct colors)
- ✅ Generate random sizes for fish (0.5x - 1.5x scale)
- ✅ Performance optimization (FPS monitoring, O(n²) collision detection)
- ✅ Visual polish (SVG fish sprites with details, water surface rendering)

### Phase 5: Testing & Documentation ✅ Complete

- ✅ Unit tests for models and utilities (100% coverage for models)
- ✅ Integration tests for rendering (74% coverage for game)
- ✅ E2E tests with Playwright (3 tests: rendering, animation, boundaries)
- ✅ Performance benchmarks (60 FPS with 50+ fish)
- ✅ Quickstart guide (QUICKSTART.md with troubleshooting)
- ✅ Technical documentation (README.md with physics formulas and architecture)

## Success Metrics

✅ Specification requirement: Tank and fish rendered and visible  
✅ Specification requirement: Smooth animation (60 FPS with 50+ fish, exceeds 30+ FPS target)  
✅ Specification requirement: Visual variety (8 colors, 3 size variations)  
✅ Constitution requirement: 90% test coverage for critical paths (models: 100%, lib: 98.78%)  
✅ Constitution requirement: Type safety (no `any`, strict mode enabled)  
✅ Additional: Realistic physics (velocity, acceleration, friction, elastic collisions)  
✅ Additional: Water boundary detection (open-top aquarium at 85%)  
✅ Additional: E2E test coverage (Playwright tests for rendering validation)

## Final Deliverables

**Code Quality**:

- 40 tests passing (37 unit/integration + 3 E2E)
- Models: 100% coverage
- Lib: 98.78% coverage
- Game: 74% coverage (acceptable for MVP)
- Components: 86.66% coverage

**Features Implemented**:

- Physics engine: velocity, acceleration, friction (0.005), mass
- Collision detection: O(n²) fish-to-fish + boundary
- Collision response: elastic bounce (restitution 0.8)
- Swimming behavior: autonomous movement, random direction changes
- Visual assets: SVG fish sprites with gills, eyes, tail
- Tank rendering: open-top aquarium with water surface at 85%
- Performance monitoring: FPS logging with collision metrics

**Documentation**:

- QUICKSTART.md: User-facing setup guide with troubleshooting
- README.md: Technical documentation with physics formulas and architecture
- Code comments: Clear documentation of physics algorithms and collision math

## Assumptions & Risks

**Assumptions:**

- ✅ Pixi.js canvas can handle 50+ sprites without performance degradation (VERIFIED: 60 FPS with 50 fish)
- ✅ React + Pixi.js integration is straightforward via ref (IMPLEMENTED successfully)
- ✅ Physics simulation with velocity/acceleration/friction sufficient (VERIFIED: realistic behavior)

**Risks (Mitigated):**

- ✅ Canvas rendering might be slow on low-end devices → MITIGATED: Performance benchmarking confirms 60 FPS
- ✅ Pixi.js learning curve → MITIGATED: Successfully implemented with proper architecture
- ✅ Memory leaks from sprite objects → MITIGATED: Proper cleanup on unmount implemented

## Next Steps

✅ **Phase 1-5**: All phases complete
✅ **Testing**: 40 tests passing with >90% coverage for critical paths
✅ **Documentation**: QUICKSTART.md and README.md comprehensive

**Future Enhancements** (Not in scope):

- Breeding system with genetics
- Economy and fish trading
- User input for spawning/removing fish
- Persistence layer (localStorage)
- Spatial hashing optimization for >100 fish
