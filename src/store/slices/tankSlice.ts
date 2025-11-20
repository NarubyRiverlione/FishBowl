import { StateCreator } from 'zustand'
import { ITank } from '../../models/types'

export interface TankState {
  /** Array of tanks (multi-tank support) */
  tanks: ITank[]
  /** Convenience: currently selected tank for backwards compatibility */
  tank: ITank | null
  /** Selected tank id */
  selectedTankId?: string | null
  /** Replace the whole tanks array */
  setTanks: (tanks: ITank[]) => void
  /** Add or upsert a tank and make it selected */
  addOrSelectTank: (tank: ITank) => void
  /** Select a tank by id */
  selectTank: (id: string) => void
  /** Set the selected tank (backwards-compatible API) */
  setTank: (tank: ITank) => void
}

// allow unused get/api params required by zustand StateCreator signature
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createTankSlice: StateCreator<TankState> = (set, get, _api) => {
  // create a default BOWL tank
  const defaultTank: ITank = {
    id: 'default-bowl-tank',
    size: 'BOWL',
    capacity: 1,
    waterQuality: 100,
    pollution: 0,
    hasFilter: false,
    temperature: 24,
    fish: [],
    createdAt: Date.now(),
  }

  return {
    tanks: [defaultTank],
    tank: defaultTank,
    selectedTankId: defaultTank.id,

    setTanks: (tanks: ITank[]) => {
      const first = tanks && tanks.length > 0 ? tanks[0] : null
      set({ tanks, tank: first, selectedTankId: first?.id ?? null })
    },

    addOrSelectTank: (tank: ITank) => {
      const current = get()
      const existing = current.tanks.find((t) => t.id === tank.id)
      if (existing) {
        // replace existing tank
        const updated = current.tanks.map((t) => (t.id === tank.id ? tank : t))
        set({ tanks: updated, tank, selectedTankId: tank.id })
      } else {
        set({ tanks: [...current.tanks, tank], tank, selectedTankId: tank.id })
      }
    },

    selectTank: (id: string) => {
      const current = get()
      const found = current.tanks.find((t) => t.id === id) ?? null
      set({ tank: found, selectedTankId: found?.id ?? null })
    },

    // Backwards-compatible setter: upsert and select
    setTank: (tank: ITank) => {
      const current = get()
      const exists = current.tanks.some((t) => t.id === tank.id)
      if (exists) {
        const updated = current.tanks.map((t) => (t.id === tank.id ? tank : t))
        set({ tanks: updated, tank, selectedTankId: tank.id })
      } else {
        set({ tanks: [...current.tanks, tank], tank, selectedTankId: tank.id })
      }
    },
  }
}

export default createTankSlice
