# Quickstart: Core Game Mechanics (MVP)

**Date**: 2025-11-19  
**Feature**: 001-core-mechanics  
**Target**: First-time developer setup

---

## Overview

This guide walks you through setting up the FishBowl project and implementing the first feature: **Core Game Mechanics (MVP)**.

**What you'll build**:

- A game loop that ticks at 1 second intervals.
- Fish entities with hunger, health, and aging.
- A store to buy and sell fish.
- Economy system with credits.

**Expected time**: 2-4 hours for experienced TypeScript/React developers.

---

## Prerequisites

- **Node.js**: v18+
- **pnpm**: v8+
- **Knowledge**: TypeScript, React, Zustand (optional but helpful)

---

## Step 1: Environment Setup

### 1.1 Install dependencies

```bash
cd /Users/renaat/Development-Eigen/FishBowl
pnpm install
```

### 1.2 Verify installation

```bash
pnpm --version
npm run dev    # Should start without errors (may show empty app)
npm run lint   # Should pass with no warnings
npm run test   # Should run, tests may not exist yet
```

---

## Step 2: Create Type Definitions

### 2.1 Create `src/types/index.ts`

This is the contract layer. All entities are defined here.

**What to implement**:

```typescript
// src/types/index.ts

// ============================================
// Primitives
// ============================================

export type UUID = string
export type Timestamp = number // milliseconds since epoch

// ============================================
// Enums
// ============================================

export enum FishSpecies {
  GUPPY = 'GUPPY',
  GOLDFISH = 'GOLDFISH',
  TETRA = 'TETRA',
  BETTA = 'BETTA',
}

// Base stats for each species
export const FISH_SPECIES_CONFIG: Record<
  FishSpecies,
  {
    baseValue: number
    minSize: number
    maxSize: number
    hungerRate: number
  }
> = {
  [FishSpecies.GUPPY]: {
    baseValue: 50,
    minSize: 0.5,
    maxSize: 1.0,
    hungerRate: 1,
  },
  [FishSpecies.GOLDFISH]: {
    baseValue: 100,
    minSize: 1.0,
    maxSize: 2.0,
    hungerRate: 2,
  },
  [FishSpecies.TETRA]: {
    baseValue: 60,
    minSize: 0.4,
    maxSize: 0.8,
    hungerRate: 1,
  },
  [FishSpecies.BETTA]: {
    baseValue: 150,
    minSize: 0.8,
    maxSize: 1.5,
    hungerRate: 1.5,
  },
}

// ============================================
// Core Interfaces
// ============================================

export interface IFish {
  id: UUID
  species: FishSpecies
  name: string
  color: string // Hex color
  size: number // 0.5-2.0
  age: number // Seconds
  health: number // 0-100
  hunger: number // 0-100
  isAlive: boolean
  genetics: Record<string, unknown> // Reserved for Phase 2
  createdAt: Timestamp
  lastFedAt: Timestamp
}

export interface ITank {
  id: UUID
  capacity: number
  waterQuality: number // 0-100
  temperature: number // Celsius
  fish: IFish[]
  createdAt: Timestamp
}

export interface IStoreItem {
  id: string
  type: 'FISH' | 'FOOD' | 'EQUIPMENT'
  name: string
  description: string
  cost: number
  quantity: number // -1 = unlimited
  species?: FishSpecies
}

export interface IGameState {
  currentTick: number
  totalTime: number
  isPaused: boolean
  tank: ITank
  credits: number
  storeInventory: IStoreItem[]
  selectedFishId: UUID | null
  gameStartedAt: Timestamp
}

// ============================================
// Result Type (for error handling)
// ============================================

export type Result<T> = { success: true; data: T } | { success: false; error: string }
```

**Checklist**:

- [ ] File created at `src/types/index.ts`
- [ ] All enums and interfaces defined
- [ ] `FISH_SPECIES_CONFIG` includes all 4 species
- [ ] No `any` types used

---

### 2.2 Verify types compile

```bash
npx tsc --noEmit  # Should pass with no errors
```

---

## Step 3: Create Services (Business Logic)

Services contain pure logic, independent of React or UI. They're easy to test.

### 3.1 Create `src/services/FishService.ts`

