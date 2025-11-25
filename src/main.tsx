import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import useGameStore from './store/useGameStore'

console.log('🚀 main.tsx loaded! URL:', window.location.href)

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)

// Initialize game mode from URL params (use explicit setMode for dev)
try {
  console.log('🚀 main.tsx: Starting initialization...')
  console.log('🌐 Current URL:', typeof window !== 'undefined' ? window.location.href : 'No window')
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  if (params) {
    const dev = params.get('dev') === 'true'
    const allParams: Record<string, string> = {}
    for (const [key, value] of params.entries()) {
      allParams[key] = value
    }
    console.log('🔍 URL params:', allParams)
    console.log('🎯 Dev mode detected:', dev)

    if (dev) {
      console.log('🎮 Calling setMode("dev")...')
      useGameStore.getState().setMode?.('dev')
      console.log('✅ setMode("dev") completed')
    } else {
      console.log('📊 Calling initializeFromQuery for non-dev params')
      // fall back to initializeFromQuery for other params (e.g., tutorial=false)
      useGameStore.getState().initializeFromQuery?.()
    }
  } else {
    console.log('❌ No URL params found')
  }
} catch (err) {
  // non-fatal: allow app to start even if initialization fails

  console.warn('Game mode initialization skipped:', err)
}
