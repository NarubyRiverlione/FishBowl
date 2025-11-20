import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { createFishSlice, FishState } from './slices/fishSlice'
import { createTankSlice, TankState } from './slices/tankSlice'
import { createGameSlice, GameState } from './slices/gameSlice'

type StoreState = TankState & FishState & GameState

const useGameStore = create<StoreState>()(
  devtools((set, get, api) => ({
    ...createTankSlice(set, get, api),
    ...createFishSlice(set, get, api),
    ...createGameSlice(set, get, api),
  }))
)

export default useGameStore

// Selectors
export const selectCredits = (state: StoreState) => state.credits
export const selectTankFish = (state: StoreState) => state.tank?.fish || []
export const selectStoreInventory = (state: StoreState) => state.storeInventory
export const selectSelectedFish = (state: StoreState) =>
  state.selectedFishId && state.tank ? state.tank.fish.find((f) => f.id === state.selectedFishId) || null : null
