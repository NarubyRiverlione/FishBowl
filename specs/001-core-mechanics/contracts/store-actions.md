# API Contracts: Core Game Mechanics (MVP)

**Date**: 2025-11-19  
**Feature**: 001-core-mechanics  
**Format**: TypeScript interfaces (Store actions)

---

## Overview

The FishBowl MVP uses a **Zustand store** as the primary state management and "API" layer. All game actions are dispatched as store mutations. This document defines the contracts for those actions.

---

## 1. Game Initialization

### Action: `initializeGame()`

**Purpose**: Create a new game with starting state.

**Preconditions**: None

**Input**: None

**Output**:
```typescript
{
  currentTick: 0,
  totalTime: 0,
  isPaused: false,
  tank: {
    id: UUID,
    capacity: 10,
    waterQuality: 90,
    temperature: 24,
    fish: [],
    createdAt: Date.now()
  },
  credits: 100,
  storeInventory: [
    { id: "fish-guppy", type: "FISH", name: "Guppy", cost: 50, quantity: -1, species: "GUPPY" },
    { id: "fish-goldfish", type: "FISH", name: "Goldfish", cost: 100, quantity: -1, species: "GOLDFISH" },
    { id: "food-bulk", type: "FOOD", name: "Bulk Food", cost: 1, quantity: -1 }
  ],
  selectedFishId: null,
  gameStartedAt: Date.now()
}
```

**Side Effects**:
- Resets all game state.
- Clears any existing fish or progress.

---

## 2. Game Loop Control

### Action: `tick()`

**Purpose**: Advance the simulation by one tick (1 second).

**Preconditions**: Game not paused

**Input**: None

**Logic Flow**:
1. Increment `currentTick` by 1.
2. For each living fish in tank:
   - Increment `age` by 1.
   - Increment `hunger` by `speciesHungerRate` (clamped to max 100).
   - If `hunger ≥ 80` and health > 0:
     - Decrement `health` by 1 (clamped to min 0).
   - If `health ≤ 0`:
     - Set `isAlive = false`.
3. Remove all dead fish from tank.

**Output**: Updated `IGameState`

**Example**:
```typescript
// Before tick (T=0)
{ 
  fish: { 
    id: "f1", age: 0, hunger: 0, health: 80, isAlive: true 
  }
}

// After tick (T=1)
{ 
  fish: { 
    id: "f1", age: 1, hunger: 1, health: 80, isAlive: true 
  }
}

// After tick at T=80 (hunger threshold reached)
{ 
  fish: { 
    id: "f1", age: 80, hunger: 80, health: 79, isAlive: true 
  }
}
```

**Error Cases**:
- None (tick is always valid)

---

### Action: `togglePause()`

**Purpose**: Pause or resume the game loop.

**Preconditions**: None

**Input**: None

**Behavior**:
- `isPaused = !isPaused`
- When paused, `tick()` is not called by the game loop timer.

**Output**: Updated `isPaused` flag

---

## 3. Fish Purchase

### Action: `buyFish(storeItemId: string)`

**Purpose**: Purchase a fish from the store and add it to the tank.

**Preconditions**:
- `credits ≥ item.cost`
- `tank.fish.length < tank.capacity`
- Store item exists and type is "FISH"

**Input**:
```typescript
{
  storeItemId: "fish-guppy" // ID from storeInventory
}
```

**Logic**:
1. Find store item by ID.
2. Validate preconditions (credits, capacity, item exists).
3. Deduct `item.cost` from `credits`.
4. Create new `IFish`:
   ```typescript
   {
     id: generateUUID(),
     species: item.species,
     name: `${item.species}-${timestamp}`,
     color: randomHexColor(),
     size: getSpeciesMinSize(species),
     age: 0,
     health: 80,
     hunger: 0,
     isAlive: true,
     genetics: {},
     createdAt: Date.now(),
     lastFedAt: Date.now()
   }
   ```
5. Add fish to `tank.fish`.

**Output**: Updated `IGameState` with fish added and credits deducted

**Error Cases**:
- **Insufficient credits**: Reject with error "Not enough credits".
- **Tank full**: Reject with error "Tank at capacity".
- **Invalid item**: Reject with error "Store item not found".

**Example**:
```typescript
// Before
{ credits: 100, tank: { fish: [] } }

// Action: buyFish("fish-guppy")
// After
{ credits: 50, tank: { fish: [{ id: "uuid", species: "GUPPY", age: 0, ... }] } }
```

---

## 4. Feeding

### Action: `feedFish(fishId: string)`

**Purpose**: Feed a fish to reduce its hunger.

**Preconditions**:
- Fish exists and is alive.
- `credits ≥ 1`

**Input**:
```typescript
{
  fishId: "550e8400-e29b-41d4-a716-446655440000" // UUID of fish
}
```

**Logic**:
1. Find fish by ID.
2. Validate preconditions (exists, alive, credits ≥ 1).
3. Deduct 1 credit from `credits`.
4. Set fish `hunger = 0`.
5. Update `lastFedAt = Date.now()`.

**Output**: Updated `IGameState` with fish hunger reset and credits deducted

**Error Cases**:
- **Fish not found**: Reject with error "Fish not found".
- **Fish dead**: Reject with error "Cannot feed dead fish".
- **Insufficient credits**: Reject with error "Not enough credits".

**Example**:
```typescript
// Before
{ credits: 50, fish: { id: "f1", hunger: 100, health: 40 } }

// Action: feedFish("f1")
// After
{ credits: 49, fish: { id: "f1", hunger: 0, health: 40 } }
```

