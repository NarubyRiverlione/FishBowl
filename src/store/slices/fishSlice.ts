import { StateCreator } from 'zustand'
import { IFish } from '../../models/types/fish'

export interface FishState {
  fish: Record<string, IFish>
  addFish: (fish: IFish) => void
  removeFish: (id: string) => void
}

// allow unused get/api params required by zustand StateCreator signature
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createFishSlice: StateCreator<FishState> = (set, _get, _api) => ({
  fish: {},
  addFish: (fish) => set((s) => ({ fish: { ...s.fish, [fish.id]: fish } })),
  removeFish: (id) =>
    set((s) => {
      const next = { ...s.fish }
      delete next[id]
      return { fish: next }
    }),
})

export default createFishSlice
