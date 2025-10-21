import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Asset } from '../types';
import { exportSpriteSheetForGodot } from '../services/godotExportService';

interface SpriteSheetEditorProps {
  assets: Asset[];
  onClose: () => void;
  onAddAssetsToSession?: (assets: Asset[]) => void;
}

export const SpriteSheetEditor: React.FC<SpriteSheetEditorProps> = ({ assets, onClose, onAddAssetsToSession }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [columns, setColumns] = useState(assets.length > 4 ? 4 : assets.length);
  const [padding, setPadding] = useState(0);
  const [filename, setFilename] = useState('spritesheet');
  const [added, setAdded] = useState(false);

  const drawSpriteSheet = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || assets.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const validColumns = Math.max(1, columns);
    const rows = Math.ceil(assets.length / validColumns);
    const images: HTMLImageElement[] = [];
    let loadedImages = 0;
    let maxW = 0, maxH = 0;

    assets.forEach(asset => {
      const img = new Image();
      img.src = asset.imageData;
      images.push(img);
      img.onload = () => {
        maxW = Math.max(maxW, img.width);
        maxH = Math.max(maxH, img.height);
        loadedImages++;
        if (loadedImages === assets.length) {
          canvas.width = validColumns * maxW + (validColumns - 1) * padding;
          canvas.height = rows * maxH + (rows - 1) * padding;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          images.forEach((image, index) => {
            const col = index % validColumns;
            const row = Math.floor(index / validColumns);
            const x = col * (maxW + padding);
            const y = row * (maxH + padding);
            ctx.drawImage(image, x, y);
          });
        }
      };
    });
  }, [assets, columns, padding]);
  
  useEffect(() => {
    drawSpriteSheet();
  }, [drawSpriteSheet]);
  
  const handleAddToSession = () => {
    if (onAddAssetsToSession) {
        onAddAssetsToSession(assets);
        setAdded(true);
    }
  }

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      exportSpriteSheetForGodot(canvas, filename, Math.max(1, columns), Math.ceil(assets.length / Math.max(1, columns)));
    }
  };

  const Input = ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        <input {...props} className="w-full bg-gray-700 text-gray-200 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 border-transparent transition-all" />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col p-4 gap-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex-shrink-0 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Spritesheet Editor</h2>
             <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close editor">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        
        <div className="flex-grow flex gap-4 min-h-0">
            {/* Canvas Preview */}
            <div className="w-3/4 bg-gray-900 rounded-md flex items-center justify-center p-4 overflow-auto">
                <canvas ref={canvasRef} className="max-w-full max-h-full" />
            </div>
            
            {/* Controls */}
            <div className="w-1/4 flex flex-col gap-6 bg-gray-800 p-4 rounded-md border border-gray-700">
                <h3 className="text-lg font-semibold mb-2 text-gray-200">Layout</h3>
                <Input label="Columns" type="number" min="1" max={assets.length} value={columns} onChange={(e) => setColumns(Number(e.target.value))} />
                <Input label="Padding (px)" type="number" min="0" value={padding} onChange={(e) => setPadding(Number(e.target.value))} />

                {onAddAssetsToSession && (
                    <>
                    <div className="flex-grow"></div>
                    <button
                        onClick={handleAddToSession}
                        disabled={added}
                        className="w-full flex items-center justify-center px-6 py-3 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 disabled:bg-green-600 disabled:cursor-not-allowed transition-colors"
                    >
                        {added ? 'Added!' : 'Add All to Session'}
                    </button>
                    </>
                )}

                <div className="flex-grow"></div>
                
                <h3 className="text-lg font-semibold mb-2 text-gray-200">Export</h3>
                <Input label="Filename" type="text" value={filename} onChange={(e) => setFilename(e.target.value)} placeholder="spritesheet" />
                <button
                  onClick={handleExport}
                  className="w-full flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-500 transition-colors"
                >
                  Export for Godot
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
