import { StateCreator } from 'zustand'
import { ITank } from '../../models/types'

export interface GameState {
  credits: number
  tutorialEnabled: boolean
  developerMode: boolean
  // Alias/utility: returns true when the game is in normal/tutorial mode
  isTutorialMode: () => boolean
  // Helper to set mode explicitly: 'tutorial' for normal mode, 'dev' for developer mode
  setMode: (mode: 'tutorial' | 'dev') => void
  initializeFromQuery: (qs?: string) => void
}

// allow unused get/api params required by zustand StateCreator signature
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createGameSlice: StateCreator<GameState> = (set, get, _api) => ({
  credits: 50,
  tutorialEnabled: true,
  developerMode: false,

  initializeFromQuery: (qs?: string) => {
    const search = qs ?? (typeof window !== 'undefined' ? window.location.search : '')
    const params = new URLSearchParams(search)

    const dev = params.get('dev') === 'true'
    const tutorialParam = params.get('tutorial')

    if (dev) {
      // Developer mode: higher starting credits, standard tank, tutorial off
      set({ developerMode: true, credits: 100, tutorialEnabled: false })

      // If tank slice is present, set a STANDARD tank for dev convenience
      const maybeSetTank = (get() as unknown as { setTank?: (t: ITank) => void }).setTank
      if (typeof maybeSetTank === 'function') {
        const devTank: ITank = {
          id: 'dev-standard-tank',
          size: 'STANDARD',
          capacity: 10,
          waterQuality: 100,
          pollution: 0,
          hasFilter: false,
          temperature: 24,
          fish: [],
          createdAt: Date.now(),
        }
        maybeSetTank(devTank)
      }
      return
    }

    if (tutorialParam === 'false') {
      set({ tutorialEnabled: false })
    }
  },
  isTutorialMode: () => {
    // Tutorial mode is enabled when tutorialEnabled is true and developerMode is false
    const s = get() as unknown as GameState
    return !!s.tutorialEnabled && !s.developerMode
  },
  setMode: (mode: 'tutorial' | 'dev') => {
    if (mode === 'dev') {
      // enable developer mode and set dev STANDARD tank
      set({ developerMode: true, credits: 100, tutorialEnabled: false })
      const maybeSetTank = (get() as unknown as { setTank?: (t: ITank) => void }).setTank
      if (typeof maybeSetTank === 'function') {
        const devTank: ITank = {
          id: 'dev-standard-tank',
          size: 'STANDARD',
          capacity: 10,
          waterQuality: 100,
          pollution: 0,
          hasFilter: false,
          temperature: 24,
          fish: [],
          createdAt: Date.now(),
        }
        maybeSetTank(devTank)
      }
      return
    }

    // tutorial mode: normal startup with a BOWL tank
    set({ developerMode: false, tutorialEnabled: true, credits: 50 })
    const maybeSetTank = (get() as unknown as { setTank?: (t: ITank) => void }).setTank
    if (typeof maybeSetTank === 'function') {
      const bowlTank: ITank = {
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
      maybeSetTank(bowlTank)
    }
  },
})

export default createGameSlice
