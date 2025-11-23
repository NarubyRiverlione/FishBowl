import React, { useEffect, useRef } from 'react'
import { RenderingEngine } from '../game/engine/RenderingEngine'
import { RenderingEngineManager } from '../game/managers/RenderingEngineManager'
import useGameStore from '../store/useGameStore'

interface TestHelpers {
  getFishScreenPositions: () => Array<{ id: string; x: number; y: number }>
  awaitFishRendered: (timeoutMs?: number) => Promise<boolean>
  getStoreFishCount: () => number
  getStoreTanks: () => unknown
  forceSync: () => void
}

type AquariumCanvasProps = {
  width?: number
  height?: number
}

const AquariumCanvas: React.FC<AquariumCanvasProps> = ({ width, height }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<RenderingEngine | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  // Store subscriptions are now handled directly by RenderingEngine

  // Handle window resize and update tank display scaling
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && engineRef.current) {
        // Update tank container display scale on resize (T042c)
        if (engineRef.current.tankView && 'updateDisplayScale' in engineRef.current.tankView) {
          engineRef.current.tankView.updateDisplayScale()
        }
      }
    }

    const handleCanvasResize = (event: CustomEvent) => {
      if (engineRef.current && 'resizeCanvas' in engineRef.current) {
        const { width, height } = event.detail
        engineRef.current.resizeCanvas(width, height)
      }
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('tankCanvasResize', handleCanvasResize as EventListener)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('tankCanvasResize', handleCanvasResize as EventListener)
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    let isInitializing = false

    const initializeEngine = async () => {
      // Prevent race condition: multiple simultaneous initializations
      if (isInitializing) return
      isInitializing = true

      try {
        // Clean up any existing engine first via singleton manager
        if (engineRef.current) {
          // RenderingEngine now handles its own cleanup
          RenderingEngineManager.destroyInstance()
          engineRef.current = null
        }

        // Get container dimensions
        const containerWidth = containerRef.current!.clientWidth
        const containerHeight = containerRef.current!.clientHeight

        // Initialize new engine via singleton manager
        const engine = RenderingEngineManager.getInstance(containerWidth, containerHeight, 0x006994)
        engineRef.current = engine

        await engine.init(containerRef.current!)

        // No need for manual sync - RenderingEngine now automatically syncs with store

        // Expose a minimal read-only test helper when enabled at build/runtime or via URL.
        // Allow both: env flag `VITE_TEST_HELPERS=true` or query param `?testHelpers=true`.
        try {
          const envFlag = (import.meta as { env?: Record<string, string> }).env?.['VITE_TEST_HELPERS'] === 'true'
          let urlFlag = false
          try {
            // Only run in browser context

            if (typeof window !== 'undefined' && window.location && window.location.search) {
              const params = new URLSearchParams(window.location.search)
              const val = params.get('testHelpers') || params.get('test_helpers')
              urlFlag = val === 'true' || val === '1'
            }
          } catch {
            urlFlag = false
          }

          if (envFlag || urlFlag) {
            ;(
              window as Window & {
                __TEST_HELPERS__?: TestHelpers
              }
            ).__TEST_HELPERS__ = {
              getFishScreenPositions: () => engine.getFishScreenPositions(),
              // Await until at least one fish is rendered (timeout in ms)
              awaitFishRendered: (timeoutMs?: number) => engine.waitForFishRendered(timeoutMs || 5000),
              // Expose a small store inspection helper for E2E diagnostics
              // Return the currently selected tank's fish count (not tanks[0])
              getStoreFishCount: () => useGameStore.getState().tank?.fish?.length ?? 0,
              getStoreTanks: () => useGameStore.getState().tanks,
              // Force an immediate sync from the current store state into the engine
              // Useful when store updates happen and tests need to ensure the renderer receives them
              forceSync: () => engine.syncFish(useGameStore.getState().tank?.fish || []),
            }
          }
        } catch {
          // ignore - test helpers are optional
        }
      } catch (error) {
        console.error('Failed to initialize aquarium:', error)
      } finally {
        isInitializing = false
      }
    }

    initializeEngine()

    // Set up cleanup function
    const cleanup = () => {
      if (engineRef.current) {
        // RenderingEngine now handles its own store subscription cleanup
        RenderingEngineManager.destroyInstance()
        engineRef.current = null
      }
    }

    cleanupRef.current = cleanup

    return cleanup
  }, [])

  // No longer needed - RenderingEngine automatically syncs with store

  return (
    <div
      ref={containerRef}
      data-testid="aquarium-container"
      style={{
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : '100%',
        border: '2px solid #333',
        boxShadow: '0 0 20px rgba(0,0,0,0.3)',
      }}
    />
  )
}

export default AquariumCanvas
