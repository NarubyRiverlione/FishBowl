import { describe, it, expect, beforeEach } from 'vitest'
import useGameStore from '../../src/store/useGameStore'

describe('Multi-tank support', () => {
  beforeEach(() => {
    // reset tanks state
    useGameStore.setState({ tanks: [], tank: null, selectedTankId: null })
  })

  it('can add multiple tanks and select between them', () => {
    const store = useGameStore.getState()

    const tankA = {
      id: 'tank-a',
      size: 'BOWL',
      capacity: 1,
      waterQuality: 100,
      pollution: 0,
      hasFilter: false,
      temperature: 24,
      fish: [],
      createdAt: Date.now(),
    }

    const tankB = {
      id: 'tank-b',
      size: 'STANDARD',
      capacity: 15,
      waterQuality: 100,
      pollution: 0,
      hasFilter: false,
      temperature: 24,
      fish: [],
      createdAt: Date.now(),
    }

    store.addOrSelectTank?.(tankA)
    let s = useGameStore.getState()
    expect(s.tanks.length).toBe(1)
    expect(s.tank?.id).toBe('tank-a')
    expect(s.selectedTankId).toBe('tank-a')

    store.addOrSelectTank?.(tankB)
    s = useGameStore.getState()
    expect(s.tanks.length).toBe(2)
    // addOrSelectTank selects the tank that was added
    expect(s.tank?.id).toBe('tank-b')
    expect(s.selectedTankId).toBe('tank-b')

    // select back to first tank
    store.selectTank?.('tank-a')
    s = useGameStore.getState()
    expect(s.tank?.id).toBe('tank-a')
    expect(s.selectedTankId).toBe('tank-a')
  })

  it('setTanks replaces array and selects first', () => {
    const store = useGameStore.getState()
    const t1 = {
      id: 't1',
      size: 'BOWL',
      capacity: 1,
      waterQuality: 100,
      pollution: 0,
      hasFilter: false,
      temperature: 24,
      fish: [],
      createdAt: Date.now(),
    }
    const t2 = {
      id: 't2',
      size: 'STANDARD',
      capacity: 15,
      waterQuality: 100,
      pollution: 0,
      hasFilter: false,
      temperature: 24,
      fish: [],
      createdAt: Date.now(),
    }

    store.setTanks?.([t1, t2])
    const s = useGameStore.getState()
    expect(s.tanks.length).toBe(2)
    expect(s.tank?.id).toBe('t1')
    expect(s.selectedTankId).toBe('t1')
  })

  it('setTank upserts and selects', () => {
    const store = useGameStore.getState()
    const t = {
      id: 'upsert',
      size: 'BOWL',
      capacity: 1,
      waterQuality: 100,
      pollution: 0,
      hasFilter: false,
      temperature: 24,
      fish: [],
      createdAt: Date.now(),
    }

    store.setTank?.(t)
    let s = useGameStore.getState()
    expect(s.tanks.find((x) => x.id === 'upsert')).toBeTruthy()
    expect(s.tank?.id).toBe('upsert')

    // update same id
    const t2 = { ...t, capacity: 5 }
    store.setTank?.(t2)
    s = useGameStore.getState()
    const found = s.tanks.find((x) => x.id === 'upsert')
    expect(found?.capacity).toBe(5)
    expect(s.tank?.capacity).toBe(5)
  })
})
