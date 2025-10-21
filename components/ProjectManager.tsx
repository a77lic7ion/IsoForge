import React, { useState, useRef, useEffect } from 'react';
import { Modal } from './Modal';
import type { Project } from '../types';

interface ProjectManagerProps {
    projects: Project[];
    activeProject: Project | null;
    onSwitchProject: (id: string) => void;
    onCreateProject: (name: string) => void;
    onDeleteProject: (project: Project) => void;
}

const IconChevronDown = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>);
const IconPlus = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>);
const IconTrash = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg> );

export const ProjectManager: React.FC<ProjectManagerProps> = ({ projects, activeProject, onSwitchProject, onCreateProject, onDeleteProject }) => {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCreate = () => {
        if (newProjectName.trim()) {
            onCreateProject(newProjectName.trim());
            setNewProjectName('');
            setCreateModalOpen(false);
            setDropdownOpen(false);
        }
    };

    const handleSwitch = (id: string) => {
        onSwitchProject(id);
        setDropdownOpen(false);
    };

    return (
        <>
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setDropdownOpen(prev => !prev)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white text-sm font-semibold rounded-md hover:bg-gray-700 border border-gray-700 transition-colors"
                >
                    <span className="font-normal text-gray-400">Project:</span>
                    <span className="truncate max-w-[150px]">{activeProject?.name || 'No Project'}</span>
                    <IconChevronDown />
                </button>

                {isDropdownOpen && (
                    <div className="absolute top-full mt-2 w-64 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-20 right-0">
                        <ul className="py-1">
                            <li className="px-3 py-2 text-xs font-semibold text-gray-400">Switch Project</li>
                            {projects.map(p => (
                                <li key={p.id}>
                                    <a href="#" onClick={(e) => { e.preventDefault(); handleSwitch(p.id); }} className={`block px-3 py-2 text-sm ${activeProject?.id === p.id ? 'bg-purple-600 text-white' : 'text-gray-200 hover:bg-gray-700'}`}>
                                        {p.name}
                                    </a>
                                </li>
                            ))}
                             <li className="border-t border-gray-600 my-1"></li>
                             <li>
                                <a href="#" onClick={(e) => { e.preventDefault(); setCreateModalOpen(true); }} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700">
                                    <IconPlus /> Create New Project
                                </a>
                            </li>
                             <li>
                                <a href="#" onClick={(e) => { e.preventDefault(); if(activeProject) onDeleteProject(activeProject); setDropdownOpen(false); }} className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500 hover:text-white">
                                    <IconTrash /> Delete Current Project
                                </a>
                            </li>
                        </ul>
                    </div>
                )}
            </div>

            {isCreateModalOpen && (
                <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Project">
                    <div className="flex flex-col gap-4">
                        <p className="text-gray-400">Enter a name for your new project.</p>
                        <input
                            type="text"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            placeholder="e.g., Forest Adventure Game"
                            className="w-full bg-gray-700 text-gray-200 placeholder-gray-500 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 border-transparent transition-all"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        />
                        <button
                            onClick={handleCreate}
                            className="w-full flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-500 transition-colors"
                        >
                            Create Project
                        </button>
                    </div>
                </Modal>
            )}
        </>
    );
};