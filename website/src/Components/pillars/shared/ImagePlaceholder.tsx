import React from 'react';

interface ImagePlaceholderProps {
  width: number;
  height: number;
  alt: string;
  className?: string;
}

const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  width,
  height,
  alt,
  className = '',
}) => {
  return (
    <div
      className={`backdrop-blur-sm bg-gradient-to-br from-gray-900/40 to-gray-800/40 border border-white/10 rounded-xl flex items-center justify-center text-gray-500 ${className}`}
      style={{ width, height }}
      role="img"
      aria-label={alt}
    >
      {alt}
    </div>
  );
};

export default ImagePlaceholder;

