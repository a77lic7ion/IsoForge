import { GoogleGenAI, Modality } from "@google/genai";
import type { GenerationOptions } from '../types';

export async function testApiKey(apiKey: string): Promise<boolean> {
  if (!apiKey) return false;
  try {
    const ai = new GoogleGenAI({ apiKey });
    // A lightweight call to test authentication and model access.
    await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'test',
      config: { maxOutputTokens: 1 }
    });
    return true;
  } catch (error) {
    console.error("Gemini API key test failed:", error);
    return false;
  }
}

const viewMap: Record<string, string> = {
    'isometric': 'isometric',
    'iso-n': 'isometric, from north',
    'iso-ne': 'isometric, from north-east',
    'iso-e': 'isometric, from east',
    'iso-se': 'isometric, from south-east',
    'iso-s': 'isometric, from south',
    'iso-sw': 'isometric, from south-west',
    'iso-w': 'isometric, from west',
    'iso-nw': 'isometric, from north-west',
    'top-down': 'top-down orthographic, 2d',
    'front': 'front view, orthographic, 2d',
    'side': 'side view, orthographic, 2d',
};

const styleMap: Record<string, string> = {
    'none': '',
    'illustration': 'illustration style',
    'vector': 'vector art style',
    'cartoon': 'cartoon style',
    'hd': 'hd, detailed, intricate',
    'outline': 'thick outlines, cel shaded',
    'b&w': 'black and white, grayscale',
};

const buildPromptFromOptions = (options: GenerationOptions): string => {
    const { prompt, genType, view, style } = options;
    
    let parts: string[] = [];

    if (style !== 'none') parts.push(styleMap[style]);
    if (view) parts.push(viewMap[view]);

    if (genType === 'asset') {
        parts.push('game asset');
        parts.push(prompt);
        parts.push('sprite');
        parts.push('transparent background');
    } else { // background
        parts.push('game background');
        parts.push(prompt);
        parts.push('tileable');
        parts.push('seamless pattern');
    }
    
    return parts.filter(p => p).join(', ');
};

export async function generateImage(options: GenerationOptions, apiKey: string): Promise<string> {
  if (!apiKey) {
    throw new Error("Gemini API Key is not configured. Please add it in Settings.");
  }
  const ai = new GoogleGenAI({ apiKey });

  try {
    const fullPrompt = buildPromptFromOptions(options);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // aka "Nano Banana"
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const candidate = response.candidates?.[0];

    if (candidate?.finishReason === 'SAFETY') {
      throw new Error("Image generation was blocked due to safety concerns. Please try a different prompt.");
    }
    
    if (candidate && candidate.content && candidate.content.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          return part.inlineData.data;
        }
      }
    }
    
    console.error("Image generation failed. Full response:", JSON.stringify(response, null, 2));
    throw new Error("No image data found in the response. The model may have returned an empty result.");

  } catch (error) {
    console.error("Error generating image:", error);
    if (error instanceof Error) {
        throw error; // Re-throw specific errors
    }
    throw new Error("Failed to generate image with the Gemini API.");
  }
}

export async function inpaintImage(
  base64ImageData: string,
  base64MaskData: string,
  prompt: string,
  apiKey: string
): Promise<string> {
   if (!apiKey) {
    throw new Error("Gemini API Key is not configured. Please add it in Settings.");
  }
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const imagePart = {
      inlineData: {
        mimeType: 'image/png',
        data: base64ImageData.split(',')[1],
      },
    };
    const maskPart = {
      inlineData: {
        mimeType: 'image/png',
        data: base64MaskData.split(',')[1],
      },
    };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [imagePart, maskPart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });
    
    const candidate = response.candidates?.[0];

    if (candidate?.finishReason === 'SAFETY') {
      throw new Error("Inpainting was blocked due to safety concerns. Please try a different prompt.");
    }

    if (candidate && candidate.content && candidate.content.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          return part.inlineData.data;
        }
      }
    }
    
    console.error("Inpainting failed. Full response:", JSON.stringify(response, null, 2));
    throw new Error("No inpainted image data found in the response. The model may have returned an empty result.");
  } catch (error) {
    console.error("Error inpainting image:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Failed to inpaint image with the Gemini API.");
  }
}