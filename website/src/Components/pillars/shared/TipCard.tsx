import React from 'react';
import { Lightbulb, CheckCircle2 } from 'lucide-react';

interface TipCardProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  tips?: string[];
  className?: string;
}

const TipCard: React.FC<TipCardProps> = ({
  title,
  description,
  icon: Icon = Lightbulb,
  tips,
  className = '',
}) => {
  return (
    <div className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl hover:border-green-600/30 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(22,163,74,0.2)] hover:scale-[1.02] focus-within:border-green-600/30 focus-within:ring-2 focus-within:ring-green-600/20 transition-all duration-300 group ${className}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400/20 to-yellow-400/10 border border-yellow-400/30 flex items-center justify-center group-hover:border-yellow-400/50 transition-colors duration-300">
            <Icon className="w-6 h-6 text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-green-400 transition-colors duration-300">
            {title}
          </h3>
          <p className="text-gray-400 leading-relaxed mb-4">{description}</p>
          {tips && tips.length > 0 && (
            <ul className="space-y-2 mt-4">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default TipCard;

