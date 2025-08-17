'use client';

import { useState, useEffect } from 'react';
import { X, ExternalLink, Info } from 'lucide-react';

export default function InfoBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Auto-dismiss after 10 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 300); // Wait for animation to complete
  };

  if (!isVisible) return null;

  return (
    <div className={`flex justify-center transform transition-all duration-300 ease-in-out pointer-events-none ${
      isAnimating ? 'translate-y-[-100%] opacity-0' : 'translate-y-0 opacity-100'
    }`}>
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-700 rounded-full px-4 py-2 shadow-sm backdrop-blur-sm pointer-events-auto">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-amber-100 dark:bg-amber-800/50 rounded-full flex items-center justify-center">
            <Info size={12} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
              To monetize your website,
            </span>
            <a
              href="https://provider-portal-peach.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-sm font-semibold text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 transition-colors underline decoration-amber-400 underline-offset-2"
            >
              <span>click here</span>
              <ExternalLink size={10} />
            </a>
          </div>
          <button
            onClick={handleDismiss}
            className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors p-1 rounded-full hover:bg-amber-100 dark:hover:bg-amber-800/30"
            title="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
