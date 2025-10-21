import React from 'react';
import type { Asset } from '../types';

const SaveIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6a1 1 0 10-2 0v5.586L7.707 10.293zM5 4a1 1 0 011-1h8a1 1 0 011 1v4h-2V5H6v3H4V4a1 1 0 011-1z" /><path d="M3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" /></svg> );
const DeleteIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg> );
const EditIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg> );
const InpaintIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M14.06,9.94l-1.41,1.41l4.24,4.24l1.41-1.41L14.06,9.94z M20.71,4.04c-0.39-0.39-1.02-0.39-1.41,0l-2.09,2.09l-4.24-4.24L10.83,0 L0,10.83l1.41,1.41l2.12-2.12l4.24,4.24l3.54,3.54l4.24,4.24l1.41-1.41l-4.24-4.24l2.12-2.12l1.41,1.41L22.12,5.45 C22.5,5.06,22.5,4.43,22.12,4.04z M2.83,12.24l-1.41-1.41L12.24,0l1.41,1.41L2.83,12.24z"/></svg> );
const RegenerateIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm10 14a1 1 0 01-1-1v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 111.885-.666A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 01-1 1z" clipRule="evenodd" /></svg> );


interface AssetCardProps {
    asset: Asset;
    isSelected: boolean;
    onAssetSelect: (id: string) => void;
    onSave: (id: string) => void;
    onDelete: (id: string) => void;
    onPreview: (asset: Asset) => void;
    onInpaint: (asset: Asset) => void;
    onEdit: (asset: Asset) => void;
    onRegenerate: (asset: Asset) => void;
    isLibrary: boolean;
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset, isSelected, onAssetSelect, onSave, onDelete, onPreview, onInpaint, onEdit, onRegenerate, isLibrary }) => {

    const ActionButton: React.FC<{ children: React.ReactNode, onClick: (e: React.MouseEvent) => void, className?: string, title: string }> = ({ children, onClick, className = 'bg-gray-700 hover:bg-gray-600', title }) => (
        <button 
            title={title}
            onClick={onClick}
            className={`h-7 w-7 flex items-center justify-center rounded-md text-white transition-colors ${className}`}
        >
            {children}
        </button>
    );

    const handleAction = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    };

    return (
        <div 
            onClick={() => onAssetSelect(asset.id)}
            className={`relative group aspect-square rounded-lg overflow-hidden border-2 ${isSelected ? 'border-purple-500 ring-2 ring-purple-500/50' : 'border-gray-700'} transition-all cursor-pointer bg-gray-800`}
        >
            <img 
                src={asset.imageData} 
                alt={asset.prompt} 
                className="w-full h-full object-cover" 
                onClick={() => onPreview(asset)} 
                loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                <p className="text-white text-xs line-clamp-2 mb-2">{asset.prompt}</p>
                 <div className="flex justify-end gap-1.5">
                    {!isLibrary && (
                        <ActionButton title="Save to Library" onClick={(e) => handleAction(e, () => onSave(asset.id))} className="bg-purple-600 hover:bg-purple-500"><SaveIcon /></ActionButton>
                    )}
                    <ActionButton title="Edit Settings" onClick={(e) => handleAction(e, () => onEdit(asset))}><EditIcon /></ActionButton>
                    <ActionButton title="Regenerate" onClick={(e) => handleAction(e, () => onRegenerate(asset))}><RegenerateIcon /></ActionButton>
                    <ActionButton title="Inpaint" onClick={(e) => handleAction(e, () => onInpaint(asset))}><InpaintIcon /></ActionButton>
                    <ActionButton title="Delete" onClick={(e) => handleAction(e, () => onDelete(asset.id))} className="bg-red-600 hover:bg-red-500"><DeleteIcon /></ActionButton>
                </div>
            </div>
             {isSelected && (
                <div className="absolute top-2 left-2 h-5 w-5 rounded bg-purple-600/80 border-2 border-white flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </div>
             )}
        </div>
    );
};
