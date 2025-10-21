import type { Settings } from '../types';

const SETTINGS_KEY = 'iso-forge-settings';

const DEFAULTS: Settings = {
  provider: 'gemini',
  geminiApiKey: '',
  comfyuiAddress: 'http://127.0.0.1:8188',
};

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save settings to local storage:", error);
  }
}

export function loadSettings(): Settings {
  try {
    const storedSettings = localStorage.getItem(SETTINGS_KEY);
    if (storedSettings) {
      // Merge with defaults to ensure new settings are added
      return { ...DEFAULTS, ...JSON.parse(storedSettings) };
    }
  } catch (error) {
    console.error("Failed to load settings:", error);
    localStorage.removeItem(SETTINGS_KEY);
  }
  return DEFAULTS;
}
