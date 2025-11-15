import React, { useState } from 'react';

interface ConceptCardProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  expandable?: boolean;
  defaultExpanded?: boolean;
  children?: React.ReactNode;
}

const ConceptCard: React.FC<ConceptCardProps> = ({
  icon: Icon,
  title,
  description,
  expandable = false,
  defaultExpanded = false,
  children,
}) => {
  // Initialize state: if expandable and defaultExpanded are both true, start expanded
  const initialExpanded = expandable && defaultExpanded;
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  return (
    <div className="h-full flex flex-col backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-4 py-6 md:px-6 md:py-6 shadow-2xl hover:border-green-600/30 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(22,163,74,0.2)] hover:scale-[1.02] focus-within:border-green-600/30 focus-within:ring-2 focus-within:ring-green-600/20 transition-all duration-300 group">
      {/* Mobile: icon inline with title */}
      <div className="md:hidden flex flex-col flex-1">
        <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
          {Icon && (
            <Icon className="w-6 h-6 text-green-600 group-hover:text-green-400 transition-colors duration-300 flex-shrink-0" />
          )}
          {title}
        </h3>
        <p className="text-gray-400 mb-3 flex-1">{description}</p>
        <div className="mt-auto">
          {expandable && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-green-600 hover:text-green-400 text-sm font-medium transition-colors duration-300 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-600/50 focus:ring-offset-2 focus:ring-offset-gray-900 rounded px-2 py-1"
              aria-expanded={isExpanded}
              aria-controls={`concept-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
            >
              {isExpanded ? 'Show Less' : 'Learn More'}
              <span className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
          )}
          {expandable && isExpanded && children && (
            <div
              id={`concept-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
              className="mt-4 pt-4 border-t border-white/10 animate-in fade-in slide-in-from-top-2 duration-300"
            >
              {children}
            </div>
          )}
          {!expandable && children && (
            <div className="mt-4">{children}</div>
          )}
        </div>
      </div>
      
      {/* Desktop: icon on the left */}
      <div className="hidden md:flex items-start gap-4 flex-1">
        {Icon && (
          <div className="flex-shrink-0 mt-1">
            <Icon className="w-6 h-6 text-green-600 group-hover:text-green-400 transition-colors duration-300" />
          </div>
        )}
        <div className="flex-1 flex flex-col">
          <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
          <p className="text-gray-400 mb-3 flex-1">{description}</p>
          <div className="mt-auto">
            {expandable && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-green-600 hover:text-green-400 text-sm font-medium transition-colors duration-300 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-600/50 focus:ring-offset-2 focus:ring-offset-gray-900 rounded px-2 py-1"
                aria-expanded={isExpanded}
                aria-controls={`concept-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
              >
                {isExpanded ? 'Show Less' : 'Learn More'}
                <span className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
            )}
            {expandable && isExpanded && children && (
              <div
                id={`concept-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
                className="mt-4 pt-4 border-t border-white/10 animate-in fade-in slide-in-from-top-2 duration-300"
              >
                {children}
              </div>
            )}
            {!expandable && children && (
              <div className="mt-4">{children}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConceptCard;

