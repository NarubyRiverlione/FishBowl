import { StateCreator } from 'zustand'
import { IFishData } from '../../models/types/fish'

export interface FishState {
  fish: Record<string, IFishData>
  addFish: (fish: IFishData) => void
  removeFish: (id: string) => void
}

// allow unused get/api params required by zustand StateCreator signature
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createFishSlice: StateCreator<FishState> = (set, _get, _api) => ({
  fish: {},
  addFish: (newFish) => set((existingFish) => ({ fish: { ...existingFish.fish, [newFish.id]: newFish } })),
  removeFish: (removeFishId) =>
    set((existingFish) => {
      const next = { ...existingFish.fish }
      delete next[removeFishId]
      return { fish: next }
    }),
})

export default createFishSlice
