import React, { useState, useEffect } from 'react';
import type { GenerationOptions, GenerationType, ViewOption, StyleOption } from '../types';

interface PromptFormProps {
  onGenerate: (options: GenerationOptions) => void;
  isLoading: boolean;
  initialOptions?: Partial<GenerationOptions>;
}

const GenerateIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>);

export const PromptForm: React.FC<PromptFormProps> = ({ onGenerate, isLoading, initialOptions }) => {
  const [prompt, setPrompt] = useState('');
  const [genType, setGenType] = useState<GenerationType>('asset');
  const [view, setView] = useState<ViewOption>('isometric');
  const [style, setStyle] = useState<StyleOption>('illustration');
  
  useEffect(() => {
    if (initialOptions) {
        setPrompt(initialOptions.prompt || '');
        setGenType(initialOptions.genType || 'asset');
        setView(initialOptions.view || 'isometric');
        setStyle(initialOptions.style || 'illustration');
    }
  }, [initialOptions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate({ prompt: prompt.trim(), genType, view, style });
    }
  };

  const RadioButton = ({ id, value, label }: { id: string, value: GenerationType, label: string }) => (
    <div>
        <input
            type="radio"
            id={id}
            name="genType"
            value={value}
            checked={genType === value}
            onChange={() => setGenType(value)}
            className="sr-only peer"
        />
        <label
            htmlFor={id}
            className={`block w-full text-center px-4 py-3 rounded-lg border-2 cursor-pointer transition-colors peer-checked:border-purple-500 peer-checked:bg-purple-600/20 peer-checked:text-white bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600`}
        >
            {label}
        </label>
    </div>
  );
  
  const Select = ({ label, value, onChange, children, disabled }: { label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, children: React.ReactNode, disabled?: boolean }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
        <select value={value} onChange={onChange} disabled={disabled} className="w-full bg-gray-700 text-gray-200 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 border-transparent transition-all disabled:bg-gray-800 disabled:cursor-not-allowed">
            {children}
        </select>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-gray-800/50 rounded-lg border border-gray-700 space-y-6">
      <div>
        <label htmlFor="prompt" className="block text-lg font-bold text-white mb-2">Describe your asset</label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., a treasure chest, a stone well, a cute slime monster"
          className="w-full bg-gray-700 text-gray-200 placeholder-gray-500 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 border-transparent transition-all"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
          <div className="grid grid-cols-1 gap-2">
            <RadioButton id="asset" value="asset" label="Single Asset" />
            <RadioButton id="background" value="background" label="Background/Tile" />
            <RadioButton id="iso-set" value="iso-set" label="Isometric Set (8 Views)" />
          </div>
        </div>
        
        <Select label="View / Angle" value={view} onChange={(e) => setView(e.target.value as ViewOption)} disabled={genType === 'iso-set'}>
            <option value="isometric">Isometric</option>
            <option value="iso-n">Isometric (North)</option>
            <option value="iso-ne">Isometric (North-East)</option>
            <option value="iso-e">Isometric (East)</option>
            <option value="iso-se">Isometric (South-East)</option>
            <option value="iso-s">Isometric (South)</option>
            <option value="iso-sw">Isometric (South-West)</option>
            <option value="iso-w">Isometric (West)</option>
            <option value="iso-nw">Isometric (North-West)</option>
            <option value="top-down">Top-Down</option>
            <option value="front">Front</option>
            <option value="side">Side</option>
        </Select>
        
        <Select label="Style" value={style} onChange={(e) => setStyle(e.target.value as StyleOption)}>
            <option value="illustration">Illustration</option>
            <option value="vector">Vector Art</option>
            <option value="cartoon">Cartoon</option>
            <option value="hd">HD / Detailed</option>
            <option value="outline">Thick Outlines</option>
            <option value="b&w">Black & White</option>
            <option value="none">None</option>
        </Select>
      </div>

      <button
        type="submit"
        disabled={isLoading || !prompt.trim()}
        className="w-full flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-300"
      >
        <GenerateIcon />
        {isLoading ? 'Generating...' : 'Generate'}
      </button>
    </form>
  );
};