```typescript
// src/services/FishService.ts

import { IFish, UUID, FishSpecies, FISH_SPECIES_CONFIG } from '../types'

export class FishService {
  /**
   * Create a new fish with initial stats.
   */
  static createFish(species: FishSpecies, color: string, name: string): IFish {
    return {
      id: this.generateUUID(),
      species,
      name,
      color,
      size: FISH_SPECIES_CONFIG[species].minSize,
      age: 0,
      health: 80,
      hunger: 0,
      isAlive: true,
      genetics: {},
      createdAt: Date.now(),
      lastFedAt: Date.now(),
    }
  }

  /**
   * Update fish state for one tick.
   */
  static tickFish(fish: IFish): IFish {
    if (!fish.isAlive) {
      return fish
    }

    const config = FISH_SPECIES_CONFIG[fish.species]
    let newHealth = fish.health
    let newHunger = Math.min(fish.hunger + config.hungerRate, 100)

    // Starvation: if very hungry, health decreases
    if (newHunger >= 80 && newHealth > 0) {
      newHealth -= 1
    }

    // Death check
    const isAlive = newHealth > 0

    return {
      ...fish,
      age: fish.age + 1,
      hunger: newHunger,
      health: Math.max(newHealth, 0),
      isAlive,
    }
  }

  /**
   * Reduce hunger for a fish by 30 points (used by feedTank action).
   */
  static reduceFishHunger(fish: IFish, amount: number = 30): IFish {
    if (!fish.isAlive) {
      throw new Error('Cannot feed dead fish')
    }

    return {
      ...fish,
      hunger: 0,
      lastFedAt: Date.now(),
    }
  }

  /**
   * Calculate the value of a fish based on species, age, and health.
   */
  static calculateFishValue(fish: IFish): number {
    if (!fish.isAlive || fish.health === 0) {
      return 0
    }

    const config = FISH_SPECIES_CONFIG[fish.species]
    const baseValue = config.baseValue

    // Age multiplier: 1.0 at age 0, max 2.0 at age 300 (5 minutes)
    const ageMultiplier = Math.min(1 + fish.age / 300, 2.0)

    // Health modifier: 0-1 based on health
    const healthModifier = fish.health / 100

    return Math.round(baseValue * ageMultiplier * healthModifier)
  }

  private static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }
}
```

**Checklist**:

- [ ] File created at `src/services/FishService.ts`
- [ ] All methods implemented
- [ ] Methods are pure (no side effects)

### 3.2 Create `src/services/EconomyService.ts`

```typescript
// src/services/EconomyService.ts

import { IGameState, IFish, UUID, Result } from '../types'
import { FishService } from './FishService'

export class EconomyService {
  /**
   * Attempt to buy a fish from the store.
   */
  static buyFish(state: IGameState, storeItemId: string): Result<IGameState> {
    const item = state.storeInventory.find((i) => i.id === storeItemId)

    if (!item) {
      return { success: false, error: 'Store item not found' }
    }

    if (item.type !== 'FISH') {
      return { success: false, error: 'Item is not a fish' }
    }

    if (state.credits < item.cost) {
      return { success: false, error: 'Insufficient credits' }
    }

    if (state.tank.fish.length >= state.tank.capacity) {
      return { success: false, error: 'Tank is at capacity' }
    }

    const newFish = FishService.createFish(item.species!, this.randomColor(), `${item.name}-${state.currentTick}`)

    return {
      success: true,
      data: {
        ...state,
        credits: state.credits - item.cost,
        tank: {
          ...state.tank,
          fish: [...state.tank.fish, newFish],
        },
      },
    }
  }

  /**
   * Attempt to sell a fish.
   */
  static sellFish(state: IGameState, fishId: UUID): Result<IGameState> {
    const fish = state.tank.fish.find((f) => f.id === fishId)

    if (!fish) {
      return { success: false, error: 'Fish not found' }
    }

    const value = FishService.calculateFishValue(fish)

    return {
      success: true,
      data: {
        ...state,
        credits: state.credits + value,
        tank: {
          ...state.tank,
          fish: state.tank.fish.filter((f) => f.id !== fishId),
        },
      },
    }
  }

  /**
   * Attempt to feed a fish.
   */
  static feedFish(state: IGameState, fishId: UUID): Result<IGameState> {
    if (state.credits < 1) {
      return { success: false, error: 'Insufficient credits for feeding' }
    }

    const fish = state.tank.fish.find((f) => f.id === fishId)

    if (!fish) {
      return { success: false, error: 'Fish not found' }
    }

    if (!fish.isAlive) {
      return { success: false, error: 'Cannot feed dead fish' }
    }

    const fedFish = FishService.feedFish(fish)

    return {
      success: true,
      data: {
        ...state,
        credits: state.credits - 1,
        tank: {
          ...state.tank,
          fish: state.tank.fish.map((f) => (f.id === fishId ? fedFish : f)),
        },
      },
    }
  }

  private static randomColor(): string {
    const hue = Math.floor(Math.random() * 360)
    const saturation = 70 + Math.floor(Math.random() * 20)
    const lightness = 50 + Math.floor(Math.random() * 20)
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }
}
```

