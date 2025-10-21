import React from 'react';
import type { Asset } from '../types';

interface PreviewModalProps {
  asset: Asset;
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ asset, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="relative w-full max-w-4xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <img 
          src={asset.imageData} 
          alt={asset.prompt} 
          className="object-contain w-full h-full max-h-[90vh] rounded-lg shadow-2xl" 
        />
        <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-center p-2 text-sm rounded-b-lg">{asset.prompt}</p>
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-purple-500 text-white rounded-full h-8 w-8 flex items-center justify-center hover:bg-purple-400 transition-colors focus:outline-none focus:ring-2 focus:ring-white shadow-lg"
          aria-label="Close preview"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};