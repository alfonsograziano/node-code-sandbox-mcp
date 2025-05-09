import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Terminal,
  ShieldCheck,
  Cpu,
  Cloud,
  Code,
} from 'lucide-react';

import { UseCase, useCases } from './useCases';
interface Feature {
  title: string;
  description: string;
  icon: React.ElementType;
}

// Extract unique categories
const allCategories: string[] = [
  ...new Set(useCases.flatMap((u) => u.category)),
].sort();

// Feature list for landing page
const features: Feature[] = [
  {
    title: 'Ephemeral Containers',
    description:
      'Run JS scripts in isolated Docker containers that clean up automatically.',
    icon: Terminal,
  },
  {
    title: 'Secure Execution',
    description:
      'Sandboxed environment with resource limits and safe dependencies.',
    icon: ShieldCheck,
  },
  {
    title: 'Multiple Runtimes',
    description:
      'Support Node.js, Deno, Python and more through a unified API.',
    icon: Cpu,
  },
  {
    title: 'REST API',
    description:
      'Easily integrate with your apps using our simple HTTP endpoints.',
    icon: Cloud,
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

  const filteredCases =
    selectedCategories.length === 0
      ? useCases
      : useCases.filter((u) =>
          u.category.some((c) => selectedCategories.includes(c))
        );

  // Inline grid background style
  const gridBg: React.CSSProperties = {
    backgroundImage:
      'linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)',
    backgroundSize: '20px 20px',
  };

  return (
    <div style={gridBg} className="min-h-screen bg-gray-50 text-gray-900 p-6">
      {/* Header / Hero */}
      <header className="max-w-6xl mx-auto text-center py-16">
        <h1 className="text-5xl font-extrabold mb-4">
          Node.js Sandbox MCP Server
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          Run arbitrary JavaScript in ephemeral, secure Docker containers via a
          simple API.
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="#use-cases"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Explore Use Cases
          </a>
          <a
            href="https://github.com/alfonsograziano/node-code-sandbox-mcp"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            <ExternalLink size={16} /> GitHub
          </a>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto py-16">
        <h2 className="text-3xl font-bold text-center mb-8">Core Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map(({ title, description, icon: Icon }, i) => (
            <div
              key={i}
              className="bg-white bg-opacity-80 p-6 rounded-xl shadow-md"
            >
              <Icon width={32} height={32} className="text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <p className="text-gray-700">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use Cases Filter */}
      <section id="filter" className="max-w-6xl mx-auto py-8">
        <h2 className="text-2xl font-semibold mb-4">Filter by Category</h2>
        <div className="flex flex-wrap gap-2">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-all ${
                selectedCategories.includes(cat)
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-800 hover:bg-gray-100'
              }`}
            >
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Use Cases Grid */}
      <section id="use-cases" className="max-w-6xl mx-auto py-8">
        <h2 className="text-3xl font-bold text-center mb-8">Use Cases</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCases.map((u) => (
            <div
              key={u.id}
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
                    className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
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
                    className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
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
      </footer>
    </div>
  );
};

export default App;
