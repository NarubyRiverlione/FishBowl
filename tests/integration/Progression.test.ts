import { describe, it, expect, beforeEach } from 'vitest'
import useGameStore from '../../src/store/useGameStore'
import { FishSpecies } from '../../src/models/types'
import { MATURE_AGE_SECONDS, MATURITY_BONUS, TANK_UPGRADE_COST, TANK_CAPACITY_STANDARD } from '../../src/lib/constants'

describe('Progression Mechanics', () => {
  beforeEach(() => {
    useGameStore.setState({
      credits: 100,
      tanks: [],
      tank: null,
      currentTick: 0,
      maturityBonusAwarded: false,
    })
    // Initialize a BOWL tank
    useGameStore.getState().addOrSelectTank({
      id: 'progression-tank',
      size: 'BOWL',
      capacity: 1,
      waterQuality: 100,
      pollution: 0,
      hasFilter: false,
      temperature: 24,
      fish: [],
      createdAt: Date.now(),
      width: 400,
      height: 400,
      backgroundColor: 0x000000,
    })
  })

  it('should award maturity bonus when fish reaches mature age', () => {
    const store = useGameStore.getState()
    const tankId = store.tank!.id

    // Buy a fish
    store.buyFish(tankId, FishSpecies.GUPPY)

    const initialCredits = useGameStore.getState().credits

    // Fast forward age
    // We can't easily set age directly via public API, but we can hack the state or tick many times.
    // Hacking state is faster for test.
    const tank = useGameStore.getState().tank!
    const fish = tank.fish[0]
    const matureFish = { ...fish, age: MATURE_AGE_SECONDS } // Exact age

    const updatedTank = { ...tank, fish: [matureFish] }
    useGameStore.setState({
      tanks: [updatedTank],
      tank: updatedTank,
    })

    // Tick once to trigger check
    useGameStore.getState().tick()

    const newState = useGameStore.getState()
    expect(newState.maturityBonusAwarded).toBe(true)
    expect(newState.credits).toBe(initialCredits + MATURITY_BONUS)
  })

  it('should only award maturity bonus once', () => {
    const store = useGameStore.getState()
    const tankId = store.tank!.id

    // Buy a fish
    store.buyFish(tankId, FishSpecies.GUPPY)

    // Set state to already awarded
    useGameStore.setState({ maturityBonusAwarded: true })
    const initialCredits = useGameStore.getState().credits

    // Set fish to mature
    const tank = useGameStore.getState().tank!
    const fish = tank.fish[0]
    const matureFish = { ...fish, age: MATURE_AGE_SECONDS + 10 }

    const updatedTank = { ...tank, fish: [matureFish] }
    useGameStore.setState({
      tanks: [updatedTank],
      tank: updatedTank,
    })

    // Tick
    useGameStore.getState().tick()

    const newState = useGameStore.getState()
    expect(newState.credits).toBe(initialCredits) // No change
  })

  it('should allow upgrading tank from BOWL to STANDARD', () => {
    const store = useGameStore.getState()
    const tankId = store.tank!.id

    // Ensure enough credits
    useGameStore.setState({ credits: TANK_UPGRADE_COST + 10 })
    const initialCredits = useGameStore.getState().credits

    // Upgrade
    useGameStore.getState().upgradeTank(tankId)

    const newState = useGameStore.getState()
    const tank = newState.tank!

    expect(tank.size).toBe('STANDARD')
    expect(tank.capacity).toBe(TANK_CAPACITY_STANDARD)
    expect(tank.geometry.width).toBe(1800)
    expect(tank.geometry.height).toBe(1800)
    expect(newState.credits).toBe(initialCredits - TANK_UPGRADE_COST)
  })

  it('should NOT allow upgrading if insufficient credits', () => {
    const store = useGameStore.getState()
    const tankId = store.tank!.id

    useGameStore.setState({ credits: TANK_UPGRADE_COST - 1 })

    useGameStore.getState().upgradeTank(tankId)

    const newState = useGameStore.getState()
    const tank = newState.tank!

    expect(tank.size).toBe('BOWL')
    expect(newState.credits).toBe(TANK_UPGRADE_COST - 1)
  })
})
