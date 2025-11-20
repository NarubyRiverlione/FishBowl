# PRD → Roadmap Mapping (Annotated)

This document is an annotated copy of `docs/PRD_Eng.md`. Each PRD section below includes annotations that indicate whether the feature is allocated to a milestone and which spec (if any) covers it. Use this to review coverage and identify gaps.

Source PRD: `docs/PRD_Eng.md`

---

# Product Requirements Document (PRD) - FishBowl (Annotated)

## 1. Introduction

This document describes the functional requirements for "FishBowl", a web-based game about breeding and selling fish. The goal is to run a profitable fish-breeding operation by caring for fish, breeding them, and investing in better equipment.

**Annotation:** High-level intro. Not allocated to a specific milestone.

## 2. Core Mechanics

### 2.1 Fish

Each fish is a unique object with specific properties.

- **Physical Properties:**
  - **Color, Size, Shape:** Determine visual appearance and rarity.
    - Annotation: Covered by `specs/002-visual-prototype` (Milestone 1) — FR-005 in that spec; visual variety implemented in prototype.
  - **Genetics:** Offspring inherit traits from parents (mixing or dominant/recessive). There is a chance for mutations (special fish).
    - Annotation: Planned for Milestone 3 (Breeding & Genetics). Not present in current specs.
- **Life Cycle:**
  - **Young (Fry):** Vulnerable, hides, eats poorly. Grows quickly if fed.
  - **Adult:** Fertile, full size, sellable.
  - **Old:** Fertility decreases, health declines faster, less valuable.
  - **Dead:** When health reaches 0. Dead fish are automatically removed (to avoid water pollution).
    - Annotation: Life stages added to `specs/001-core-mechanics/spec.md` as FR-015 with tasks T041-T043 (Milestone 2). Death handling & removal covered by FR-014 in the same spec.
- **Behavior & Needs:**
  - **Feeding:** Hunger meter. Too little food => health decreases. Overfeeding => pollution.
    - Annotation: Feeding mechanics implemented in `specs/001-core-mechanics` (Milestone 2) — FR-005 and related tasks T015/T016.
  - **Stress:** Influenced by environment (few plants, poor water quality). High stress => no breeding, prone to disease.
    - Annotation: Stress is in PRD (planned); not fully represented in `specs/001-core-mechanics` yet — listed as a potential gap in `docs/IMPLEMENTATION_STATUS.md`.
  - **Schooling Behavior:** Some species require companions for happiness/health.
    - Annotation: Planned (Milestone 3). Not in current specs.

### 2.2 Environment (The Aquarium)

The player can manage multiple tanks. Each tank has its own ecosystem.

- **Water Quality (Pollution):**
  - **Causes:** Total fish biomass (larger fish pollute more), waste, uneaten food.
    - Annotation: Basic pollution model implemented in `specs/001-core-mechanics` (Milestone 2) — FR-006 and pollution formula implemented. Biomass-weighted pollution (large fish pollute more) is noted in PRD but only basic per-fish pollution exists; consider as a gap.
  - **Effects:** High pollution => health decreases, stress, disease.
    - Annotation: Water quality → health penalty implemented (FR-007 in spec).
  - **Solutions:**
    - **Filter:** Removes a fixed amount of pollution per minute. Requires occasional cleaning.
      - Annotation: `buyFilter` and filter mechanics present in `specs/001-core-mechanics` (T022) allowing filter purchases for STANDARD tanks; per-tick reduction implemented.
    - **Water Change:** Immediately reduces pollution. Costs credits and takes time. **Feeding is disabled during a water change.**
      - Annotation: Water change mechanic not yet implemented in `specs/001-core-mechanics`; planned for Milestone 4.
    - **Plants:** Passively reduce pollution (nitrates).
      - Annotation: Plants are PRD-level (Milestone 4). Not in current specs.
  - **Water Visuals:** Use a background image/texture as the water backdrop and apply a pollution-driven blur/tint to communicate water quality non-verbally.
    - Annotation: Proposed FR-017 added to `specs/001-core-mechanics/spec.md`. Tasks T047–T049 added to `specs/001-core-mechanics/tasks.md` (recommended Milestone 2 inclusion for visual feedback). See `docs/roadmap.md` Milestone 2 for placement.
- **Oxygen:**
  - **Consumption:** Fish consume oxygen based on size.
  - **Supply:** Surface agitation, oxygen pumps, plants.
  - **Mechanic:** Oxygen shortage => rapid health decline.
    - Annotation: Oxygen system is PRD (Milestone 4). Not in current specs.

### 2.3 Plants & Decoration

- **Plants:** Living organisms in the tank.
  - **Functions:**
    - Reduce stress (hideouts for fry and shy fish).
    - Increase breeding chance (places for eggs).
    - Passively reduce pollution.
  - **Maintenance:** Can die under poor water quality or be eaten by herbivores.
  - Annotation: Plants are planned (Milestone 4). No spec allocation currently.
- **Decoration:** Visual elements that may act as hiding spots.
  - Annotation: Decorations are planned; minimal/prototype visuals may exist in Milestone 1 but gameplay effects are future work.

### 2.4 Disease & Health

- **Disease:** Arises from prolonged stress or poor water quality.
  - **Examples:** Ich (white spot), fungal infections.
  - **Effect:** Continuous health decline; contagious within the same tank.
