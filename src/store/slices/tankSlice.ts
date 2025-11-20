import { StateCreator } from 'zustand'
import { ITank } from '../../models/types/tank'

export interface TankState {
  tank: ITank | null
  setTank: (tank: ITank) => void
}

// allow unused get/api params required by zustand StateCreator signature
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createTankSlice: StateCreator<TankState> = (set, _get, _api) => ({
  tank: null,
  setTank: (tank: ITank) => set({ tank }),
})

export default createTankSlice
