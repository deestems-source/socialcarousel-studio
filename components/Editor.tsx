import React from 'react';
import { Slide } from '../types';

interface EditorProps {
  slide: Slide;
}

export const Editor: React.FC<EditorProps> = ({ slide }) => {
  return (
    <div className="w-full aspect-square relative bg-gray-200 overflow-hidden shadow-xl rounded-xl">
      {/* Base Image */}
      {slide.imageUrl ? (
        <img 
          src={slide.imageUrl} 
          alt="Slide content" 
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          No Image Selected
        </div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

      {/* Text Layer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
        <p 
          className={`${slide.fontFamily} transition-all duration-300`}
          style={{ 
            color: slide.textColor, 
            textAlign: slide.alignment,
            fontSize: `${slide.fontSize}px`,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            lineHeight: '1.4'
          }}
        >
          {slide.caption}
        </p>
      </div>
    </div>
  );
};