- **Treatment:**
  - **Medications:** Purchaseable in the shop (e.g., "General Cure", "Anti-Fungal"). Adding medicine to the water costs credits and may temporarily increase stress.
  - **Quarantine:** Move sick fish to a separate tank (if available).
- Annotation: Disease mechanics are PRD features (Milestone 4+). Current specs include health decline from hunger and pollution (FR-004, FR-007) but not full disease modeling.

### 2.5 Player Interactions & Time

- **Time:** The game has an internal clock.
  - **Speed:** By default real-time, but the player may purchase/activate "Time Warp" or accelerations to speed up processes (growth, breeding).
  - Annotation: Game loop and tick-based system implemented in `specs/001-core-mechanics` (Milestone 2) — FR-001. Time Warp is planned for later milestones.
- **Actions:**
  - **Feed:** Manually or via an **Automatic Feeder** (mid-game upgrade).
    - Annotation: Feed Tank action implemented (FR-005). Automatic Feeder is planned (Milestone 3+).
  - **Clean:** Water changes, filter cleaning.
    - Annotation: Clean Tank action implemented (FR-021/T021) for basic cleaning. Filter cleaning (periodic maintenance) is future work.
  - **Shop:** Buy fish, tanks, equipment, medicine, plants.
    - Annotation: Store and buy mechanics exist (Milestone 2: buyFish, buyFilter, upgradeTank). Some shop items planned in future milestones.
  - **Sell:** Select fish to sell.
    - Annotation: Sell backend exists (FR-013/T027), front-end sell UI tasks added (T037-T040) — in-progress.
  - **Hover (UI/UX):** Hovering over a fish shows an information tooltip displaying key stats (non-exhaustive):
    - Species and ID
    - Age and life stage (Young / Adult / Old)
    - Hunger level (0–100)
    - Health (0–100)
    - Current estimated sell price (calculated using base value × size factor × health% × age factor)
    - Stress level (derived from environment)
    - Size, color, and notable genetic markers (if present)
    - Last fed timestamp

    The tooltip should be lightweight, non-blocking, and optionally allow a click-through to select the fish for actions (feed, inspect, sell).
    - Annotation: Hover tooltip is noted in PRD/PRD_Eng; not yet in `specs/001-core-mechanics` as FR. Recommend adding FR (e.g., FR-016) and tasks (UI + tests). See `specs/001-core-mechanics/tasks.md` for adding T037-T040 (selection/sell) and consider adding T044-T046 for hover tooltip.

## 3. Economy

- **Currency:** "AquaCredits".
- **Income:** Selling fish.
  - **Price Formula:** base value × (size factor) × (health %) × (age factor)
  - Annotation: Fish valuation implemented in `src/services/FishService.calculateFishValue` and `specs/001-core-mechanics` FR-013/T027.
- **Expenses:**
  - Fish, plants, decorations
  - Food, medicine, water
  - Equipment: filters, pumps, automatic feeder
  - Expansion: larger/new aquariums
  - Annotation: Basic purchasing is implemented (buyFish, buyFilter, upgradeTank). Some items (plants, auto-feeders) are planned in future milestones.

## 4. Reproduction

- **Automatic Breeding:** Occurs when:
  1. A male and female of the same species are in the same tank.
  2. Both are adults and healthy.
  3. Stress is low (sufficient plants/hiding spots).
- **Result:** New young fish (fry) appear in the tank.
- Annotation: Breeding is planned for Milestone 3. Not implemented in current specs.

## 5. Future Scope (Version 2)

- **Temperature:** Heaters and species-specific temperature requirements.
- **Complex Genetics:** Extended pedigrees and recessive genes.
- Annotation: Planned for future milestones (Milestone 3+). No spec mapping.

## 6. Next Steps

1. Define the MVP (Minimum Viable Product) scope.
   - Annotation: MVP scope largely represented by `specs/001-core-mechanics` (Milestone 2) which implements core mechanics; confirm if additional PRD items belong in MVP.
2. Confirm the technical stack (React + Vite is already selected in the repo).

---

## Summary of Coverage

- Covered by Milestone 1 (`specs/002-visual-prototype`): Visual rendering, fish sprites, physics, visual variety.
- Covered / In Progress in Milestone 2 (`specs/001-core-mechanics`): Game loop, aging, hunger, health, feeding, pollution, water quality, buy/sell backend, tank upgrade, developer mode, tests.
- Planned for Milestone 3+: Breeding/genetics, plants, stress mechanics, oxygen, advanced water systems, automatic feeders, advanced economy items.

## Recommended Changes

- Add a formal Functional Requirement for the hover tooltip (e.g., FR-016) in `specs/001-core-mechanics/spec.md` and add tasks for UI and tests (T044-T046).
- Add tasks to explicitly implement stress mechanics and biomass-weighted pollution if these are considered MVP features.
- Allocate `plants` and `oxygen` to Milestone 4 and create placeholder specs/tasks.

---

_This annotated roadmap file was generated from `docs/PRD_Eng.md`, the README roadmap, and the two existing specs (`specs/001-core-mechanics` and `specs/002-visual-prototype`). Use it to verify that each PRD feature is allocated to a milestone/spec or to identify missing allocations._
