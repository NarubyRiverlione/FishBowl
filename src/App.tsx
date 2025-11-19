import React from 'react'
import AquariumCanvas from './components/AquariumCanvas'

const App: React.FC = () => {
  return (
    <div className="app-container" style={{ textAlign: 'center', padding: '20px' }}>
      <h1>FishBowl Visual Prototype</h1>
      <AquariumCanvas width={800} height={600} />
    </div>
  )
}

export default App
