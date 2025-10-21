import type { GenerationOptions } from '../types';
// A simplified client for the ComfyUI API
// See: https://github.com/comfyanonymous/ComfyUI/blob/master/web/scripts/api.js

const CLIENT_ID = Date.now().toString();

// --- Prompt Builder (mirrors geminiService for consistency) ---

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


// --- Helper Functions ---

function dataURLToBlob(dataURL: string): Blob {
    const parts = dataURL.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
}

async function uploadImage(dataUrl: string, serverAddress: string): Promise<any> {
    const blob = dataURLToBlob(dataUrl);
    const formData = new FormData();
    formData.append('image', blob, 'image.png');
    formData.append('overwrite', 'true');
    const response = await fetch(`${serverAddress}/upload/image`, {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) {
        throw new Error('Failed to upload image to ComfyUI');
    }
    return response.json();
}

function getImages(ws: WebSocket, serverAddress: string, prompt: any): Promise<string> {
    return new Promise((resolve, reject) => {
        const onMessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            if (data.type === 'executed') {
                const finalImage = data.data.output.images[0];
                const url = `${serverAddress}/view?filename=${encodeURIComponent(finalImage.filename)}&subfolder=${encodeURIComponent(finalImage.subfolder)}&type=${finalImage.type}`;
                
                fetch(url)
                    .then(response => response.blob())
                    .then(blob => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const base64data = (reader.result as string).split(',')[1];
                            resolve(base64data);
                        };
                        reader.readAsDataURL(blob);
                    })
                    .catch(reject)
                    .finally(() => {
                        ws.removeEventListener('message', onMessage);
                        ws.close();
                    });
            } else if (data.type === 'execution_error') {
                console.error('ComfyUI Execution Error:', data.data);
                reject(new Error(`ComfyUI execution error: ${data.data.exception_message}`));
                ws.removeEventListener('message', onMessage);
                ws.close();
            }
        };
        ws.addEventListener('message', onMessage);
    });
}

async function queuePrompt(serverAddress: string, promptWorkflow: object): Promise<string> {
    const wsUrl = new URL(serverAddress);
    wsUrl.protocol = wsUrl.protocol.replace('http', 'ws');
    const ws = new WebSocket(`${wsUrl.href}/ws?clientId=${CLIENT_ID}`);

    const imagePromise = getImages(ws, serverAddress, promptWorkflow);

    await new Promise<void>(resolve => {
        ws.onopen = () => {
            fetch(`${serverAddress}/prompt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: promptWorkflow, client_id: CLIENT_ID }),
            }).then(response => {
                if(!response.ok) throw new Error("Failed to queue prompt in ComfyUI");
                resolve();
            }).catch(e => {
                ws.close();
                throw e;
            });
        };
    });

    return imagePromise;
}


// --- API Functions ---

export async function generateImage(options: GenerationOptions, serverAddress: string): Promise<string> {
    const fullPrompt = buildPromptFromOptions(options);
    const negativePrompt = "text, watermark, blurry, low quality, jpeg artifacts, ugly";
    
    // A standard text-to-image workflow JSON
    const workflow = {
        "3": {
            "inputs": { "seed": Math.floor(Math.random() * 1e15), "steps": 25, "cfg": 8, "sampler_name": "dpmpp_2m", "scheduler": "karras", "denoise": 1, "model": ["4", 0], "positive": ["6", 0], "negative": ["7", 0], "latent_image": ["5", 0] },
            "class_type": "KSampler",
        },
        "4": { "inputs": { "ckpt_name": "sd_xl_base_1.0.safetensors" }, "class_type": "CheckpointLoaderSimple" },
        "5": { "inputs": { "width": 1024, "height": 1024, "batch_size": 1 }, "class_type": "EmptyLatentImage" },
        "6": { "inputs": { "text": fullPrompt, "clip": ["4", 1] }, "class_type": "CLIPTextEncode" },
        "7": { "inputs": { "text": negativePrompt, "clip": ["4", 1] }, "class_type": "CLIPTextEncode" },
        "8": { "inputs": { "samples": ["3", 0], "vae": ["4", 2] }, "class_type": "VAEDecode" },
        "9": { "inputs": { "filename_prefix": "IsoForge", "images": ["8", 0] }, "class_type": "SaveImage" }
    };
    
    try {
        return await queuePrompt(serverAddress, workflow);
    } catch(e) {
        console.error("ComfyUI connection error", e);
        throw new Error(`Could not connect to ComfyUI server at ${serverAddress}. Make sure it's running and accessible.`);
    }
}


export async function inpaintImage(base64ImageData: string, base64MaskData: string, prompt: string, serverAddress: string): Promise<string> {
    const inpaintPrompt = `${prompt}, high quality, detailed`;
    const negativePrompt = "text, watermark, blurry, low quality, jpeg artifacts, ugly, deformed";
    
    // Upload the base image and mask first
    const [baseImage, maskImage] = await Promise.all([
        uploadImage(base64ImageData, serverAddress),
        uploadImage(base64MaskData, serverAddress)
    ]);
    
    // An inpainting workflow using the uploaded images
    const workflow = {
      "1": { "inputs": { "image": baseImage.name, "vae": ["13", 2] }, "class_type": "VAEEncode" },
      "2": { "inputs": { "seed": Math.floor(Math.random() * 1e15), "steps": 25, "cfg": 8, "sampler_name": "dpmpp_2m_sde", "scheduler": "karras", "denoise": 1, "model": ["13", 0], "positive": ["14", 0], "negative": ["15", 0], "latent_image": ["16", 0] }, "class_type": "KSampler" },
      "5": { "inputs": { "samples": ["2", 0], "vae": ["13", 2] }, "class_type": "VAEDecode" },
      "9": { "inputs": { "filename_prefix": "IsoForge_Inpaint", "images": ["5", 0] }, "class_type": "SaveImage" },
      "13": { "inputs": { "ckpt_name": "sd_xl_base_1.0.safetensors" }, "class_type": "CheckpointLoaderSimple" },
      "14": { "inputs": { "text": inpaintPrompt, "clip": ["13", 1] }, "class_type": "CLIPTextEncode" },
      "15": { "inputs": { "text": negativePrompt, "clip": ["13", 1] }, "class_type": "CLIPTextEncode" },
      "16": { "inputs": { "pixels": ["1", 0], "mask": ["17", 0] }, "class_type": "SetLatentNoiseMask" },
      "17": { "inputs": { "image": maskImage.name, "channel": "alpha" }, "class_type": "LoadImage" }
    };

    try {
        return await queuePrompt(serverAddress, workflow);
    } catch(e) {
        console.error("ComfyUI connection error", e);
        throw new Error(`Could not connect to ComfyUI server at ${serverAddress}. Make sure it's running and accessible.`);
    }
}
