# Research: Core Game Mechanics (MVP)

**Date**: 2025-11-19  
**Feature**: 001-core-mechanics  
**Status**: Complete

---

## 1. Game Loop Architecture & Tick System

### Decision

Implement a **tick-based game loop** running at a fixed rate (1 tick per second for MVP), independent of React render cycles. Pixi.js interpolates between ticks for smooth visuals.

### Rationale

- Separates simulation logic from rendering, improving testability.
- Fixed tick rate ensures deterministic behavior for breeding/genetics simulation.
- Allows simulation to run even when the UI isn't rendering (frame-rate independent).
- Standard in game development for physics/simulation consistency.

### Alternatives Considered

- **Frame-based updates**: Would tie simulation to rendering, making tests flaky and creating frame-rate dependencies.
- **Event-driven updates**: Would lack continuous state progression (hunger, aging), requiring polling.

### Implementation Strategy

- Use `setInterval` in Zustand store to dispatch ticks to simulation.
- Each tick mutates state through pure services (GameService, FishService, etc.).
- React and Pixi.js subscribe to state updates via selectors.

---

## 2. State Management (Zustand Store)

### Decision

Use **Zustand with a centralized game store** for:

- Game loop state (current tick, time)
- Tank state (fish list, water quality, pollution, hasFilter, capacity)
- Economy state (credits, store inventory)
- UI state (selected fish, modals)

### Rationale

- Zustand is lightweight, performant, and integrates well with React.
- Centralized store simplifies debugging and state replay.
- Selectors prevent unnecessary React re-renders.
- Easy to mock for testing.

### Store Structure

```typescript
type GameState = {
  // Time
  currentTick: number
  isPaused: boolean

  // Tank & Fish
  tank: ITank
  fish: Map<string, IFish>

  // Economy
  credits: number
  storeInventory: IStoreItem[]

  // UI
  selectedFishId: string | null

  // Actions
  tick: () => void
  buyFish: (species: string) => void
  feedFish: (fishId: string) => void
  sellFish: (fishId: string) => void
  // ... more actions
}
```

### Alternatives Considered

- **Redux**: Too verbose for this scope; Zustand is simpler.
- **Context API alone**: Would cause excessive re-renders without optimization.

---

## 3. Type Safety & Domain Models

### Decision

Define strict TypeScript interfaces in `src/models/types/` before implementation:

- `IFish`: Core fish entity with genetics, stats, lifecycle.
- `ITank`: Container for fish, tracks water quality.
- `IGameState`: Game loop state structure.
- `IEconomyEvent`: Transactions (buy, sell, feed).

### Rationale

- Prevents runtime errors and undefined behavior.
- Serves as contract between services and store.
- Enables IntelliSense in editor and better DX.
- Required by FishBowl architecture (no `any` types).

### Example Interfaces

```typescript
interface IFish {
  id: string;
  species: FishSpecies;
  age: number;
  health: 0-100;
  hunger: 0-100;
  size: number;
  color: string;
  isAlive: boolean;
  genetics: IGeneticMarkers;
  createdAt: timestamp;
}

interface ITank {
  id: string;
  capacity: number;
  fish: IFish[];
  waterQuality: 0-100;
  temperature: number;
}
```

---

### 3. Hunger & Feeding System

### Decision

Implement a **linear hunger increase** (1 point per tick) with **threshold-based health loss**. Feeding is instant via a "Feed Tank" action that reduces all living fish hunger by 30 points (not to 0, allowing strategic timing).

### Rationale

- Linear mechanics are simple to test, tune, and predict.
- Threshold-based triggers are common in survival games (tamagotchi model).
- Allows players to recover fish from high hunger without dying if they feed quickly.
- Feed-all mechanic prevents tedious individual fish clicking (better UX for multiple fish).
- Hunger reduction of 30 points (not to 0) creates strategic timing gameplay.
- Economic scaling: cost increases with fish count (2 + fish count), preventing "feed spam".

### Alternatives Considered

- **Exponential hunger**: Would make late-game balance complex.
- **Health-based death only**: Would remove the player's ability to control outcome (passive).
- **Random starvation**: Would make the game unfair and hard to learn.

---

## 4. Water Quality & Pollution System

### Decision

Implement **pollution accumulation** from fish waste and feeding, with **water quality** affecting fish health:

