import React from 'react';
import { ExternalLink } from 'lucide-react';

interface ToolCardProps {
  name: string;
  description: string;
  link: string;
  category: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const ToolCard: React.FC<ToolCardProps> = ({
  name,
  description,
  link,
  category,
  icon: Icon,
}) => {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="block backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl hover:border-green-600/30 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(22,163,74,0.2)] hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-600/50 focus:ring-offset-2 focus:ring-offset-gray-950 transition-all duration-300 group"
      aria-label={`Visit ${name} - ${description}`}
    >
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="flex-shrink-0 mt-1">
            <Icon className="w-6 h-6 text-green-600 group-hover:text-green-400 transition-colors duration-300" />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold text-white group-hover:text-green-400 transition-colors duration-300">
              {name}
            </h3>
            <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-green-600 transition-colors duration-300" />
          </div>
          <p className="text-xs text-green-600/70 mb-2 uppercase tracking-wide">{category}</p>
          <p className="text-gray-400">{description}</p>
        </div>
      </div>
    </a>
  );
};

export default ToolCard;

