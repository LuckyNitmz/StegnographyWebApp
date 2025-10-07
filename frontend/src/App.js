import React, { useState } from 'react';
import EncodeSection from './components/EncodeSection';
import DecodeSection from './components/DecodeSection';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('encode');

  return (
    <div className="App">
      <header className="app-header">
        <h1>🔐 Steganography App</h1>
        <p>Securely hide and extract messages from images</p>
      </header>

      <div className="tab-container">
        <button
          className={`tab-button ${activeTab === 'encode' ? 'active' : ''}`}
          onClick={() => setActiveTab('encode')}
        >
          Encode
        </button>
        <button
          className={`tab-button ${activeTab === 'decode' ? 'active' : ''}`}
          onClick={() => setActiveTab('decode')}
        >
          Decode
        </button>
      </div>

      <main className="app-content">
        {activeTab === 'encode' ? <EncodeSection /> : <DecodeSection />}
      </main>

      <footer className="app-footer">
        <p>Made with ❤️ using React, Node.js, and Flask</p>
      </footer>
    </div>
  );
}

export default App;
