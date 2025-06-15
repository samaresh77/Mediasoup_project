import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WebRTC from './WebRTC';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WebRTC />} />
      </Routes>
    </Router>
  );
}

export default App;
