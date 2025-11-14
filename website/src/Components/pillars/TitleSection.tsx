import React from 'react';

const DEFAULT_TITLE = "The Pillars of AI Native Engineering";
const DEFAULT_DESCRIPTION = "Discover the foundational principles, methodologies, and tools that define modern AI-assisted software development. We will cover context engineering, online learning, spec-driven development, the Model Context Protocol and how AI is shaping the future of software engineering.";

const PillarsTitle: React.FC<{ title?: string, description?: string }> = ({ title = DEFAULT_TITLE, description = DEFAULT_DESCRIPTION }: { title?: string, description?: string }) => {

  return (
    <div className="text-center">
      <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
        <span className="bg-gradient-to-r from-green-400 via-yellow-400 to-green-400 bg-clip-text text-transparent">
          {title}
        </span>
      </h1>
      <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
        {description}
      </p>

    </div>
  );
};

export default PillarsTitle;

