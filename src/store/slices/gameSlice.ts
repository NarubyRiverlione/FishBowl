import { StateCreator } from 'zustand'
import { ITank, IStoreItem, UUID } from '../../models/types'
import { TankState } from './tankSlice'
import { FishService } from '../../services/FishService'
import { createDeveloperModeFish } from '../../lib/fishHelpers'
import {
  TICK_RATE_SECONDS,
  POLLUTION_PER_FISH_PER_TICK,
  FILTER_POLLUTION_REDUCTION_PER_TICK,
  MATURE_AGE_SECONDS,
  MATURITY_BONUS,
  GAME_DEV_MODE_CREDITS,
  GAME_INITIAL_CREDITS,
  TANK_CAPACITY_STANDARD,
  TANK_CAPACITY_BOWL,
  TANK_UPGRADED_WIDTH,
  TANK_UPGRADED_HEIGHT,
  TANK_DEFAULT_WIDTH,
  TANK_DEFAULT_HEIGHT,
  WATER_QUALITY_INITIAL,
  POLLUTION_INITIAL,
  TEMPERATURE_DEFAULT,
  PERCENTAGE_MAX,
} from '../../lib/constants'

export interface GameState {
  credits: number
  currentTick: number
  totalTime: number
  isPaused: boolean
  maturityBonusAwarded: boolean
  tutorialEnabled: boolean
  tutorialEvents: string[]
  storeInventory: IStoreItem[]
  selectedFishId: UUID | null
  gameStartedAt: number
  developerMode: boolean
  sellMode: boolean
  setSellMode: (enabled: boolean) => void

  isTutorialMode: () => boolean
  setMode: (mode: 'tutorial' | 'dev') => void
  initializeFromQuery: (qs?: string) => void

  tick: () => void
  setPaused: (paused: boolean) => void
  selectFish: (fishId: UUID | null) => void
  showTutorial: (eventId: string) => void
  dismissTutorial: (eventId: string) => void
}

