import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { createFishSlice, FishState } from './slices/fishSlice'
import { createTankSlice, TankState } from './slices/tankSlice'

type StoreState = TankState & FishState

const useGameStore = create<StoreState>()(
  devtools((set, get, api) => ({
    ...createTankSlice(set, get, api),
    ...createFishSlice(set, get, api),
  }))
)

export default useGameStore
