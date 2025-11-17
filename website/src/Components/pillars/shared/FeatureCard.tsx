import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  link?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  link,
}) => {
  const cardContent = (
    <>
      {link && (
        <div className="absolute top-4 right-4">
          <ArrowUpRight className="w-5 h-5 text-green-600 group-hover:text-green-400 transition-colors duration-300" />
        </div>
      )}
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="flex-shrink-0 mt-1">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors duration-300 ${
              link 
                ? 'bg-gradient-to-br from-green-600/20 to-green-600/10 border border-green-600/30 group-hover:border-green-600/50' 
                : 'bg-gradient-to-br from-gray-600/20 to-gray-600/10 border border-gray-600/20'
            }`}>
              <Icon className={`w-6 h-6 transition-colors duration-300 ${
                link 
                  ? 'text-green-600 group-hover:text-green-400' 
                  : 'text-gray-500'
              }`} />
            </div>
          </div>
        )}
        <div className="flex-1">
          <div className={`flex items-center gap-2 mb-2 flex-wrap ${link ? 'pr-10 sm:pr-0' : ''}`}>
            <h3 className={`text-xl font-semibold transition-colors duration-300 ${
              link 
                ? 'text-white group-hover:text-green-400' 
                : 'text-gray-400'
            }`}>
              {title}
            </h3>
            {!link && (
              <span className="inline-block px-2 py-0.5 text-xs font-semibold text-orange-400 bg-orange-400/20 border border-orange-400/30 rounded-md whitespace-nowrap">
                Coming soon
              </span>
            )}
          </div>
          <p className={`leading-relaxed ${link ? 'text-gray-400' : 'text-gray-500'}`}>{description}</p>
        </div>
      </div>
    </>
  );

  const cardClassName = link
    ? `backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl hover:border-green-600/30 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(22,163,74,0.2)] hover:scale-[1.02] focus-within:border-green-600/30 focus-within:ring-2 focus-within:ring-green-600/20 transition-all duration-300 group relative cursor-pointer`
    : `backdrop-blur-xl bg-white/5 border border-gray-700/20 rounded-2xl p-6 shadow-2xl opacity-75 transition-all duration-300 group relative`;

  if (link) {
    return (
      <Link to={link} className="block">
        <div className={cardClassName}>{cardContent}</div>
      </Link>
    );
  }

  return <div className={cardClassName}>{cardContent}</div>;
};

export default FeatureCard;

