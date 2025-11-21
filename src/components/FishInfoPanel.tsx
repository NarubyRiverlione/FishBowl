import React from 'react'
import useGameStore, { selectSelectedFish } from '../store/useGameStore'
import { IFish } from '../models/types'
import { FishService } from '../services/FishService'

const FishInfoPanel: React.FC = () => {
  const selectedFish = useGameStore(selectSelectedFish) as IFish | null
  const sellFish = useGameStore((s) => s.sellFish)
  const tank = useGameStore((s) => s.tank)
  const setSelected = useGameStore((s) => s.selectFish)

  if (!selectedFish) return null

  const sell = () => {
    if (!tank) return
    if (!selectedFish) return
    sellFish(tank.id, selectedFish.id)
    // Clear selection after selling
    setSelected(null)
  }

  const formatAge = (seconds: number) => {
    const s = Math.floor(seconds % 60)
    const m = Math.floor((seconds / 60) % 60)
    const h = Math.floor(seconds / 3600)
    const two = (n: number) => String(n).padStart(2, '0')
    return `${two(h)}:${two(m)}:${two(s)}`
  }

  const lifeStage = (ageSec: number) => {
    if (ageSec < 120) return 'Young'
    if (ageSec < 300) return 'Mature'
    return 'Old'
  }

  return (
    <div
      style={{
        position: 'absolute',
        right: 16,
        bottom: 16,
        width: 240,
        background: 'rgba(0,0,0,0.8)',
        color: '#fff',
        padding: 12,
        borderRadius: 8,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        zIndex: 200,
        textAlign: 'left',
      }}
      role="dialog"
      aria-label="Fish info panel"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <strong style={{ flex: 1 }}>{selectedFish.species}</strong>
      </div>

      <div style={{ marginTop: 8, fontSize: 13 }}>
        <div style={{ marginBottom: 6 }}>Age: {formatAge(selectedFish.age ?? 0)}</div>
        <div style={{ marginBottom: 8 }}>Life stage: {lifeStage(selectedFish.age ?? 0)}</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 60, fontSize: 12, color: '#ccc' }}>Health</div>
          <div style={{ flex: 1, height: 12, background: '#222', borderRadius: 6 }}>
            {(() => {
              const health = Math.max(0, Math.min(100, Math.round(selectedFish.health ?? 0)))
              let color = '#0f0'
              // New thresholds: 100-50 green, 49-25 orange, 24-0 red
              if (health >= 50) color = '#0f0'
              else if (health >= 25) color = '#ffa500'
              else color = '#f44336'
              return (
                <div
                  style={{
                    width: `${health}%`,
                    height: '100%',
                    background: color,
                    borderRadius: 6,
                    transition: 'width 200ms linear',
                  }}
                />
              )
            })()}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 60, fontSize: 12, color: '#ccc' }}>Hunger</div>
          <div style={{ flex: 1, height: 12, background: '#222', borderRadius: 6 }}>
            <div
              style={{
                width: `${Math.max(0, Math.min(100, Math.round(selectedFish.hunger ?? 0)))}%`,
                height: '100%',
                background: '#2196f3',
                borderRadius: 6,
                transition: 'width 200ms linear',
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: 2, fontSize: 13 }}>
          Estimated value: {Math.round(selectedFish ? FishService.calculateFishValue(selectedFish) : 0)} 💰
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button
          onClick={sell}
          style={{
            flex: 1,
            padding: '8px 10px',
            background: '#0a84ff',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
          }}
        >
          Sell
        </button>
        <button
          onClick={() => setSelected(null)}
          style={{ flex: 1, padding: '8px 10px', background: '#444', color: '#fff', border: 'none', borderRadius: 6 }}
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default FishInfoPanel
