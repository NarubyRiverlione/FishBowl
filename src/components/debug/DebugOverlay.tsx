/**
 * Debug overlay component for development mode (T040d)
 * Shows tank count, engine instance count, collision statistics
 * Only visible when developer mode is enabled
 */

import React, { useEffect, useState } from 'react'
import useGameStore from '../../store/useGameStore'
import { TankDebugger } from '../../lib/debug/TankDebugger'

interface DebugStats {
  tankCount: number
  fishCount: number
  livingFishCount: number
  waterQuality: number
  pollution: number
  collisionChecks: number
  renderingEngineInstances: number
  canvasPresent: boolean
  lastUpdate: string
}

export const DebugOverlay: React.FC = () => {
  const { developerMode, tank } = useGameStore()
  const [stats, setStats] = useState<DebugStats>({
    tankCount: 0,
    fishCount: 0,
    livingFishCount: 0,
    waterQuality: 0,
    pollution: 0,
    collisionChecks: 0,
    renderingEngineInstances: 1, // Assuming single instance for now
    canvasPresent: false,
    lastUpdate: new Date().toLocaleTimeString(),
  })

  useEffect(() => {
    if (!developerMode) {
      return
    }

    // Enable debugging when overlay is active
    TankDebugger.setEnabled(true)

    const updateStats = () => {
      if (!tank) return

      const debuggerStats = TankDebugger.getStats()

      setStats({
        tankCount: 1, // Single tank mode for now
        fishCount: tank.fish.length,
        livingFishCount: tank.fish.filter((f) => f.isAlive).length,
        waterQuality: tank.waterQuality,
        pollution: tank.pollution,
        collisionChecks: debuggerStats['collisionChecks'] || 0,
        renderingEngineInstances: 1, // Single instance for now
        canvasPresent: typeof document !== 'undefined' && Boolean(document.querySelector('canvas')),
        lastUpdate: new Date().toLocaleTimeString(),
      })
    }

    // Update stats immediately
    updateStats()

    // Update stats every second
    const interval = setInterval(updateStats, 1000)

    return () => {
      clearInterval(interval)
      TankDebugger.setEnabled(false)
    }
  }, [developerMode, tank])

  // Only render in developer mode
  if (!developerMode) {
    return null
  }

  const overlayStyles: React.CSSProperties = {
    position: 'fixed',
    top: '10px',
    right: '10px',
    width: '300px',
    background: 'rgba(0, 0, 0, 0.9)',
    color: '#fff',
    padding: '16px',
    borderRadius: '8px',
    fontFamily: '"Courier New", monospace',
    fontSize: '12px',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  }

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
  }

  const sectionStyles: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '8px',
    borderRadius: '4px',
    marginBottom: '12px',
  }

  const statItemStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  }

  const buttonStyles: React.CSSProperties = {
    flex: 1,
    background: 'rgba(59, 130, 246, 0.8)',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '10px',
    cursor: 'pointer',
    marginRight: '8px',
  }

  return (
    <div style={overlayStyles}>
      <div style={headerStyles}>
        <h3 style={{ margin: 0, fontSize: '14px', color: '#4ade80' }}>🛠️ Debug Info</h3>
        <span style={{ fontSize: '10px', color: '#94a3b8' }}>{stats.lastUpdate}</span>
      </div>

      <div>
        <div style={sectionStyles}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#60a5fa' }}>🏠 Tank State</h4>
          <div>
            <div style={statItemStyles}>
              <span style={{ color: '#cbd5e1', fontSize: '11px' }}>Tanks:</span>
              <span style={{ color: '#f1f5f9', fontWeight: 'bold' }}>{stats.tankCount}</span>
            </div>
            <div style={statItemStyles}>
              <span style={{ color: '#cbd5e1', fontSize: '11px' }}>Fish Total:</span>
              <span style={{ color: '#f1f5f9', fontWeight: 'bold' }}>{stats.fishCount}</span>
            </div>
            <div style={statItemStyles}>
              <span style={{ color: '#cbd5e1', fontSize: '11px' }}>Fish Alive:</span>
              <span style={{ color: '#f1f5f9', fontWeight: 'bold' }}>{stats.livingFishCount}</span>
            </div>
            <div style={statItemStyles}>
              <span style={{ color: '#cbd5e1', fontSize: '11px' }}>Water Quality:</span>
              <span style={{ color: '#f1f5f9', fontWeight: 'bold' }}>{stats.waterQuality.toFixed(1)}%</span>
            </div>
            <div style={statItemStyles}>
              <span style={{ color: '#cbd5e1', fontSize: '11px' }}>Pollution:</span>
              <span style={{ color: '#f1f5f9', fontWeight: 'bold' }}>{stats.pollution.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div style={sectionStyles}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#60a5fa' }}>🎯 Collision System</h4>
          <div>
            <div style={statItemStyles}>
              <span style={{ color: '#cbd5e1', fontSize: '11px' }}>Collision Checks:</span>
              <span style={{ color: '#f1f5f9', fontWeight: 'bold' }}>{stats.collisionChecks}</span>
            </div>
            <div style={statItemStyles}>
              <span style={{ color: '#cbd5e1', fontSize: '11px' }}>Checks/Second:</span>
              <span style={{ color: '#f1f5f9', fontWeight: 'bold' }}>
                {tank?.fish.length ? Math.round(stats.collisionChecks / 60) : 0}
              </span>
            </div>
          </div>
        </div>

        <div style={sectionStyles}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#60a5fa' }}>🎮 Rendering Engine</h4>
          <div>
            <div style={statItemStyles}>
              <span style={{ color: '#cbd5e1', fontSize: '11px' }}>Engine Instances:</span>
              <span style={{ color: '#f1f5f9', fontWeight: 'bold' }}>{stats.renderingEngineInstances}</span>
            </div>
            <div style={statItemStyles}>
              <span style={{ color: '#cbd5e1', fontSize: '11px' }}>Canvas Present:</span>
              <span style={{ color: '#f1f5f9', fontWeight: 'bold' }}>{stats.canvasPresent ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
        <button onClick={() => TankDebugger.resetStats()} style={buttonStyles}>
          Reset Stats
        </button>
        <button
          onClick={() => {
            if (tank) {
              const issues = TankDebugger.validateTank(tank)
              alert(issues.length ? `Issues: ${issues.join(', ')}` : 'No issues found!')
            }
          }}
          style={{ ...buttonStyles, marginRight: 0 }}
        >
          Validate Tank
        </button>
      </div>
    </div>
  )
}

export default DebugOverlay
