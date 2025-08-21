import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NodeMCPServer from './pages/NodeMCPServer';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mcp" element={<NodeMCPServer />} />
      </Routes>
    </Router>
  );
};

export default App;
