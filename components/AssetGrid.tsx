import React from 'react';
import type { Asset } from '../types';
import { AssetCard } from './AssetCard';

interface AssetGridProps {
    title: string;
    assets: Asset[];
    selectedAssets: Set<string>;
    onAssetSelect: (id: string) => void;
    onSave: (id: string) => void;
    onDelete: (id: string) => void;
    onPreview: (asset: Asset) => void;
    onInpaint: (asset: Asset) => void;
    onEdit: (asset: Asset) => void;
    onRegenerate: (asset: Asset) => void;
    isLibrary: boolean;
    emptyStateMessage?: string;
}

export const AssetGrid: React.FC<AssetGridProps> = ({ title, assets, selectedAssets, onAssetSelect, onSave, onDelete, onPreview, onInpaint, onEdit, onRegenerate, isLibrary, emptyStateMessage = "No assets here yet. Use the form above to generate some!" }) => {

    if (assets.length === 0) {
        return (
            <div className="mt-8">
                <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
                <div className="text-center py-16 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-700">
                    <p className="text-gray-500">{emptyStateMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                {assets.map(asset => (
                    <AssetCard 
                        key={asset.id} 
                        asset={asset}
                        isSelected={selectedAssets.has(asset.id)}
                        onAssetSelect={onAssetSelect}
                        onSave={onSave}
                        onDelete={onDelete}
                        onPreview={onPreview}
                        onInpaint={onInpaint}
                        onEdit={onEdit}
                        onRegenerate={onRegenerate}
                        isLibrary={isLibrary} 
                    />
                ))}
            </div>
        </div>
    );
};
