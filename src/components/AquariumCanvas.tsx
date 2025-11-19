import React, { useEffect, useRef } from 'react'
import { RenderingEngine } from '../game/RenderingEngine'

interface AquariumCanvasProps {
  width?: number
  height?: number
}

const AquariumCanvas: React.FC<AquariumCanvasProps> = ({ width = 800, height = 600 }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<RenderingEngine | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const initializeEngine = async () => {
      try {
        // Clean up any existing engine first
        if (engineRef.current) {
          engineRef.current.destroy()
          engineRef.current = null
        }

        // Initialize new engine
        const engine = new RenderingEngine(width, height, 0x006994)
        engineRef.current = engine

        await engine.initialize(containerRef.current!)
      } catch (error) {
        console.error('Failed to initialize aquarium:', error)
      }
    }

    initializeEngine()

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy()
        engineRef.current = null
      }
    }
  }, [width, height])

  return (
    <div
      ref={containerRef}
      data-testid="aquarium-container"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        border: '2px solid #333',
        margin: '20px auto',
        boxShadow: '0 0 20px rgba(0,0,0,0.3)',
      }}
    />
  )
}

export default AquariumCanvas
