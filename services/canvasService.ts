import { Slide } from "../types";
import { ASPECT_RATIOS, DEFAULT_ASPECT_RATIO } from "../constants";

// Helper to load image
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

const getFontFamily = (tailwindClass: string): string => {
  switch (tailwindClass) {
    case 'font-playfair': return '"Playfair Display", serif';
    case 'font-roboto': return '"Roboto Mono", monospace';
    case 'font-merriweather': return '"Merriweather", serif';
    case 'font-oswald': return '"Oswald", sans-serif';
    default: return '"Inter", sans-serif';
  }
};

export const downloadSlide = async (slide: Slide) => {
  const canvas = document.createElement('canvas');
  
  // Determine dimensions based on aspect ratio
  const ratioConfig = ASPECT_RATIOS.find(r => r.value === slide.aspectRatio) 
                      || ASPECT_RATIOS.find(r => r.value === DEFAULT_ASPECT_RATIO)!;
  
  const width = ratioConfig.width;
  const height = ratioConfig.height;

  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');

  if (!ctx) return;

  try {
    // 1. Draw Image with Transforms (Free Position + Scale)
    const img = await loadImage(slide.imageUrl);
    
    // Save context to restore after transform
    ctx.save();
    
    // Center of canvas
    ctx.translate(width / 2, height / 2);
    
    // Apply User Translation (calculated as percentage of canvas dimensions)
    const pos = slide.imagePosition || { x: 0, y: 0 };
    ctx.translate(
      (pos.x / 100) * width,
      (pos.y / 100) * height
    );
    
    // Apply User Scale
    const scale = slide.scale || 1;
    ctx.scale(scale, scale);
    
    // Calculate "Cover" Scale
    // This replicates the "min-width: 100%" or "min-height: 100%" logic
    const imgRatio = img.width / img.height;
    const canvasRatio = width / height;
    
    let renderWidth, renderHeight;
    
    if (imgRatio > canvasRatio) {
      // Image is wider than canvas (relative to AR) -> fit by Height (min-height: 100%)
      renderHeight = height;
      renderWidth = height * imgRatio;
    } else {
      // Image is taller than canvas -> fit by Width (min-width: 100%)
      renderWidth = width;
      renderHeight = width / imgRatio;
    }
    
    // Draw centered on the pivot point (which we translated to center + offset)
    ctx.drawImage(img, -renderWidth / 2, -renderHeight / 2, renderWidth, renderHeight);
    
    ctx.restore();

    // 2. Draw Gradient Overlay (Bottom)
    const intensity = slide.gradientIntensity !== undefined ? slide.gradientIntensity : 0.7;
    const gradient = ctx.createLinearGradient(0, height * 0.4, 0, height);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, `rgba(0,0,0,${intensity})`); 
    ctx.fillStyle = gradient;
    ctx.fillRect(0, height * 0.4, width, height * 0.6);

    // 3. Draw Caption
    const fontFamily = getFontFamily(slide.fontFamily);
    const fontSize = slide.fontSize * 2.5; // Scale up for hi-res
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = slide.textColor;
    ctx.textAlign = slide.alignment;
    ctx.textBaseline = 'bottom';

    // Text Wrapping Logic
    const maxWidth = width - 80; // 40px padding on each side
    const lineHeight = fontSize * 1.4;
    const words = slide.caption.split(' ');
    let line = '';
    const lines = [];

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && i > 0) {
        lines.push(line);
        line = words[i] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    // Position text at VERY BOTTOM
    // 40px padding from bottom
    const bottomPadding = 40; 
    const initialY = height - bottomPadding - ((lines.length - 1) * lineHeight);
    
    let textX = 40; // Left align default
    if (slide.alignment === 'center') textX = width / 2;
    if (slide.alignment === 'right') textX = width - 40;

    lines.forEach((l, index) => {
        ctx.fillText(l.trim(), textX, initialY + (index * lineHeight));
    });

    // 4. Download
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const link = document.createElement('a');
    link.download = `slide-${slide.id}.jpg`;
    link.href = dataUrl;
    link.click();

  } catch (err) {
    console.error("Failed to render slide", err);
    alert("Could not save image.");
  }
};