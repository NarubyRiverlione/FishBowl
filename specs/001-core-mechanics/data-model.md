# Data Model: Core Game Mechanics (MVP)

**Date**: 2025-11-19  
**Feature**: 001-core-mechanics  
**Status**: Complete

---

## 1. Domain Entities

### 1.1 Fish (`IFish`)

**Purpose**: Represents a single fish in the tank with genetics, stats, and lifecycle.

**Fields**:

| Field | Type | Range | Notes |
|-------|------|-------|-------|
| `id` | `string` (UUID) | - | Unique identifier for the fish |
| `species` | `FishSpecies` enum | `GUPPY \| GOLDFISH \| TETRA \| ...` | Determines base stats and breeding traits |
| `name` | `string` | 1-20 chars | Optional display name |
| `color` | `string` | Hex color | RGB values, used for rendering |
| `size` | `number` | 0.5-2.0 | Multiplier for rendering scale; grows with age |
| `age` | `number` | 0-∞ seconds | Increments per tick; affects value and maturity |
| `health` | `number` | 0-100 | Decreases when starving; reaches 0 = death |
| `hunger` | `number` | 0-100 | Increases per tick; above 80 causes health loss |
| `isAlive` | `boolean` | true \| false | Set to false when health reaches 0 |
| `genetics` | `IGeneticMarkers` (future) | - | Reserved for breeding/mutations (Phase 2) |
| `createdAt` | `timestamp` | - | Unix milliseconds; used for value calculation |
| `lastFedAt` | `timestamp` | - | Unix milliseconds; used for hunger reset |

**State Transitions**:

```
SPAWNED → LIVING → STARVING → DEAD
  ↑        ↓↑       ↓↑         ↓
  |   age++, hunger++, health--
  |   (when hungry ≥ 80)
  └── (on feed action)
```

**Validation Rules**:

- `id` must be a valid UUID v4.
- `species` must be defined in `FishSpecies` enum.
- `health` and `hunger` are always between 0-100 (clamped).
- `isAlive = false` implies `health = 0`.
- `size` must be > 0.
- `age` is never negative.

**Example Instance**:

```typescript
{
  id: "550e8400-e29b-41d4-a716-446655440000",
  species: "GUPPY",
  name: "Bubbles",
  color: "#FF6B9D",
  size: 1.0,
  age: 120,
  health: 85,
  hunger: 45,
  isAlive: true,
  genetics: {},
  createdAt: 1731866134949,
  lastFedAt: 1731866094949
}
```

---

### 1.2 Tank (`ITank`)

**Purpose**: Container for fish, tracks environment and capacity.

**Fields**:

| Field | Type | Range | Notes |
|-------|------|-------|-------|
| `id` | `string` (UUID) | - | Unique identifier for the tank |
| `capacity` | `number` | 1-100 | Max fish allowed in tank |
| `waterQuality` | `number` | 0-100 | Health of environment; affects fish health (future) |
| `temperature` | `number` | 0-40 °C | Tank temperature; affects metabolism (future) |
| `fish` | `IFish[]` | - | List of living fish in tank |
| `createdAt` | `timestamp` | - | When tank was created |

**Validation Rules**:

- `id` must be a valid UUID v4.
- `capacity` ≥ 1.
- `waterQuality` is clamped to 0-100.
- `temperature` is clamped to 0-40.
- `fish.length ≤ capacity`.
- Cannot add more fish if `fish.length === capacity`.

**Example Instance**:

```typescript
{
  id: "660e8400-e29b-41d4-a716-446655440001",
  capacity: 10,
  waterQuality: 85,
  temperature: 24,
  fish: [ /* IFish instances */ ],
  createdAt: 1731866134949
}
```

---

### 1.3 Game State (`IGameState`)

**Purpose**: Represents the entire game simulation state and lifecycle.

**Fields**:

| Field | Type | Notes |
|-------|------|-------|
| `currentTick` | `number` | 0-based tick counter |
| `totalTime` | `number` | Total seconds elapsed (currentTick × 1) |
| `isPaused` | `boolean` | If true, no ticks are processed |
| `tank` | `ITank` | Primary player tank |
| `credits` | `number` | AquaCredits balance (currency) |
| `storeInventory` | `IStoreItem[]` | Items available for purchase |
| `selectedFishId` | `string \| null` | Currently selected fish (for UI) |
| `gameStartedAt` | `timestamp` | When game was initialized |

**Example Instance**:

