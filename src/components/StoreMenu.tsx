import React, { useState, useRef, useEffect } from 'react'
import useGameStore from '../store/useGameStore'
import { FishSpecies, FISH_SPECIES_CONFIG } from '../models/types'
import { FILTER_COST, TANK_UPGRADE_COST, CLEAN_COST, FEED_BASE_COST, FEED_PER_FISH_COST } from '../lib/constants'

const StoreMenu: React.FC = () => {
  const tank = useGameStore((state) => state.tank)
  const credits = useGameStore((state) => state.credits)
  const buyFish = useGameStore((state) => state.buyFish)
  const buyFilter = useGameStore((state) => state.buyFilter)
  const upgradeTank = useGameStore((state) => state.upgradeTank)
  const cleanTank = useGameStore((state) => state.cleanTank)
  const feedTank = useGameStore((state) => state.feedTank)

  const [showBuyMenu, setShowBuyMenu] = useState(false)
  const [showUpgradeMenu, setShowUpgradeMenu] = useState(false)
  const buyMenuRef = useRef<HTMLDivElement>(null)
  const upgradeMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buyMenuRef.current && !buyMenuRef.current.contains(event.target as Node)) {
        setShowBuyMenu(false)
      }
      if (upgradeMenuRef.current && !upgradeMenuRef.current.contains(event.target as Node)) {
        setShowUpgradeMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!tank) return null

  const feedCost = FEED_BASE_COST + tank.fish.filter((f) => f.isAlive).length * FEED_PER_FISH_COST

  const buttonStyle: React.CSSProperties = {
    padding: '6px 12px',
    fontSize: '14px',
    border: 'none',
    borderRadius: '4px',
    background: '#444',
    color: '#fff',
    cursor: 'pointer',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    transition: 'background 0.2s',
  }

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '4px',
    background: 'rgba(0, 0, 0, 0.95)',
    border: '1px solid #555',
    borderRadius: '4px',
    padding: '8px',
    minWidth: '200px',
    zIndex: 100,
    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
  }

  const dropdownItemStyle: React.CSSProperties = {
    padding: '8px 12px',
    fontSize: '14px',
    border: 'none',
    borderRadius: '3px',
    background: '#333',
    color: '#fff',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    marginBottom: '4px',
    transition: 'background 0.2s',
  }

  const disabledItemStyle: React.CSSProperties = {
    ...dropdownItemStyle,
    background: '#1a1a1a',
    color: '#999',
    cursor: 'not-allowed',
    opacity: 0.7,
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <button
        style={{
          ...buttonStyle,
          ...(credits < feedCost ? { background: '#1a1a1a', color: '#999', cursor: 'not-allowed', opacity: 0.7 } : {}),
        }}
        onClick={() => credits >= feedCost && feedTank(tank.id)}
        onMouseEnter={(e) => credits >= feedCost && (e.currentTarget.style.background = '#555')}
        onMouseLeave={(e) => credits >= feedCost && (e.currentTarget.style.background = '#444')}
        title={`Feed all fish (${feedCost} credits)${credits < feedCost ? ' - Not enough credits' : ''}`}
        disabled={credits < feedCost}
      >
        🍽️ Feed
      </button>

      <button
        style={{
          ...buttonStyle,
          ...(credits < CLEAN_COST
            ? { background: '#1a1a1a', color: '#999', cursor: 'not-allowed', opacity: 0.7 }
            : {}),
        }}
        onClick={() => credits >= CLEAN_COST && cleanTank(tank.id)}
        onMouseEnter={(e) => credits >= CLEAN_COST && (e.currentTarget.style.background = '#555')}
        onMouseLeave={(e) => credits >= CLEAN_COST && (e.currentTarget.style.background = '#444')}
        title={`Clean tank (${CLEAN_COST} credits)${credits < CLEAN_COST ? ' - Not enough credits' : ''}`}
        disabled={credits < CLEAN_COST}
      >
        🧹 Clean
      </button>

      <div style={{ position: 'relative' }} ref={buyMenuRef}>
        <button
          style={buttonStyle}
          onClick={() => setShowBuyMenu(!showBuyMenu)}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#555')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#444')}
          title="Buy fish"
        >
          🐟 Buy ▼
        </button>
        {showBuyMenu && (
          <div style={dropdownStyle}>
            {Object.values(FishSpecies).map((species) => {
              const cost = FISH_SPECIES_CONFIG[species].baseValue
              const canAfford = credits >= cost
              return (
                <button
                  key={species}
                  style={canAfford ? dropdownItemStyle : disabledItemStyle}
                  onClick={() => {
                    if (canAfford) {
                      buyFish(tank.id, species)
                      setShowBuyMenu(false)
                    }
                  }}
                  onMouseEnter={(e) => canAfford && (e.currentTarget.style.background = '#444')}
                  onMouseLeave={(e) => canAfford && (e.currentTarget.style.background = '#333')}
                  disabled={!canAfford}
                  title={!canAfford ? 'Not enough credits' : undefined}
                >
                  {species} ({cost} 💰)
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div style={{ position: 'relative' }} ref={upgradeMenuRef}>
        <button
          style={buttonStyle}
          onClick={() => setShowUpgradeMenu(!showUpgradeMenu)}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#555')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#444')}
          title="Upgrades"
        >
          ⬆️ Upgrades ▼
        </button>
        {showUpgradeMenu && (
          <div style={dropdownStyle}>
            {tank.size === 'STANDARD' && !tank.hasFilter && (
              <button
                style={credits >= FILTER_COST ? dropdownItemStyle : disabledItemStyle}
                onClick={() => {
                  if (credits >= FILTER_COST) {
                    buyFilter(tank.id)
                    setShowUpgradeMenu(false)
                  }
                }}
                onMouseEnter={(e) => credits >= FILTER_COST && (e.currentTarget.style.background = '#444')}
                onMouseLeave={(e) => credits >= FILTER_COST && (e.currentTarget.style.background = '#333')}
                disabled={credits < FILTER_COST}
                title={credits < FILTER_COST ? 'Not enough credits' : undefined}
              >
                Buy Filter ({FILTER_COST} 💰)
              </button>
            )}
            {tank.size === 'BOWL' && (
              <button
                style={credits >= TANK_UPGRADE_COST ? dropdownItemStyle : disabledItemStyle}
                onClick={() => {
                  if (credits >= TANK_UPGRADE_COST) {
                    upgradeTank(tank.id)
                    setShowUpgradeMenu(false)
                  }
                }}
                onMouseEnter={(e) => credits >= TANK_UPGRADE_COST && (e.currentTarget.style.background = '#444')}
                onMouseLeave={(e) => credits >= TANK_UPGRADE_COST && (e.currentTarget.style.background = '#333')}
                disabled={credits < TANK_UPGRADE_COST}
                title={credits < TANK_UPGRADE_COST ? 'Not enough credits' : undefined}
              >
                Upgrade Tank ({TANK_UPGRADE_COST} 💰)
              </button>
            )}
            {tank.size === 'STANDARD' && tank.hasFilter && (
              <div style={{ padding: '8px', color: '#999', fontSize: '13px' }}>No upgrades available</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default StoreMenu
