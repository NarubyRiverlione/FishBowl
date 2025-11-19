# Implementation Plan: Visual Prototype - Swimming Fish in Tank

**Branch**: `002-visual-prototype` | **Date**: 2025-11-19 | **Spec**: [spec.md](./spec.md)
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

### Phase 0: Research (Complete)

- ✅ Specification finalized
- ✅ Technical stack confirmed (React + Pixi.js)
- ✅ Data model sketched

### Phase 1: Design & Setup

- [ ] Define interfaces (Fish, Tank, Sprite)
- [ ] Configure Vite + ESLint + Prettier
- [ ] Set up test infrastructure (Vitest)
- [ ] Create project structure

### Phase 2: Core Rendering

- [ ] Implement Fish model (properties only)
- [ ] Implement Tank model (container)
- [ ] Create TankView Pixi container
- [ ] Create FishSprite Pixi sprite class

### Phase 3: Animation & Physics

- [ ] Implement simple velocity-based movement
- [ ] Add boundary detection (bounce/reverse)
- [ ] Implement animation loop (RenderingEngine)
- [ ] Create AquariumCanvas React component

### Phase 4: Visual Variety & Polish

- [ ] Generate random colors for fish
- [ ] Generate random sizes for fish
- [ ] Performance optimization (frame rate monitoring)
- [ ] Visual polish (scaling, proportions)

### Phase 5: Testing & Documentation

- [ ] Unit tests for models and utilities
- [ ] Integration tests for rendering
- [ ] Performance benchmarks
- [ ] Quickstart guide

## Success Metrics

✅ Specification requirement: Tank and fish rendered and visible  
✅ Specification requirement: Smooth animation (30+ fps with 20 fish)  
✅ Specification requirement: Visual variety (3+ colors, 3 sizes)  
✅ Constitution requirement: 90% test coverage for critical rendering paths  
✅ Constitution requirement: Type safety (no `any`, strict mode)

## Assumptions & Risks

**Assumptions:**

- Pixi.js canvas can handle 50+ sprites without performance degradation
- React + Pixi.js integration is straightforward via ref
- Simple velocity physics are sufficient (no acceleration/AI)

**Risks:**

- Canvas rendering might be slow on low-end devices (mitigation: performance benchmarking)
- Pixi.js learning curve (mitigation: use examples from Pixi docs)
- Memory leaks from sprite objects (mitigation: proper cleanup on unmount)

## Next Steps

1. Run `/speckit.tasks` to generate detailed task breakdown
2. Begin Phase 1: Design & Setup
3. Create type definitions and project structure