// allow unused get/api params required by zustand StateCreator signature
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createGameSlice: StateCreator<GameState & TankState, [], [], GameState> = (set, get, _api) => ({
  credits: GAME_DEV_MODE_CREDITS,
  currentTick: 0,
  totalTime: 0,
  isPaused: false,
  maturityBonusAwarded: false,
  tutorialEnabled: true,
  tutorialEvents: [],
  storeInventory: [],
  selectedFishId: null,
  gameStartedAt: Date.now(),
  developerMode: false,
  sellMode: false,

  isTutorialMode: () => !get().developerMode,

  setMode: (mode) => {
    if (mode === 'dev') {
      set({ developerMode: true, credits: GAME_DEV_MODE_CREDITS, tutorialEnabled: false })

      // Set dev tank
      const maybeSetTank = (get() as unknown as { setTank?: (t: ITank) => void }).setTank
      if (typeof maybeSetTank === 'function') {
        const devFish = createDeveloperModeFish()
        const devTank: ITank = {
          id: 'dev-standard-tank',
          size: 'STANDARD',
          capacity: TANK_CAPACITY_STANDARD,
          waterQuality: WATER_QUALITY_INITIAL,
          pollution: POLLUTION_INITIAL,
          hasFilter: false,
          temperature: TEMPERATURE_DEFAULT,
          fish: devFish,
          createdAt: Date.now(),
          width: TANK_UPGRADED_WIDTH,
          height: TANK_UPGRADED_HEIGHT,
          backgroundColor: 0x87ceeb,
        }
        maybeSetTank(devTank)
      } else {
        console.error('❌ setTank function not available!')
      }
    } else {
      set({ developerMode: false, credits: GAME_INITIAL_CREDITS, tutorialEnabled: true })

      // Set default bowl tank
      const maybeSetTank = (get() as unknown as { setTank?: (t: ITank) => void }).setTank
      if (typeof maybeSetTank === 'function') {
        const bowlTank: ITank = {
          id: 'default-bowl-tank',
          size: 'BOWL',
          capacity: TANK_CAPACITY_BOWL,
          waterQuality: WATER_QUALITY_INITIAL,
          pollution: POLLUTION_INITIAL,
          hasFilter: false,
          temperature: TEMPERATURE_DEFAULT,
          fish: [],
          createdAt: Date.now(),
          width: TANK_DEFAULT_WIDTH,
          height: TANK_DEFAULT_HEIGHT,
          backgroundColor: 0x87ceeb,
        }
        maybeSetTank(bowlTank)
      }
    }
  },

  initializeFromQuery: (qs?: string) => {
    const search = qs ?? (typeof window !== 'undefined' ? window.location.search : '')
    const params = new URLSearchParams(search)

    const dev = params.get('dev') === 'true'
    const tutorialParam = params.get('tutorial')

    if (dev) {
      set({ developerMode: true, credits: GAME_DEV_MODE_CREDITS, tutorialEnabled: false })

      // If tank slice is present, set a STANDARD tank for dev convenience
      const maybeSetTank = (get() as unknown as { setTank?: (t: ITank) => void }).setTank
      if (typeof maybeSetTank === 'function') {
        const devFish = createDeveloperModeFish()
        const devTank: ITank = {
          id: 'dev-standard-tank',
          size: 'STANDARD',
          capacity: TANK_CAPACITY_STANDARD,
          waterQuality: WATER_QUALITY_INITIAL,
          pollution: POLLUTION_INITIAL,
          hasFilter: false,
          temperature: TEMPERATURE_DEFAULT,
          fish: devFish,
          createdAt: Date.now(),
          width: TANK_UPGRADED_WIDTH,
          height: TANK_UPGRADED_HEIGHT,
          backgroundColor: 0x87ceeb,
        }
        maybeSetTank(devTank)
      }
    } else {
      if (tutorialParam === 'false') {
        set({ tutorialEnabled: false })
      }
    }
  },

  tick: () => {
    const state = get()
    if (state.isPaused) return

    const newTick = state.currentTick + 1
    const newTotalTime = state.totalTime + TICK_RATE_SECONDS

    // Update fish in all tanks
    let bonusAwarded = state.maturityBonusAwarded
    let newCredits = state.credits

    const newTanks = state.tanks.map((tank) => {
      const livingFishCount = tank.fish.filter((f) => f.isAlive).length
      const pollutionIncrease = livingFishCount * POLLUTION_PER_FISH_PER_TICK
      const pollutionDecrease = tank.hasFilter ? FILTER_POLLUTION_REDUCTION_PER_TICK : 0

      const newPollution = Math.min(PERCENTAGE_MAX, Math.max(0, tank.pollution + pollutionIncrease - pollutionDecrease))
      const newWaterQuality = Math.max(0, PERCENTAGE_MAX - newPollution)

      const newFish = tank.fish.map((fish) => {
        if (!fish.isAlive) return fish

        // Check for maturity bonus
        if (!bonusAwarded && tank.size === 'BOWL' && fish.age >= MATURE_AGE_SECONDS) {
          bonusAwarded = true
          newCredits += MATURITY_BONUS
        }

        return FishService.tickFish(fish, newWaterQuality)
      })

      return {
        ...tank,
        fish: newFish,
        pollution: newPollution,
        waterQuality: newWaterQuality,
      }
    })

    // Sync selected tank
    const newSelectedTank = state.tank ? newTanks.find((t) => t.id === state.tank!.id) || state.tank : null

    set({
      currentTick: newTick,
      totalTime: newTotalTime,
      tanks: newTanks,
      tank: newSelectedTank,
      maturityBonusAwarded: bonusAwarded,
      credits: newCredits,
    })
  },

  setPaused: (paused) => set({ isPaused: paused }),

  selectFish: (fishId) => set({ selectedFishId: fishId }),

  setSellMode: (enabled) => set({ sellMode: enabled }),

  showTutorial: (eventId) => {
    const { tutorialEvents, tutorialEnabled } = get()
    if (tutorialEnabled && !tutorialEvents.includes(eventId)) {
      set({ tutorialEvents: [...tutorialEvents, eventId] })
    }
  },

  dismissTutorial: (eventId) => {
    const { tutorialEvents } = get()
    set({ tutorialEvents: tutorialEvents.filter((id) => id !== eventId) })
  },
})

export default createGameSlice
