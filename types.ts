export interface Slide {
  id: string;
  imageUrl: string;
  caption: string;
  fontFamily: string;
  textColor: string;
  alignment: 'left' | 'center' | 'right';
  fontSize: number;
  gradientIntensity: number;
  aspectRatio: string;
  imagePosition: { x: number; y: number }; // Percentage offset from center (e.g., 0,0 is center)
  scale: number; // Zoom level, default 1
}

export interface FontOption {
  name: string;
  value: string;
  label: string;
}

export interface ColorOption {
  name: string;
  value: string;
}

export interface AspectRatioOption {
  label: string;
  value: string; // CSS value (e.g., "1 / 1")
  width: number; // For canvas export
  height: number; // For canvas export
  iconClass: string; // Tailwind class to represent shape
}

export type EditorTab = 'text' | 'style' | 'qr';