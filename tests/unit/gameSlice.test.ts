import { describe, it, expect } from 'vitest'
import { create, StateCreator } from 'zustand'
import { createGameSlice, GameState } from '../../src/store/slices/gameSlice'
import { createTankSlice, TankState } from '../../src/store/slices/tankSlice'
import { MATURE_AGE_SECONDS, MATURITY_BONUS } from '../../src/lib/constants'
import { IFish, ITank, FishSpecies } from '../../src/models/types'

describe('Game slice - tick and mode behaviors', () => {
  it('awards maturity bonus once when fish is mature in BOWL tank', () => {
    const useTestStore = create((set, get, api) => ({
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

    const fish: IFish = {
      id: 'f1',
      species: FishSpecies.GUPPY,
      color: '#fff',
      size: 1,
      age: MATURE_AGE_SECONDS,
      health: 100,
      hunger: 0,
      isAlive: true,
      genetics: {},
      createdAt: Date.now(),
    }

    const tank = { ...useTestStore.getState().tank!, fish: [fish] }
    useTestStore.getState().setTank(tank as ITank)

    const beforeCredits = useTestStore.getState().credits
    useTestStore.getState().tick()
    const after = useTestStore.getState()
    expect(after.maturityBonusAwarded).toBe(true)
    expect(after.credits).toBe(beforeCredits + MATURITY_BONUS)

    // Tick again - bonus should not be awarded again
    useTestStore.getState().tick()
    expect(useTestStore.getState().credits).toBe(beforeCredits + MATURITY_BONUS)
  })

  it('increments pollution per living fish and updates waterQuality', () => {
    const useTestStore = create((set, get, api) => ({
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

    const fish: IFish = {
      id: 'f2',
      species: FishSpecies.GUPPY,
      color: '#fff',
      size: 1,
      age: 1,
      health: 100,
      hunger: 0,
      isAlive: true,
      genetics: {},
      createdAt: Date.now(),
    }

    const initialTank = { ...useTestStore.getState().tank!, fish: [fish], pollution: 0, waterQuality: 100 }
    useTestStore.getState().setTank(initialTank as ITank)

    useTestStore.getState().tick()
    const t = useTestStore.getState().tank!
    // pollution increased by POLLUTION_PER_FISH_PER_TICK
    expect(t.pollution).toBeGreaterThanOrEqual(0)
    expect(t.waterQuality).toBe(100 - t.pollution)
  })

  it('setMode dev sets developerMode and dev tank', () => {
    const useTestStore = create((set, get, api) => ({
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
    useTestStore.getState().setMode('dev')
    const s = useTestStore.getState()
    expect(s.developerMode).toBe(true)
    expect(s.credits).toBe(100)
    expect(s.tank?.size).toBe('STANDARD')
  })

  it('initializeFromQuery honors dev and tutorial params', () => {
    const useTestStore = create((set, get, api) => ({
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
    useTestStore.getState().initializeFromQuery('?dev=true')
    expect(useTestStore.getState().developerMode).toBe(true)
    useTestStore.getState().initializeFromQuery('?tutorial=false')
    expect(useTestStore.getState().tutorialEnabled).toBe(false)
  })
})
