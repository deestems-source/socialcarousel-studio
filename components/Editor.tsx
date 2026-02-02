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
  
  // Dynamic layout style for the container to ensure "contain" fit
  const [layoutStyle, setLayoutStyle] = useState<React.CSSProperties>({
      width: '100%',
      height: 'auto',
      aspectRatio: slide.aspectRatio || '1 / 1'
  });

  const getRatioValue = useCallback((ratioStr: string) => {
    try {
      const [w, h] = ratioStr.split('/').map(n => parseFloat(n.trim()));
      return w / h;
    } catch {
      return 1;
    }
  }, []);

  // 1. Handle Container Sizing (Fit logic)
  useEffect(() => {
     const updateLayout = () => {
         if (!containerRef.current || !containerRef.current.parentElement) return;
         const parent = containerRef.current.parentElement;
         // Use getBoundingClientRect for precise sub-pixel measurements
         const parentRect = parent.getBoundingClientRect();
         const parentW = parentRect.width;
         const parentH = parentRect.height;
         
         if (parentW === 0 || parentH === 0) return;

         const parentRatio = parentW / parentH;
         const slideRatio = getRatioValue(slide.aspectRatio);

         // If parent is wider than slide (relative to aspect), height is the limiting factor.
         // e.g. Parent 16:9 (1.77), Slide 1:1 (1). Parent > Slide. Fit Height.
         // e.g. Parent 16:9 (1.77), Slide 9:16 (0.56). Parent > Slide. Fit Height.
         if (parentRatio > slideRatio) {
             setLayoutStyle({
                 height: '100%',
                 width: 'auto',
                 aspectRatio: slide.aspectRatio
             });
         } else {
              // Parent is taller (or equal) than slide. Width is limiting factor.
              // e.g. Parent 9:16 (0.56), Slide 1:1 (1). Parent < Slide. Fit Width.
              setLayoutStyle({
                 width: '100%',
                 height: 'auto',
                 aspectRatio: slide.aspectRatio
             });
         }
     };

     updateLayout();
     
     // Observe parent for resizing
     const resizeObserver = new ResizeObserver(updateLayout);
     if (containerRef.current?.parentElement) {
         resizeObserver.observe(containerRef.current.parentElement);
     }
     window.addEventListener('resize', updateLayout);

     return () => {
         resizeObserver.disconnect();
         window.removeEventListener('resize', updateLayout);
     };
  }, [slide.aspectRatio, getRatioValue]);

  // Store calculated base dimensions (percentages) for "Cover" fit
  const [baseDims, setBaseDims] = useState({ w: 100, h: 100 });

  // Helper to calculate boundaries based on current factors
  // This defines the maximum percentage the image can move from center
  const getBounds = useCallback((widthPercent: number, heightPercent: number) => {
    const userScale = slide.scale || 1;
    
    // Calculate total rendered size in % of container
    const renderW = widthPercent * userScale;
    const renderH = heightPercent * userScale;

    // Allowable deviation from center (50%)
    // Epsilon 0.1 to handle float rounding errors
    let maxPercX = Math.max(0, (renderW - 100) / 2);
    let maxPercY = Math.max(0, (renderH - 100) / 2);

    // Round down extremely small values to 0 to strictly lock 'perfect fits'
    if (maxPercX < 0.1) maxPercX = 0;
    if (maxPercY < 0.1) maxPercY = 0;

    return { x: maxPercX, y: maxPercY };
  }, [slide.scale]);

  // Update Base Dimensions when Image/Container/Ratio changes
  useEffect(() => {
    const updateDimensions = () => {
      const img = imageRef.current;
      const cont = containerRef.current;
      if (!img || !cont) return;
      
      // Ensure we have valid dimensions
      if (img.naturalWidth === 0 || cont.clientWidth === 0) return;

      const imgRatio = img.naturalWidth / img.naturalHeight;
      const contRatio = cont.clientWidth / cont.clientHeight;
      
      let w = 100;
      let h = 100;

      // Standard "Cover" logic
      // If image is wider than container, we match height (100%) and scale width
      // If image is taller than container, we match width (100%) and scale height
      if (imgRatio > contRatio) {
        w = (imgRatio / contRatio) * 100;
        h = 100;
      } else {
        w = 100;
        h = (contRatio / imgRatio) * 100;
      }
      
      setBaseDims({ w, h });
    };

    const img = imageRef.current;
    if (img && img.complete) updateDimensions();
    if (img) img.onload = updateDimensions;
    
    // ResizeObserver handles dynamic container resizing (e.g. window resize or layout shift)
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    
    return () => resizeObserver.disconnect();
  }, [slide.imageUrl, slide.aspectRatio]);

  // Enforce Bounds (Clamping) when Scale/Ratio/BaseDims change
  useEffect(() => {
    if(!onUpdate || isDragging) return;
    
    const bounds = getBounds(baseDims.w, baseDims.h);
    const currentPos = slide.imagePosition || { x: 0, y: 0 };
    
    let newX = currentPos.x;
    let newY = currentPos.y;
    let changed = false;

    // Clamp X
    if (newX > bounds.x) { newX = bounds.x; changed = true; }
    else if (newX < -bounds.x) { newX = -bounds.x; changed = true; }

    // Clamp Y
    if (newY > bounds.y) { newY = bounds.y; changed = true; }
    else if (newY < -bounds.y) { newY = -bounds.y; changed = true; }

    if (changed) {
        onUpdate({ imagePosition: { x: newX, y: newY } });
    }
  }, [baseDims, slide.scale, slide.aspectRatio, getBounds, onUpdate, isDragging, slide.imagePosition]);


  // Handle Dragging
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault(); 
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    startPos.current = { x: e.clientX, y: e.clientY };
    startImagePos.current = { ...(slide.imagePosition || { x: 0, y: 0 }) };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current || !onUpdate) return;

    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

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
      className={`relative bg-gray-200 shadow-xl rounded-xl overflow-hidden group ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{ 
        ...layoutStyle,
        maxWidth: '100%',
        maxHeight: '100%',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Visual Hint for Dragging - Only show if movable */}
      {(getBounds(baseDims.w, baseDims.h).x > 0 || getBounds(baseDims.w, baseDims.h).y > 0) && (
        <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          Drag to Pan
        </div>
      )}

      {/* Image Rendering */}
      {slide.imageUrl ? (
        <img 
          ref={imageRef}
          src={slide.imageUrl} 
          alt="Slide content" 
          className="absolute max-w-none select-none pointer-events-none"
          style={{
             width: `${baseDims.w}%`,
             height: `${baseDims.h}%`,
             left: `${50 + pos.x}%`,
             top: `${50 + pos.y}%`,
             transform: `translate(-50%, -50%) scale(${scale})`,
             willChange: isDragging ? 'left, top' : 'auto'
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          No Image
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
            overflowWrap: 'break-word'
          }}
        >
          {slide.caption}
        </p>
      </div>
    </div>
  );
};