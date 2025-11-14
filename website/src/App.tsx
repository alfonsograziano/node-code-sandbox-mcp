import React, { lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NodeMCPServer from './pages/NodeMCPServer';
import TinyAgent from './pages/TinyAgent';
import GraphGPT from './pages/GraphGPT';
import Pillars from './pages/Pillars';
import { MDXComponent } from './Components/MDXComponent';
import PillarPage from './Components/pillars/PillarPage';

const ContextPillars = lazy(() => import("./staticPages/pillars/context.mdx"));


const contentRoutes = [
  { path: "pillars/context", component: ContextPillars, title: "Context Engineering" },
];

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mcp" element={<NodeMCPServer />} />
        <Route path="/tiny-agent" element={<TinyAgent />} />
        <Route path="/graph-gpt" element={<GraphGPT />} />
        <Route path="/pillars" element={<Pillars />} />
        {contentRoutes.map(({ path, component: Component, title }, index) => {
          console.log(`Adding route for path: ${path}`);
          return <Route key={index} path={path} element={<PillarPage component={<Component components={MDXComponent} />} articleTitle={title} />} />;
        })}
      </Routes>
    </Router>
  );
};

export default App;
