import React from 'react';
import type { Asset } from '../types';

interface GenerationPreviewModalProps {
  asset: Asset;
  onAccept: () => void;
  onDiscard: () => void;
}

const AcceptIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const DiscardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);


export const GenerationPreviewModal: React.FC<GenerationPreviewModalProps> = ({ asset, onAccept, onDiscard }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4 animate-fade-in"
      aria-modal="true"
      role="dialog"
    >
      <div className="w-full h-full flex items-center justify-center flex-col">
        <div 
          className="relative w-full max-w-4xl max-h-[80vh]"
        >
          <img 
            src={asset.imageData} 
            alt={asset.prompt} 
            className="object-contain w-full h-full max-h-[80vh] rounded-lg" 
          />
        </div>
        <p className="text-gray-400 mt-4 text-center max-w-4xl">"{asset.prompt}"</p>
      </div>

      <div className="absolute bottom-6 flex items-center justify-center gap-4">
        <button
            onClick={onDiscard}
            className="flex items-center justify-center px-6 py-3 bg-gray-700 text-white font-semibold rounded-md hover:bg-gray-600 transition-colors duration-300"
        >
            <DiscardIcon />
            Discard
        </button>
        <button
            onClick={onAccept}
            className="flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-500 transition-colors duration-300"
        >
            <AcceptIcon />
            Accept & Save
        </button>
      </div>
    </div>
  );
};