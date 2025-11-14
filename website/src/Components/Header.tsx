import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Terminal, Brain, Bot, GitBranch, Landmark } from 'lucide-react';

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

  const isPillarsPage = location.pathname.includes('/pillars');

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isPillarsPage
          ? 'backdrop-blur-xl bg-gray-950/80 border-b border-white/10 shadow-2xl'
          : 'bg-white shadow-sm'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className={`flex items-center gap-2 text-xl font-bold transition-colors ${
              isPillarsPage ? 'text-white' : 'text-gray-900'
            }`}
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
                  : isPillarsPage
                  ? 'text-gray-300 hover:text-green-400'
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
                  : isPillarsPage
                  ? 'text-gray-300 hover:text-green-400'
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
                  : isPillarsPage
                  ? 'text-gray-300 hover:text-green-400'
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
                  : isPillarsPage
                  ? 'text-gray-300 hover:text-green-400'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <GitBranch size={16} />
                GraphGPT
              </div>
            </Link>
            <Link
              to="/pillars"
              className={`text-sm font-medium transition-colors ${
                isActive('/pillars')
                  ? 'text-green-600 border-b-2 border-green-600'
                  : isPillarsPage
                  ? 'text-gray-300 hover:text-green-400'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <Landmark size={16} />
                Pillars
              </div>
            </Link>
            <a
              href="https://github.com/alfonsograziano/node-code-sandbox-mcp"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm font-medium transition-colors ${
                isPillarsPage
                  ? 'text-gray-300 hover:text-green-400'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              GitHub
            </a>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link
              to="/mcp"
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isPillarsPage
                  ? 'backdrop-blur-md bg-gradient-to-r from-green-600/20 to-green-600/10 border border-green-600/30 text-green-400 hover:border-green-600/50 hover:bg-green-600/30 hover:shadow-[0_0_20px_rgba(22,163,74,0.3)]'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <Terminal size={16} />
              Try Sandbox
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className={`md:hidden p-2 transition-colors ${
              isPillarsPage
                ? 'text-gray-300 hover:text-green-400'
                : 'text-gray-600 hover:text-green-600'
            }`}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div
            className={`md:hidden border-t py-4 ${
              isPillarsPage ? 'border-white/10' : 'border-gray-200'
            }`}
          >
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                onClick={closeMenu}
                className={`text-base font-medium transition-colors ${
                  isActive('/')
                    ? 'text-green-600'
                    : isPillarsPage
                    ? 'text-gray-300 hover:text-green-400'
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
                    : isPillarsPage
                    ? 'text-gray-300 hover:text-green-400'
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
                    : isPillarsPage
                    ? 'text-gray-300 hover:text-green-400'
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
                    : isPillarsPage
                    ? 'text-gray-300 hover:text-green-400'
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GitBranch size={16} />
                  GraphGPT
                </div>
              </Link>
              <Link
                to="/pillars"
                onClick={closeMenu}
                className={`text-base font-medium transition-colors ${
                  isActive('/pillars')
                    ? 'text-green-600'
                    : isPillarsPage
                    ? 'text-gray-300 hover:text-green-400'
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                Pillars
              </Link>
              <a
                href="https://github.com/alfonsograziano/node-code-sandbox-mcp"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                className={`text-base font-medium transition-colors ${
                  isPillarsPage
                    ? 'text-gray-300 hover:text-green-400'
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                GitHub
              </a>

              <div className="pt-2">
                <Link
                  to="/mcp"
                  onClick={closeMenu}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors w-full justify-center ${
                    isPillarsPage
                      ? 'backdrop-blur-md bg-gradient-to-r from-green-600/20 to-green-600/10 border border-green-600/30 text-green-400 hover:border-green-600/50 hover:bg-green-600/30'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
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
