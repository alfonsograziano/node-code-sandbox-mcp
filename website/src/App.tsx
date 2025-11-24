import React, { lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import NodeMCPServer from './pages/NodeMCPServer';
import TinyAgent from './pages/TinyAgent';
import GraphGPT from './pages/GraphGPT';
import Pillars from './pages/Pillars';
import { MDXComponent } from './Components/MDXComponent';
import PillarPage from './Components/pillars/PillarPage';

const ContextPillars = lazy(() => import("./staticPages/pillars/context.mdx"));
const HITLPillar = lazy(() => import("./staticPages/pillars/hitl.mdx"));
const SpecDrivenDevelopment = lazy(() => import("./staticPages/pillars/spec-driven-development.mdx"));


const contentRoutes = [
  { path: "pillars/context", component: ContextPillars, title: "Context Engineering" },
  { path: "pillars/hitl", component: HITLPillar, title: "Human-in-the-Loop (HITL)" },
  { path: "pillars/spec-driven-development", component: SpecDrivenDevelopment, title: "Spec-Driven Development" },
];

// Component to update document title based on route
const DocumentTitle: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const baseTitle = "jsdevai.com";
    let pageTitle = "";

    // First check if it's a content route (pillar pages)
    const contentRoute = contentRoutes.find(route => {
      const routePath = route.path.startsWith('/') ? route.path : `/${route.path}`;
      return location.pathname === routePath || location.pathname.endsWith(`/${route.path}`);
    });

    if (contentRoute) {
      pageTitle = contentRoute.title;
    } else {
      // Handle other routes
      switch (location.pathname) {
        case "/":
          pageTitle = "Home";
          break;
        case "/mcp":
          pageTitle = "Node.js Sandbox MCP Server";
          break;
        case "/tiny-agent":
          pageTitle = "Tiny Agent";
          break;
        case "/graph-gpt":
          pageTitle = "GraphGPT";
          break;
        case "/pillars":
          pageTitle = "Pillars of AI Native Engineering";
          break;
        default:
          pageTitle = "jsdevai";
      }
    }

    document.title = pageTitle ? pageTitle : baseTitle;
  }, [location.pathname]);

  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <DocumentTitle />
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
