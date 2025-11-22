import { describe, it, expect, beforeEach } from 'vitest'
import useGameStore from '../../src/store/useGameStore'

describe('Developer Mode Initialization Integration', () => {
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
    expect(state.credits).toBe(1000)
    expect(state.tutorialEnabled).toBe(false)
    expect(state.tank).toBeDefined()
    expect(state.tank?.size).toBe('STANDARD')
    expect(state.tank?.capacity).toBe(15)

    // Verify dev mode creates fish of all species and age groups
    expect(state.tank?.fish).toBeDefined()
    expect(state.tank?.fish.length).toBe(12) // 4 species x 3 age groups

    // Check that we have fish of all different ages
    const ages = state.tank?.fish.map((f) => f.age).sort((a, b) => a - b)
    expect(ages).toContain(50) // young
    expect(ages).toContain(200) // mature
    expect(ages).toContain(400) // old
  })

  it('honors tutorial=false query param when not in dev mode', () => {
    useGameStore.getState().initializeFromQuery?.('?tutorial=false')
    const state = useGameStore.getState()
    expect(state.tutorialEnabled).toBe(false)
  })
})