- Pollution increases per tick: `pollution += (livingFishCount × 0.1) + (feedingsThisTick × 2)`
- Water quality calculated as: `waterQuality = 100 - pollution` (clamped 0-100)
- When `waterQuality < 50`, fish health decreases by 0.5 per tick
- Players can manage pollution via:
  - **Clean Tank** action: Costs 10 credits, reduces pollution by 30
  - **Filter** equipment: Costs 50 credits (one-time), reduces pollution by 0.5 per tick

### Rationale

- Creates economic pressure (currency drain) essential for game loop
- Balances fish population (more fish = more pollution = higher maintenance cost)
- Rewards strategic play (filter is expensive upfront but saves money long-term)
- Adds resource management layer beyond just feeding
- Pollution from feeding prevents "spam feeding" strategy
- Low water quality provides another failure mode besides starvation

### Economic Balance

- **Without filter**: 5 fish generate 0.5 pollution/tick = tank pollutes in ~100 ticks
- **With filter**: Net pollution rate reduced (-0.5 offset by filter)
- **Filter ROI**: Costs 50 credits upfront, saves ~10 credits per cleaning cycle
- **Player decision**: Buy filter early (upfront cost) vs. clean repeatedly (ongoing cost)

### Alternatives Considered

- **No pollution system**: Would eliminate maintenance currency drain (boring economy)
- **Food-only pollution**: Wouldn't scale with fish population (unrealistic)
- **Instant death from pollution**: Too punishing, removes strategic depth
- **Multiple filter tiers**: Adds complexity without meaningful choice for MVP

---

## 5. Fish Value Calculation & Economy

### Decision

Fish value is calculated as: **`Base Value × Age Multiplier × Health Modifier`**

- **Base Value**: Depends on species (e.g., Guppy=50, Goldfish=100).
- **Age Multiplier**: (age in seconds / 300) capped at 2x (fish reach max value at 5 minutes old).
- **Health Modifier**: health / 100 (dead fish worth 0).

### Rationale

