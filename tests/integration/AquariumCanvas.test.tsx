import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AquariumCanvas from '../../src/components/AquariumCanvas'

// Mock the RenderingEngine to avoid WebGL context issues in tests
vi.mock('../../src/game/RenderingEngine', () => {
  return {
    RenderingEngine: class {
      initialize = vi.fn().mockResolvedValue(undefined)
      destroy = vi.fn()
      resize = vi.fn()
    },
  }
})

describe('AquariumCanvas', () => {
  it('should render a container div', () => {
    render(<AquariumCanvas />)
    const container = screen.getByTestId('aquarium-container')
    expect(container).toBeInTheDocument()
  })

  it('should have correct styling dimensions', () => {
    render(<AquariumCanvas width={800} height={600} />)
    const container = screen.getByTestId('aquarium-container')
    expect(container).toHaveStyle({ width: '800px', height: '600px' })
  })
})
