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

## Milestone 2 — Core Mechanics (Current)

Goal: Implement core game systems for playable loop and economy.

- Game loop (tick-based, pause/resume)
- Fish lifecycle: aging, hunger, health, death (`specs/001-core-mechanics`)
- Feeding, cleaning, pollution, water quality
- Economy basics: credits, buy/sell fish, tank upgrade
- UI: HUD, store menu, basic interaction controls
- Life stage visual rules (young/mature/old)
- Water visuals: background texture + pollution-driven blur/tint (see `specs/001-core-mechanics` FR-017)
- Acceptance: Playable loop — buy → feed → survive → sell

Links:

- Spec: `specs/001-core-mechanics/`
- PRD mapping: `docs/feature_check.md` (Core mechanics)
- Status: `docs/IMPLEMENTATION_STATUS.md`

---

## Milestone 3 — Breeding & Mid-game

Goal: Introduce reproduction, genetics, and mid-game upgrades.

- Breeding mechanics and mate selection
- Simple genetics and trait inheritance (dominant/recessive)
- Automatic feeder upgrade
- Schooling/social behavior for selected species
- Automatic player actions (time warp toggle)

Links:

- PRD mapping: `docs/feature_check.md` (Breeding items)

---

## Milestone 4 — Advanced Environment & Systems

Goal: Deepen environment simulation and emergent behaviors.

- Plants lifecycle and maintenance (effects on stress/pollution)
- Oxygen management and pumps
- Disease modelling (contagion, treatment, quarantine)
- Water change mechanic with time and cost
- Biomass-weighted pollution and food-particle system

Links:

- PRD mapping: `docs/feature_check.md` (Environment)

---

## Milestone 5 — Extended Economy & Polish

Goal: Expand economy, equipment, and player-facing polish.

- Equipment shop expansion (filters, pumps, heaters)
- Market/rare breed mechanics
- Achievements, seasonal events, and progression polish
- Save/load and persistence

Links:

- PRD mapping: `docs/feature_check.md` (Economy items)
- Status: `docs/IMPLEMENTATION_STATUS.md`

---

## How to use this roadmap

- Use milestones to plan releases and communicate scope.
- For each milestone, use the linked spec or `docs/feature_check.md` to find which PRD items are covered.
- `docs/IMPLEMENTATION_STATUS.md` contains in-progress details, test coverage, and developer-mode notes.

If you want, I can also add short target dates or issue/PR references to each milestone.
