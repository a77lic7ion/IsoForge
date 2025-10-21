import React from 'react';

const ExportIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg> );
const SpriteSheetIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M1 1a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H2a1 1 0 01-1-1V1zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1V1zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V1zM1 6a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H2a1 1 0 01-1-1V6zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1V6zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V6zM1 11a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H2a1 1 0 01-1-1v-2zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1v-2zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z" /></svg>);
const DeleteIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg> );

interface SelectionToolbarProps {
  selectionCount: number;
  onClearSelection: () => void;
  onExport: () => void;
  onCreateSpriteSheet: () => void;
  onDelete: () => void;
}

export const SelectionToolbar: React.FC<SelectionToolbarProps> = ({ selectionCount, onClearSelection, onExport, onCreateSpriteSheet, onDelete }) => {
  if (selectionCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-2 bg-gray-900/80 backdrop-blur-md border border-purple-500/30 rounded-full p-2 shadow-2xl shadow-purple-900/20 animate-fade-in">
            <span className="text-white font-bold text-sm px-3">{selectionCount} asset{selectionCount > 1 ? 's' : ''} selected</span>
            <div className="w-px h-6 bg-gray-600"></div>
            <button onClick={onExport} className="flex items-center px-4 py-2 text-sm bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors"><ExportIcon /> Export</button>
            <button onClick={onCreateSpriteSheet} className="flex items-center px-4 py-2 text-sm bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors"><SpriteSheetIcon /> Sprite Sheet</button>
            <button onClick={onDelete} className="flex items-center px-4 py-2 text-sm bg-red-800/50 text-red-300 rounded-full hover:bg-red-700/50 transition-colors"><DeleteIcon /> Delete</button>
            <div className="w-px h-6 bg-gray-600"></div>
            <button onClick={onClearSelection} title="Clear Selection" className="h-9 w-9 flex items-center justify-center rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    </div>
  );
};
