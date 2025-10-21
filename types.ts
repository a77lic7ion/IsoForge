export type GenerationProvider = 'gemini' | 'comfyui';
export type GenerationType = 'asset' | 'background';
export type ViewOption = 'isometric' | 'iso-n' | 'iso-ne' | 'iso-e' | 'iso-se' | 'iso-s' | 'iso-sw' | 'iso-w' | 'iso-nw' | 'top-down' | 'front' | 'side';
export type StyleOption = 'none' | 'illustration' | 'vector' | 'cartoon' | 'hd' | 'outline' | 'b&w';

export interface GenerationOptions {
  prompt: string;
  genType: GenerationType;
  view: ViewOption;
  style: StyleOption;
  seed?: number; // For reproducibility
  originalId?: string; // For regeneration
}

export interface Asset {
  id: string;
  imageData: string; // base64 data URL
  prompt: string;
  options: GenerationOptions;
  createdAt: number;
}

export interface Project {
  id: string;
  name: string;
  assets: Asset[];
}

export interface Settings {
  provider: GenerationProvider;
  geminiApiKey: string;
  comfyuiAddress: string;
}
