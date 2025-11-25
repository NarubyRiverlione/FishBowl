# Future Feature Spec: Food Particle System

**Status**: DRAFT / FUTURE  
**Priority**: Post-MVP (after breeding system)  
**Dependencies**: Core mechanics (001) must be complete

---

## Overview

Replace the instant "Feed Tank" mechanic with a realistic food particle system where:

- Players buy food and spawn particles at the water surface (top of tank)
- Food particles float on the surface until consumed
- Fish autonomously detect food and swim toward it (hungrier fish swim faster)
- Fish consume food through collision detection at the surface
- After eating, fish dive down to make room for other fish
- Fish have different hunger requirements based on age/size
- Uneaten food dissolves after a timeout and pollutes the water

This adds visual polish, strategic depth (positioning food, managing consumption), and realistic aquarium behavior.

---

## User Stories

### As a player, I want to see fish swim to food at the surface so the game feels more alive

**Acceptance Criteria**:

- When I add food, particles appear at the water surface (top of tank)
- Food floats on the surface until consumed or dissolved
- Nearby fish detect food and swim upward toward it
- Hungrier fish swim faster to reach food first
- Fish that reach food consume it (hunger decreases)
- After eating, fish dive down to make room for other fish at the surface
- Uneaten food dissolves after 30 seconds and pollutes the water

### As a player, I want to feed specific fish by placing food strategically

**Acceptance Criteria**:

- I can click/place food at specific locations on the water surface
- Faster/healthier/hungrier fish can reach food first
- Slow/weak/less hungry fish may need food placed closer to them
- Fish with higher hunger swim with increased urgency

### As a player, I want fish to have realistic feeding needs based on their life stage

**Acceptance Criteria**:

- Young/small fish need 1 food piece to satisfy hunger
- Mature/medium fish need 3 food pieces to satisfy hunger
- Old/large fish need 5 food pieces to satisfy hunger
- After eating, fish check if still hungry and seek more food if needed

---

## Key Requirements

### Functional

- **FR-001**: Food particles spawn at water surface (top 5% of tank height) at player click/button position
- **FR-002**: Food particles float on surface with slight horizontal drift physics
- **FR-003**: Fish AI detects nearest food within detection radius (e.g., 100px)
- **FR-004**: Hungrier fish have increased swim speed toward food (hunger-based urgency multiplier)
- **FR-005**: Fish pathfinding/steering toward food target (upward movement to surface)
- **FR-006**: Collision detection between fish mouth and food particle at surface
- **FR-007**: Food consumption reduces fish hunger based on fish size/age:
  - Young/small fish: -30 hunger per piece (1 piece satisfies)
  - Mature/medium fish: -10 hunger per piece (3 pieces satisfy)
  - Old/large fish: -6 hunger per piece (5 pieces satisfy)
- **FR-008**: After consuming food, fish dive down (move away from surface) to make room
- **FR-009**: Fish check remaining hunger after eating and seek more food if still hungry
- **FR-010**: Uneaten food dissolves after lifespan (e.g., 30 seconds)
- **FR-011**: Dissolved food increases water pollution (reduces water quality)
- **FR-012**: Food costs credits (bulk purchase or per-batch spawning)

### Non-Functional

- **NFR-001**: No performance degradation with 20+ food particles + 50 fish
- **NFR-002**: Smooth animations (60 FPS maintained)
- **NFR-003**: Intuitive click-to-feed UX

---

## Technical Considerations

### New Entities

- `Food` model (position, velocity, lifespan, nutritionValue, isFloating)
- `FoodParticle` Pixi.js sprite (renders at water surface)

### New Systems

- **Surface Physics**: Food floats on water surface with gentle horizontal drift
- **AI/Steering**: Fish behavior tree or steering behaviors (seek food at surface)
- **Hunger-Based Speed**: Fish swim speed increases with hunger level
- **Spatial Detection**: Fish detect food within radius (use spatial hash if >100 entities)
- **Collision**: Fish mouth hitbox + food hitbox detection at surface
- **Dive Behavior**: After eating, fish descend to lower depths
- **Multi-Consumption**: Fish track consumption and continue seeking if still hungry
- **Pollution System**: Dissolved food affects water quality metric
- **Particle Effects**: Food spawn, consumption, and dissolve animations

### Integration Points

- Extend `Fish` model with:
  - `targetFood: Food | null` (current food target)
  - `detectionRadius: number` (how far fish can "see" food)
  - `hungerUrgency: number` (swim speed multiplier based on hunger)
  - `foodRequirement: number` (pieces needed based on age/size: 1/3/5)
  - `isFeeding: boolean` (at surface consuming food)
