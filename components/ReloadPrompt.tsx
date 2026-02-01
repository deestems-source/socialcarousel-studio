import React, { useEffect, useState } from 'react';
import { RefreshCw, X, WifiOff } from 'lucide-react';

export const ReloadPrompt: React.FC = () => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register the service worker
      navigator.serviceWorker.register('./sw.js').then((reg) => {
        setRegistration(reg);

        // Check if there is already a waiting worker (e.g., from a previous load)
        if (reg.waiting) {
            setNeedRefresh(true);
        }

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New content available, please refresh.
                  setNeedRefresh(true);
                } else {
                  // Content is cached for offline use.
                  setOfflineReady(true);
                  setTimeout(() => setOfflineReady(false), 4000);
                }
              }
            });
          }
        });
      });

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  const updateServiceWorker = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const close = () => {
    setNeedRefresh(false);
    setOfflineReady(false);
  };

  if (!needRefresh && !offlineReady) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-auto">
      {offlineReady && (
        <div className="bg-gray-800 text-white p-4 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300 border border-gray-700">
           <WifiOff size={18} className="text-green-400" />
           <span className="text-sm font-medium">App ready for offline use</span>
           <button onClick={close} className="ml-2 opacity-70 hover:opacity-100"><X size={16} /></button>
        </div>
      )}
      {needRefresh && (
        <div className="bg-white text-gray-900 p-4 rounded-xl shadow-2xl border border-blue-100 flex flex-col gap-3 animate-in slide-in-from-bottom duration-300 w-72">
           <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-sm text-blue-600">Update Available</h4>
                <p className="text-xs text-gray-500 mt-1">A new version of SocialCarousel is available.</p>
              </div>
              <button onClick={close} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
           </div>
           <button 
             onClick={updateServiceWorker}
             className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
           >
             <RefreshCw size={16} /> Update Now
           </button>
        </div>
      )}
    </div>
  );
};