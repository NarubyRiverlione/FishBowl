import { StateCreator } from 'zustand'
import { ITankData, FishSpecies, UUID } from '../../models/types'
import { GameState } from './gameSlice'
import { EconomyService } from '../../services/EconomyService'
import { FishService } from '../../services/FishService'
import {
  POLLUTION_PER_FEEDING,
  FEED_BASE_COST,
  FEED_PER_FISH_COST,
  CLEAN_COST,
  CLEAN_POLLUTION_REDUCTION,
  FILTER_COST,
  TANK_UPGRADE_COST,
  TANK_CAPACITY_STANDARD,
  TANK_CAPACITY_BOWL,
  TANK_BOWL_SIZE,
  TANK_UPGRADED_WIDTH,
  TANK_UPGRADED_HEIGHT,
  WATER_QUALITY_INITIAL,
  POLLUTION_INITIAL,
  TEMPERATURE_DEFAULT,
  PERCENTAGE_MAX,
} from '../../lib/constants'

export interface TankState {
  /** Array of tanks (multi-tank support) */
  tanks: ITankData[]
  /** Convenience: currently selected tank for backwards compatibility */
  tank: ITankData | null
  /** Selected tank id */
  selectedTankId?: string | null
  /** Replace the whole tanks array */
  setTanks: (tanks: ITankData[]) => void
  /** Add or upsert a tank and make it selected */
  addOrSelectTank: (tank: ITankData) => void
  /** Select a tank by id */
  selectTank: (id: string) => void
  /** Set the selected tank (backwards-compatible API) */
  setTank: (tank: ITankData) => void

  // New actions
  feedTank: (tankId: UUID) => void
  cleanTank: (tankId: UUID) => void
  buyFilter: (tankId: UUID) => void
  upgradeTank: (tankId: UUID) => void
  buyFish: (tankId: UUID, species: FishSpecies) => void
  sellFish: (tankId: UUID, fishId: UUID) => void
}

