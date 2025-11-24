import { create } from 'zustand'
import { createFishSlice } from '../../src/store/slices/fishSlice'
import { createTankSlice } from '../../src/store/slices/tankSlice'
import { createGameSlice } from '../../src/store/slices/gameSlice'
import { selectCredits, selectTankFish, selectSelectedFish } from '../../src/store/useGameStore'
import { describe, expect, it } from 'vitest'
import type { TankState } from '../../src/store/slices/tankSlice'
import type { FishState } from '../../src/store/slices/fishSlice'
import type { GameState } from '../../src/store/slices/gameSlice'

type StoreState = TankState & FishState & GameState

describe('useGameStore selectors and basic behaviors', () => {
  it('provides default credits and selectors work', () => {
    const useTestStore = create<StoreState>((set, get, api) => ({
      ...createTankSlice(set as never, get as never, api as never),
      ...createFishSlice(set as never, get as never, api as never),
      ...createGameSlice(set as never, get as never, api as never),
    }))

    const state = useTestStore.getState()

    expect(selectCredits(state)).toBeDefined()
    expect(selectCredits(state)).toBe(100)
    expect(selectTankFish(state)).toEqual([])
    expect(selectSelectedFish(state)).toBeNull()
  })
})
