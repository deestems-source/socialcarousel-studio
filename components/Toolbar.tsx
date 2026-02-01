import React, { useEffect, useState } from 'react';
import { AlignLeft, AlignCenter, AlignRight, Type, Palette, Download, Ratio, ZoomIn, Smartphone, Share } from 'lucide-react';
import { Slide, EditorTab } from '../types';
import { FONTS, COLORS, ASPECT_RATIOS } from '../constants';

interface ToolbarProps {
  slide: Slide;
  activeTab: EditorTab;
  onTabChange: (tab: EditorTab) => void;
  onUpdate: (updates: Partial<Slide>) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  slide, 
  activeTab, 
  onTabChange, 
  onUpdate
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check for iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    // Listen for PWA install prompt (Android/Desktop)
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Calculate Text Size Percentage (Range 12 - 48)
  const textSizePercent = Math.round(((slide.fontSize - 12) / (48 - 12)) * 100);

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
          onClick={() => onTabChange('install')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'install' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500'}`}
        >
          <Smartphone size={16} /> Install
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

            {/* Text Size with Percentage */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Size</span>
                    <span className="text-xs text-gray-500">{textSizePercent}%</span>
                </div>
                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
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
          </div>
        )}

        {activeTab === 'style' && (
          <div className="space-y-6">
            
            {/* Aspect Ratio Selector */}
            <div>
              <div className="flex items-center gap-2 mb-3 text-gray-400">
                <Ratio size={14} />
                <h3 className="text-xs font-bold uppercase">Aspect Ratio</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio.value}
                    onClick={() => onUpdate({ aspectRatio: ratio.value })}
                    className={`flex items-center gap-3 p-2 rounded-lg border text-sm transition-all ${
                      slide.aspectRatio === ratio.value 
                      ? 'bg-blue-50 border-blue-500 text-blue-700' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-gray-300 rounded-sm ${ratio.iconClass} ${slide.aspectRatio === ratio.value ? 'bg-blue-400' : ''}`} />
                    <span>{ratio.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-gray-100" />
            
             {/* Scale/Zoom Slider */}
            <div>
               <div className="flex justify-between items-center mb-2">
                 <div className="flex items-center gap-2 text-gray-400">
                    <ZoomIn size={14} />
                    <h3 className="text-xs font-bold uppercase">Zoom / Scale</h3>
                 </div>
                 <span className="text-xs text-gray-500">{Math.round((slide.scale || 1) * 100)}%</span>
               </div>
               <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
                  <input 
                    type="range" 
                    min="1" 
                    max="3" 
                    step="0.05"
                    value={slide.scale || 1} 
                    onChange={(e) => onUpdate({ scale: Number(e.target.value) })}
                    className="flex-1 accent-blue-600"
                  />
               </div>
            </div>

            <hr className="border-gray-100" />

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

            {/* Gradient Intensity */}
            <div>
               <div className="flex justify-between items-center mb-2">
                 <h3 className="text-xs font-bold text-gray-400 uppercase">Shadow Intensity</h3>
                 <span className="text-xs text-gray-500">{Math.round((slide.gradientIntensity || 0.7) * 100)}%</span>
               </div>
               <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={(slide.gradientIntensity || 0.7) * 100} 
                    onChange={(e) => onUpdate({ gradientIntensity: Number(e.target.value) / 100 })}
                    className="flex-1 accent-blue-600"
                  />
               </div>
            </div>
          </div>
        )}

        {activeTab === 'install' && (
          <div className="flex flex-col items-center justify-center space-y-6 py-8">
             
             {/* Android / Desktop Install */}
             {deferredPrompt && (
                <div className="text-center space-y-4">
                  <div className="p-4 bg-blue-50 rounded-full inline-flex">
                    <Download className="text-blue-600" size={32} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">Install App</h3>
                    <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
                      Add SocialCarousel to your home screen for the best experience.
                    </p>
                  </div>
                  <button 
                    onClick={handleInstallClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg transition-transform active:scale-95"
                  >
                    Install Now
                  </button>
                </div>
             )}

             {/* iOS Instructions */}
             {isIOS && (
                <div className="bg-gray-50 p-6 rounded-2xl max-w-sm mx-auto">
                  <div className="flex items-center gap-3 mb-4">
                    <Share className="text-blue-600" />
                    <h3 className="font-bold text-gray-900">Install on iPhone</h3>
                  </div>
                  <ol className="text-sm text-gray-600 space-y-3 list-decimal list-inside text-left">
                    <li>Tap the <span className="font-bold">Share</span> button in your browser bar.</li>
                    <li>Scroll down and tap <span className="font-bold">Add to Home Screen</span>.</li>
                    <li>Tap <span className="font-bold">Add</span> in the top right corner.</li>
                  </ol>
                </div>
             )}

             {/* Fallback if installed or not supported */}
             {!deferredPrompt && !isIOS && (
               <div className="text-center text-gray-400 p-8">
                  <Smartphone size={48} className="mx-auto mb-4 opacity-50" />
                  <p>App is already installed or not supported on this browser.</p>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};