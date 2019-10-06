import React from 'react';
import './App.scss';
import Terminal from './components/terminal/Terminal';

const App: React.FC = () => {
  return (
    <div className="App">
      <Terminal />
      <div className="controls-helper">
        <div className="control">
          <div className="key">🠘   </div>
          <span className="label">Return to previous choice</span>
        </div>
        <div className="control">
          <div className="key">🠘 🠚 🠙 🠛</div>
          <span className="label">Select / navigate</span>
        </div>
        <div className="control">

          <div className="key">↵</div>
          <span className="label">Validate / Send</span>
        </div>

      </div>
    </div>
  );
}

export default App;
