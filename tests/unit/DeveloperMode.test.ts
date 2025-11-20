import { describe, it, expect, beforeEach } from 'vitest'
import useGameStore from '../../src/store/useGameStore'

describe('Developer Mode initialization', () => {
  beforeEach(() => {
    // reset relevant parts of the store to defaults
    const store = useGameStore.getState()
    store.setTank?.({
      id: 'reset-tank',
      size: 'BOWL',
      capacity: 1,
      waterQuality: 100,
      pollution: 0,
      hasFilter: false,
      temperature: 24,
      fish: [],
      createdAt: Date.now(),
    })
    // reset credits/tutorial/developerMode
    useGameStore.setState({ credits: 50, tutorialEnabled: true, developerMode: false })
  })

  it('enables developer mode and sets starting state when ?dev=true', () => {
    useGameStore.getState().initializeFromQuery?.('?dev=true')
    const state = useGameStore.getState()

    expect(state.developerMode).toBe(true)
    expect(state.credits).toBe(100)
    expect(state.tutorialEnabled).toBe(false)
    expect(state.tank).toBeDefined()
    expect(state.tank?.size).toBe('STANDARD')
    expect(state.tank?.capacity).toBe(10)
  })

  it('honors tutorial=false query param when not in dev mode', () => {
    useGameStore.getState().initializeFromQuery?.('?tutorial=false')
    const state = useGameStore.getState()
    expect(state.tutorialEnabled).toBe(false)
  })
})
