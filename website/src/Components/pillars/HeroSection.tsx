import React from 'react';
import PillarsTitle from './TitleSection';

const HeroSection: React.FC = () => {

  return (
    <section
      id="hero-section"
      className="relative pb-10 pt-32 bg-gradient-to-br from-gray-950 via-gray-900 to-black overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <PillarsTitle />
        </div>
      
      </div>
    </section>
  );
};

export default HeroSection;

