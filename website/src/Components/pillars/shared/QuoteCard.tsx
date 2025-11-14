import React from 'react';
import { Quote } from 'lucide-react';

interface QuoteCardProps {
  quote: string;
  author?: string;
  source?: string;
  className?: string;
}

const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  author,
  source,
  className = '',
}) => {
  return (
    <div className={`backdrop-blur-xl bg-gradient-to-r from-green-600/10 via-yellow-400/5 to-green-600/10 border-l-4 border-green-600/50 rounded-xl p-6 shadow-2xl hover:border-green-600/70 hover:bg-green-600/15 hover:shadow-[0_0_20px_rgba(22,163,74,0.2)] hover:scale-[1.01] focus-within:border-green-600/70 focus-within:ring-2 focus-within:ring-green-600/20 transition-all duration-300 relative ${className}`}>
      <Quote className="absolute top-4 right-4 w-8 h-8 text-green-600/20" />
      <p className="text-gray-100 text-lg mb-4 italic leading-relaxed relative z-10">
        "{quote}"
      </p>
      {author && (
        <p className="text-gray-400 font-medium not-italic">— {author}</p>
      )}
      {source && (
        <p className="text-gray-500 text-sm mt-2 not-italic">{source}</p>
      )}
    </div>
  );
};

export default QuoteCard;

