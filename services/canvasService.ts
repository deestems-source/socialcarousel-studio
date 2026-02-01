import { Slide } from "../types";
import { FONTS } from "../constants";

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
  const size = 1080; // Standard high-res square
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) return;

  try {
    // 1. Draw Image
    const img = await loadImage(slide.imageUrl);
    
    // Calculate aspect ratio to cover
    const scale = Math.max(size / img.width, size / img.height);
    const x = (size / 2) - (img.width / 2) * scale;
    const y = (size / 2) - (img.height / 2) * scale;
    
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

    // 2. Draw Gradient Overlay (Bottom)
    const gradient = ctx.createLinearGradient(0, size / 2, 0, size);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.8)'); // Slightly darker for better text readability
    ctx.fillStyle = gradient;
    ctx.fillRect(0, size / 2, size, size / 2);

    // 3. Draw Text
    const fontFamily = getFontFamily(slide.fontFamily);
    const fontSize = slide.fontSize * 2.5; // Scale up for hi-res
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = slide.textColor;
    ctx.textAlign = slide.alignment;
    ctx.textBaseline = 'bottom';

    // Text Wrapping Logic
    const maxWidth = size - 80; // 40px padding on each side
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

    // Position text at bottom with padding
    const initialY = size - 60 - ((lines.length - 1) * lineHeight);
    
    let textX = 40; // Left align default
    if (slide.alignment === 'center') textX = size / 2;
    if (slide.alignment === 'right') textX = size - 40;

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