- Encourages long-term care and investment (older = more valuable).
- Rewards player skill (keeping fish healthy = better profit).
- Prevents exploitation (cap at 2x so players aren't forced to wait forever).
- Balances economy: adult fish worth ~100-200 credits, food costs ~1 credit.

### Example Economy

- **Starting credits**: 50 (BOWL mode) or 100 (Developer mode)
- **Starting tank**: Small Bowl (capacity 1) or Standard Tank (capacity 10)
- **Cost to buy Guppy**: 50
- **Cost per feed** (1 fish): 3 credits (2 base + 1 per fish)
- **Cost per feed** (5 fish): 7 credits (2 base + 5 per fish)
- **Cost to clean tank**: 10 credits (reduces pollution by 30)
- **Cost for filter**: 50 credits (one-time, -0.5 pollution per tick)
- **Cost for tank upgrade**: 75 credits (BOWL → STANDARD, unlock breeding)
- **Maturity bonus**: 50 credits (when first fish reaches age 120 in BOWL)
- **Profit from selling 5-min-old healthy Guppy**: 100 credits
- **Tutorial win condition**: Buy 1 fish (cost 50) → keep alive to maturity (earn 50 bonus) → upgrade tank (cost 75) → buy 2nd fish and breed.
- **Advanced win condition**: Buy 2+ fish → feed and maintain water quality → sell mature fish for profit.

### Alternatives Considered

- **Fixed value**: Would make breeding irrelevant (no progression).
- **Quadratic growth**: Could break economy balance too easily.
- **Time-only calculation**: Doesn't reward healthy fish management.

---

## 6. Tank Progression & Tutorial System

### Decision

Implement **two-tier tank system** with **contextual tutorial popups** to create natural progression and guided learning:

- **Small Bowl**: Capacity 1, starting tank for normal mode, **cannot have filters installed**
- **Standard Tank**: Capacity 10, unlocked via upgrade (75 credits), **filters become available**
- **Maturity Bonus**: Award 50 credits when first fish reaches age 120 in bowl
- **Tutorial Popups**: Event-triggered explanations for key mechanics (enable/disable via URL or UI)
- **Developer Mode**: Skip tutorial, start with Standard Tank and 100 credits, tutorial disabled

### Rationale

- **Gradual learning**: New players master basics (feeding, water quality) with 1 fish before managing multiple
- **Natural tutorial**: Capacity constraint forces focus on core mechanics first
- **Contextual help**: Tutorial popups appear when relevant (first feed, hunger warning, fish death, etc.)
- **Filter simplification**: Hiding filter option in BOWL prevents overwhelming new players with too many choices
- **Sense of achievement**: Upgrading tank feels like progression milestone and unlocks new mechanics (filter)
- **Economic teaching**: Bonus credits teach players that healthy fish = rewards
- **Developer convenience**: Dev mode allows testing breeding/multi-fish without tutorial grind
- **Player control**: Tutorial can be toggled off for experienced players (`?tutorial=false` or UI setting)
- **Clear goal**: "Keep fish alive to maturity" is simple first objective

### Progression Flow

```
Normal Mode (Tutorial Enabled):
1. Start with 50 credits + Bowl (capacity 1) + tutorial on
2. Buy first fish (Guppy = 50 credits, now at 0 credits)
   → Trigger "first_buy" popup: "Welcome to FishBowl! Keep your fish healthy..."
3. Feed fish for first time
   → Trigger "first_feed" popup: "Good job! Monitor hunger (red at 80+)..."
4. If fish hunger reaches 80
   → Trigger "hunger_warning" popup: "Warning! Feed soon or fish loses health..."
5. If water quality drops below 50
   → Trigger "low_water_quality" popup: "Clean the tank (10 credits) to improve..."
6. If fish dies
   → Trigger "fish_death" popup: "Your fish died! Common causes: starvation, bad water..."
7. Keep fish alive to age 120 → earn 50 bonus credits
   → Trigger "maturity_bonus" popup: "Congratulations! Save up for tank upgrade (75 credits)..."
8. Save/earn 75 credits total → upgrade to Standard Tank
   → Trigger "tank_upgrade" popup: "Tank upgraded! Filters now available, can have 10 fish..."
9. Filter option now visible in store
10. Buy second fish → unlock breeding mechanics

Developer Mode:
1. Start with 100 credits + Standard Tank (capacity 10) + tutorial off
2. Skip directly to multi-fish gameplay
3. Maturity bonus already awarded (flag = true)
4. Filter available immediately
5. No tutorial popups
```

### Tutorial Event System

**Events tracked** (to prevent duplicate popups):

- `first_buy` - After purchasing first fish
- `first_feed` - After first feeding action
- `hunger_warning` - When fish hunger reaches 80
- `low_water_quality` - When water quality drops below 50
- `fish_death` - When first fish dies
- `maturity_bonus` - When maturity bonus is awarded
- `tank_upgrade` - After upgrading to STANDARD tank

**Toggle Mechanisms**:

- URL query param: `?tutorial=false` disables on load
- UI settings toggle: Can enable/disable anytime during play
- Developer mode: Always forces tutorial off (`?dev=true` → `tutorialEnabled = false`)

**Implementation Notes**:

- Each event stored in `tutorialEvents: string[]` array
- Before showing popup, check: `tutorialEnabled === true` AND `eventId not in tutorialEvents`
- Toggling tutorial off preserves event history (no duplicate popups if re-enabled)

### Filter Restriction for BOWL

**Decision**: BOWL tanks cannot have filters installed. Filter option hidden in store until tank upgrade.

**Rationale**:

- **Reduces decision paralysis**: New players face only 3 initial choices (buy fish, buy food, upgrade tank)
- **Teaches core mechanics first**: Players must learn manual water quality management (feeding pollution, cleaning) before automation (filter)
- **Creates upgrade value**: Tank upgrade unlocks both capacity (1→10) and new mechanic (filter), making it more rewarding
- **Natural progression**: By time player upgrades, they understand water quality problem and value of filter solution

**Implementation**:

- Validation rule: `hasFilter` can only be true if `tank.size === 'STANDARD'`
- Store inventory: Filter item not included for BOWL, added after `upgradeTank()` action
- Error handling: `buyFilter()` rejects with error if `tank.size === 'BOWL'`

### Economic Balance

- **Tutorial loop**: 50 start → -50 fish → +50 maturity → need +75 for tank = must sell fish or keep alive longer
- **Maturity bonus timing**: 120 seconds (2 minutes) is achievable for new players learning mechanics
- **Upgrade cost**: 75 credits requires ~2-3 feedings worth of savings, teaches resource management
- **Filter unlock**: Becomes available only after demonstrating ability to keep fish alive (completing tutorial objective)

### Alternatives Considered

- **Single tank size**: Would overwhelm new players with multi-fish complexity immediately
- **Multiple upgrade tiers**: Adds complexity without meaningful choice for MVP
- **No maturity bonus**: Players might sell first fish instead of learning to keep alive
- **Locked breeding until tutorial**: Could frustrate advanced players (dev mode solves this)
- **Allow filter in BOWL**: Too many initial choices, players don't understand water quality problem yet
- **Step-by-step tutorial wizard**: Blocks gameplay, feels like work vs contextual learn-by-doing popups

---

## 7. Fish Death & Removal

### Decision

- When health reaches 0, mark fish as `isAlive = false`.
- On the next tick, remove dead fish from tank.
- Dead fish cannot be fed or bred.

### Rationale

- Allows UI to show death animation (optional).
- Grace period for visual feedback.
- Prevents resurrection bugs.

---

## 8. Testing Strategy (TDD)

### Decision

Use **Vitest with unit + integration tests**:

1. **Unit tests** for services (FishService, EconomyService, GameLoopService).
2. **Integration tests** for store actions (buy, feed, sell, tick).
3. **Snapshot tests** for state transitions.
4. Target: **90% coverage** for critical paths.

### Test Structure

```
tests/
├── unit/
│   ├── FishService.test.ts
│   ├── EconomyService.test.ts
│   ├── GameLoopService.test.ts
├── integration/
│   └── GameFlow.test.ts (e2e: buy → feed → sell)
```

### Rationale

- Ensures logic is testable and correct before implementation.
- Red-Green-Refactor cycle enforces quality.
- Makes refactoring safe.

---

## 9. Performance & Scale (MVP)

### Decision

- **Target**: 60 FPS rendering, tick updates at 1/sec.
- **Tank capacity**: 10-20 fish (MVP limit).
- **No persistence**: State lost on page refresh.
- **No offline**: Simulation paused when tab is closed.

### Rationale

- MVP prioritizes playability over features.
- 1 sec tick is slow enough that performance isn't a concern.
- Small tank size makes simulation logic tractable.
- Simplifies testing (no persistence layer needed).

### Alternatives Considered

- **Tick at 60 Hz**: Would make hunger/age tuning more complex.
- **Persistence from day 1**: Adds complexity; can add later.
- **Tank capacity unlimited**: Would hit performance and balance issues.

---

## 10. File Structure & Architecture

### Decision

Strictly follow the FishBowl architecture:

```
src/
├── types/           # Interfaces (IFish, ITank, IGameState, etc.)
├── models/          # Domain entities (Fish.ts, Tank.ts)
├── services/        # Business logic (FishService, EconomyService, GameLoopService)
├── store/           # Zustand store (useGameStore.ts)
├── components/      # React UI (HUD, Menus, Controls)
├── game/            # Pixi.js rendering (FishSprite, TankView, Renderer)
└── lib/             # Utilities (Random, Math, Constants)
```

### Rationale

- **Separation of concerns**: Logic, state, UI, rendering are independent.
- **Testability**: Services and models are pure, mockable functions.
- **Scalability**: New features added by extending services without touching store logic.
- **Team collaboration**: Clear ownership of each layer.

---

## Summary of Key Decisions

| Component          | Decision                                                      | Rationale                                                  |
| ------------------ | ------------------------------------------------------------- | ---------------------------------------------------------- |
| Game Loop          | Tick-based (1/sec)                                            | Deterministic, testable, frame-rate independent            |
| State Mgmt         | Zustand + services                                            | Lightweight, performant, centralized                       |
| Hunger             | Linear increase, threshold health loss                        | Simple to tune, player-controllable outcome                |
| Water Quality      | Pollution accumulation, filter equipment                      | Creates currency drain, resource management gameplay       |
| Tank System        | Bowl (capacity 1) → Standard (capacity 10)                    | Natural tutorial, progressive complexity                   |
| Filter Restriction | BOWL cannot have filters, unlocked after upgrade              | Reduces new player choices, teaches manual mechanics first |
| Tutorial System    | Event-triggered popups, enable/disable toggle                 | Contextual help, learn-by-doing, player control            |
| Maturity Bonus     | 50 credits at age 120 (BOWL only)                             | Teaches care mechanics, funds tank upgrade                 |
| Developer Mode     | URL param or button, starts with Standard Tank + tutorial off | Convenience for testing, skip tutorial                     |
| Economy            | Base × Age × Health formula                                   | Incentivizes care, prevents exploitation                   |
| Death              | Mark dead, remove on next tick                                | Clean, allows UI feedback                                  |
| Tests              | Vitest unit + integration (90% critical)                      | TDD enforced, high confidence                              |
| Architecture       | Feature-centric (types → models → services → store → UI)      | Clean, scalable, team-friendly                             |

---

## Next Steps (Phase 1)

1. Generate `data-model.md` with detailed entity schemas.
2. Create API contracts in `specs/001-core-mechanics/contracts/`.
3. Generate `quickstart.md` with setup and first-feature walkthrough.
4. Update agent context with TypeScript/React/Zustand tech stack.
