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
- Tank state (fish list, water quality, capacity)
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
  currentTick: number;
  isPaused: boolean;
  
  // Tank & Fish
  tank: ITank;
  fish: Map<string, IFish>;
  
  // Economy
  credits: number;
  storeInventory: IStoreItem[];
  
  // UI
  selectedFishId: string | null;
  
  // Actions
  tick: () => void;
  buyFish: (species: string) => void;
  feedFish: (fishId: string) => void;
  sellFish: (fishId: string) => void;
  // ... more actions
};
```

### Alternatives Considered
- **Redux**: Too verbose for this scope; Zustand is simpler.
- **Context API alone**: Would cause excessive re-renders without optimization.

---

## 3. Type Safety & Domain Models

### Decision
Define strict TypeScript interfaces in `src/types/` before implementation:
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

## 4. Hunger & Feeding Mechanics

### Decision
Implement a **linear hunger increase** and **threshold-based health loss**:
- Hunger increases by a fixed amount per tick (e.g., +1 per tick).
- When hunger ≥ 80, health decreases by 1 per tick.
- Feeding instantly reduces hunger to 0 and costs 1 credit per fish.
- When health reaches 0, fish dies and is removed.

### Rationale
- Linear mechanics are simple to test, tune, and predict.
- Threshold-based triggers are common in survival games (tamagotchi model).
- Allows players to recover fish from high hunger without dying if they feed quickly.
- Economic balance: feeding costs are low (1 credit), but necessary to avoid death.

### Alternatives Considered
- **Exponential hunger**: Would make late-game balance complex.
- **Health-based death only**: Would remove the player's ability to control outcome (passive).
- **Random starvation**: Would make the game unfair and hard to learn.

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
- **Starting credits**: 100
- **Cost to buy Guppy**: 50
- **Cost per feed**: 1
- **Profit from selling 5-min-old healthy Guppy**: 100 credits
- **Win condition**: Buy 2 fish → feed them → sell for profit within 10 minutes.

### Alternatives Considered
- **Fixed value**: Would make breeding irrelevant (no progression).
- **Quadratic growth**: Could break economy balance too easily.
- **Time-only calculation**: Doesn't reward healthy fish management.

---

## 6. Fish Death & Removal

### Decision
- When health reaches 0, mark fish as `isAlive = false`.
- On the next tick, remove dead fish from tank.
- Dead fish cannot be fed or bred.

### Rationale
- Allows UI to show death animation (optional).
- Grace period for visual feedback.
- Prevents resurrection bugs.

---

## 7. Testing Strategy (TDD)

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

## 8. Performance & Scale (MVP)

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

## 9. File Structure & Architecture

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

| Component | Decision | Rationale |
|-----------|----------|-----------|
| Game Loop | Tick-based (1/sec) | Deterministic, testable, frame-rate independent |
| State Mgmt | Zustand + services | Lightweight, performant, centralized |
| Hunger | Linear increase, threshold health loss | Simple to tune, player-controllable outcome |
| Economy | Base × Age × Health formula | Incentivizes care, prevents exploitation |
| Death | Mark dead, remove on next tick | Clean, allows UI feedback |
| Tests | Vitest unit + integration (90% critical) | TDD enforced, high confidence |
| Architecture | Feature-centric (types → models → services → store → UI) | Clean, scalable, team-friendly |

---

## Next Steps (Phase 1)

1. Generate `data-model.md` with detailed entity schemas.
2. Create API contracts in `specs/001-core-mechanics/contracts/`.
3. Generate `quickstart.md` with setup and first-feature walkthrough.
4. Update agent context with TypeScript/React/Zustand tech stack.
