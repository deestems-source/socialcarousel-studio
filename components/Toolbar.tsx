import React from 'react';
import { AlignLeft, AlignCenter, AlignRight, Type, Palette, Wand2 } from 'lucide-react';
import { Slide, FontOption, ColorOption, EditorTab } from '../types';
import { FONTS, COLORS } from '../constants';

interface ToolbarProps {
  slide: Slide;
  activeTab: EditorTab;
  isGenerating: boolean;
  onTabChange: (tab: EditorTab) => void;
  onUpdate: (updates: Partial<Slide>) => void;
  onGenerateCaption: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  slide, 
  activeTab, 
  isGenerating,
  onTabChange, 
  onUpdate,
  onGenerateCaption
}) => {
  return (
    <div className="bg-white rounded-t-3xl shadow-negative-lg border-t border-gray-100 flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-100">
        <button 
          onClick={() => onTabChange('text')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'text' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          <Type size={16} /> Text
        </button>
        <button 
          onClick={() => onTabChange('style')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'style' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          <Palette size={16} /> Style
        </button>
        <button 
          onClick={() => onTabChange('ai')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'ai' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
        >
          <Wand2 size={16} /> AI Tools
        </button>
      </div>

      {/* Tool Content */}
      <div className="p-4 flex-1 overflow-y-auto">
        {activeTab === 'text' && (
          <div className="space-y-4">
            <textarea
              value={slide.caption}
              onChange={(e) => onUpdate({ caption: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none text-gray-700"
              rows={3}
              placeholder="Enter your caption..."
            />
            
            <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
               <span className="text-xs font-semibold text-gray-500 uppercase ml-2">Alignment</span>
               <div className="flex gap-1">
                  <button 
                    onClick={() => onUpdate({ alignment: 'left' })}
                    className={`p-2 rounded ${slide.alignment === 'left' ? 'bg-white shadow text-blue-600' : 'text-gray-400'}`}
                  >
                    <AlignLeft size={18} />
                  </button>
                  <button 
                    onClick={() => onUpdate({ alignment: 'center' })}
                    className={`p-2 rounded ${slide.alignment === 'center' ? 'bg-white shadow text-blue-600' : 'text-gray-400'}`}
                  >
                    <AlignCenter size={18} />
                  </button>
                  <button 
                    onClick={() => onUpdate({ alignment: 'right' })}
                    className={`p-2 rounded ${slide.alignment === 'right' ? 'bg-white shadow text-blue-600' : 'text-gray-400'}`}
                  >
                    <AlignRight size={18} />
                  </button>
               </div>
            </div>

            <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
                <span className="text-xs font-semibold text-gray-500 uppercase">Size</span>
                <input 
                  type="range" 
                  min="12" 
                  max="48" 
                  value={slide.fontSize} 
                  onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
                  className="flex-1 accent-blue-600"
                />
            </div>
          </div>
        )}

        {activeTab === 'style' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Typography</h3>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {FONTS.map((font) => (
                  <button
                    key={font.value}
                    onClick={() => onUpdate({ fontFamily: font.value })}
                    className={`px-4 py-2 rounded-full border text-sm whitespace-nowrap transition-all ${
                      slide.fontFamily === font.value 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    <span className={font.value}>{font.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Text Color</h3>
              <div className="flex gap-3 flex-wrap">
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => onUpdate({ textColor: color.value })}
                    className={`w-10 h-10 rounded-full border-2 transition-transform ${
                      slide.textColor === color.value ? 'scale-110 border-blue-500' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-4">
             <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                   <Wand2 size={16} /> Magic Caption
                </h3>
                <p className="text-sm text-purple-700 mb-4">
                  Let Gemini AI analyze your photo and write a perfect caption for you.
                </p>
                <button
                  onClick={onGenerateCaption}
                  disabled={isGenerating}
                  className={`w-full py-3 rounded-lg text-white font-medium shadow-md transition-all ${
                    isGenerating ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 active:scale-95'
                  }`}
                >
                  {isGenerating ? 'Analyzing Photo...' : 'Generate Caption'}
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};