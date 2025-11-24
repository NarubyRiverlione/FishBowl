import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import useGameStore from '../../src/store/useGameStore'
import AquariumCanvas from '../../src/components/AquariumCanvas'

describe('Dev Mode Fish Visibility Fix', () => {
  beforeEach(() => {
    // Reset the store before each test
    useGameStore.setState(useGameStore.getInitialState())
  })

  it('should sync fish when dev mode is enabled after canvas initialization', async () => {
    // 1. Render AquariumCanvas first (simulating normal startup)
    const { container } = render(<AquariumCanvas width={800} height={600} />)

    // Wait for initial render
    await new Promise((resolve) => setTimeout(resolve, 100))

    // 2. Enable dev mode after canvas is already initialized (simulating URL param processing)
    useGameStore.getState().setMode('dev')

    // Wait for the effects to process
    await new Promise((resolve) => setTimeout(resolve, 100))

    // 3. Check that the current tank has the expected dev fish
    const state = useGameStore.getState()
    expect(state.developerMode).toBe(true)
    expect(state.tank).toBeDefined()
    expect(state.tank!.fish).toHaveLength(12) // 4 species × 3 age groups

    // 4. Verify the tank is a dev tank with correct dimensions
    expect(state.tank!.size).toBe('STANDARD')
    expect(state.tank!.capacity).toBe(15)
    expect(state.tank!.geometry.width).toBe(300)
    expect(state.tank!.geometry.height).toBe(300)

    // Test passes if no errors are thrown and fish are populated
    expect(container).toBeDefined()
  })

  it('should sync fish immediately when dev mode is set before canvas initialization', async () => {
    // 1. Enable dev mode first (simulating fast URL param processing)
    useGameStore.getState().setMode('dev')

    // 2. Then render AquariumCanvas
    const { container } = render(<AquariumCanvas width={800} height={600} />)

    // Wait for initialization
    await new Promise((resolve) => setTimeout(resolve, 100))

    // 3. Verify dev mode state
    const state = useGameStore.getState()
    expect(state.developerMode).toBe(true)
    expect(state.tank).toBeDefined()
    expect(state.tank!.fish).toHaveLength(12)

    expect(container).toBeDefined()
  })
})
