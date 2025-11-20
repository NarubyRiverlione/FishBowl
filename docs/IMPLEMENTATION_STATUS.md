# FishBowl - Implementation Status

**Last Updated**: 2025-11-20

## Overview

FishBowl is a web-based fish breeding simulation game. This document tracks the implementation progress across planned features.

## Current Status: Milestone 2 (Core Mechanics) In Progress 🚧

### ⚠️ Spec Alignment Required

**Action Required**: Verify `specs/001-core-mechanics/spec.md` against `docs/PRD.md` for missing features.

**Known Gaps Already Addressed**:

- ✅ Life stages (jong/volwassen/oud) - Added as FR-015 with tasks T041-T043

**Potential Gaps to Review**:

- Stress mechanics (PRD 2.1): Fish stress affected by environment, prevents breeding
- School behavior (PRD 2.1): Some species need companions for health/happiness
- Biomass-based pollution (PRD 2.2): Large fish pollute more than small fish
- Oxygen system (PRD 2.2): Oxygen consumption/production, pumps, surface agitation
- Plants system (PRD 2.3): Living organisms that reduce pollution, provide hiding spots, can die
- Decorations (PRD 2.3): Visual elements and hiding spots
- Food particles (PRD): Not-eaten food increases pollution
- Fish size growth (PRD): Young fish grow to adult size over time

**Next Steps**:

1. Read through entire PRD systematically
2. Cross-reference each PRD section with spec.md functional requirements
3. Identify features that belong in MVP (001-core-mechanics) vs future specs
4. Add missing MVP features to spec.md or create new feature specs for post-MVP items

### Milestone 1: Visual Prototype (✅ Completed)

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

---

## Milestone 2: Core Game Mechanics (🚧 In Progress)

**Branch**: `001-core-mechanics`  
**Objective**: Implement core gameplay loop - fish survival, feeding, economy, progression.

**Implemented Features**:

- ✅ Game loop (1 tick/second with pause/resume)
- ✅ Fish lifecycle:
  - Age tracking (increments per tick)
  - Hunger system (species-specific rates)
  - Health system (affected by hunger and water quality)
  - Death when health reaches 0
- ✅ Economy system:
  - Credits (starting: 100)
  - Buy fish from store (cost validation)
  - Sell fish (dynamic value: baseValue × ageMultiplier × healthModifier)
- ✅ Tank management:
  - Multiple tank support (up to 3 tanks)
  - Tank sizes: BOWL (capacity 1), STANDARD (capacity 10), BIG (capacity 20)
  - Tank upgrade system (BOWL → STANDARD for 75 credits)
  - Maturity bonus (50 credits when first fish reaches 120s in BOWL tank)
- ✅ Water quality:
  - Pollution accumulation (from fish count and feeding)
  - Water quality calculation (100 - pollution)
  - Health penalties when water quality < 50
  - Clean tank action (cost 10, reduces pollution by 30)
  - Filter system (cost 50, reduces pollution per tick, requires STANDARD tank)
- ✅ Feeding system:
  - Feed tank action (reduces all fish hunger by 30)
  - Cost: 2 + livingFishCount
  - Increases pollution
- ✅ UI/UX:
  - Top bar HUD with stats (credits, time, fish count, pollution)
  - Store menu with dropdowns (buy fish, upgrade tank, clean, filter)
  - Disabled states for unaffordable items (WCAG AA compliant)
  - Full-width responsive canvas
  - Pause/resume button with color-coded states
  - Time display in HH:mm:ss format
- ✅ Developer mode:
  - Enabled via `?dev=true` URL param
  - Starts with 100 credits, STANDARD tank, tutorial disabled
- ✅ Visual rendering:
  - Pixi.js integration with Zustand store synchronization
  - Fish sprites with collision detection
  - Tank container with boundaries

**In Progress**:

- ⏳ Fish selection UI (T037-T040):
  - Click fish sprite to select
  - Visual highlight for selected fish
  - Fish info panel showing stats and sell value
  - Sell button in UI
- ⏳ Life stage visual variations (T041-T043):
  - Young (0-119s): Base size
  - Mature (120-299s): 1.3× size
  - Old (≥300s): 1.3× size with 0.8× saturation

**Test Coverage**:

- 40+ tests passing
- Unit tests for services, models, physics
- Integration tests for buy/feed/survival/pollution/progression flows
- E2E tests with Playwright

**Documentation**:

- ✅ specs/001-core-mechanics/spec.md - Feature specification
- ✅ specs/001-core-mechanics/tasks.md - Implementation tasks (43 total, 36 complete)
- ✅ specs/001-core-mechanics/plan.md - Technical architecture

---

## Planned Features (Not Yet Implemented)

### Milestone 3: Breeding System (Planned)

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

### Milestone 4: Advanced Environment & Water Quality (Planned)

**Objective**: Extend water quality simulation with advanced mechanics.

**Planned Features** (from PRD.md):

- Enhanced water quality:
  - Biomass-based pollution (large fish pollute more)
  - Food particle system (uneaten food increases pollution)
  - Stress mechanics affecting fish health and breeding
- Advanced maintenance:
  - Filter cleaning requirement
  - Water change mechanics (locks feeding temporarily)
- Oxygen management:
  - Fish consume oxygen based on size
  - Surface agitation, oxygen pumps, plants provide oxygen
  - Oxygen deficiency → rapid health decline
- Plants and decoration:
  - Living plants (reduce pollution, provide hiding spots, can die)
  - Decorative items (stress reduction, breeding sites)
- School behavior:
  - Some species need companions for health/happiness

**Status**: Not started (some basics implemented in Milestone 2)

---

### Milestone 5: Extended Economy System (Planned)

**Objective**: Extend economy with equipment shop and progression.

**Planned Features** (from PRD.md):

- Advanced trading:
  - Buy rare fish breeds
  - Dynamic market prices
- Equipment shop (expanded):
  - Multiple filter types (varied capacity)
  - Oxygen pumps (various sizes)
  - Tank expansions (BIG tank)
  - Decorations and plants
- Multiple tank management (partially implemented)
- Unlock progression system

**Status**: Core economy implemented in Milestone 2, advanced features pending

---

### Milestone 6: Advanced Features (Future)

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

### Immediate (Complete Milestone 2)

1. ✅ Implement fish selection UI (T037-T040)
2. ✅ Add life stage visual rendering (T041-T043)
3. Verify and align spec with PRD
4. Complete any remaining MVP tasks

### Short-term (Milestone 3 - Breeding System)

1. Design genetic system (traits, inheritance rules)
2. Implement breeding mechanics (mate selection, egg laying)
3. Add visual indicators for gender and fertility
4. Test genetic inheritance with multiple generations

### Medium-term (Milestone 4 - Enhanced Environment)

1. Implement biomass-based pollution
2. Add plants and decorations
3. Create oxygen management system
4. Implement stress mechanics
5. Add food particle simulation

### Long-term (Milestones 5-6 - Economy & Advanced Features)

1. Expand equipment shop
2. Implement save/load system
3. Add achievement system
4. Create seasonal events
5. Optimize for mobile devices

---

## References

- [PRD.md](./PRD.md) - Product Requirements (Dutch)
- [HighLevel.md](./HighLevel.md) - High-level design (Dutch)
- [specs/001-core-mechanics/](../specs/001-core-mechanics/) - Milestone 2 specification (In Progress)
- [specs/002-visual-prototype/](../specs/002-visual-prototype/) - Milestone 1 specification (Complete)
- [QUICKSTART.md](../QUICKSTART.md) - User setup guide
- [README.md](../README.md) - Technical documentation
