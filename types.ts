export interface Slide {
  id: string;
  imageUrl: string;
  caption: string;
  fontFamily: string;
  textColor: string;
  alignment: 'left' | 'center' | 'right';
  fontSize: number;
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

export type EditorTab = 'text' | 'style' | 'ai';