**Checklist**:

- [ ] File created at `src/services/EconomyService.ts`
- [ ] All methods return `Result<T>`
- [ ] Error cases handled

### 3.3 Create `src/services/GameLoopService.ts`

```typescript
// src/services/GameLoopService.ts

import { IGameState } from '../types'
import { FishService } from './FishService'

export class GameLoopService {
  /**
   * Advance the game by one tick.
   */
  static tickGame(state: IGameState): IGameState {
    if (state.isPaused) {
      return state
    }

    // Update all fish
    const updatedFish = state.tank.fish.map((fish) => FishService.tickFish(fish))

    // Remove dead fish
    const livingFish = updatedFish.filter((f) => f.isAlive)

    return {
      ...state,
      currentTick: state.currentTick + 1,
      totalTime: (state.currentTick + 1) * 1, // 1 second per tick
      tank: {
        ...state.tank,
        fish: livingFish,
      },
    }
  }

  /**
   * Initialize a new game.
   */
  static initializeGame(): IGameState {
    const now = Date.now()

    return {
      currentTick: 0,
      totalTime: 0,
      isPaused: false,
      tank: {
        id: this.generateUUID(),
        capacity: 10,
        waterQuality: 90,
        temperature: 24,
        fish: [],
        createdAt: now,
      },
      credits: 100,
      storeInventory: [
        {
          id: 'fish-guppy',
          type: 'FISH',
          name: 'Guppy',
          description: 'Small, colorful fish',
          cost: 50,
          quantity: -1,
          species: 'GUPPY',
        },
        {
          id: 'fish-goldfish',
          type: 'FISH',
          name: 'Goldfish',
          description: 'Classic goldfish',
          cost: 100,
          quantity: -1,
          species: 'GOLDFISH',
        },
        {
          id: 'food-bulk',
          type: 'FOOD',
          name: 'Bulk Food',
          description: 'Feed your fish',
          cost: 1,
          quantity: -1,
        },
      ],
      selectedFishId: null,
      gameStartedAt: now,
    }
  }

  private static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }
}
```

**Checklist**:

- [ ] File created at `src/services/GameLoopService.ts`
- [ ] `tickGame()` updates all fish and removes dead ones
- [ ] `initializeGame()` creates starting state with 100 credits

---

## Step 4: Create Zustand Store

### 4.1 Create `src/store/useGameStore.ts`

