import { describe, it, expect, beforeEach } from 'vitest'
import useGameStore from '../../src/store/useGameStore'

describe('Game mode helpers', () => {
  beforeEach(() => {
    // reset store to defaults
    useGameStore.setState({ credits: 50, tutorialEnabled: true, developerMode: false })
    useGameStore.getState().setTank?.({
      id: 'reset-tank',
      size: 'BOWL',
      capacity: 1,
      waterQuality: 100,
      pollution: 0,
      hasFilter: false,
      temperature: 24,
      fish: [],
      createdAt: Date.now(),
      geometry: {
        width: 300,
        height: 300,
        centerX: 150,
        centerY: 150,
      },
      floor: {
        visible: false,
        type: 'invisible',
        geometry: {
          x: 0,
          y: 299,
          width: 300,
          height: 1,
        },
        restitution: 0.2,
        friction: 0.002,
      },
      backgroundColor: 0x87ceeb,
    })
  })

  it('setMode("tutorial") enables tutorial and provides a BOWL tank', () => {
    const store = useGameStore.getState()
    store.setMode?.('tutorial')

    const s = useGameStore.getState()
    expect(s.developerMode).toBe(false)
    expect(s.tutorialEnabled).toBe(true)
    expect(s.credits).toBe(100)
    expect(s.isTutorialMode?.()).toBe(true)
    expect(s.tank).toBeDefined()
    expect(s.tank?.size).toBe('BOWL')
    expect(s.tank?.capacity).toBe(2)
  })

  it('setMode("dev") disables tutorial and provides a STANDARD tank with elevated credits', () => {
    const store = useGameStore.getState()
    store.setMode?.('dev')

    const s = useGameStore.getState()
    expect(s.developerMode).toBe(true)
    expect(s.tutorialEnabled).toBe(false)
    expect(s.credits).toBe(1000)
    expect(s.isTutorialMode?.()).toBe(false)
    expect(s.tank).toBeDefined()
    expect(s.tank?.size).toBe('STANDARD')
    expect(s.tank?.capacity).toBe(15)
  })
})