// allow unused get/api params required by zustand StateCreator signature
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createTankSlice: StateCreator<TankState & GameState, [], [], TankState> = (set, get, _api) => {
  // create a default BOWL tank
  const defaultTank: ITankData = {
    id: 'default-bowl-tank',
    size: 'BOWL',
    capacity: TANK_CAPACITY_BOWL,
    waterQuality: WATER_QUALITY_INITIAL,
    pollution: POLLUTION_INITIAL,
    hasFilter: false,
    temperature: TEMPERATURE_DEFAULT,
    fish: [],
    createdAt: Date.now(),
    geometry: {
      width: TANK_BOWL_SIZE,
      height: TANK_BOWL_SIZE,
      centerX: TANK_BOWL_SIZE / 2,
      centerY: TANK_BOWL_SIZE / 2,
    },
    backgroundColor: 0x87ceeb, // Sky blue
  }

  return {
    tanks: [defaultTank],
    tank: defaultTank,
    selectedTankId: defaultTank.id,

    setTanks: (tanks: ITankData[]) => {
      const first = tanks && tanks.length > 0 ? tanks[0] : null
      set({ tanks, tank: first, selectedTankId: first?.id ?? null })
    },

    addOrSelectTank: (tank: ITankData) => {
      const current = get()
      const existing = current.tanks.find((t) => t.id === tank.id)
      if (existing) {
        set({ selectedTankId: tank.id, tank: existing })
      } else {
        set({ tanks: [...current.tanks, tank], selectedTankId: tank.id, tank })
      }
    },

    selectTank: (id: string) => {
      const current = get()
      const target = current.tanks.find((t) => t.id === id)
      if (target) {
        set({ selectedTankId: id, tank: target })
      }
    },

    setTank: (tank: ITankData) => {
      const current = get()
      const exists = current.tanks.some((t) => t.id === tank.id)
      if (exists) {
        set((state) => ({
          tanks: state.tanks.map((t) => (t.id === tank.id ? tank : t)),
          tank,
          selectedTankId: tank.id,
        }))
      } else {
        set((state) => ({
          tanks: [...state.tanks, tank],
          tank,
          selectedTankId: tank.id,
        }))
      }
    },

    feedTank: (tankId: UUID) => {
      set((state) => {
        const tankIndex = state.tanks.findIndex((t) => t.id === tankId)
        if (tankIndex === -1) return state
        const tank = state.tanks[tankIndex]
        if (!tank) return state

        const livingFish = tank.fish.filter((f) => f.isAlive)
        const cost = FEED_BASE_COST + livingFish.length * FEED_PER_FISH_COST

        if (state.credits < cost) return state

        const updatedFish = tank.fish.map((fish) => {
          return FishService.feedFish(fish)
        })

        const updatedTank = {
          ...tank,
          fish: updatedFish,
          pollution: Math.min(PERCENTAGE_MAX, tank.pollution + POLLUTION_PER_FEEDING),
          waterQuality: Math.max(0, tank.waterQuality - POLLUTION_PER_FEEDING),
        }

        const newTanks = [...state.tanks]
        newTanks[tankIndex] = updatedTank

        return {
          credits: state.credits - cost,
          tanks: newTanks,
          tank: state.tank?.id === tankId ? updatedTank : state.tank,
        }
      })
    },
    cleanTank: (tankId: UUID) => {
      set((state) => {
        const tankIndex = state.tanks.findIndex((t) => t.id === tankId)
        if (tankIndex === -1) return state
        const tank = state.tanks[tankIndex]
        if (!tank) return state

        const cost = CLEAN_COST
        if (state.credits < cost) return state

        const newPollution = Math.max(0, tank.pollution - CLEAN_POLLUTION_REDUCTION)
        const newWaterQuality = Math.min(PERCENTAGE_MAX, tank.waterQuality + CLEAN_POLLUTION_REDUCTION)

        const updatedTank = {
          ...tank,
          pollution: newPollution,
          waterQuality: newWaterQuality,
        }

        const newTanks = [...state.tanks]
        newTanks[tankIndex] = updatedTank

        return {
          credits: state.credits - cost,
          tanks: newTanks,
          tank: state.tank?.id === tankId ? updatedTank : state.tank,
        }
      })
    },
    buyFilter: (tankId: UUID) => {
      set((state) => {
        const tankIndex = state.tanks.findIndex((t) => t.id === tankId)
        if (tankIndex === -1) return state
        const tank = state.tanks[tankIndex]
        if (!tank) return state

        // Preconditions: Standard tank, no filter yet, enough credits
        if (tank.size !== 'STANDARD') return state
        if (tank.hasFilter) return state
        if (state.credits < FILTER_COST) return state

        const updatedTank = {
          ...tank,
          hasFilter: true,
        }

        const newTanks = [...state.tanks]
        newTanks[tankIndex] = updatedTank

        return {
          credits: state.credits - FILTER_COST,
          tanks: newTanks,
          tank: state.tank?.id === tankId ? updatedTank : state.tank,
        }
      })
    },
    upgradeTank: (tankId: UUID) => {
      set((state) => {
        const tankIndex = state.tanks.findIndex((t) => t.id === tankId)
        if (tankIndex === -1) return state
        const tank = state.tanks[tankIndex]
        if (!tank) return state

        // Preconditions: BOWL tank, enough credits
        if (tank.size !== 'BOWL') return state
        if (state.credits < TANK_UPGRADE_COST) return state

        const updatedTank = {
          ...tank,
          size: 'STANDARD',
          capacity: TANK_CAPACITY_STANDARD,
          geometry: {
            width: TANK_UPGRADED_WIDTH,
            height: TANK_UPGRADED_HEIGHT,
            centerX: TANK_UPGRADED_WIDTH / 2,
            centerY: TANK_UPGRADED_HEIGHT / 2,
          },
        } as ITankData // Cast to ensure type safety if needed, though should be inferred

        const newTanks = [...state.tanks]
        newTanks[tankIndex] = updatedTank

        return {
          credits: state.credits - TANK_UPGRADE_COST,
          tanks: newTanks,
          tank: state.tank?.id === tankId ? updatedTank : state.tank,
        }
      })
    },
    buyFish: (tankId, species) => {
      const state = get()
      const tank = state.tanks.find((t) => t.id === tankId)
      if (!tank) return

      console.log('🛒 buyFish called for species:', species, 'in tank:', tankId)
      if (EconomyService.canBuyFish(state.credits, tank, species)) {
        const cost = EconomyService.getFishCost(species)
        const newFish = FishService.createFish(species)
        console.log('💰 Buying fish:', { id: newFish.id, species: newFish.species, cost })

        // Update credits
        set((s) => ({ credits: s.credits - cost }))

        // Update tank
        const updatedTank = { ...tank, fish: [...tank.fish, newFish] }
        console.log('🏠 Tank updated with new fish. Total fish:', updatedTank.fish.length)
        get().setTank(updatedTank)
      } else {
        console.warn('❌ Cannot buy fish - not enough credits or tank full')
      }
    },
    sellFish: (tankId: UUID, fishId: UUID) => {
      set((state) => {
        const tankIndex = state.tanks.findIndex((t) => t.id === tankId)
        if (tankIndex === -1) return state
        const tank = state.tanks[tankIndex]
        if (!tank) return state

        const fishIndex = tank.fish.findIndex((f) => f.id === fishId)
        if (fishIndex === -1) return state
        const fish = tank.fish[fishIndex]
        if (!fish) return state

        const value = FishService.calculateFishValue(fish)

        const newFishList = [...tank.fish]
        newFishList.splice(fishIndex, 1)

        const updatedTank = {
          ...tank,
          fish: newFishList,
        }

        const newTanks = [...state.tanks]
        newTanks[tankIndex] = updatedTank

        return {
          credits: state.credits + value,
          tanks: newTanks,
          tank: state.tank?.id === tankId ? updatedTank : state.tank,
        }
      })
    },
  }
}
