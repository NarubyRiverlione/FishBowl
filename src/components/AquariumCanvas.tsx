import React, { useEffect, useRef } from 'react'
import { RenderingEngine } from '../game/RenderingEngine'
import useGameStore from '../store/useGameStore'

const AquariumCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<RenderingEngine | null>(null)
  const fish = useGameStore((state) => state.tanks[0]?.fish)

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && engineRef.current) {
        // Note: We'd need to add a resize method to RenderingEngine to properly handle this
        // For now, dimensions are set on mount
      }
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

        // Get container dimensions
        const width = containerRef.current!.clientWidth
        const height = containerRef.current!.clientHeight

        // Initialize new engine
        const engine = new RenderingEngine(width, height, 0x006994)
        engineRef.current = engine

        await engine.init(containerRef.current!)

        // Initial sync with store state
        const currentFish = useGameStore.getState().tanks[0]?.fish || []
        engine.syncFish(currentFish)
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
  }, [])

  // Sync fish from store to engine
  useEffect(() => {
    if (engineRef.current && fish) {
      engineRef.current.syncFish(fish)
    }
  }, [fish])

  return (
    <div
      ref={containerRef}
      data-testid="aquarium-container"
      style={{
        width: '100%',
        height: '100%',
        border: '2px solid #333',
        boxShadow: '0 0 20px rgba(0,0,0,0.3)',
      }}
    />
  )
}

export default AquariumCanvas
