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
  { label: '1:1', value: '1 / 1', width: 1080, height: 1080, iconClass: 'aspect-square' },
  { label: '4:5', value: '4 / 5', width: 1080, height: 1350, iconClass: 'aspect-[4/5]' },
  { label: '9:16', value: '9 / 16', width: 1080, height: 1920, iconClass: 'aspect-[9/16]' },
  { label: '16:9', value: '16 / 9', width: 1920, height: 1080, iconClass: 'aspect-video' },
];

export const DEFAULT_CAPTION = "";
export const DEFAULT_FONT = 'font-oswald';
export const DEFAULT_COLOR = '#FFFFFF';
export const DEFAULT_SIZE = 18;
export const DEFAULT_GRADIENT_INTENSITY = 0.7;
export const DEFAULT_ASPECT_RATIO = '1 / 1';
export const DEFAULT_IMAGE_POSITION = { x: 0, y: 0 }; // Center
export const DEFAULT_SCALE = 1;