```typescript
// src/store/useGameStore.ts

import { create } from 'zustand'
import { IGameState, UUID, Result } from '../types'
import { GameLoopService } from '../services/GameLoopService'
import { EconomyService } from '../services/EconomyService'

interface GameStoreActions {
  tick: () => void
  initializeGame: () => void
  togglePause: () => void
  buyFish: (storeItemId: string) => Result<void>
  feedFish: (fishId: UUID) => Result<void>
  sellFish: (fishId: UUID) => Result<void>
  selectFish: (fishId: UUID | null) => void
}

type GameStore = IGameState & GameStoreActions

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state (can be replaced by initializeGame)
  currentTick: 0,
  totalTime: 0,
  isPaused: false,
  tank: { id: '', capacity: 0, waterQuality: 0, temperature: 0, fish: [], createdAt: 0 },
  credits: 0,
  storeInventory: [],
  selectedFishId: null,
  gameStartedAt: 0,

  // Actions
  initializeGame: () => {
    const initialState = GameLoopService.initializeGame()
    set(initialState)
  },

  tick: () => {
    const state = get()
    const newState = GameLoopService.tickGame(state)
    set(newState)
  },

  togglePause: () => {
    set((state) => ({ isPaused: !state.isPaused }))
  },

  buyFish: (storeItemId: string) => {
    const state = get()
    const result = EconomyService.buyFish(state, storeItemId)
    if (result.success) {
      set(result.data)
    }
    return result
  },

  feedFish: (fishId: UUID) => {
    const state = get()
    const result = EconomyService.feedFish(state, fishId)
    if (result.success) {
      set(result.data)
    }
    return result
  },

  sellFish: (fishId: UUID) => {
    const state = get()
    const result = EconomyService.sellFish(state, fishId)
    if (result.success) {
      set(result.data)
    }
    return result
  },

  selectFish: (fishId: UUID | null) => {
    set({ selectedFishId: fishId })
  },
}))

// Selectors
export const selectGameState = (state: GameStore) => state
export const selectCredits = (state: GameStore) => state.credits
export const selectTankFish = (state: GameStore) => state.tank.fish
export const selectSelectedFish = (state: GameStore) => {
  if (!state.selectedFishId) return null
  return state.tank.fish.find((f) => f.id === state.selectedFishId) || null
}
export const selectCurrentTick = (state: GameStore) => state.currentTick
export const selectStoreInventory = (state: GameStore) => state.storeInventory
```

**Checklist**:

- [ ] File created at `src/store/useGameStore.ts`
- [ ] All actions delegated to services
- [ ] Selectors defined for UI components

---

## Step 5: Write Tests (TDD)

### 5.1 Create `tests/services/FishService.test.ts`

```typescript
// tests/services/FishService.test.ts

import { describe, it, expect } from 'vitest'
import { FishService } from '../../src/services/FishService'
import { FishSpecies } from '../../src/types'

describe('FishService', () => {
  it('should create a fish with initial stats', () => {
    const fish = FishService.createFish(FishSpecies.GUPPY, '#FF0000', 'Bubbles')
    expect(fish.species).toBe(FishSpecies.GUPPY)
    expect(fish.age).toBe(0)
    expect(fish.health).toBe(80)
    expect(fish.hunger).toBe(0)
    expect(fish.isAlive).toBe(true)
  })

  it('should increase age and hunger on tick', () => {
    const fish = FishService.createFish(FishSpecies.GUPPY, '#FF0000', 'Bubbles')
    const tickedFish = FishService.tickFish(fish)
    expect(tickedFish.age).toBe(1)
    expect(tickedFish.hunger).toBe(1)
    expect(tickedFish.health).toBe(80)
  })

  it('should cause health loss when starving', () => {
    let fish = FishService.createFish(FishSpecies.GUPPY, '#FF0000', 'Bubbles')
    // Simulate 80 ticks to reach hunger threshold
    for (let i = 0; i < 80; i++) {
      fish = FishService.tickFish(fish)
    }
    expect(fish.hunger).toBe(100) // Clamped
    expect(fish.health).toBe(80) // Not dead yet

    // One more tick should reduce health
    fish = FishService.tickFish(fish)
    expect(fish.health).toBe(79)
  })

  it('should mark fish as dead when health reaches 0', () => {
    let fish = FishService.createFish(FishSpecies.GUPPY, '#FF0000', 'Bubbles')
    // Starvation for 100+ ticks
    for (let i = 0; i < 100; i++) {
      fish = FishService.tickFish(fish)
    }
    expect(fish.isAlive).toBe(false)
    expect(fish.health).toBe(0)
  })

  it('should reset hunger when fed', () => {
    let fish = FishService.createFish(FishSpecies.GUPPY, '#FF0000', 'Bubbles')
    fish.hunger = 50
    const fedFish = FishService.feedFish(fish)
    expect(fedFish.hunger).toBe(0)
  })

  it('should calculate fish value based on age and health', () => {
    const fish = FishService.createFish(FishSpecies.GUPPY, '#FF0000', 'Bubbles')
    fish.age = 120
    fish.health = 90
    const value = FishService.calculateFishValue(fish)
    // Expected: 50 * 1.4 * 0.9 = 63
    expect(value).toBe(63)
  })

  it('should return 0 value for dead fish', () => {
    const fish = FishService.createFish(FishSpecies.GUPPY, '#FF0000', 'Bubbles')
    fish.isAlive = false
    fish.health = 0
    const value = FishService.calculateFishValue(fish)
    expect(value).toBe(0)
  })
})
```