- Extend `Tank` model with:
  - `foodParticles: Food[]` (active food floating on surface)
  - `waterQuality: number` (affected by dissolved food pollution)
  - `surfaceY: number` (y-coordinate of water surface for food placement)
- Extend `GameLoopService` to:
  - Update food lifespan and remove expired food
  - Apply pollution from dissolved food to water quality
  - Update fish feeding state and dive behavior
- Extend `RenderingEngine` to:
  - Render food particles at surface layer
  - Animate fish ascending/descending for feeding
  - Show water quality visual indicators

### Dependencies

- Existing physics system (extend for surface floating and dive behavior)
- Existing collision system (extend for food-fish collision)
- Fish size/age system (determines food requirement: 1/3/5 pieces)

---

## Design Questions (To Resolve in Full Spec)

1. **Food Physics**: Food floats on surface with slight drift - what forces apply? (wind simulation, tank current?)
2. **AI Complexity**: Simple "move toward nearest food" or sophisticated steering behaviors with obstacle avoidance?
3. **Feeding Priority**: First-come-first-served or fair distribution algorithm to help weak/slow fish?
4. **UI Affordance**: Click anywhere on surface or dedicated "Feed" button that spawns X particles at random surface locations?
5. **Cost Model**: Per-particle cost, bulk purchase of food inventory, or per-feeding-session cost?
6. **Animation**: What animations for food spawn/consumption/dissolve? Fish eating animation?
7. **Hunger Urgency Formula**: Linear speed increase with hunger (e.g., `speed = baseSpeed * (1 + hunger/100)`) or threshold-based?
8. **Dive Behavior**: How deep do fish dive after eating? Random depth or return to previous position?
9. **Multi-Food Consumption**: Can fish eat multiple pieces in one surface visit or must dive between each piece?
10. **Size/Age Thresholds**: At what age/size values do fish transition between 1/3/5 piece requirements?
11. **Water Quality Impact**: How much does one dissolved food piece reduce water quality? Linear or exponential decay?
12. **Food Clustering**: Should food pieces repel each other to spread out on surface or can they overlap?

---

## Success Criteria

- Feeding feels intuitive and rewarding (visual feedback)
- Fish behavior appears intelligent and realistic (hungrier fish are more eager)
- Fish naturally congregate at surface during feeding, then disperse after eating
- Food floats convincingly on water surface
- Different sized/aged fish visibly consume different amounts of food
- Performance maintains 60 FPS with 50 fish + 20 food particles
- Economic balance maintained (food cost vs fish value)
- Water quality mechanic adds strategic layer (don't overfeed or water pollutes)

---

## Out of Scope (Post-Feature)

- Multiple food types (pellets vs flakes vs live food)
- Advanced overfeeding mechanics (fish can get "fat" or sick)
- Fish preferences (species-specific food types)
- Automatic feeders (equipment upgrade)
- Food sinking to bottom (bottom-feeder species)
- Competition/aggression during feeding
- Feeding schedule/routine system
- Food inventory management UI

---

## Implementation Notes

### Age/Size to Food Requirement Mapping

Suggested thresholds (to be refined in full spec):

- **Young/Small** (age < 2 minutes, size < 0.8): 1 piece = -30 hunger
- **Mature/Medium** (age 2-5 minutes, size 0.8-1.2): 3 pieces = -10 hunger each
- **Old/Large** (age > 5 minutes, size > 1.2): 5 pieces = -6 hunger each

### Hunger Urgency Speed Formula

Suggested formula (to be tuned):

```typescript
swimSpeedToFood = baseSpeed * (1 + (hunger / 100) * urgencyMultiplier)
// Example: 70 hunger = 1.7x speed if urgencyMultiplier = 1.0
```

### Dive Behavior After Eating

Options to evaluate:

1. **Fixed depth**: Fish descend to middle of tank (50% depth)
2. **Random depth**: Fish pick random y-coordinate below surface
3. **Return to origin**: Fish remember position before feeding and return
4. **Natural swim**: Resume normal swimming behavior (wander mode)

---

## Estimated Complexity

- **High**: Requires AI/pathfinding, collision detection, animation
- **Estimated Effort**: 2-3 weeks for experienced game developer
- **Risk**: May need performance optimization for many particles

---

**Next Steps**: Expand this into full spec when core mechanics and breeding system are complete.
