import { create } from 'zustand'
import { createFishSlice } from '../../src/store/slices/fishSlice'
import { createTankSlice } from '../../src/store/slices/tankSlice'
import { createGameSlice } from '../../src/store/slices/gameSlice'
import { selectCredits, selectTankFish, selectSelectedFish } from '../../src/store/useGameStore'
import { describe, expect, it } from 'vitest'

describe('useGameStore selectors and basic behaviors', () => {
  it('provides default credits and selectors work', () => {
    const useTestStore = create((set, get, api) => ({
      ...createTankSlice(set, get, api),
      ...createFishSlice(set, get, api),
      ...createGameSlice(set, get, api),
    }))

    const state = useTestStore.getState()

    expect(selectCredits(state)).toBeDefined()
    expect(selectCredits(state)).toBe(100)
    expect(selectTankFish(state)).toEqual([])
    expect(selectSelectedFish(state)).toBeNull()
  })
})