### 5.2 Run tests

```bash
pnpm test
```

**Expected**: All tests pass.

---

## Step 6: Create a Simple React Component

### 6.1 Create `src/components/GameHUD.tsx`

```typescript
// src/components/GameHUD.tsx

import React from "react";
import { useGameStore, selectCredits, selectTankFish, selectCurrentTick } from "../store/useGameStore";

export function GameHUD() {
  const credits = useGameStore(selectCredits);
  const fish = useGameStore(selectTankFish);
  const tick = useGameStore(selectCurrentTick);
  const initializeGame = useGameStore(state => state.initializeGame);
  const buyFish = useGameStore(state => state.buyFish);
  const tick_action = useGameStore(state => state.tick);

  React.useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>FishBowl MVP</h1>
      <p><strong>Credits:</strong> {credits}</p>
      <p><strong>Tick:</strong> {tick}</p>
      <p><strong>Fish:</strong> {fish.length}</p>

      <button onClick={() => buyFish("fish-guppy")}>Buy Guppy (50 credits)</button>
      <button onClick={() => tick_action()}>Tick</button>

      <div style={{ marginTop: "20px" }}>
        <h3>Fish</h3>
        {fish.map(f => (
          <div key={f.id} style={{ padding: "10px", border: "1px solid gray", marginTop: "10px" }}>
            <p><strong>{f.name}</strong> ({f.species})</p>
            <p>Age: {f.age}s | Health: {f.health} | Hunger: {f.hunger}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 6.2 Update `src/App.tsx`

```typescript
// src/App.tsx

import { GameHUD } from "./components/GameHUD";

function App() {
  return <GameHUD />;
}

export default App;
```

---

## Step 7: Verify Everything Works

### 7.1 Run dev server

```bash
pnpm dev
```

You should see a basic UI with:

- Credits: 100
- Tick: 0
- Fish: 0
- "Buy Guppy" button

### 7.2 Test manually

1. Click "Buy Guppy" → credits drop to 50, fish count increases to 1.
2. Click "Tick" 10 times → fish age and hunger increase.
3. Refresh page → game state is lost (MVP has no persistence).

### 7.3 Run linter

```bash
pnpm lint
```

Should pass with no warnings.

### 7.4 Run tests

```bash
pnpm test
```

Should pass all tests.

---

## Step 8: Add Game Loop Timer (Optional)

To make the game loop run automatically without clicking "Tick" each time:

```typescript
// src/components/GameHUD.tsx (addition)

React.useEffect(() => {
  const interval = setInterval(() => {
    tick_action()
  }, 1000) // Tick every 1 second

  return () => clearInterval(interval)
}, [tick_action])
```

---

## Checklist for Completion

- [ ] Types defined in `src/types/index.ts`
- [ ] Services implemented (Fish, Economy, GameLoop)
- [ ] Zustand store created with actions
- [ ] Tests written and passing
- [ ] React component displays game state
- [ ] `pnpm lint` passes with 0 warnings
- [ ] `pnpm test` passes
- [ ] Dev server runs without errors

---

## Common Issues & Fixes

### Issue: `Cannot find module 'zustand'`

**Fix**: `pnpm install zustand`

### Issue: TypeScript errors in tests

**Fix**: Ensure `tests/` directory has `tsconfig.json` or is configured in root `tsconfig.json`.

### Issue: Store not updating in React

**Fix**: Ensure selectors are used correctly:

```typescript
const credits = useGameStore((state) => state.credits) // ✅ Correct
const state = useGameStore() // ❌ Returns entire state, every change causes re-render
```

---

## Next Steps

1. **Add Pixi.js rendering** to visualize fish in the tank.
2. **Add feeding UI** to feed individual fish.
3. **Add selling UI** to sell fish and track economics.
4. **Implement water quality system** (Phase 2).
5. **Add breeding mechanics** (Phase 2).

---

## Resources

- **Zustand Docs**: https://github.com/pmndrs/zustand
- **React Docs**: https://react.dev
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/

---

**Good luck! 🐠**
