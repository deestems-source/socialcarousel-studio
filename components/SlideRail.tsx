import React from 'react';
import { Plus, Trash2, Download } from 'lucide-react';
import { Slide } from '../types';

interface SlideRailProps {
  slides: Slide[];
  activeId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onDownload: (id: string) => void;
}

export const SlideRail: React.FC<SlideRailProps> = ({ 
  slides, 
  activeId, 
  onSelect, 
  onAdd, 
  onRemove,
  onDownload
}) => {
  return (
    <div className="flex gap-3 overflow-x-auto p-4 no-scrollbar items-center">
      {slides.map((slide, index) => (
        <div 
          key={slide.id} 
          className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all cursor-pointer group ${
            activeId === slide.id ? 'border-blue-500 scale-105' : 'border-transparent opacity-80'
          }`}
          onClick={() => onSelect(slide.id)}
        >
          <img src={slide.imageUrl} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
          
          {/* Active Overlay for Actions */}
          {activeId === slide.id && (
             <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); onRemove(slide.id); }}
                  className="w-8 h-8 flex items-center justify-center bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                  aria-label="Delete Slide"
                >
                  <Trash2 size={14} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDownload(slide.id); }}
                  className="w-8 h-8 flex items-center justify-center bg-green-500 rounded-full text-white hover:bg-green-600 transition-colors"
                  aria-label="Download Slide"
                >
                  <Download size={14} />
                </button>
             </div>
          )}
        </div>
      ))}

      {/* Add Button */}
      <button 
        onClick={onAdd}
        className="flex-shrink-0 w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors bg-white active:scale-95"
      >
        <Plus size={24} />
        <span className="text-xs mt-1">Add</span>
      </button>
    </div>
  );
};