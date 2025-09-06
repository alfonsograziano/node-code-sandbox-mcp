import React from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  Code,
  Zap,
  Shield,
  Rocket,
  Terminal,
  ArrowRight,
  CheckCircle,
  Play,
  Github,
  GitBranch,
} from 'lucide-react';
import Footer from '../Components/Footer';
import Header from '../Components/Header';

const Home: React.FC = () => {
  const gridBg: React.CSSProperties = {
    backgroundImage:
      'linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)',
    backgroundSize: '20px 20px',
  };

  const features = [
    {
      icon: Brain,
      title: 'AI-First Development',
      description:
        'Build intelligent applications with JavaScript-first AI tools and frameworks',
    },
    {
      icon: Zap,
      title: 'Rapid Prototyping',
      description:
        'Quickly iterate and test AI features with our sandboxed development environment',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description:
        'Production-ready security practices for AI applications in regulated industries',
    },
    {
      icon: Rocket,
      title: 'Scalable Architecture',
      description:
        'Design patterns and best practices for AI systems that grow with your business',
    },
  ];

  const tools = [
    {
      title: 'Node.js Sandbox MCP',
      description:
        'Run JavaScript in secure Docker containers with automatic dependency management',
      category: 'Development Tools',
      link: '/mcp',
      icon: Terminal,
    },
    {
      title: 'Tiny Agent Framework',
      description:
        'Intelligent AI agent framework with RAG capabilities and memory persistence',
      category: 'AI Development',
      link: '/tiny-agent',
      icon: Brain,
    },
    {
      title: 'GraphGPT',
      description:
        'Graph-based interface for LLM interactions that mirrors human thinking patterns',
      category: 'AI Interface',
      link: '/graph-gpt',
      icon: GitBranch,
    },
  ];

  return (
    <div style={gridBg} className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Build the Future of
            <span className="block text-green-600">AI-Powered Apps</span>
            <span className="block text-3xl md:text-4xl font-normal text-gray-600 mt-4">
              with JavaScript
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Your comprehensive toolkit for building intelligent applications.
            From AI integration to production deployment, we've got everything
            you need to succeed in the AI revolution.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/mcp"
              className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-lg font-semibold"
            >
              <Play size={20} />
              Try Our Sandbox
            </Link>
            <a
              href="#tools"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-100 transition text-lg font-semibold"
            >
              <Code size={20} />
              Explore Tools
            </a>
          </div>

          {/* Hero Image */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl p-2 shadow-2xl">
              <img
                src="/images/js_ai.jpeg"
                alt="JavaScript AI Development - Showcase of AI-powered development workflow with modern tools and frameworks"
                className="w-full h-auto rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Why JavaScript for AI Section - Expanded */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Why JavaScript for AI Development?
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto">
              While Python dominates model training, JavaScript excels at
              building the applications that users actually interact with.
              Here's why JS is the perfect choice for AI-powered apps.
            </p>
          </div>

          {/* Main Value Proposition */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">
                  Build Where Users Are
                </h3>
                <p className="text-lg text-gray-700 mb-6">
                  JavaScript runs everywhere your users are - browsers, mobile
                  apps, servers, and edge computing. While Python trains the
                  models, JavaScript delivers the experience.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle size={16} className="text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium">
                      Frontend AI interfaces that users love
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle size={16} className="text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium">
                      Real-time AI responses with WebSockets
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle size={16} className="text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium">
                      Edge AI deployment for low latency
                    </span>
                  </div>
                </div>
              </div>

              {/* Code Example Image */}
              <div className="bg-gray-900 rounded-xl">
                <img
                  src="/images/simple_agent.jpeg"
                  alt="Simple AI Agent Code Example - JavaScript AI chat interface implementation in React"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>

          {/* AI Use Cases Grid */}
          <div className="mb-16">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">
              What You Can Build with JavaScript AI
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* RAG Applications */}
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <h4 className="text-xl font-semibold mb-3">RAG Applications</h4>
                <p className="text-gray-600 mb-4">
                  Build intelligent search and question-answering systems that
                  combine your data with AI models.
                </p>
                <div className="text-sm text-gray-500">
                  <strong>Tools:</strong> LangChain.js, Vector DBs, OpenAI API
                </div>
              </div>

              {/* AI Agents */}
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <h4 className="text-xl font-semibold mb-3">AI Agents</h4>
                <p className="text-gray-600 mb-4">
                  Create autonomous agents that can browse the web, use tools,
                  and complete complex multi-step tasks.
                </p>
                <div className="text-sm text-gray-500">
                  <strong>Tools:</strong> Playwright, Puppeteer, Function
                  Calling
                </div>
              </div>

              {/* Real-time AI Chat */}
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <h4 className="text-xl font-semibold mb-3">
                  Real-time AI Chat
                </h4>
                <p className="text-gray-600 mb-4">
                  Build responsive chat interfaces with streaming responses,
                  typing indicators, and rich media support.
                </p>
                <div className="text-sm text-gray-500">
                  <strong>Tools:</strong> WebSockets, Server-Sent Events, React
                </div>
              </div>

              {/* AI-Powered APIs */}
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h4 className="text-xl font-semibold mb-3">AI-Powered APIs</h4>
                <p className="text-gray-600 mb-4">
                  Create intelligent backends that process natural language,
                  generate content, and make smart decisions.
                </p>
                <div className="text-sm text-gray-500">
                  <strong>Tools:</strong> Express.js, Fastify, Serverless
                </div>
              </div>

              {/* Browser AI */}
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🌐</span>
                </div>
                <h4 className="text-xl font-semibold mb-3">Browser AI</h4>
                <p className="text-gray-600 mb-4">
                  Run AI models directly in the browser with WebAssembly,
                  enabling privacy-first AI applications.
                </p>
                <div className="text-sm text-gray-500">
                  <strong>Tools:</strong> ONNX.js, TensorFlow.js, WebAssembly
                </div>
              </div>

              {/* AI Automation */}
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🔄</span>
                </div>
                <h4 className="text-xl font-semibold mb-3">AI Automation</h4>
                <p className="text-gray-600 mb-4">
                  Automate workflows with AI-driven decision making, from
                  content generation to data processing.
                </p>
                <div className="text-sm text-gray-500">
                  <strong>Tools:</strong> Node.js, Cron Jobs, Webhooks
                </div>
              </div>
            </div>
          </div>

          {/* JavaScript AI Advantages */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">
                🚀 JavaScript AI Superpowers
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-lg mb-2 text-gray-800">
                    Async by Nature
                  </h4>
                  <p className="text-gray-600">
                    JavaScript's async/await makes it perfect for AI API calls,
                    streaming responses, and handling multiple concurrent AI
                    operations without blocking the UI.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2 text-gray-800">
                    JSON Native
                  </h4>
                  <p className="text-gray-600">
                    AI APIs speak JSON, and JavaScript speaks JSON natively. No
                    parsing overhead, no type conversion - just seamless data
                    flow.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2 text-gray-800">
                    Real-time Ready
                  </h4>
                  <p className="text-gray-600">
                    WebSockets, Server-Sent Events, and WebRTC are built into
                    the ecosystem. Perfect for streaming AI responses and
                    collaborative AI features.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">
                🌍 Ecosystem Advantages
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-lg mb-2 text-gray-800">
                    2M+ NPM Packages
                  </h4>
                  <p className="text-gray-600">
                    The largest package ecosystem in the world includes
                    countless AI libraries, integrations, and tools ready to use
                    in your projects.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2 text-gray-800">
                    Universal Deployment
                  </h4>
                  <p className="text-gray-600">
                    Deploy anywhere: Vercel, Netlify, AWS Lambda, Cloudflare
                    Workers, or traditional servers. One codebase, infinite
                    possibilities.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2 text-gray-800">
                    Developer Velocity
                  </h4>
                  <p className="text-gray-600">
                    Hot reload, excellent debugging, TypeScript support, and the
                    best developer tools mean you can iterate on AI features
                    incredibly fast.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Integration Examples */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-16">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">
              Popular AI Integrations in JavaScript
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">🤖</span>
                </div>
                <h4 className="font-semibold mb-2">OpenAI</h4>
                <p className="text-sm text-gray-600">GPT-4, DALL-E, Whisper</p>
                <a
                  href="https://github.com/openai/openai-node"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-600 hover:underline"
                >
                  openai-node
                </a>
              </div>
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">🧠</span>
                </div>
                <h4 className="font-semibold mb-2">Anthropic</h4>
                <p className="text-sm text-gray-600">
                  Claude, Constitutional AI
                </p>
                <a
                  href="https://github.com/anthropics-ai/anthropic-sdk-typescript"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  anthropic-sdk
                </a>
              </div>
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">🔗</span>
                </div>
                <h4 className="font-semibold mb-2">LangChain</h4>
                <p className="text-sm text-gray-600">Agents, Chains, Tools</p>
                <a
                  href="https://github.com/langchain-ai/langchainjs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-600 hover:underline"
                >
                  langchainjs
                </a>
              </div>
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">📊</span>
                </div>
                <h4 className="font-semibold mb-2">Vector DBs</h4>
                <p className="text-sm text-gray-600">
                  Pinecone, Weaviate, Chroma
                </p>
                <a
                  href="https://github.com/pinecone-io/pinecone-js"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-orange-600 hover:underline"
                >
                  pinecone-js
                </a>
              </div>
            </div>
          </div>

          {/* JavaScript AI Frameworks & Tools */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 md:p-12 mb-16">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">
              JavaScript AI Frameworks & Tools
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Vercel AI SDK */}
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl font-bold">▲</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">Vercel AI SDK</h4>
                    <p className="text-sm text-gray-500">
                      Streaming AI responses
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  Build AI-powered streaming text and chat UIs with React,
                  Svelte, Vue, and more.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                    React/Next.js
                  </span>
                  <a
                    href="https://github.com/vercel/ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    GitHub →
                  </a>
                </div>
              </div>

              {/* TensorFlow.js */}
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl font-bold">TF</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">TensorFlow.js</h4>
                    <p className="text-sm text-gray-500">
                      Browser ML framework
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  Run machine learning models directly in the browser with
                  JavaScript.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                    ML/AI
                  </span>
                  <a
                    href="https://github.com/tensorflow/tfjs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    GitHub →
                  </a>
                </div>
              </div>

              {/* Hugging Face */}
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl font-bold">🤗</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">Hugging Face</h4>
                    <p className="text-sm text-gray-500">Transformers.js</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  Run transformer models in the browser with zero dependencies.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                    NLP
                  </span>
                  <a
                    href="https://github.com/xenova/transformers.js"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    GitHub →
                  </a>
                </div>
              </div>

              {/* AutoGen */}
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl font-bold">🤖</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">Mastra</h4>
                    <p className="text-sm text-gray-500">
                      TypeScript Agent Framework
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  The TypeScript Agent Framework from the Gatsby team. Build AI
                  agents with modern JavaScript.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                    Agents
                  </span>
                  <a
                    href="https://mastra.ai/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Website →
                  </a>
                </div>
              </div>

              {/* ChromaDB */}
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl font-bold">📊</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">ChromaDB</h4>
                    <p className="text-sm text-gray-500">Vector database</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  Embedding database for AI applications with JavaScript client.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Vector DB
                  </span>
                  <a
                    href="https://docs.trychroma.com/docs/overview/introduction#javascripttypescript"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Docs →
                  </a>
                </div>
              </div>

              {/* BMAD-METHOD */}
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl font-bold">🚀</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">BMAD-METHOD™</h4>
                    <p className="text-sm text-gray-500">
                      Universal AI Agent Framework
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  Universal AI Agent Framework with Agentic Planning and
                  Context-Engineered Development for any domain.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    AI Agents
                  </span>
                  <a
                    href="https://github.com/bmad-code-org/bmad-method"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    GitHub →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Section */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 text-white mb-16">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Python vs JavaScript in AI Development
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/10 rounded-xl p-6">
                <h4 className="text-xl font-semibold mb-4 text-yellow-400">
                  🐍 Python's Domain
                </h4>
                <ul className="space-y-3 text-gray-300">
                  <li>• Model training & fine-tuning</li>
                  <li>• Data science & research</li>
                  <li>• Deep learning frameworks</li>
                  <li>• Scientific computing</li>
                  <li>• ML experimentation</li>
                </ul>
              </div>
              <div className="bg-white/10 rounded-xl p-6">
                <h4 className="text-xl font-semibold mb-4 text-green-400">
                  ⚡ JavaScript's Domain
                </h4>
                <ul className="space-y-3 text-gray-300">
                  <li>• User-facing AI applications</li>
                  <li>• Real-time AI interactions</li>
                  <li>• AI-powered web & mobile apps</li>
                  <li>• Agent orchestration</li>
                  <li>• Production AI deployment</li>
                </ul>
              </div>
            </div>
            <div className="text-center mt-8">
              <p className="text-lg text-gray-300">
                <strong className="text-white">The Perfect Partnership:</strong>{' '}
                Train in Python, Deploy in JavaScript
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 md:p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Build AI Apps with JavaScript?
            </h3>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of developers who are already building the future
              of AI applications with the language they know and love.
            </p>
            <Link
              to="/mcp"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition text-lg font-semibold"
            >
              <Terminal size={20} />
              Start Building Now
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Build AI Apps
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From development tools to production best practices, we've curated
              the essential resources for modern AI development with JavaScript.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white bg-opacity-80 p-6 rounded-xl shadow-md hover:shadow-lg transition"
              >
                <feature.icon
                  width={32}
                  height={32}
                  className="text-green-600 mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-700">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Essential AI Development Tools
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover the tools that will accelerate your AI development
              journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:border-green-300 transition"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <tool.icon size={24} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {tool.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{tool.title}</h3>
                    <p className="text-gray-600 mb-4">{tool.description}</p>
                    {tool.link ? (
                      <Link
                        to={tool.link}
                        className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                      >
                        Learn More <ArrowRight size={16} />
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-gray-400 font-medium">
                        Coming Soon <ArrowRight size={16} />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join the AI JavaScript Community
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with developers, share knowledge, and stay updated with the
            latest AI development trends and tools.
          </p>

          <div className="flex justify-center">
            <a
              href="https://github.com/alfonsograziano/node-code-sandbox-mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
            >
              <Github size={20} />
              GitHub Community
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Build the Future?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start your AI development journey with our comprehensive toolkit and
            community support.
          </p>
          <div className="flex justify-center">
            <Link
              to="/mcp"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition text-lg font-semibold"
            >
              <Terminal size={20} />
              Try Our Sandbox
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