```typescript
{
  currentTick: 420,
  totalTime: 420,
  isPaused: false,
  tank: { /* ITank */ },
  credits: 75,
  storeInventory: [ { species: "GUPPY", cost: 50 }, ... ],
  selectedFishId: "550e8400-...",
  gameStartedAt: 1731866134949
}
```

---

## 2. Enumerations

### FishSpecies

```typescript
enum FishSpecies {
  GUPPY = "GUPPY",
  GOLDFISH = "GOLDFISH",
  TETRA = "TETRA",
  BETTA = "BETTA",
  // ... more species in Phase 2
}
```

**Base Stats** (used in value calculation):

| Species | Base Value | Size Range | Health | Hunger Rate |
|---------|------------|------------|--------|-------------|
| GUPPY | 50 | 0.5-1.0 | 80 | 1/tick |
| GOLDFISH | 100 | 1.0-2.0 | 80 | 2/tick |
| TETRA | 60 | 0.4-0.8 | 75 | 1/tick |
| BETTA | 150 | 0.8-1.5 | 90 | 1.5/tick |

---

### Store Item

```typescript
interface IStoreItem {
  id: string;
  type: "FISH" | "FOOD" | "EQUIPMENT";
  name: string;
  description: string;
  cost: number;
  quantity: number; // -1 = unlimited
  species?: FishSpecies; // If type == "FISH"
}
```

**Initial Store Inventory** (MVP):

```typescript
[
  { id: "fish-guppy", type: "FISH", name: "Guppy", cost: 50, quantity: -1, species: "GUPPY" },
  { id: "fish-goldfish", type: "FISH", name: "Goldfish", cost: 100, quantity: -1, species: "GOLDFISH" },
  { id: "food-bulk", type: "FOOD", name: "Bulk Food", cost: 1, quantity: -1 }
]
```

---

## 3. Business Rules & Calculations

### 3.1 Fish Value Calculation

**Formula**:
```
value = baseValue × ageMultiplier × healthModifier

ageMultiplier = min(1 + (age / 300), 2.0)  // Caps at 2x after 5 minutes
healthModifier = health / 100               // 0-1 based on health
```

**Example**:
- Guppy (base = 50) at age 120s, health 90:
  - ageMultiplier = 1 + (120 / 300) = 1.4
  - healthModifier = 90 / 100 = 0.9
  - **value = 50 × 1.4 × 0.9 = 63 credits**

---

### 3.2 Hunger Mechanics

**Per-Tick Behavior**:

1. **Hunger increases**: `hunger += speciesHungerRate` (clamped to max 100).
2. **Starvation check**: If `hunger ≥ 80`, then `health -= 1` (per tick).
3. **Death check**: If `health ≤ 0`, mark fish as dead.

**Feed Action**:

- **Cost**: 1 credit (deducted from player balance).
- **Effect**: Set `hunger = 0`, `lastFedAt = now`.
- **Preconditions**: Fish must be alive, player must have ≥ 1 credit.
- **Result**: Prevents starvation if done in time.

---

### 3.3 Economy Rules

**Starting State**:
- Player starts with 100 AquaCredits.
- Tank starts with capacity 10, empty.

**Buy Fish**:
- **Cost**: Varies by species (50-150 credits).
- **Preconditions**: Player has enough credits, tank not full.
- **Result**: Fish spawned in tank with `age = 0`, `health = 80`, `hunger = 0`.

**Feed Fish**:
- **Cost**: 1 credit per fish.
- **Preconditions**: Player has ≥ 1 credit, fish alive.
- **Result**: `hunger = 0`.

**Sell Fish**:
- **Cost**: None (player gains value).
- **Preconditions**: Fish alive or dead (no value if dead).
- **Result**: Fish removed from tank, player gains calculated credits.

---

## 4. Constraints & Edge Cases

### Tank Capacity
- Tank can hold up to 10 fish (MVP).
- Cannot buy or breed beyond capacity.
- If full, show error message.

### Fish Death
- When `health = 0`, mark `isAlive = false`.
- Dead fish cannot be fed or bred.
- Dead fish can be sold for 0 credits (cleanup action).
- Remove dead fish from tank after 1 tick (grace period for UI).

### Starvation Timeline (Example: Guppy)
- Hunger increases 1/tick → reaches 80 after 80 ticks (80 seconds).
- Health starts at 80 (newborn) or varies (older).
- At 80 hunger, health decreases 1/tick → death in 80-100 ticks (1.3-1.6 min).
- **Player window to react**: ~2 minutes before death.

### Game Over Condition (Future)
- If all fish die AND player has 0 credits → game over.
- Option: Offer "pity" loan or restart.
- **MVP**: No explicit game over; player can restart manually.

