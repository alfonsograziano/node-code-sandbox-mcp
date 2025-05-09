import React, { useEffect, useState } from 'react';
import {
  X,
  Terminal,
  ShieldCheck,
  Cpu,
  Package,
  Code,
  Settings,
  Server,
  Star,
} from 'lucide-react';

import { UseCase, useCases } from './useCases';
import GettingStarted from './Components/GettingStarted';

interface Feature {
  title: string;
  description: string;
  icon: React.ElementType;
}

// Extract unique categories
const allCategories: string[] = [
  ...new Set(useCases.flatMap((u) => u.category)),
].sort();

const features: Feature[] = [
  {
    title: 'Ephemeral Containers',
    description:
      'Run JavaScript in isolated Docker containers that clean up automatically after execution.',
    icon: Terminal,
  },
  {
    title: 'Secure Execution',
    description:
      'Sandboxed execution with CPU/memory limits and safe, controlled environments.',
    icon: ShieldCheck,
  },
  {
    title: 'Detached Mode',
    description:
      'Keep containers alive after execution to host servers or persistent processes.',
    icon: Cpu,
  },
  {
    title: 'Optimized Docker Images',
    description:
      'Use prebuilt Docker images with popular dependencies already installed—perfect for advanced use cases like Playwright, Chart.js, and more.',
    icon: Package,
  },
  {
    title: 'NPM Dependencies',
    description:
      'Install dependencies on-the-fly per job using package name and version.',
    icon: Settings,
  },
  {
    title: 'Multi-Tool Support',
    description:
      'Use ephemeral runs or long-lived sandbox sessions, depending on your use case.',
    icon: Server,
  },
];

const App: React.FC = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedCase, setSelectedCase] = useState<UseCase | null>(null);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const openModal = (useCase: UseCase) => {
    setSelectedCase(useCase);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCase(null);
  };

  useEffect(() => {
    if (modalOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [modalOpen]);

  const filteredCases =
    selectedCategories.length === 0
      ? useCases
      : useCases.filter((u) =>
          u.category.some((c) => selectedCategories.includes(c))
        );

  const gridBg: React.CSSProperties = {
    backgroundImage:
      'linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)',
    backgroundSize: '20px 20px',
  };

  return (
    <div style={gridBg} className="min-h-screen bg-gray-50 text-gray-900 p-6">
      {/* Hero Section */}
      <header className="max-w-6xl mx-auto text-center py-16">
        <h1 className="text-5xl font-extrabold mb-4">
          🐢🚀 Node.js Sandbox MCP Server
        </h1>
        {/* Compact MCP Info Banner */}
        <div className="max-w-3xl mx-auto mb-8 px-4 py-3 bg-green-50 border border-green-200 text-sm rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-center sm:text-left">
          <div className="text-gray-800">
            🧠 MCP is a protocol that lets AI models access tools and data
            through a standardized interface.
          </div>
          <a
            href="https://modelcontextprotocol.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-700 font-medium hover:underline"
          >
            Learn more →
          </a>
        </div>

        <p className="text-lg text-gray-700 mb-8">
          Run JavaScript in secure, disposable Docker containers via the Model
          Context Protocol (MCP). Automatic dependency installation included.
        </p>

        <div className="flex justify-center gap-4">
          <a
            href="#use-cases"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Explore Use Cases
          </a>
          <a
            href="https://github.com/alfonsograziano/node-code-sandbox-mcp"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-100 transition"
          >
            <Star size={16} className="text-yellow-500" fill="yellow" /> Star on
            GitHub
          </a>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Core Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map(({ title, description, icon: Icon }, i) => (
            <div
              key={i}
              className="bg-white bg-opacity-80 p-6 rounded-xl shadow-md"
            >
              <Icon width={32} height={32} className="text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <p className="text-gray-700">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Getting Started Section */}
      <GettingStarted />

      {/* Contribute Section */}
      <section id="contribute" className="max-w-4xl mx-auto my-10">
        <div className="bg-green-50 border border-green-200 p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold mb-2">
            🤝 Want to contribute to Node.js + AI?
          </h2>
          <p className="text-gray-800 mb-4">
            Brilliant! If you want to help, I’m opening a few issues on my new
            MCP server project. Since the project is still in its early stages,
            it’s the <strong>perfect time to jump in</strong> and become a core
            collaborator. 🚀
          </p>
          <p className="text-gray-800 mb-4">
            If you're excited about bringing <strong>Node.js</strong> into the
            world of <strong>AI applications</strong>, leave a comment or DM me,
            I'd love to have a chat!
          </p>
          <a
            href="https://github.com/alfonsograziano/node-code-sandbox-mcp/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            View Open Issues →
          </a>
        </div>
      </section>

      {/* Use Cases Grid */}
      <section id="use-cases" className="max-w-6xl mx-auto py-8">
        <h2 className="text-3xl font-bold text-center mb-8">Use Cases</h2>
        <p className="text-center text-gray-600 max-w-3xl mx-auto mb-8">
          Discover powerful, real-world examples you can run in seconds. From
          file generation to web scraping and AI workflows—this sandbox unlocks
          serious JavaScript potential in isolated containers.
        </p>

        <section id="filter" className="max-w-6xl mx-auto py-8">
          <h3 className="text-2xl font-semibold mb-4">Filter by Category</h3>
          <div className="flex flex-wrap gap-2">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  selectedCategories.includes(cat)
                    ? 'bg-green-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-800 hover:bg-gray-100'
                }`}
              >
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCases.map((u, index) => (
            <div
              key={index}
              onClick={() => openModal(u)}
              className="bg-white bg-opacity-80 p-6 rounded-xl shadow hover:shadow-lg cursor-pointer transition"
            >
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                {u.title}
              </h3>
              <p className="text-gray-700 mb-4">{u.description}</p>
              <div className="flex flex-wrap gap-2">
                {u.category.map((cat) => (
                  <span
                    key={cat}
                    className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs"
                  >
                    <span>{cat}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal */}
      {modalOpen && selectedCase && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white p-4 flex justify-between items-center border-b">
              <h2 className="text-2xl font-bold">{selectedCase.title}</h2>
              <button
                onClick={closeModal}
                aria-label="Close"
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCase.category.map((cat) => (
                  <span
                    key={cat}
                    className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                  >
                    <span>{cat}</span>
                  </span>
                ))}
              </div>
              <div className="mb-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold mb-2 text-gray-800">
                  <Code size={20} /> Prompt for AI
                </h3>
                <pre className="bg-gray-100 rounded-lg p-4 whitespace-pre-wrap text-sm text-gray-800">
                  {selectedCase.prompt}
                </pre>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">
                  Expected Result
                </h3>
                <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-800">
                  {selectedCase.result}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="max-w-6xl mx-auto py-8 text-center text-gray-600">
        <p>© 2025 Node.js Sandbox MCP Server • MIT License</p>
        <p className="text-sm mt-2">
          Requires Docker.{' '}
          <a
            href="https://github.com/alfonsograziano/node-code-sandbox-mcp"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:underline"
          >
            View full README
          </a>
        </p>
      </footer>
    </div>
  );
};

export default App;
