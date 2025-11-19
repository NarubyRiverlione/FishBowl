import React, { useEffect, useRef } from 'react'
import { RenderingEngine } from '../game/RenderingEngine'

interface AquariumCanvasProps {
  width?: number
  height?: number
}

const AquariumCanvas: React.FC<AquariumCanvasProps> = ({ width = 800, height = 600 }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<RenderingEngine | null>(null)
  const [dimensions, setDimensions] = React.useState({ width, height })

  // Update dimensions when props change
  useEffect(() => {
    setDimensions({ width, height })
  }, [width, height])

  // Handle window resize (optional, if we wanted full screen)
  useEffect(() => {
    const handleResize = () => {
      // Placeholder for responsive logic if we switch to full-screen mode
      // For now, we stick to prop-based sizing
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
        const engine = new RenderingEngine(dimensions.width, dimensions.height, 0x006994)
        engineRef.current = engine

        await engine.init(containerRef.current!)
        engine.spawnFish(20)
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
  }, [dimensions.width, dimensions.height])

  return (
    <div
      ref={containerRef}
      data-testid="aquarium-container"
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        border: '2px solid #333',
        margin: '20px auto',
        boxShadow: '0 0 20px rgba(0,0,0,0.3)',
      }}
    />
  )
}

export default AquariumCanvas
