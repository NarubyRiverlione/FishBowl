import React from 'react'
import useGameStore, { selectCredits } from '../store/useGameStore'

const StatItem: React.FC<{ icon: string; value: string; tooltip: string }> = ({ icon, value, tooltip }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 6px',
      cursor: 'crosshair',
    }}
    title={tooltip}
  >
    <span style={{ fontSize: '16px' }}>{icon}</span>
    <span style={{ fontSize: '14px', fontWeight: '500' }}>{value}</span>
  </span>
)

const HUD: React.FC = () => {
  const credits = useGameStore(selectCredits)
  const tank = useGameStore((state) => state.tank)
  const totalTime = useGameStore((state) => state.totalTime)

  if (!tank) return null

  // Convert totalTime (seconds) to HH:mm:ss
  const hours = Math.floor(totalTime / 3600)
  const minutes = Math.floor((totalTime % 3600) / 60)
  const seconds = totalTime % 60
  const timeDisplay = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '14px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <StatItem icon="💰" value={credits.toString()} tooltip="Credits" />
      <span style={{ color: '#666' }}>|</span>
      <StatItem icon="🕐" value={timeDisplay} tooltip="Game Time (HH:mm:ss)" />
      <span style={{ color: '#666' }}>|</span>
      <StatItem
        icon="🐠"
        value={`${tank.size} ${tank.fish.length}/${tank.capacity}`}
        tooltip={`Tank: ${tank.size} (Capacity: ${tank.fish.length}/${tank.capacity})`}
      />
      <span style={{ color: '#666' }}>|</span>
      <StatItem icon="🗑️" value={`${tank.pollution.toFixed(0)}%`} tooltip="Pollution" />
    </div>
  )
}

export default HUD
