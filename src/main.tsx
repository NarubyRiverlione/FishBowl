import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import useGameStore from './store/useGameStore'

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)

// Initialize game mode from URL params (use explicit setMode for dev)
try {
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  if (params) {
    const dev = params.get('dev') === 'true'
    if (dev) {
      useGameStore.getState().setMode?.('dev')
    } else {
      // fall back to initializeFromQuery for other params (e.g., tutorial=false)
      useGameStore.getState().initializeFromQuery?.()
    }
  }
} catch (err) {
  // non-fatal: allow app to start even if initialization fails

  console.warn('Game mode initialization skipped:', err)
}