---

## 5. Data Persistence

### MVP (No Persistence)
- State is stored only in memory (Zustand store).
- Refreshing the page resets the game.
- **Rationale**: Simplifies testing, allows rapid iteration.

### Future (Phase 2)
- Serialize state to `localStorage`.
- On app load, deserialize and restore.
- Implement offline time progression (optional).

---

## 6. Type Definitions Summary

```typescript
// Core types
type UUID = string;
type Timestamp = number; // milliseconds
type Credits = number;

// Enums
enum FishSpecies { GUPPY, GOLDFISH, TETRA, BETTA }

// Interfaces
interface IFish {
  id: UUID;
  species: FishSpecies;
  name?: string;
  color: string;
  size: number; // 0.5-2.0
  age: number;
  health: number; // 0-100
  hunger: number; // 0-100
  isAlive: boolean;
  genetics: Record<string, unknown>; // Future
  createdAt: Timestamp;
  lastFedAt: Timestamp;
}

interface ITank {
  id: UUID;
  capacity: number;
  waterQuality: number; // 0-100
  temperature: number; // 0-40 °C
  fish: IFish[];
  createdAt: Timestamp;
}

interface IGameState {
  currentTick: number;
  totalTime: number;
  isPaused: boolean;
  tank: ITank;
  credits: Credits;
  storeInventory: IStoreItem[];
  selectedFishId?: UUID;
  gameStartedAt: Timestamp;
}

interface IStoreItem {
  id: string;
  type: "FISH" | "FOOD" | "EQUIPMENT";
  name: string;
  description: string;
  cost: number;
  quantity: number; // -1 = unlimited
  species?: FishSpecies;
}
```

---

## 7. Relationships & Diagrams

### Entity Relationship Diagram

```
┌─────────────┐
│  GameState  │
├─────────────┤
│ currentTick │◄──────┐
│ credits     │       │
│ isPaused    │       │
└─────────────┘       │
       │              │
       ├─ Tank ───────┘ (1-to-1)
       │
       └─ StoreInventory (1-to-many)

┌─────────────┐
│    Tank     │
├─────────────┤
│ capacity    │
│ waterQuality│
│ temperature │
└─────────────┘
       │
       └─ Fish[] (1-to-many)

┌─────────────┐
│    Fish     │
├─────────────┤
│ age         │
│ health      │
│ hunger      │
│ isAlive     │
└─────────────┘
```

---

## 8. State Mutation Timeline (Example: First 2 Minutes)

**Time**: T=0 (Game Start)

```
GameState:
  currentTick: 0
  credits: 100
  tank: { fish: [] }
```

**Action**: Player buys Guppy

```
GameState:
  credits: 50 (100 - 50)
  tank: { 
    fish: [
      { id: "uuid1", species: "GUPPY", age: 0, health: 80, hunger: 0 }
    ]
  }
```

**T=80 (after 80 ticks)**

```
Fish: {
  age: 80,
  hunger: 80 (1/tick × 80),
  health: 80 (still OK)
}
```

**T=120 (after 120 ticks, 2 minutes)**

```
Fish: {
  age: 120,
  hunger: 100 (clamped),
  health: 60 (80 - 20 from 40 ticks of starvation)
}
```

**Player Action**: Feed at T=120

```
Fish: {
  hunger: 0,
  health: 60
}
```

**T=300 (after 300 ticks, 5 minutes)**

```
Fish: {
  age: 300,
  hunger: 100 (clamped again),
  health: 0 → isAlive: false (starvation from unfed)
}
```

**Player Action**: Sell Fish

```
Value = 50 × min(1 + 300/300, 2.0) × (0/100)
      = 50 × 2.0 × 0
      = 0 (dead fish)

Credits: 50 + 0 = 50
```

---

## 9. Validation & Invariants

**Must Always Be True**:

1. `fish.length ≤ tank.capacity`
2. `0 ≤ fish.health ≤ 100` for all fish
3. `0 ≤ fish.hunger ≤ 100` for all fish
4. `isAlive = false` ⟹ `health = 0`
5. `credits ≥ 0` (never negative, purchase rejected if insufficient)
6. `allDeadFish.health = 0`

---

## Next Steps (Phase 1 → Phase 2)

1. Create `contracts/` directory with API specs.
2. Generate `quickstart.md` with development setup.
3. Begin implementation in `src/types/` (type definitions).
4. Create `src/models/Fish.ts` and `src/models/Tank.ts`.
5. Create `src/services/` business logic layer.
