import { FontOption, ColorOption, AspectRatioOption } from './types';

export const FONTS: FontOption[] = [
  { name: 'Modern', value: 'font-inter', label: 'Inter' },
  { name: 'Elegant', value: 'font-playfair', label: 'Playfair' },
  { name: 'Tech', value: 'font-roboto', label: 'Mono' },
  { name: 'Classic', value: 'font-merriweather', label: 'Serif' },
  { name: 'Bold', value: 'font-oswald', label: 'Oswald' },
];

export const COLORS: ColorOption[] = [
  { name: 'White', value: '#FFFFFF' },
  { name: 'Black', value: '#000000' },
  { name: 'Yellow', value: '#FCD34D' }, // amber-300
  { name: 'Cyan', value: '#22D3EE' },   // cyan-400
  { name: 'Rose', value: '#FB7185' },   // rose-400
  { name: 'Lime', value: '#A3E635' },   // lime-400
];

export const ASPECT_RATIOS: AspectRatioOption[] = [
  { label: 'Square', value: '1 / 1', width: 1080, height: 1080, iconClass: 'aspect-square' },
  { label: 'Portrait', value: '4 / 5', width: 1080, height: 1350, iconClass: 'aspect-[4/5]' },
];

export const DEFAULT_CAPTION = "Write your caption here...";
export const DEFAULT_FONT = 'font-inter';
export const DEFAULT_COLOR = '#FFFFFF';
export const DEFAULT_SIZE = 18;
export const DEFAULT_GRADIENT_INTENSITY = 0.7;
export const DEFAULT_ASPECT_RATIO = '1 / 1';
export const DEFAULT_IMAGE_POSITION = { x: 0, y: 0 }; // Center
export const DEFAULT_SCALE = 1;