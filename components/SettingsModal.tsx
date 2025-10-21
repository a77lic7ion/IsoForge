import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import type { Settings, GenerationProvider } from '../types';
import * as geminiService from '../services/geminiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: Settings;
  onSave: (newSettings: Settings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentSettings, onSave }) => {
  const [provider, setProvider] = useState<GenerationProvider>(currentSettings.provider);
  const [comfyuiAddress, setComfyuiAddress] = useState(currentSettings.comfyuiAddress);
  const [geminiApiKey, setGeminiApiKey] = useState(currentSettings.geminiApiKey);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');


  useEffect(() => {
    setProvider(currentSettings.provider);
    setComfyuiAddress(currentSettings.comfyuiAddress);
    setGeminiApiKey(currentSettings.geminiApiKey);
    setTestStatus('idle');
  }, [currentSettings, isOpen]);

  const handleSave = () => {
    onSave({ provider, comfyuiAddress, geminiApiKey });
  };

  const handleTestKey = async () => {
    setTestStatus('testing');
    const isValid = await geminiService.testApiKey(geminiApiKey);
    setTestStatus(isValid ? 'success' : 'error');
  };

  const TestButton: React.FC = () => {
    let text = 'Test';
    if (testStatus === 'testing') text = 'Testing...';
    if (testStatus === 'success') text = 'Success';
    if (testStatus === 'error') text = 'Failed';
    return (
      <button
        onClick={handleTestKey}
        disabled={testStatus === 'testing' || !geminiApiKey}
        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors w-24
          ${testStatus === 'success' ? 'bg-green-600 text-white' : ''}
          ${testStatus === 'error' ? 'bg-red-600 text-white' : ''}
          ${testStatus === 'idle' || testStatus === 'testing' ? 'bg-gray-600 hover:bg-gray-500 text-white' : ''}
          ${testStatus === 'testing' ? 'cursor-wait' : ''}
          ${!geminiApiKey ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : ''}
        `}
      >
        {text}
      </button>
    );
  };

  const RadioButton = ({ id, value, label }: { id: string, value: GenerationProvider, label: string }) => (
    <div>
        <input
            type="radio"
            id={id}
            name="provider"
            value={value}
            checked={provider === value}
            onChange={() => setProvider(value)}
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      onConfirm={handleSave}
      confirmText="Save Settings"
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Generation Provider
          </label>
          <div className="grid grid-cols-2 gap-4">
            <RadioButton id="gemini" value="gemini" label="Gemini API" />
            <RadioButton id="comfyui" value="comfyui" label="Local ComfyUI" />
          </div>
        </div>
        
        {provider === 'gemini' && (
          <div className="animate-fade-in space-y-2">
            <label htmlFor="gemini-api-key" className="block text-sm font-medium text-gray-300">
              Gemini API Key
            </label>
            <div className="flex items-center gap-2">
              <input
                id="gemini-api-key"
                type="password"
                value={geminiApiKey}
                onChange={(e) => {
                  setGeminiApiKey(e.target.value);
                  setTestStatus('idle');
                }}
                placeholder="Enter your API Key"
                className="flex-grow w-full bg-gray-700 text-gray-200 placeholder-gray-500 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 border-transparent transition-all"
              />
              <TestButton />
            </div>
             {testStatus === 'success' && <p className="text-xs text-green-400">API Key is valid and has access to the model.</p>}
             {testStatus === 'error' && <p className="text-xs text-red-400">Invalid API Key or connection failed.</p>}
            <p className="text-xs text-gray-500">
                Get a key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">Google AI Studio</a>. Your key is stored only in your browser.
            </p>
          </div>
        )}

        {provider === 'comfyui' && (
          <div className="animate-fade-in">
            <label htmlFor="comfyui-address" className="block text-sm font-medium text-gray-300 mb-2">
              ComfyUI Server Address
            </label>
            <input
              id="comfyui-address"
              type="text"
              value={comfyuiAddress}
              onChange={(e) => setComfyuiAddress(e.target.value)}
              placeholder="http://127.0.0.1:8188"
              className="w-full bg-gray-700 text-gray-200 placeholder-gray-500 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 border-transparent transition-all"
            />
             <p className="text-xs text-gray-500 mt-2">
                Enter the address of your running ComfyUI instance, including the port.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};