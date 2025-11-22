import React, { useEffect, useRef } from 'react'
import { RenderingEngine } from '../game/RenderingEngine'
import { RenderingEngineManager } from '../game/RenderingEngineManager'
import useGameStore from '../store/useGameStore'

interface RenderingEngineWithUnsubscribe extends RenderingEngine {
  __unsubscribeFromStore?: () => void
}

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
  const fish = useGameStore((state) => state.tanks[0]?.fish)
  const developerMode = useGameStore((state) => state.developerMode)
  const currentTank = useGameStore((state) => state.tank)

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

    let isInitializing = false

    const initializeEngine = async () => {
      // Prevent race condition: multiple simultaneous initializations
      if (isInitializing) return
      isInitializing = true

      try {
        // Clean up any existing engine first via singleton manager
        if (engineRef.current) {
          try {
            const unsubscribe = (engineRef.current as RenderingEngineWithUnsubscribe).__unsubscribeFromStore
            if (unsubscribe) {
              unsubscribe()
            }
          } catch {
            // ignore cleanup errors
          }
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

        // Initial sync with store state
        const currentFish = useGameStore.getState().tanks[0]?.fish || []
        engine.syncFish(currentFish)

        // Subscribe to store updates
        // Subscribe to the currently selected tank's fish array. Using `s.tank?.fish`
        // ensures updates are received when the selected tank changes (not only index 0).
        const unsubscribe = useGameStore.subscribe((state) => {
          try {
            engine.syncFish(state.tank?.fish || [])
          } catch {
            // ignore for now
          }
        })

        // Attach unsubscribe to engine for cleanup
        ;(engine as RenderingEngineWithUnsubscribe).__unsubscribeFromStore = unsubscribe

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
        // unsubscribe store subscription if present
        if ((engineRef.current as RenderingEngineWithUnsubscribe).__unsubscribeFromStore) {
          try {
            const unsubscribeFn = (engineRef.current as RenderingEngineWithUnsubscribe).__unsubscribeFromStore
            if (unsubscribeFn) {
              unsubscribeFn()
            }
          } catch {
            // ignore
          }
        }
        RenderingEngineManager.destroyInstance()
        engineRef.current = null
      }
    }

    cleanupRef.current = cleanup

    return cleanup
  }, [])

  // Sync fish from store to engine (consolidate all fish sync logic)
  useEffect(() => {
    // Use currentTank fish if available (dev mode), otherwise use fish from tanks[0]
    const fishToSync = currentTank?.fish || fish || []

    if (engineRef.current && fishToSync.length >= 0) {
      engineRef.current.syncFish(fishToSync)
    }
  }, [fish, currentTank, developerMode])

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
