import React from 'react';
import {
  Brain,
  Code,
  Shield,
  Terminal,
  ArrowRight,
  CheckCircle,
  Play,
  Github,
  Database,
  FileText,
  Cpu,
  Server,
  HardDrive,
  Search,
  GitBranch,
  Package,
  Globe,
  ArrowUpRight,
  Settings,
} from 'lucide-react';
import Footer from '../Components/Footer';
import Header from '../Components/Header';

const TinyAgent: React.FC = () => {
  const gridBg: React.CSSProperties = {
    backgroundImage:
      'linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)',
    backgroundSize: '20px 20px',
  };

  const features = [
    {
      icon: Brain,
      title: 'Intelligent Agent',
      description: 'LLM-powered agent with context-aware decision making',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: Server,
      title: 'Server-Client Architecture',
      description:
        'Once the server is running, multiple clients can be used to interact with the agent',
      color: 'from-green-600 to-green-700',
    },
    {
      icon: Search,
      title: 'RAG System',
      description:
        'Automatic file indexing of your workspace and retrieval with semantic search',
      color: 'from-green-700 to-green-800',
    },
    {
      icon: HardDrive,
      title: 'Memory Persistence',
      description: 'Save and load agent memories using RAG and pgvector',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: Terminal,
      title: 'Built-in Tools',
      description:
        'Integrated MCP servers including code interpreter and Playwright',
      color: 'from-green-600 to-green-700',
    },
    {
      icon: Shield,
      title: 'Node.js Sandbox',
      description: 'Safe code execution environment for dynamic tool creation',
      color: 'from-green-700 to-green-800',
    },
  ];

  const architecture = [
    {
      title: 'Server',
      description:
        'Handles RAG operations, memory storage, MCP server management, and tool execution',
      icon: Server,
      features: [
        'File indexing',
        'Vector search',
        'Memory storage',
        'Tool registry',
      ],
    },
    {
      title: 'Client',
      description:
        'Provides command line interface, goal setting, tool invocation, and memory context management',
      icon: Cpu,
      features: [
        'User interaction',
        'Task management',
        'Tool handling',
        'Context management',
      ],
    },
  ];

  const tools = [
    {
      title: 'Code Interpreter',
      description:
        'Execute Node.js code in a sandboxed environment with resource limits',
      icon: Code,
      benefits: ['Safe execution', 'Resource limits', 'Dynamic tools'],
    },
    {
      title: 'Playwright Integration',
      description:
        'Web automation and scraping with browser control and interaction',
      icon: Globe,
      benefits: ['Web automation', 'Browser control', 'Screenshot analysis'],
    },
    {
      title: 'Filesystem Access',
      description: 'File reading, writing, and manipulation operations',
      icon: FileText,
      benefits: [
        'File operations',
        'Directory traversal',
        'Content manipulation',
      ],
    },
  ];

  const quickStart = [
    {
      step: '1',
      title: 'Prerequisites',
      description: 'Node.js 18+, PostgreSQL with pgvector, OpenAI API key',
      icon: CheckCircle,
    },
    {
      step: '2',
      title: 'Installation',
      description: 'Run npm install to get all dependencies',
      icon: Package,
    },
    {
      step: '3',
      title: 'Configuration',
      description: 'Set API keys and configure agent settings',
      icon: Settings,
    },
    {
      step: '4',
      title: 'Run',
      description: 'Start server and client processes',
      icon: Play,
    },
  ];

  return (
    <div style={gridBg} className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 items-center gap-12">
          {/* Left Column - Content */}
          <div className="text-center md:text-left order-2 md:order-1">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-700 leading-[1.2]">
                Tiny Agent
              </span>

              <span className="block text-3xl md:text-4xl font-normal text-gray-600 mt-1">
                A cute agent written in TypeScript
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl">
              An opinionated AI agent that comes with "batteries included":
              built-in tools, RAG capabilities, memory persistence, and powerful
              integrations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mb-12">
              <a
                href="https://github.com/alfonsograziano/meta-tiny-agents"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Github size={20} />
                View on GitHub
              </a>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-100 transition text-lg font-semibold"
              >
                <ArrowRight size={20} />
                Explore Features
              </a>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="flex justify-center md:justify-end order-1 md:order-2">
            <img
              src="/images/client.png"
              alt="Client illustration"
              className="max-w-full h-auto rounded-2xl shadow-xl"
            />
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need, Built Right In
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              No need to hunt for tools or build integrations - everything is
              already included and designed to work together seamlessly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2 border-gray-200 bg-white hover:border-green-200`}
              >
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Scalable Architecture
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built for production with server-client separation and intelligent
              resource management
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {architecture.map((arch, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg border border-gray-200"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-700 rounded-lg flex items-center justify-center">
                    <arch.icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">{arch.title}</h3>
                </div>
                <p className="text-gray-600 mb-6">{arch.description}</p>
                <ul className="space-y-2">
                  {arch.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-gray-700"
                    >
                      <CheckCircle size={16} className="text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built-in Tools & Capabilities
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive toolset for AI development and automation
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {tools.map((tool, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-700 rounded-lg flex items-center justify-center mb-4">
                  <tool.icon size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{tool.title}</h3>
                <p className="text-gray-600 mb-4">{tool.description}</p>
                <ul className="space-y-2">
                  {tool.benefits.map((benefit, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <ArrowRight size={14} className="text-purple-500" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-green-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple setup process to get your AI agent running quickly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickStart.map((step, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="https://github.com/alfonsograziano/meta-tiny-agents"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Github size={20} />
              Start Building
              <ArrowUpRight size={20} />
            </a>
          </div>
        </div>
      </section>

      {/* RAG & Memory Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Advanced RAG & Memory System
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Tiny Agent automatically indexes your workspace and provides
                intelligent context retrieval for seamless AI workflows.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle size={14} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Automatic File Indexing</h4>
                    <p className="text-gray-600 text-sm">
                      Files are automatically processed and indexed for semantic
                      search
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle size={14} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Vector Storage</h4>
                    <p className="text-gray-600 text-sm">
                      Uses pgvector for efficient similarity search and
                      retrieval
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle size={14} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Memory Persistence</h4>
                    <p className="text-gray-600 text-sm">
                      Memories survive restarts and are stored as semantic
                      vectors
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-green-100 to-green-200 p-8 rounded-2xl">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Search size={16} className="text-purple-500" />
                      <span className="font-mono text-sm text-gray-600">
                        RAG Query
                      </span>
                    </div>
                    <p className="text-sm text-gray-800">
                      Find relevant context for AI tasks
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Database size={16} className="text-blue-500" />
                      <span className="font-mono text-sm text-gray-600">
                        Vector Search
                      </span>
                    </div>
                    <p className="text-sm text-gray-800">
                      Semantic similarity matching
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <HardDrive size={16} className="text-green-500" />
                      <span className="font-mono text-sm text-gray-600">
                        Memory Store
                      </span>
                    </div>
                    <p className="text-sm text-gray-800">
                      Persistent context across sessions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Build AI Agents the Right Way?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Skip the setup headaches and start building with our opinionated,
            batteries-included framework
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://github.com/alfonsograziano/meta-tiny-agents"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition text-lg font-semibold shadow-lg"
            >
              <Github size={20} />
              Star on GitHub
            </a>
            <a
              href="https://github.com/alfonsograziano/meta-tiny-agents"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-green-600 transition text-lg font-semibold"
            >
              <GitBranch size={20} />
              Fork & Contribute
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default TinyAgent;
