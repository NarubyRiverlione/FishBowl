import { describe, it, expect, beforeEach } from 'vitest'
import useGameStore from '../../src/store/useGameStore'
import type { ITankData } from '../../src/models/types'

describe('Multi-tank support', () => {
  beforeEach(() => {
    // reset tanks state
    useGameStore.setState({ tanks: [], tank: null, selectedTankId: null })
  })

  it('can add multiple tanks and select between them', () => {
    const store = useGameStore.getState()

    const tankA: ITankData = {
      id: 'tank-a',
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
      backgroundColor: 0x87ceeb,
      floor: {
        visible: true,
        type: 'pebble',
        geometry: {
          x: 0,
          y: 290,
          width: 300,
          height: 10,
        },
        restitution: 0.3,
        friction: 0.5,
      },
    }

    const tankB: ITankData = {
      id: 'tank-b',
      size: 'STANDARD',
      capacity: 15,
      waterQuality: 100,
      pollution: 0,
      hasFilter: false,
      temperature: 24,
      fish: [],
      createdAt: Date.now(),
      geometry: {
        width: 600,
        height: 600,
        centerX: 300,
        centerY: 300,
      },
      backgroundColor: 0x87ceeb,
      floor: {
        visible: true,
        type: 'pebble',
        geometry: {
          x: 0,
          y: 590,
          width: 600,
          height: 10,
        },
        restitution: 0.3,
        friction: 0.5,
      },
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
    const t1: ITankData = {
      id: 't1',
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
      backgroundColor: 0x87ceeb,
      floor: {
        visible: true,
        type: 'pebble',
        geometry: {
          x: 0,
          y: 290,
          width: 300,
          height: 10,
        },
        restitution: 0.3,
        friction: 0.5,
      },
    }
    const t2: ITankData = {
      id: 't2',
      size: 'STANDARD',
      capacity: 15,
      waterQuality: 100,
      pollution: 0,
      hasFilter: false,
      temperature: 24,
      fish: [],
      createdAt: Date.now(),
      geometry: {
        width: 600,
        height: 600,
        centerX: 300,
        centerY: 300,
      },
      backgroundColor: 0x87ceeb,
      floor: {
        visible: true,
        type: 'pebble',
        geometry: {
          x: 0,
          y: 590,
          width: 600,
          height: 10,
        },
        restitution: 0.3,
        friction: 0.5,
      },
    }

    store.setTanks?.([t1, t2])
    const s = useGameStore.getState()
    expect(s.tanks.length).toBe(2)
    expect(s.tank?.id).toBe('t1')
    expect(s.selectedTankId).toBe('t1')
  })

  it('setTank upserts and selects', () => {
    const store = useGameStore.getState()
    const t: ITankData = {
      id: 'upsert',
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
      backgroundColor: 0x87ceeb,
      floor: {
        visible: true,
        type: 'pebble',
        geometry: {
          x: 0,
          y: 290,
          width: 300,
          height: 10,
        },
        restitution: 0.3,
        friction: 0.5,
      },
    }

    store.setTank?.(t)
    let s = useGameStore.getState()
    expect(s.tanks.find((x) => x.id === 'upsert')).toBeTruthy()
    expect(s.tank?.id).toBe('upsert')

    // update same id
    const t2: ITankData = { ...t, capacity: 5 }
    store.setTank?.(t2)
    s = useGameStore.getState()
    const found = s.tanks.find((x) => x.id === 'upsert')
    expect(found?.capacity).toBe(5)
    expect(s.tank?.capacity).toBe(5)
  })
})