---

## 5. Selling Fish

### Action: `sellFish(fishId: string)`

**Purpose**: Sell a fish and receive credits based on value calculation.

**Preconditions**:
- Fish exists (alive or dead)

**Input**:
```typescript
{
  fishId: "550e8400-e29b-41d4-a716-446655440000" // UUID of fish
}
```

**Logic**:
1. Find fish by ID.
2. Calculate value:
   ```
   if (isAlive && health > 0):
     ageMultiplier = min(1 + (age / 300), 2.0)
     healthModifier = health / 100
     value = baseValue × ageMultiplier × healthModifier
   else:
     value = 0
   ```
3. Add value to `credits`.
4. Remove fish from `tank.fish`.

**Output**: Updated `IGameState` with fish removed and credits added

**Error Cases**:
- **Fish not found**: Reject with error "Fish not found".

**Example**:
```typescript
// Before (Guppy at age 120, health 90)
{ credits: 50, fish: { id: "f1", species: "GUPPY", age: 120, health: 90 } }

// Value = 50 × (1 + 120/300) × (90/100) = 50 × 1.4 × 0.9 = 63
// Action: sellFish("f1")
// After
{ credits: 113, tank: { fish: [] } }
```

---

## 6. Fish Selection (UI Helper)

### Action: `selectFish(fishId: string | null)`

**Purpose**: Select or deselect a fish for UI interaction.

**Preconditions**: None

**Input**:
```typescript
{
  fishId: "550e8400-e29b-41d4-a716-446655440000" // UUID or null to deselect
}
```

**Logic**:
1. Set `selectedFishId = fishId`.

**Output**: Updated `IGameState` with new selection

**Error Cases**: None (deselection always valid)

---

## 7. Query/Selector Contracts

These are **read-only selectors** (Zustand hooks) for UI components to access state without unnecessary re-renders.

### Selector: `selectGameState(state: IGameState)`
```typescript
// Returns: Full game state
return state;
```

### Selector: `selectCredits(state: IGameState)`
```typescript
// Returns: Current credits balance
return state.credits;
```

### Selector: `selectTankFish(state: IGameState)`
```typescript
// Returns: All living fish in tank
return state.tank.fish.filter(f => f.isAlive);
```

### Selector: `selectSelectedFish(state: IGameState)`
```typescript
// Returns: Currently selected fish or null
if (state.selectedFishId) {
  return state.tank.fish.find(f => f.id === state.selectedFishId);
}
return null;
```

### Selector: `selectStoreInventory(state: IGameState)`
```typescript
// Returns: Store items
return state.storeInventory;
```

---

## 8. Event Logging (Optional, Future)

For debugging and analytics, actions could emit events:

```typescript
type GameEvent = 
  | { type: "FISH_PURCHASED"; fishId: string; species: FishSpecies; cost: number; }
  | { type: "FISH_FED"; fishId: string; cost: number; }
  | { type: "FISH_SOLD"; fishId: string; value: number; }
  | { type: "FISH_DIED"; fishId: string; cause: "STARVATION" | "OTHER"; }
  | { type: "GAME_INITIALIZED"; }
  | { type: "TICK"; }
  | { type: "GAME_OVER"; }
```

MVP: Optional (no event logging required).

---

## 9. Error Handling

All actions return a **Result type** for error handling:

```typescript
type Result<T> = 
  | { success: true; data: T; }
  | { success: false; error: string; }

// Example usage
const result = store.feedFish("f1");
if (!result.success) {
  console.error(result.error); // "Not enough credits"
}
```

---

## 10. Store Hook Example

```typescript
// Zustand store definition
export const useGameStore = create<IGameState & {
  tick: () => void;
  buyFish: (storeItemId: string) => Result<void>;
  feedFish: (fishId: string) => Result<void>;
  sellFish: (fishId: string) => Result<void>;
  selectFish: (fishId: string | null) => void;
  togglePause: () => void;
  initializeGame: () => void;
}>((set, get) => ({
  // ... state
  tick: () => { /* logic */ },
  buyFish: (storeItemId) => { /* logic */ },
  feedFish: (fishId) => { /* logic */ },
  sellFish: (fishId) => { /* logic */ },
  selectFish: (fishId) => { /* logic */ },
  togglePause: () => { /* logic */ },
  initializeGame: () => { /* logic */ },
}));

// Usage in React component
export function GameHUD() {
  const credits = useGameStore(state => state.credits);
  const fish = useGameStore(state => state.tank.fish);
  const feedFish = useGameStore(state => state.feedFish);

  return (
    <div>
      <p>Credits: {credits}</p>
      <p>Fish: {fish.length}</p>
      <button onClick={() => feedFish("f1")}>Feed</button>
    </div>
  );
}
```

---

## Summary

| Action | Input | Output | Errors |
|--------|-------|--------|--------|
| `initializeGame()` | - | Full game state | - |
| `tick()` | - | Updated game state | - |
| `buyFish(itemId)` | Store item ID | Updated state | Credits, capacity, item not found |
| `feedFish(fishId)` | Fish ID | Updated state | Fish not found, dead, no credits |
| `sellFish(fishId)` | Fish ID | Updated state | Fish not found |
| `selectFish(fishId)` | Fish ID or null | Updated state | - |
| `togglePause()` | - | Updated pause flag | - |

---

## Next Steps

1. Implement types in `src/types/index.ts`.
2. Implement store actions in `src/store/useGameStore.ts`.
3. Write tests for each action in `tests/store.test.ts`.
