import { describe, it, expect } from 'vitest'
import { create, StateCreator } from 'zustand'
import { createGameSlice, GameState } from '../../src/store/slices/gameSlice'
import { createTankSlice, TankState } from '../../src/store/slices/tankSlice'
import { FEED_BASE_COST, FEED_PER_FISH_COST, CLEAN_COST, FILTER_COST, TANK_UPGRADE_COST } from '../../src/lib/constants'
import { IFishData, ITankData, FishSpecies } from '../../src/models/types'

describe('Tank slice actions', () => {
  it('feedTank deducts cost and increases pollution', () => {
    const useTestStore = create<GameState & TankState>((set, get, api) => ({
      ...createTankSlice(
        set as Parameters<StateCreator<GameState & TankState>>[0],
        get as Parameters<StateCreator<GameState & TankState>>[1],
        api as Parameters<StateCreator<GameState & TankState>>[2]
      ),
      ...createGameSlice(
        set as Parameters<StateCreator<GameState & TankState>>[0],
        get as Parameters<StateCreator<GameState & TankState>>[1],
        api as Parameters<StateCreator<GameState & TankState>>[2]
      ),
    }))
    const fish: IFishData = {
      id: 'f1',
      species: FishSpecies.GUPPY,
      color: '#000',
      size: 1,
      age: 1,
      health: 100,
      hunger: 50,
      isAlive: true,
      genetics: {},
      createdAt: Date.now(),
      geometry: {
        position: { x: 100, y: 100 },
        velocity: { vx: 0, vy: 0 },
        radius: 10,
      },
    }
    const tank = { ...useTestStore.getState().tank!, fish: [fish], pollution: 0, waterQuality: 100 }
    useTestStore.getState().setTank(tank as ITankData)

    const cost = FEED_BASE_COST + 1 * FEED_PER_FISH_COST
    const beforeCredits = useTestStore.getState().credits
    useTestStore.getState().feedTank(tank.id)
    const s = useTestStore.getState()
    expect(s.credits).toBe(beforeCredits - cost)
    expect(s.tank!.pollution).toBeGreaterThan(0)
  })

  it('cleanTank reduces pollution and deducts credits when affordable', () => {
    const useTestStore = create<GameState & TankState>((set, get, api) => ({
      ...createTankSlice(
        set as Parameters<StateCreator<GameState & TankState>>[0],
        get as Parameters<StateCreator<GameState & TankState>>[1],
        api as Parameters<StateCreator<GameState & TankState>>[2]
      ),
      ...createGameSlice(
        set as Parameters<StateCreator<GameState & TankState>>[0],
        get as Parameters<StateCreator<GameState & TankState>>[1],
        api as Parameters<StateCreator<GameState & TankState>>[2]
      ),
    }))
    const tank = { ...useTestStore.getState().tank!, pollution: 50, waterQuality: 50 }
    useTestStore.getState().setTank(tank as ITankData)

    const beforeCredits = useTestStore.getState().credits
    useTestStore.getState().cleanTank(tank.id)
    const s = useTestStore.getState()
    expect(s.credits).toBe(beforeCredits - CLEAN_COST)
    expect(s.tank!.pollution).toBeLessThanOrEqual(50)
    expect(s.tank!.waterQuality).toBeGreaterThanOrEqual(50)
  })

  it('buyFilter requires STANDARD tank and sufficient credits', () => {
    const useTestStore = create<GameState & TankState>((set, get, api) => ({
      ...createTankSlice(
        set as Parameters<StateCreator<GameState & TankState>>[0],
        get as Parameters<StateCreator<GameState & TankState>>[1],
        api as Parameters<StateCreator<GameState & TankState>>[2]
      ),
      ...createGameSlice(
        set as Parameters<StateCreator<GameState & TankState>>[0],
        get as Parameters<StateCreator<GameState & TankState>>[1],
        api as Parameters<StateCreator<GameState & TankState>>[2]
      ),
    }))
    // create a STANDARD tank
    const standardTank = { ...useTestStore.getState().tank!, size: 'STANDARD', hasFilter: false }
    useTestStore.getState().setTank(standardTank as ITankData)

    const beforeCredits = useTestStore.getState().credits
    useTestStore.getState().buyFilter(standardTank.id)
    const s = useTestStore.getState()
    // if affordable, credits reduced and hasFilter true
    if (beforeCredits >= FILTER_COST) {
      expect(s.credits).toBe(beforeCredits - FILTER_COST)
      expect(s.tank!.hasFilter).toBe(true)
    } else {
      expect(s.tank!.hasFilter).toBe(false)
    }
  })

  it('upgradeTank turns BOWL into STANDARD when affordable', () => {
    const useTestStore = create<GameState & TankState>((set, get, api) => ({
      ...createTankSlice(
        set as Parameters<StateCreator<GameState & TankState>>[0],
        get as Parameters<StateCreator<GameState & TankState>>[1],
        api as Parameters<StateCreator<GameState & TankState>>[2]
      ),
      ...createGameSlice(
        set as Parameters<StateCreator<GameState & TankState>>[0],
        get as Parameters<StateCreator<GameState & TankState>>[1],
        api as Parameters<StateCreator<GameState & TankState>>[2]
      ),
    }))
    const bowlTank = { ...useTestStore.getState().tank!, size: 'BOWL' }
    useTestStore.getState().setTank(bowlTank as ITankData)

    const beforeCredits = useTestStore.getState().credits
    useTestStore.getState().upgradeTank(bowlTank.id)
    const s = useTestStore.getState()
    if (beforeCredits >= TANK_UPGRADE_COST) {
      expect(s.credits).toBe(beforeCredits - TANK_UPGRADE_COST)
      expect(s.tank!.size).toBe('STANDARD')
    } else {
      expect(s.tank!.size).toBe('BOWL')
    }
  })
})
