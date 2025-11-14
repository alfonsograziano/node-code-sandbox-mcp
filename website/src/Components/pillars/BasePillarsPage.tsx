import React, { useEffect, useRef } from 'react';
import Header from '../Header';
import Footer from '../Footer';

// Smooth scroll helper function
const smoothScrollTo = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (element) {
    const headerOffset = 80; // Account for fixed header
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  }
};

const BasePillarsPage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Handle anchor links on mount and hash changes
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          smoothScrollTo(hash);
        }, 100);
      }
    };

    // Handle initial hash
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Modern gradient mesh background
    const gradientPoints = [
      { x: 0.2, y: 0.2, color: 'rgba(34, 197, 94, 0.15)' }, // green-500
      { x: 0.8, y: 0.3, color: 'rgba(59, 130, 246, 0.12)' }, // blue-500
      { x: 0.3, y: 0.7, color: 'rgba(168, 85, 247, 0.1)' }, // purple-500
      { x: 0.7, y: 0.8, color: 'rgba(34, 197, 94, 0.12)' }, // green-500
    ];

    let time = 0;

    // Draw static gradient mesh
    const drawGradientMesh = () => {
      // Fill with dark background first
      ctx.fillStyle = '#030712'; // gray-950
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Create radial gradients for each point
      gradientPoints.forEach((point, index) => {
        const x = point.x * canvas.width;
        const y = point.y * canvas.height;
        
        // Very subtle movement (barely noticeable)
        const offsetX = Math.sin(time * 0.00005 + index) * 10;
        const offsetY = Math.cos(time * 0.00005 + index) * 10;
        
        const gradient = ctx.createRadialGradient(
          x + offsetX,
          y + offsetY,
          0,
          x + offsetX,
          y + offsetY,
          Math.max(canvas.width, canvas.height) * 0.6
        );
        
        gradient.addColorStop(0, point.color);
        // Create a faded version for the middle stop
        const fadedColor = point.color.replace(/[\d.]+(?=\)$)/, (match) => {
          const opacity = parseFloat(match);
          return (opacity * 0.3).toFixed(2);
        });
        gradient.addColorStop(0.5, fadedColor);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      // Add subtle grid overlay
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 100;
      
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    };

    // Slow animation loop (updates every ~200ms for more static feel)
    const animate = () => {
      time += 1;
      drawGradientMesh();
      
      // Update less frequently for more static feel
      setTimeout(() => {
        requestAnimationFrame(animate);
      }, 200);
    };

    // Initial draw
    drawGradientMesh();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Animated background canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
        style={{ background: '#030712' }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        <Header />
        {children}
       
        <Footer />
      </div>
    </div>
  );
};

export default BasePillarsPage;

