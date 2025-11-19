import React from 'react';

const App: React.FC = () => {
  return (
    <div className="app-container">
      <h1>FishBowl Visual Prototype</h1>
      <div id="canvas-container">
        {/* PixiJS canvas will be mounted here */}
      </div>
    </div>
  );
};

export default App;
