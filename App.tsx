import React, { useState, useRef, useEffect } from 'react';
import { Upload, Plus, Image as ImageIcon } from 'lucide-react';
import { Editor } from './components/Editor';
import { SlideRail } from './components/SlideRail';
import { Toolbar } from './components/Toolbar';
import { Slide, EditorTab } from './types';
import { DEFAULT_CAPTION, DEFAULT_COLOR, DEFAULT_FONT, DEFAULT_SIZE } from './constants';
import { generateCaption } from './services/geminiService';
import { downloadSlide } from './services/canvasService';

const App: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeSlideId, setActiveSlideId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<EditorTab>('text');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeSlide = slides.find(s => s.id === activeSlideId);

  // Handle File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newSlides: Slide[] = Array.from(e.target.files).map(file => ({
        id: crypto.randomUUID(),
        imageUrl: URL.createObjectURL(file),
        caption: DEFAULT_CAPTION,
        fontFamily: DEFAULT_FONT,
        textColor: DEFAULT_COLOR,
        alignment: 'left',
        fontSize: DEFAULT_SIZE
      }));
      
      setSlides(prev => [...prev, ...newSlides]);
      if (!activeSlideId) setActiveSlideId(newSlides[0].id);
    }
  };

  // Update Slide State
  const updateActiveSlide = (updates: Partial<Slide>) => {
    if (!activeSlideId) return;
    setSlides(prev => prev.map(s => 
      s.id === activeSlideId ? { ...s, ...updates } : s
    ));
  };

  // Remove Slide
  const removeSlide = (id: string) => {
    const newSlides = slides.filter(s => s.id !== id);
    setSlides(newSlides);
    if (activeSlideId === id) {
      setActiveSlideId(newSlides.length > 0 ? newSlides[0].id : null);
    }
  };

  // AI Caption Logic
  const handleGenerateCaption = async () => {
    if (!activeSlide) return;
    setIsGenerating(true);
    try {
      // Need to fetch blob and convert to base64 for the service
      const response = await fetch(activeSlide.imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          const caption = await generateCaption(base64);
          updateActiveSlide({ caption });
        } catch (error) {
          alert('Could not generate caption. Check API Key.');
        } finally {
          setIsGenerating(false);
        }
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      console.error(e);
      setIsGenerating(false);
    }
  };

  if (slides.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md w-full">
           <div className="bg-blue-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <ImageIcon className="text-blue-600" size={40} />
           </div>
           <h1 className="text-3xl font-bold text-gray-900 mb-2">SocialCarousel</h1>
           <p className="text-gray-500 mb-8">Create aesthetic photo carousels with custom captions and styles in seconds.</p>
           
           <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
           >
             <Plus size={20} /> Create New Carousel
           </button>
           <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            multiple 
            accept="image/*" 
            className="hidden" 
           />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row max-w-6xl mx-auto md:shadow-2xl md:my-8 md:rounded-2xl md:overflow-hidden md:h-[90vh]">
      
      {/* LEFT: Preview & Rail */}
      <div className="flex-1 flex flex-col h-[60vh] md:h-full bg-gray-900 md:bg-gray-100 relative">
        <header className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent md:hidden text-white">
           <h1 className="font-bold">SocialCarousel</h1>
        </header>

        {/* Main Editor Preview */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
           <div className="w-full max-w-md">
             {activeSlide && <Editor slide={activeSlide} />}
           </div>
        </div>

        {/* Bottom Rail */}
        <div className="bg-white/10 backdrop-blur-md md:bg-white border-t border-gray-700 md:border-gray-200">
           <SlideRail 
             slides={slides} 
             activeId={activeSlideId || ''}
             onSelect={setActiveSlideId}
             onAdd={() => fileInputRef.current?.click()}
             onRemove={removeSlide}
             onDownload={(id) => {
               const s = slides.find(slide => slide.id === id);
               if(s) downloadSlide(s);
             }}
           />
           <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            multiple 
            accept="image/*" 
            className="hidden" 
           />
        </div>
      </div>

      {/* RIGHT: Toolbar (Bottom Sheet on Mobile, Sidebar on Desktop) */}
      <div className="h-[40vh] md:h-full md:w-96 bg-white z-20 shadow-negative md:shadow-none flex flex-col">
        {activeSlide ? (
          <Toolbar 
            slide={activeSlide}
            activeTab={activeTab}
            isGenerating={isGenerating}
            onTabChange={setActiveTab}
            onUpdate={updateActiveSlide}
            onGenerateCaption={handleGenerateCaption}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a slide to edit
          </div>
        )}
      </div>
    </div>
  );
};

export default App;