import React from 'react';
import {
  Brain,
  GitBranch,
  Zap,
  Play,
  Github,
  CheckCircle,
  Database,
  Layers,
  Users,
  ExternalLink,
} from 'lucide-react';
import Footer from '../Components/Footer';
import Header from '../Components/Header';

const GraphGPT: React.FC = () => {
  const gridBg: React.CSSProperties = {
    backgroundImage:
      'linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)',
    backgroundSize: '20px 20px',
  };

  const features = [
    {
      icon: GitBranch,
      title: 'Non-linear Conversations',
      description:
        'Create multiple conversation branches from any point in your interaction',
    },
    {
      icon: Layers,
      title: 'Visual Graph Interface',
      description:
        'Intuitive node-based conversation management using React Flow',
    },
    {
      icon: Zap,
      title: 'Real-time Streaming',
      description: 'Live markdown rendering as the AI responds',
    },
    {
      icon: Brain,
      title: 'Contextual Branching',
      description: 'Create new nodes from specific parts of AI responses',
    },
    {
      icon: Database,
      title: 'Conversation Persistence',
      description: 'Save and manage multiple conversation graphs',
    },
    {
      icon: Users,
      title: 'Interactive Node Management',
      description:
        'Click to activate conversation paths, drag to reposition nodes',
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
            GraphGPT
            <span className="block text-3xl md:text-4xl font-normal text-gray-600 mt-4">
              A graph-based interface for LLM interactions
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Mirror human thinking patterns with non-linear conversations.
            Instead of linear chat, explore multiple conversation paths
            simultaneously, creating a visual knowledge graph of your AI
            interactions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a
              href="https://github.com/alfonsograziano/graph-gpt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-lg font-semibold"
            >
              <Github size={20} />
              View on GitHub
            </a>
            <a
              href="https://www.youtube.com/watch?v=AGMuGlKxO3w"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-100 transition text-lg font-semibold"
            >
              <Play size={20} />
              Watch Demo
            </a>
          </div>

          {/* Hero Image */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-purple-400 to-blue-500 rounded-2xl p-2 shadow-2xl">
              <img
                src="/images/graph-gpt.png"
                alt="GraphGPT Demo Interface - Interactive graph visualization of AI conversations with nodes and branches"
                className="w-full h-auto rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Demo Video Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              📹 See GraphGPT in Action
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Watch how GraphGPT transforms traditional linear conversations
              into dynamic, explorative knowledge graphs.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-2 shadow-2xl">
              <div className="bg-black rounded-xl overflow-hidden">
                <iframe
                  width="100%"
                  height="400"
                  src="https://www.youtube.com/embed/AGMuGlKxO3w"
                  title="GraphGPT Demo Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full aspect-video rounded-lg"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              🌟 Key Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the future of AI conversations with these powerful
              features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition"
              >
                <feature.icon
                  width={32}
                  height={32}
                  className="text-purple-600 mb-4"
                />
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reference Parts of Conversation Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              🔗 Reference Parts of a Conversation
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Link new chat inputs to specific parts of your conversation for
              more contextual and focused AI interactions
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">
                  Contextual Branching
                </h3>
                <p className="text-lg text-gray-700 mb-6">
                  Select any part of your conversation and create a new branch
                  from that specific point. This allows you to explore different
                  directions while maintaining the context of your original
                  discussion.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <CheckCircle size={16} className="text-blue-600" />
                    </div>
                    <span className="text-gray-700 font-medium">
                      Click on any message to create a branch
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <CheckCircle size={16} className="text-blue-600" />
                    </div>
                    <span className="text-gray-700 font-medium">
                      Maintain conversation context automatically
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <CheckCircle size={16} className="text-blue-600" />
                    </div>
                    <span className="text-gray-700 font-medium">
                      Explore multiple conversation paths simultaneously
                    </span>
                  </div>
                </div>
              </div>

              {/* Reference Parts Screenshot */}
              <div className="bg-white rounded-xl shadow-lg">
                <img
                  src="/images/graph-gpt_reference_section.png"
                  alt="GraphGPT Reference Parts - Visual demonstration of contextual branching and conversation referencing"
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Markdown Support Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Markdown Support Screenshot */}
            <div className="bg-white rounded-xl shadow-lg">
              <img
                src="/images/graph-gpt_markdown.png"
                alt="GraphGPT Markdown Support - Real-time markdown rendering demonstration with code highlighting and formatting"
                className="w-full h-auto rounded-lg"
              />
            </div>

            <div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  📝 Markdown Support
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Rich text formatting and real-time rendering for enhanced
                  conversation readability and structure
                </p>
              </div>

              <p className="text-lg text-gray-700 mb-6">
                GraphGPT supports full Markdown formatting, allowing you to
                create structured, readable conversations with headers, lists,
                code blocks, and more. All formatting is rendered in real-time
                as the AI responds.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle size={16} className="text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">
                    Real-time markdown rendering
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle size={16} className="text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">
                    Code syntax highlighting
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle size={16} className="text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">
                    Tables, lists, and formatting support
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              🚀 Quick Start
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get GraphGPT running on your machine in just a few steps
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Prerequisites */}
              <div>
                <h3 className="text-2xl font-bold mb-6">Prerequisites</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle size={16} className="text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium">
                      Node.js v20+
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle size={16} className="text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium">
                      MongoDB (local with Docker, or cloud instance)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle size={16} className="text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium">
                      OpenAI API key
                    </span>
                  </div>
                </div>
              </div>

              {/* Installation Steps */}
              <div>
                <h3 className="text-2xl font-bold mb-6">Installation</h3>
                <div className="space-y-4">
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <code className="text-green-400 text-sm whitespace-nowrap">
                      git clone https://github.com/alfonsograziano/graph-gpt.git
                      <br />
                      cd graph-gpt
                      <br />
                      npm install
                    </code>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <code className="text-green-400 text-sm whitespace-nowrap">
                      cp .env.example .env.local
                      <br /># Add your OpenAI API key and MongoDB URI
                    </code>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <code className="text-green-400 text-sm whitespace-nowrap">
                      npm run start:mongodb
                      <br />
                      npm run dev
                    </code>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <a
                href="https://github.com/alfonsograziano/graph-gpt"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-lg font-semibold"
              >
                <Github size={20} />
                Get Started on GitHub
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contributing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            🤝 Contributing
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            We welcome contributions! Please feel free to open a PR or an issue
            to request features :D
          </p>
          <div className="flex justify-center">
            <a
              href="https://github.com/alfonsograziano/graph-gpt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
            >
              <Github size={20} />
              Contribute on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your AI Conversations?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Experience the future of AI interaction with GraphGPT's innovative
            graph-based conversation interface.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://github.com/alfonsograziano/graph-gpt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition text-lg font-semibold"
            >
              <Github size={20} />
              View on GitHub
            </a>
            <a
              href="https://www.youtube.com/watch?v=AGMuGlKxO3w"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-purple-600 transition text-lg font-semibold"
            >
              <Play size={20} />
              Watch Demo
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default GraphGPT;
