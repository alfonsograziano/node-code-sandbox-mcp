import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Terminal, Brain, Bot, GitBranch } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-gray-900"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Brain size={20} className="text-white" />
            </div>
            <span>JSDevAI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              Home
            </Link>
            <Link
              to="/mcp"
              className={`text-sm font-medium transition-colors ${
                isActive('/mcp')
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <Terminal size={16} />
                MCP Sandbox
              </div>
            </Link>
            <Link
              to="/tiny-agent"
              className={`text-sm font-medium transition-colors ${
                isActive('/tiny-agent')
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <Bot size={16} />
                Tiny Agent
              </div>
            </Link>
            <Link
              to="/graph-gpt"
              className={`text-sm font-medium transition-colors ${
                isActive('/graph-gpt')
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <GitBranch size={16} />
                GraphGPT
              </div>
            </Link>
            <a
              href="https://github.com/alfonsograziano/node-code-sandbox-mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
            >
              GitHub
            </a>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link
              to="/mcp"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <Terminal size={16} />
              Try Sandbox
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-gray-600 hover:text-green-600 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                onClick={closeMenu}
                className={`text-base font-medium transition-colors ${
                  isActive('/')
                    ? 'text-green-600'
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                Home
              </Link>
              <Link
                to="/mcp"
                onClick={closeMenu}
                className={`text-base font-medium transition-colors ${
                  isActive('/mcp')
                    ? 'text-green-600'
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Terminal size={16} />
                  MCP Sandbox
                </div>
              </Link>
              <Link
                to="/tiny-agent"
                onClick={closeMenu}
                className={`text-base font-medium transition-colors ${
                  isActive('/tiny-agent')
                    ? 'text-green-600'
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Bot size={16} />
                  Tiny Agent
                </div>
              </Link>
              <Link
                to="/graph-gpt"
                onClick={closeMenu}
                className={`text-base font-medium transition-colors ${
                  isActive('/graph-gpt')
                    ? 'text-green-600'
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GitBranch size={16} />
                  GraphGPT
                </div>
              </Link>
              <a
                href="https://github.com/alfonsograziano/node-code-sandbox-mcp"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                className="text-base font-medium text-gray-600 hover:text-green-600 transition-colors"
              >
                GitHub
              </a>

              <div className="pt-2">
                <Link
                  to="/mcp"
                  onClick={closeMenu}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors w-full justify-center"
                >
                  <Terminal size={16} />
                  Try Sandbox
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
