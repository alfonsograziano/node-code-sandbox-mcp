import React from 'react';
import { ArrowDown } from 'lucide-react';
import PillarsTitle from './TitleSection';

const HeroSection: React.FC = () => {
  const scrollToFirstSection = () => {
    const firstSection = document.getElementById('introduction-section');
    if (firstSection) {
      const headerOffset = 80;
      const elementPosition = firstSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section
      id="hero-section"
      className="relative py-20 md:py-24 lg:py-32 bg-gradient-to-br from-gray-950 via-gray-900 to-black overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <PillarsTitle />
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={scrollToFirstSection}
              className="backdrop-blur-md bg-gradient-to-r from-green-600/20 to-green-600/10 border border-green-600/30 rounded-lg px-8 py-4 text-green-400 font-semibold hover:border-green-600/50 hover:bg-green-600/30 hover:shadow-[0_0_20px_rgba(22,163,74,0.3)] transition-all duration-300 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-600/50 focus:ring-offset-2 focus:ring-offset-gray-950"
              aria-label="Scroll to introduction section"
            >
              Explore the Pillars
              <ArrowDown className="w-5 h-5" />
            </button>
          </div>
        </div>
      
      </div>
    </section>
  );
};

export default HeroSection;

