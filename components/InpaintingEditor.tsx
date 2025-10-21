import React, { useState, useRef, useEffect } from 'react';
import type { Asset } from '../types';
import { useCanvasDraw } from '../hooks/useCanvasDraw';

interface InpaintingEditorProps {
  asset: Asset;
  onClose: () => void;
  onSubmit: (maskDataUrl: string, prompt: string) => void;
  isLoading: boolean;
}

const PaintIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M14.06,9.94l-1.41,1.41l4.24,4.24l1.41-1.41L14.06,9.94z M20.71,4.04c-0.39-0.39-1.02-0.39-1.41,0l-2.09,2.09l-4.24-4.24L10.83,0 L0,10.83l1.41,1.41l2.12-2.12l4.24,4.24l3.54,3.54l4.24,4.24l1.41-1.41l-4.24-4.24l2.12-2.12l1.41,1.41L22.12,5.45 C22.5,5.06,22.5,4.43,22.12,4.04z M2.83,12.24l-1.41-1.41L12.24,0l1.41,1.41L2.83,12.24z"/>
    </svg>
);

const EraseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M22,3.34L20.66,2l-8.3,8.3l-2.08,2.08L2,10.25V14h3.75l2.08-2.08l8.3-8.3L22,3.34z M5.41,12H4v-1.41l7.3-7.3l1.41,1.41 L5.41,12z M21.41,6.34l-1.41-1.41L18.59,6.34l1.41,1.41L21.41,6.34z"/>
      <path d="M21,14.08V20H3v-5.92L14.08,3H21V14.08z M5,18h14v-4l-7-7l-7,7V18z"/>
    </svg>
);


export const InpaintingEditor: React.FC<InpaintingEditorProps> = ({ asset, onClose, onSubmit, isLoading }) => {
    const [prompt, setPrompt] = useState('');
    const [brushSize, setBrushSize] = useState(20);
    const [tool, setTool] = useState<'paint' | 'erase'>('paint');

    const { canvasRef, maskCanvasRef, setTool: setCanvasTool, setBrushSize: setCanvasBrushSize, getMaskAsBase64 } = useCanvasDraw(asset.imageData);
    
    useEffect(() => {
        setCanvasTool(tool);
    }, [tool, setCanvasTool]);

    useEffect(() => {
        setCanvasBrushSize(brushSize);
    }, [brushSize, setCanvasBrushSize]);

    const handleSubmit = async () => {
        if (!prompt.trim() || isLoading) return;
        const maskData = await getMaskAsBase64();
        if(maskData) {
            onSubmit(maskData, prompt);
        } else {
            console.error("Could not get mask data");
        }
    };
    
    return (
        <div 
          className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4 animate-fade-in"
          onClick={onClose}
        >
          <div 
            className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col p-4 gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-shrink-0 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Inpainting Editor</h2>
                 <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close editor">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <div className="flex-grow flex gap-4 min-h-0">
                {/* Canvas Area */}
                <div className="w-3/4 bg-gray-900 rounded-md flex items-center justify-center relative overflow-hidden">
                    <canvas ref={canvasRef} className="absolute top-0 left-0" />
                    <canvas ref={maskCanvasRef} className="absolute top-0 left-0 opacity-40" />
                </div>
                
                {/* Tools Panel */}
                <div className="w-1/4 flex flex-col gap-6 bg-gray-800 p-4 rounded-md border border-gray-700">
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-gray-200">Inpainting Tools</h3>
                        <div className="mb-4">
                            <label className="text-sm font-medium text-gray-400">Masking</label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <button onClick={() => setTool('paint')} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-md border-2 transition-colors ${tool === 'paint' ? 'bg-purple-600/30 border-purple-500 text-white' : 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-300'}`}>
                                    <PaintIcon />
                                    <span className="text-sm font-medium">Paint Mask</span>
                                </button>
                                <button onClick={() => setTool('erase')} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-md border-2 transition-colors ${tool === 'erase' ? 'bg-purple-600/30 border-purple-500 text-white' : 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-300'}`}>
                                    <EraseIcon />
                                    <span className="text-sm font-medium">Erase Mask</span>
                                </button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="brushSize" className="text-sm font-medium text-gray-400">Brush Size</label>
                            <input 
                                id="brushSize"
                                type="range"
                                min="5"
                                max="100"
                                value={brushSize}
                                onChange={(e) => setBrushSize(Number(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer mt-2"
                            />
                        </div>
                    </div>
                    
                    <div className="flex-grow flex flex-col">
                        <label htmlFor="inpaint-prompt" className="text-sm font-medium text-gray-400 mb-2">Describe your changes</label>
                        <textarea
                            id="inpaint-prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., add a futuristic helmet"
                            className="w-full flex-grow bg-gray-700 text-gray-200 placeholder-gray-500 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 border-transparent transition-all resize-none"
                        />
                    </div>
                    
                    <button
                      onClick={handleSubmit}
                      disabled={isLoading || !prompt.trim()}
                      className="w-full flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-300"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating...
                        </>
                      ) : (
                        'Generate'
                      )}
                    </button>
                </div>
            </div>
          </div>
        </div>
    );
};