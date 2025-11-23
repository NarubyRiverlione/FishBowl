import { describe, it, expect } from 'vitest'
import { RenderingEngine } from '../../src/game/engine/RenderingEngine'

describe('RenderingEngine helpers', () => {
  it('getFishScreenPositions falls back and waitForFishRendered polls until available', async () => {
    const engine = new RenderingEngine(200, 100, 0x000000)

    // Replace tankView with a mock that changes behavior after a short delay
    let returned: Array<{ id: string; x: number; y: number }> = []
    const mockTankView: { getFishScreenPositions: () => Array<{ id: string; x: number; y: number }> } = {
      getFishScreenPositions: () => returned,
    }

    // inject mock tankView
    ;(
      engine as RenderingEngine & {
        tankView: { getFishScreenPositions: () => Array<{ id: string; x: number; y: number }> }
      }
    ).tankView = mockTankView

    // Initially no positions
    expect(engine.getFishScreenPositions()).toEqual([])

    // Start a timer that will populate positions after 200ms
    setTimeout(() => {
      returned = [{ id: 'f1', x: 10, y: 20 }]
    }, 200)

    // waitForFishRendered should poll until positions are available
    const ok = await engine.waitForFishRendered(1000, 50)
    expect(ok).toBe(true)
    const pos = engine.getFishScreenPositions()
    expect(pos.length).toBeGreaterThan(0)
    expect(pos[0].id).toBe('f1')
  })
})
