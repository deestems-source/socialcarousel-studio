import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Slide } from '../types';

interface EditorProps {
  slide: Slide;
  onUpdate?: (updates: Partial<Slide>) => void;
}

export const Editor: React.FC<EditorProps> = ({ slide, onUpdate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startImagePos = useRef({ x: 0, y: 0 });
  
  // Store calculated base dimensions (percentages) for "Cover" fit
  const [baseDims, setBaseDims] = useState({ w: 100, h: 100 });

  // Helper to calculate boundaries based on current factors
  const getBounds = useCallback((widthPercent: number, heightPercent: number) => {
    const userScale = slide.scale || 1;
    
    // Calculate total rendered size in % of container
    const renderW = widthPercent * userScale;
    const renderH = heightPercent * userScale;

    // Allowable deviation from center (50%)
    // If render is 100%, max deviation is 0.
    // If render is 120%, max deviation is 10 ( +/- 10% ).
    const maxPercX = Math.max(0, (renderW - 100) / 2);
    const maxPercY = Math.max(0, (renderH - 100) / 2);

    return { x: maxPercX, y: maxPercY };
  }, [slide.scale]);

  // Update Base Dimensions when Image/Container/Ratio changes
  useEffect(() => {
    const updateDimensions = () => {
      const img = imageRef.current;
      const cont = containerRef.current;
      if (!img || !cont) return;
      
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const contRatio = cont.clientWidth / cont.clientHeight;
      
      let w = 100;
      let h = 100;

      if (imgRatio > contRatio) {
        // Image is wider: Fit Height (100%), Scale Width
        w = (imgRatio / contRatio) * 100;
        h = 100;
      } else {
        // Image is taller: Fit Width (100%), Scale Height
        w = 100;
        h = (contRatio / imgRatio) * 100;
      }
      
      setBaseDims({ w, h });
    };

    const img = imageRef.current;
    if (img && img.complete) updateDimensions();
    if (img) img.onload = updateDimensions;
    
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    
    return () => resizeObserver.disconnect();
  }, [slide.imageUrl, slide.aspectRatio]);

  // Enforce Bounds (Clamping) when Scale or Ratio changes
  useEffect(() => {
    if(!onUpdate || isDragging) return;
    
    const timer = setTimeout(() => {
        const bounds = getBounds(baseDims.w, baseDims.h);
        const currentPos = slide.imagePosition || { x: 0, y: 0 };
        
        let newX = currentPos.x;
        let newY = currentPos.y;
        let changed = false;

        if (newX > bounds.x) { newX = bounds.x; changed = true; }
        if (newX < -bounds.x) { newX = -bounds.x; changed = true; }

        if (newY > bounds.y) { newY = bounds.y; changed = true; }
        if (newY < -bounds.y) { newY = -bounds.y; changed = true; }

        if (changed) {
            onUpdate({ imagePosition: { x: newX, y: newY } });
        }
    }, 50);
    return () => clearTimeout(timer);

  }, [slide.aspectRatio, slide.scale, baseDims, getBounds, onUpdate, isDragging, slide.imagePosition]);


  // Handle Dragging
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    startPos.current = { x: e.clientX, y: e.clientY };
    startImagePos.current = { ...(slide.imagePosition || { x: 0, y: 0 }) };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current || !onUpdate) return;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;

    // Convert pixels to percentage of container
    const percentX = (deltaX / rect.width) * 100; 
    const percentY = (deltaY / rect.height) * 100;

    const bounds = getBounds(baseDims.w, baseDims.h);

    let newX = startImagePos.current.x + percentX;
    let newY = startImagePos.current.y + percentY;

    // Strict Clamping to prevent gray areas
    newX = Math.max(-bounds.x, Math.min(bounds.x, newX));
    newY = Math.max(-bounds.y, Math.min(bounds.y, newY));

    onUpdate({
      imagePosition: {
        x: newX,
        y: newY
      }
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const pos = slide.imagePosition || { x: 0, y: 0 };
  const scale = slide.scale || 1;

  return (
    <div 
      ref={containerRef}
      className={`w-full relative bg-gray-200 overflow-hidden shadow-xl rounded-xl group ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{ 
        aspectRatio: slide.aspectRatio || '1 / 1',
        touchAction: 'none' // Prevent scrolling on mobile while dragging
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Visual Hint for Dragging */}
      <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        Drag to Pan
      </div>

      {/* Image Rendering */}
      {slide.imageUrl ? (
        <img 
          ref={imageRef}
          src={slide.imageUrl} 
          alt="Slide content" 
          className="absolute max-w-none select-none pointer-events-none"
          style={{
             // Explicit sizing based on calculated "Cover" dimensions
             width: `${baseDims.w}%`,
             height: `${baseDims.h}%`,
             
             // Position relative to container
             left: `${50 + pos.x}%`,
             top: `${50 + pos.y}%`,
             
             // Center pivot and scale
             transform: `translate(-50%, -50%) scale(${scale})`,
             willChange: 'left, top, transform'
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          No Image Selected
        </div>
      )}

      {/* Gradient Overlay */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-3/5 pointer-events-none transition-all duration-300 z-20" 
        style={{
          background: `linear-gradient(to top, rgba(0,0,0,${slide.gradientIntensity || 0.7}) 0%, rgba(0,0,0,0) 100%)`
        }}
      />

      {/* Text Layer */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 pointer-events-none flex flex-col justify-end z-30">
        <p 
          className={`${slide.fontFamily} transition-all duration-300`}
          style={{ 
            color: slide.textColor, 
            textAlign: slide.alignment,
            fontSize: `${slide.fontSize}px`,
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            lineHeight: '1.4',
            marginBottom: '0', 
          }}
        >
          {slide.caption}
        </p>
      </div>
    </div>
  );
};