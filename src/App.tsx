import React, { useEffect } from 'react'
import AquariumCanvas from './components/AquariumCanvas'
import HUD from './components/HUD'
import StoreMenu from './components/StoreMenu'
import FishInfoPanel from './components/FishInfoPanel'
import useGameStore from './store/useGameStore'

const App: React.FC = () => {
  const tick = useGameStore((state) => state.tick)
  const isPaused = useGameStore((state) => state.isPaused)
  const setPaused = useGameStore((state) => state.setPaused)

  // Start the game loop
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!isPaused) {
        tick()
      }
    }, 1000) // Tick every 1 second

    return () => clearInterval(intervalId)
  }, [tick, isPaused])

  return (
    <div
      className="app-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        background: '#1a1a1a',
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.9)',
          color: '#fff',
          padding: '12px 20px',
          borderBottom: '1px solid #333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          flexShrink: 0,
          zIndex: 100,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            onClick={() => setPaused(!isPaused)}
            style={{
              padding: '6px 12px',
              fontSize: '14px',
              border: 'none',
              borderRadius: '4px',
              background: isPaused ? '#d9534f' : '#5cb85c',
              color: '#fff',
              cursor: 'pointer',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              transition: 'background 0.2s',
              fontWeight: '600',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            title={isPaused ? 'Resume game' : 'Pause game'}
          >
            {isPaused ? '▶️ Resume' : '⏸️ Pause'}
          </button>
          <HUD />
        </div>
        <StoreMenu />
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          width: '100%',
          height: '100%',
        }}
      >
        <AquariumCanvas />
        <FishInfoPanel />
      </div>
    </div>
  )
}

export default App
