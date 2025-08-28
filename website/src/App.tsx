import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NodeMCPServer from './pages/NodeMCPServer';
import TinyAgent from './pages/TinyAgent';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mcp" element={<NodeMCPServer />} />
        <Route path="/tiny-agent" element={<TinyAgent />} />
      </Routes>
    </Router>
  );
};

export default App;
