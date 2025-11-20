# Product Requirements Document (PRD) - FishBowl (English Draft)

## 1. Introduction

This document describes the functional requirements for "FishBowl", a web-based game about breeding and selling fish. The goal is to run a profitable fish-breeding operation by caring for fish, breeding them, and investing in better equipment.

## 2. Core Mechanics

### 2.1 Fish

Each fish is a unique object with specific properties.

- **Physical Properties:**
  - **Color, Size, Shape:** Determine visual appearance and rarity.
  - **Genetics:** Offspring inherit traits from parents (mixing or dominant/recessive). There is a chance for mutations (special fish).
- **Life Cycle:**
  - **Young (Fry):** Vulnerable, hides, eats poorly. Grows quickly if fed.
  - **Adult:** Fertile, full size, sellable.
  - **Old:** Fertility decreases, health declines faster, less valuable.
  - **Dead:** When health reaches 0. Dead fish are automatically removed (to avoid water pollution).
- **Behavior & Needs:**
  - **Feeding:** Hunger meter. Too little food => health decreases. Overfeeding => pollution.
  - **Stress:** Influenced by environment (few plants, poor water quality). High stress => no breeding, prone to disease.
  - **Schooling Behavior:** Some species require companions for happiness/health.

### 2.2 Environment (The Aquarium)

The player can manage multiple tanks. Each tank has its own ecosystem.

- **Water Quality (Pollution):**
  - **Causes:** Total fish biomass (larger fish pollute more), waste, uneaten food.
  - **Effects:** High pollution => health decreases, stress, disease.
  - **Solutions:**
    - **Filter:** Removes a fixed amount of pollution per minute. Requires occasional cleaning.
    - **Water Change:** Immediately reduces pollution. Costs credits and takes time. **Feeding is disabled during a water change.**
    - **Plants:** Passively reduce pollution (nitrates).
- **Water Visuals (UX suggestion):**
  - **Background image as "transparent water":** Instead of a flat blue fill, use a subtle background image (texture/photo) to act as the scene behind the tank. Render fish and decorations on top so the background reads as the water body.
  - **Pollution-driven blur/opacity:** Apply a dynamic blur and color/palette shift to the background based on the tank's pollution grade (e.g., clean = slightly clear, moderate = subtle blur + green tint, heavy = stronger blur + brownish tint). This provides immediate visual feedback about water quality without intrusive HUD elements.
  - **Performance:** Provide a low-cost shader/Canvas2D fallback and LOD (disable heavy blur when many fish are present or on low-end devices).
  - **Annotation / Recommendation:** UI-level enhancement that enhances feedback for pollution. Consider as part of Milestone 2 (visual feedback for core mechanics) with a spec entry and small tasks for implementation and testing.
- **Oxygen:**
  - **Consumption:** Fish consume oxygen based on size.
  - **Supply:** Surface agitation, oxygen pumps, plants.
  - **Mechanic:** Oxygen shortage => rapid health decline.

### 2.3 Plants & Decoration

- **Plants:** Living organisms in the tank.
  - **Functions:**
    - Reduce stress (hideouts for fry and shy fish).
    - Increase breeding chance (places for eggs).
    - Passively reduce pollution.
  - **Maintenance:** Can die under poor water quality or be eaten by herbivores.
- **Decoration:** Visual elements that may act as hiding spots.

### 2.4 Disease & Health

- **Disease:** Arises from prolonged stress or poor water quality.
  - **Examples:** Ich (white spot), fungal infections.
  - **Effect:** Continuous health decline; contagious within the same tank.
- **Treatment:**
  - **Medications:** Purchaseable in the shop (e.g., "General Cure", "Anti-Fungal"). Adding medicine to the water costs credits and may temporarily increase stress.
  - **Quarantine:** Move sick fish to a separate tank (if available).

### 2.5 Player Interactions & Time

- **Time:** The game has an internal clock.
  - **Speed:** By default real-time, but the player may purchase/activate "Time Warp" or accelerations to speed up processes (growth, breeding).
- **Actions:**
  - **Feed:** Manually or via an **Automatic Feeder** (mid-game upgrade).
  - **Clean:** Water changes, filter cleaning.
  - **Shop:** Buy fish, tanks, equipment, medicine, plants.
  - **Sell:** Select fish to sell.
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

## 3. Economy

- **Currency:** "AquaCredits".
- **Income:** Selling fish.
  - **Price Formula:** base value × (size factor) × (health %) × (age factor)
- **Expenses:**
  - Fish, plants, decorations
  - Food, medicine, water
  - Equipment: filters, pumps, automatic feeder
  - Expansion: larger/new aquariums

## 4. Reproduction

- **Automatic Breeding:** Occurs when:
  1. A male and female of the same species are in the same tank.
  2. Both are adults and healthy.
  3. Stress is low (sufficient plants/hiding spots).
- **Result:** New young fish (fry) appear in the tank.

## 5. Future Scope (Version 2)

- **Temperature:** Heaters and species-specific temperature requirements.
- **Complex Genetics:** Extended pedigrees and recessive genes.

## 6. Next Steps

1. Define the MVP (Minimum Viable Product) scope.
2. Confirm the technical stack (React + Vite is already selected in the repo).

---

_Notes:_

- This English PRD is a direct translation of `docs/PRD.md`. The hover-tooltip UI suggestion has been added under the Interactions section per request.
- If you want this hover interaction to become a formal requirement, I can add a Functional Requirement (e.g., FR-016) to `specs/001-core-mechanics/spec.md` and create associated tasks (UI + tests).
