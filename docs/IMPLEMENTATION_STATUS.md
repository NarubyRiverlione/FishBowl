# FishBowl - Implementation Status

**Last Updated**: 2025-11-19

## Overview

FishBowl is a web-based fish breeding simulation game. This document tracks the implementation progress across planned features.

## Current Status: Phase 1 Complete ✅

### Phase 1: Visual Prototype (✅ Completed)

**Objective**: Create a physics-based visual prototype of fish swimming in an aquarium tank.

**Implemented Features**:

- ✅ Aquarium tank rendering with Pixi.js
- ✅ Fish sprites with SVG graphics (gills, eyes, tail fins)
- ✅ Physics engine:
  - Velocity, acceleration, and friction (0.005)
  - Mass-based force calculations
  - Elastic collision response (restitution 0.8)
- ✅ Collision detection:
  - Fish-to-fish (circle collision, O(n²))
  - Boundary detection (walls and water surface)
- ✅ Visual variety:
  - 8 distinct fish colors
  - Size variations (0.5x - 1.5x scale)
- ✅ Swimming behavior:
  - Autonomous movement
  - Random direction changes (0.5% per frame)
  - Speed boost when moving too slowly
- ✅ Performance optimization:
  - 60 FPS maintained with 50+ fish
  - FPS monitoring with metrics logging
  - Collision count tracking
- ✅ Realistic tank rendering:
  - Open-top aquarium (no ceiling)
  - Water surface at 85% height
  - Visible tank walls

**Test Coverage**:

- 40 tests passing (37 unit/integration + 3 E2E)
- Models: 100% coverage
- Lib: 98.78% coverage
- Game: 74% coverage
- Components: 86.66% coverage

**Documentation**:

- ✅ QUICKSTART.md - User setup guide
- ✅ README.md - Technical documentation with physics formulas
- ✅ specs/002-visual-prototype/ - Complete specification and implementation plan

**Deliverables**:

- Fully functional visual prototype
- Comprehensive test suite
- Production-ready codebase

---

## Planned Features (Not Yet Implemented)

### Phase 2: Breeding System (Planned)

**Objective**: Implement fish genetics, life cycle, and reproduction mechanics.

**Planned Features** (from PRD.md):

- Fish genetics and inheritance
- Life cycle stages:
  - Young (fry): Vulnerable, hides, grows fast
  - Adult: Fertile, full size, sellable
  - Old: Fertility decreases, health declines
- Breeding mechanics:
  - Mate selection
  - Egg laying and hatching
  - Genetic inheritance (dominant/recessive traits)
  - Mutations for special fish
- Gender and fertility
- Death mechanics (health = 0)

**Status**: Not started

---

### Phase 3: Environment & Water Quality (Planned)

**Objective**: Implement water quality simulation and tank management.

**Planned Features** (from PRD.md):

- Water quality system:
  - Pollution from fish biomass and waste
  - Health/stress effects from poor water
  - Disease mechanics
- Water maintenance:
  - Water changes (costs money and time)
  - Filters (continuous pollution removal, requires cleaning)
  - Oxygen pumps
- Plants and decoration:
  - Living plants (reduce pollution, provide hiding spots)
  - Decorative items (stress reduction)
- Oxygen management:
  - Fish consume oxygen based on size
  - Surface agitation, oxygen pumps, plants provide oxygen

**Status**: Not started

---

### Phase 4: Economy System (Planned)

**Objective**: Implement currency, trading, and progression mechanics.

**Planned Features** (from PRD.md):

- Currency system (Euro-based, needs in-game name)
- Fish trading:
  - Sell adult fish
  - Buy rare breeds
- Equipment purchases:
  - Filters (varied capacity)
  - Oxygen pumps
  - Tank expansions
  - Decorations and plants
- Progression system:
  - Starting capital
  - Unlock better equipment
  - Multiple tank management

**Status**: Not started

---

### Phase 5: Advanced Features (Future)

**Objective**: Add depth and complexity to the simulation.

**Planned Features**:

- Multiple tank management
- Advanced genetics (traits, colors, patterns)
- Fish behavior AI (schooling, hiding, feeding)
- Seasonal events
- Achievement system
- Save/load functionality

**Status**: Not started

---

## Technical Debt & Future Optimizations

### Performance

- [ ] Implement spatial hashing for collision detection (needed for >100 fish)
- [ ] Optimize rendering pipeline for mobile devices
- [ ] Add object pooling for fish sprites

### Features

- [ ] Tank resizing (responsive to browser window)
- [ ] User input (click to spawn/remove fish)
- [ ] Persistence layer (localStorage or backend)
- [ ] Settings panel (fish count, physics parameters)

### Testing

- [ ] Visual regression testing
- [ ] Performance benchmarking automation
- [ ] Cross-browser testing

---

## Architecture Overview

**Current Stack**:

- React 19 + Vite 7 (UI framework & build tool)
- TypeScript 5.9 (strict mode)
- Pixi.js 8 (rendering engine)
- Vitest (unit/integration testing)
- Playwright (E2E testing)
- pnpm (package manager)

**Project Structure**:

```
src/
├── types/         # TypeScript interfaces
├── models/        # Domain logic (Fish, Tank)
├── lib/           # Utilities (physics, collision, random)
├── game/          # Pixi.js rendering (sprites, views, engine)
├── components/    # React UI (canvas wrapper)
└── assets/        # Graphics (SVG fish sprite)
```

**Architecture Pattern**: Separation of Concerns

- Models: Pure TypeScript logic, no rendering
- Game: Pixi.js rendering, observes models
- Components: React UI, thin wrapper layer
- Lib: Stateless utility functions

---

## Next Steps

### Immediate (Phase 2 - Breeding System)

1. Design genetic system (traits, inheritance rules)
2. Implement life cycle stages (fry, adult, old)
3. Create breeding mechanics (mate selection, egg laying)
4. Add visual indicators for age and gender
5. Test genetic inheritance with multiple generations

### Short-term (Phase 3 - Environment)

1. Design water quality model (pollution sources, effects)
2. Implement maintenance actions (water change, filter)
3. Add plants and decorations
4. Create UI for water quality indicators

### Long-term (Phase 4+ - Economy & Advanced)

1. Design economy balancing (prices, progression)
2. Implement trading system
3. Add equipment shop
4. Create multiple tank management
5. Implement save/load system

---

## References

- [PRD.md](./PRD.md) - Product Requirements (Dutch)
- [HighLevel.md](./HighLevel.md) - High-level design (Dutch)
- [specs/002-visual-prototype/](../specs/002-visual-prototype/) - Phase 1 specification
- [QUICKSTART.md](../QUICKSTART.md) - User setup guide
- [README.md](../README.md) - Technical documentation
