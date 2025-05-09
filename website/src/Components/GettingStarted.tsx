import React, { useState } from 'react';
import clsx from 'clsx';

const GettingStarted: React.FC = () => {
  const [selectedClient, setSelectedClient] = useState<'claude' | 'vscode'>(
    'claude'
  );
  const [variant, setVariant] = useState<'docker' | 'npx'>('docker');

  const codeSnippets = {
    claude: {
      docker: {
        mcpServers: {
          'js-sandbox': {
            command: 'docker',
            args: [
              'run',
              '-i',
              '--rm',
              '-v',
              '/var/run/docker.sock:/var/run/docker.sock',
              '-v',
              '$HOME/Desktop/sandbox-output:/root',
              '-e',
              'FILES_DIR=$HOME/Desktop/sandbox-output',
              'alfonsograziano/node-code-sandbox-mcp',
            ],
          },
        },
      },
      npx: {
        mcpServers: {
          'node-code-sandbox-mcp': {
            type: 'stdio',
            command: 'npx',
            args: ['-y', 'node-code-sandbox-mcp'],
            env: {
              FILES_DIR: '/Users/your_user/Desktop/node-sandbox',
            },
          },
        },
      },
    },
    vscode: {
      docker: {
        mcp: {
          servers: {
            'js-sandbox': {
              command: 'docker',
              args: [
                'run',
                '-i',
                '--rm',
                '-v',
                '/var/run/docker.sock:/var/run/docker.sock',
                '-v',
                '$HOME/Desktop/sandbox-output:/root',
                '-e',
                'FILES_DIR=$HOME/Desktop/sandbox-output',
                'alfonsograziano/node-code-sandbox-mcp',
              ],
            },
          },
        },
      },
      npx: {
        mcp: {
          servers: {
            'js-sandbox': {
              type: 'stdio',
              command: 'npx',
              args: ['-y', 'node-code-sandbox-mcp'],
              env: {
                FILES_DIR: '/Users/your_user/Desktop/node-sandbox',
              },
            },
          },
        },
      },
    },
  };

  const tabs = [
    { key: 'claude', label: 'Claude Desktop' },
    { key: 'vscode', label: 'VS Code' },
  ];

  return (
    <section id="getting-started" className="max-w-6xl mx-auto py-16">
      <h2 className="text-3xl font-bold text-center mb-4">Getting Started</h2>
      <p className="text-center text-gray-700 mb-8">
        To get started, first of all you need to import the server in your MCP
        client.
      </p>

      <div className="bg-white rounded-xl shadow p-6 space-y-6">
        {/* Tabs + Switch */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() =>
                  setSelectedClient(tab.key as typeof selectedClient)
                }
                className={clsx(
                  'px-4 py-2 rounded-full text-sm font-medium border transition-all',
                  selectedClient === tab.key
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Variant:</span>
            <button
              onClick={() => setVariant('docker')}
              className={clsx(
                'px-3 py-1 rounded-full border text-sm font-medium',
                variant === 'docker'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-800 hover:bg-gray-100'
              )}
            >
              Docker
            </button>
            <button
              onClick={() => setVariant('npx')}
              className={clsx(
                'px-3 py-1 rounded-full border text-sm font-medium',
                variant === 'npx'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-800 hover:bg-gray-100'
              )}
            >
              NPX
            </button>
          </div>
        </div>

        {/* Config Code */}
        <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto whitespace-pre">
          {JSON.stringify(codeSnippets[selectedClient][variant], null, 2)}
        </pre>

        <p className="text-sm text-gray-700">
          Copy this snippet into your configuration file. Ensure Docker is
          running and your volumes are mounted correctly.
        </p>
      </div>
    </section>
  );
};

export default GettingStarted;
