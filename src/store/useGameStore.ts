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
