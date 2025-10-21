import React, { useState, useEffect, useCallback } from 'react';
import type { Asset, GenerationOptions, Settings, Project } from './types';
import { Header } from './components/Header';
import { PromptForm } from './components/PromptForm';
import { AssetGrid } from './components/AssetGrid';
import { Loader } from './components/Loader';
import { Modal } from './components/Modal';
import { SettingsModal } from './components/SettingsModal';
import { PreviewModal } from './components/PreviewModal';
import { InpaintingEditor } from './components/InpaintingEditor';
import { SelectionToolbar } from './components/SelectionToolbar';
import { SpriteSheetEditor } from './components/SpriteSheetEditor';
import { GenerationPreviewModal } from './components/GenerationPreviewModal';
import { ProjectManager } from './components/ProjectManager';
import * as geminiService from './services/geminiService';
import * as comfyuiService from './services/comfyuiService';
import * as storage from './services/storageService';
import * as settingsService from './services/settingsService';
import { exportToGodotProject } from './services/godotExportService';

const App: React.FC = () => {
    // App State
    const [settings, setSettings] = useState<Settings>(settingsService.loadSettings());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sessionAssets, setSessionAssets] = useState<Asset[]>([]);
    
    // Project State
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

    // Selection State
    const [selectedAssets, setSelectedAssets] = useState(new Set<string>());

    // UI State
    const [isSettingsOpen, setSettingsOpen] = useState(false);
    const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
    const [inpaintAsset, setInpaintAsset] = useState<Asset | null>(null);
    const [editAsset, setEditAsset] = useState<Asset | null>(null);
    const [isSpriteSheetEditorOpen, setSpriteSheetEditorOpen] = useState(false);
    const [generationPreview, setGenerationPreview] = useState<Asset | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ assets?: string[], project?: Project } | null>(null);

    const activeProject = projects.find(p => p.id === activeProjectId) || null;
    const libraryAssets = activeProject?.assets || [];
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // --- Data Persistence ---
    useEffect(() => {
        const loadInitialData = async () => {
            const { projects, activeProjectId, sessionAssets } = await storage.loadProjects();
            setProjects(projects);
            setActiveProjectId(activeProjectId);
            setSessionAssets(sessionAssets);

            if (projects.length === 0) {
                const newProject: Project = { id: Date.now().toString(), name: "My First Project", assets: [] };
                setProjects([newProject]);
                setActiveProjectId(newProject.id);
            } else if (!activeProjectId && projects.length > 0) {
                setActiveProjectId(projects[0].id);
            }
            setIsInitialLoad(false);
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        if (!isInitialLoad) {
            storage.saveProjects({ projects, activeProjectId, sessionAssets });
        }
    }, [projects, activeProjectId, sessionAssets, isInitialLoad]);
    
    // --- Core Actions ---
    const handleGenerate = async (options: GenerationOptions) => {
        setIsLoading(true);
        setError(null);
        setEditAsset(null); // Close edit form if open
        try {
            const apiKey = settings.provider === 'gemini' ? settings.geminiApiKey : settings.comfyuiAddress;
            if (!apiKey) {
                setSettingsOpen(true);
                throw new Error("API Key or Server Address is not configured. Please add it in Settings.");
            }
            
            const generateFn = settings.provider === 'gemini' ? geminiService.generateImage : comfyuiService.generateImage;
            const base64Data = await generateFn(options, apiKey);
            
            const newAsset: Asset = {
                id: `asset-${Date.now()}`,
                imageData: `data:image/png;base64,${base64Data}`,
                prompt: options.prompt,
                options,
                createdAt: Date.now(),
            };
            setGenerationPreview(newAsset);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleInpaint = async (maskData: string, prompt: string) => {
        if (!inpaintAsset) return;
        setIsLoading(true);
        setError(null);
        try {
            const apiKey = settings.provider === 'gemini' ? settings.geminiApiKey : settings.comfyuiAddress;
             if (!apiKey) {
                setSettingsOpen(true);
                throw new Error("API Key or Server Address is not configured. Please add it in Settings.");
            }

            const inpaintFn = settings.provider === 'gemini' ? geminiService.inpaintImage : comfyuiService.inpaintImage;
            const newBase64 = await inpaintFn(inpaintAsset.imageData, maskData, prompt, apiKey);
            
            const newAsset: Asset = {
                ...inpaintAsset,
                id: `asset-${Date.now()}`,
                imageData: `data:image/png;base64,${newBase64}`,
                prompt: `(inpainted) ${prompt}`,
                createdAt: Date.now(),
            };
            
            // Replace old asset with new one
            setSessionAssets(prev => prev.map(a => a.id === inpaintAsset.id ? newAsset : a));
            if (activeProject) {
                setProjects(prev => prev.map(p => p.id === activeProject.id ? { ...p, assets: p.assets.map(a => a.id === inpaintAsset.id ? newAsset : a) } : p));
            }

            setInpaintAsset(null);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Asset Management ---
    const acceptAndSaveGeneration = () => {
        if (generationPreview) {
            setSessionAssets(prev => [generationPreview, ...prev]);
            setGenerationPreview(null);
        }
    };

    const saveAssetToLibrary = (id: string) => {
        if (!activeProject) return;
        const assetToSave = sessionAssets.find(a => a.id === id);
        if (assetToSave && !activeProject.assets.some(a => a.id === id)) {
             setProjects(prev => prev.map(p => p.id === activeProject.id ? { ...p, assets: [assetToSave, ...p.assets] } : p));
        }
    };
    
    const deleteAssets = (ids: string[]) => {
        const idsSet = new Set(ids);
        setSessionAssets(prev => prev.filter(a => !idsSet.has(a.id)));
        if (activeProject) {
            setProjects(prev => prev.map(p => p.id === activeProject.id ? { ...p, assets: p.assets.filter(a => !idsSet.has(a.id)) } : p));
        }
        setSelectedAssets(new Set());
    };
    
    const handleAssetSelect = (id: string) => {
        setSelectedAssets(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(id)) {
                newSelection.delete(id);
            } else {
                newSelection.add(id);
            }
            return newSelection;
        });
    };
    
    // --- UI Handlers ---
    const handleSaveSettings = (newSettings: Settings) => {
        setSettings(newSettings);
        settingsService.saveSettings(newSettings);
        setSettingsOpen(false);
    };

    const handleExport = () => {
        const assetsToExport = [...sessionAssets, ...libraryAssets].filter(a => selectedAssets.has(a.id));
        exportToGodotProject(assetsToExport);
    };

    // --- Project Management ---
    const handleCreateProject = (name: string) => {
        const newProject: Project = { id: Date.now().toString(), name, assets: [] };
        setProjects(prev => [...prev, newProject]);
        setActiveProjectId(newProject.id);
    };

    const handleDeleteProject = (project: Project) => {
        setProjects(prev => prev.filter(p => p.id !== project.id));
        if (activeProjectId === project.id) {
            const remainingProjects = projects.filter(p => p.id !== project.id);
            setActiveProjectId(remainingProjects.length > 0 ? remainingProjects[0].id : null);
        }
    };

    return (
        <div className="bg-gray-900 min-h-screen text-gray-200 font-sans">
            <Header onOpenSettings={() => setSettingsOpen(true)} />
            
            <main className="container mx-auto p-4 md:p-6">
                <div className="flex justify-end mb-4">
                    <ProjectManager
                        projects={projects}
                        activeProject={activeProject}
                        onSwitchProject={setActiveProjectId}
                        onCreateProject={handleCreateProject}
                        onDeleteProject={(p) => setDeleteConfirm({ project: p })}
                    />
                </div>
                
                <PromptForm onGenerate={handleGenerate} isLoading={isLoading} initialOptions={editAsset?.options} />
                {editAsset && <button onClick={() => setEditAsset(null)} className="text-purple-400 mt-2 text-sm hover:underline">Clear form</button>}
                
                {isLoading && !generationPreview && <Loader />}
                {error && <div className="mt-4 p-4 bg-red-900/50 text-red-300 border border-red-700 rounded-md">{error}</div>}

                <AssetGrid
                    title="This Session"
                    assets={sessionAssets}
                    selectedAssets={selectedAssets}
                    onAssetSelect={handleAssetSelect}
                    onSave={saveAssetToLibrary}
                    onDelete={(id) => setDeleteConfirm({ assets: [id] })}
                    onPreview={setPreviewAsset}
                    onInpaint={setInpaintAsset}
                    onEdit={setEditAsset}
                    onRegenerate={(asset) => handleGenerate(asset.options)}
                    isLibrary={false}
                />
                
                {activeProject && (
                    <AssetGrid
                        title={`${activeProject.name} Library`}
                        assets={libraryAssets}
                        selectedAssets={selectedAssets}
                        onAssetSelect={handleAssetSelect}
                        onSave={() => {}} // No-op
                        onDelete={(id) => setDeleteConfirm({ assets: [id] })}
                        onPreview={setPreviewAsset}
                        onInpaint={setInpaintAsset}
                        onEdit={setEditAsset}
                        onRegenerate={(asset) => handleGenerate(asset.options)}
                        isLibrary={true}
                        emptyStateMessage="Your saved assets for this project will appear here."
                    />
                )}

            </main>

            <SelectionToolbar 
                selectionCount={selectedAssets.size}
                onClearSelection={() => setSelectedAssets(new Set())}
                onExport={handleExport}
                onCreateSpriteSheet={() => setSpriteSheetEditorOpen(true)}
                onDelete={() => setDeleteConfirm({ assets: Array.from(selectedAssets) })}
            />

            {/* Modals */}
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} currentSettings={settings} onSave={handleSaveSettings} />
            {previewAsset && <PreviewModal asset={previewAsset} onClose={() => setPreviewAsset(null)} />}
            {inpaintAsset && <InpaintingEditor asset={inpaintAsset} onClose={() => setInpaintAsset(null)} onSubmit={handleInpaint} isLoading={isLoading} />}
            {isSpriteSheetEditorOpen && <SpriteSheetEditor assets={[...sessionAssets, ...libraryAssets].filter(a => selectedAssets.has(a.id))} onClose={() => setSpriteSheetEditorOpen(false)} />}
            {generationPreview && <GenerationPreviewModal asset={generationPreview} onAccept={acceptAndSaveGeneration} onDiscard={() => setGenerationPreview(null)} />}
            {deleteConfirm && (
                <Modal 
                    isOpen={!!deleteConfirm} 
                    onClose={() => setDeleteConfirm(null)} 
                    title={deleteConfirm.project ? "Delete Project?" : "Delete Asset(s)?"}
                    onConfirm={() => {
                        if (deleteConfirm.assets) deleteAssets(deleteConfirm.assets);
                        if (deleteConfirm.project) handleDeleteProject(deleteConfirm.project);
                        setDeleteConfirm(null);
                    }}
                    confirmText="Delete"
                    confirmClassName="bg-red-600 hover:bg-red-500"
                >
                    <p className="text-gray-400">
                      {deleteConfirm.project ? `Are you sure you want to delete the project "${deleteConfirm.project.name}" and all its assets?` : `Are you sure you want to delete the selected asset(s)?`} This action cannot be undone.
                    </p>
                </Modal>
            )}

        </div>
    );
};

export default App;