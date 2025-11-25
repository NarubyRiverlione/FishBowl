# PRD → Roadmap Mapping (Annotated)

This document is an annotated copy of `docs/PRD_Eng.md`. Each PRD section below includes annotations that indicate whether the feature is allocated to a milestone and which spec (if any) covers it. Use this to review coverage and identify gaps.

Source PRD: `docs/PRD_Eng.md`

---

# Product Requirements Document (PRD) - FishBowl (Annotated)

## 1. Introduction

This document describes the functional requirements for "FishBowl", a web-based game about breeding and selling fish. The goal is to run a profitable fish-breeding operation by caring for fish, breeding them, and investing in better equipment.

**Annotation:** High-level intro. Not allocated to a specific milestone.

## Project Roadmap — Milestones & Features

This document lists the high-level milestones and the main features allocated to each milestone. For detailed PRD→spec mappings see `docs/feature_check.md`. For current implementation progress see `docs/IMPLEMENTATION_STATUS.md`.

## Milestone 1 — Visual Prototype

Goal: Build a working visual foundation and rendering pipeline.

- Render aquarium tank and water surface (`specs/002-visual-prototype`)
- Fish sprite rendering and SVG assets
- Basic physics: velocity, acceleration, friction, elastic collisions
- Visual variety: colors, sizes, base sprite variants
- Acceptance: POC visual prototype complete

Links:

- Spec: `specs/002-visual-prototype/`
- PRD mapping: `docs/feature_check.md` (Visual items)

---

## Milestone 2 — Core Mechanics (✅ COMPLETE)

Goal: Implement core game systems for playable loop and economy.

**Status**: ✅ **COMPLETE** - MVP Ready for Production  
**Completion**: November 2025  
**Next**: Advanced features moved to new specs

**Implemented Features**:

- ✅ Game loop (tick-based, pause/resume)
- ✅ Fish lifecycle: aging, hunger, health, death (`specs/001-core-mechanics`)
- ✅ Feeding, cleaning, pollution, water quality
- ✅ Economy basics: credits, buy/sell fish, tank upgrade
- ✅ UI: HUD, store menu, basic interaction controls
- ✅ Life stage visual rules (young/mature/old)
- ✅ Multi-tank support (up to 3 tanks)
- ✅ Developer mode and tutorial system
- ✅ Fish selection and info panel
- ✅ Collision detection and boundary physics
- ✅ Acceptance: Playable loop — buy → feed → survive → sell ✅

Links:

- Spec: `specs/001-core-mechanics/`
- PRD mapping: `docs/feature_check.md` (Core mechanics)
- Status: `docs/IMPLEMENTATION_STATUS.md`

---

## Milestone 3 — Advanced Rendering & Physics (Planned)

Goal: Enhance visual rendering, tank shapes, and advanced collision physics.

**Advanced Tank Rendering** (from 001-core-mechanics Phase 4):

- Procedural tank rendering (BOWL circular, STANDARD square, BIG rectangle)
- Advanced collision detection with composite shapes
- Floor physics with different restitution values (gentle floor vs bouncy walls)
- Tank shape factory system and debugging infrastructure
- Performance optimization for multiple tank display

**Multi-Tank Display**:

- Responsive multi-tank layout: desktop grid view (all tanks visible), tablet split layout, mobile tab navigation
- Tab buttons with visual indicators (● for BOWL, ◯ for STANDARD, ▭ for BIG)
- Active tank highlighting and keyboard shortcuts (1/2/3 keys, arrow keys)
- Responsive CSS with viewport breakpoints (desktop ≥1024px, tablet 768–1024px, mobile <768px)
- Integration and E2E tests for layout responsiveness across device sizes

Links:

- Advanced Rendering spec: planned for `specs/003-advanced-rendering/`
- Multi-Tank Display tasks: moved from `specs/001-core-mechanics/tasks.md` Phase 4
- PRD mapping: `docs/feature_check.md` (Advanced rendering items)

---

## Milestone 4 — Breeding & UX Polish (Planned)

Goal: Introduce reproduction, genetics, and enhanced user experience.

**Breeding & Genetics**:

- Breeding mechanics and mate selection
- Simple genetics and trait inheritance (dominant/recessive)
- Schooling/social behavior for selected species
- Automatic player actions (time warp toggle)

**UX Polish & Animation** (from 001-core-mechanics Phase 5):

- Fish animation system (tail wagging, fin movement)
- Water visuals with pollution-driven effects
- Enhanced fish selection and interaction
- Visual polish and animation responsiveness

**Quality & Logging**:

- Structured logging with debug package integration
- Performance monitoring and optimization
- Code quality improvements

Links:

- Breeding spec: planned for `specs/004-breeding-ux/`
- UX Polish tasks: moved from `specs/001-core-mechanics/tasks.md` Phase 5
- PRD mapping: `docs/feature_check.md` (Breeding + UX items)

---

## Milestone 5 — Advanced Environment & Systems (Future)stems (Future)

Goal: Deepen environment simulation and emergent behaviors.

- Plants lifecycle and maintenance (effects on stress/pollution)
- Oxygen management and pumps
- Disease modelling (contagion, treatment, quarantine)
- Water change mechanic with time and cost
- Biomass-weighted pollution and food-particle system

## How to use this roadmap

- Use milestones to plan releases and communicate scope.
- For each milestone, use the linked spec or `docs/feature_check.md` to find which PRD items are covered.
- `docs/IMPLEMENTATION_STATUS.md` contains in-progress details, test coverage, and developer-mode notes.

If you want, I can also add short target dates or issue/PR references to each milestone.
