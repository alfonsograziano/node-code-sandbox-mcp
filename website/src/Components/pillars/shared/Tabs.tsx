import React, { useState } from 'react';

interface TabsProps {
  tabs: Array<{ id: string; label: string; content: React.ReactNode }>;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({ tabs, className = '' }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '');

  return (
    <div className={className} role="tablist" aria-label="Content tabs">
      <div className="flex gap-2 mb-6 border-b border-white/10 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-medium transition-all duration-300 border-b-2 focus:outline-none focus:ring-2 focus:ring-green-600/50 focus:ring-offset-2 focus:ring-offset-gray-950 ${
              activeTab === tab.id
                ? 'border-green-600 text-green-400 bg-green-600/10 hover:bg-green-600/15'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
            }`}
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            role="tab"
            id={`tab-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6 transition-all duration-300 animate-in fade-in slide-in-from-top-2"
      >
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};

export default Tabs;

