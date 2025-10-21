import { useRef, useEffect, useState, useCallback } from 'react';

type Tool = 'paint' | 'erase';

export const useCanvasDraw = (imageUrl: string) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const maskCanvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState<Tool>('paint');
    const [brushSize, setBrushSize] = useState(20);

    const drawImageOnCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const maskCanvas = maskCanvasRef.current;
        const ctx = canvas?.getContext('2d');
        const maskCtx = maskCanvas?.getContext('2d');
        if (!canvas || !ctx || !maskCanvas || !maskCtx) return;

        const image = new Image();
        image.src = imageUrl;
        image.onload = () => {
            const container = canvas.parentElement;
            if(!container) return;

            const containerW = container.clientWidth;
            const containerH = container.clientHeight;
            const imgAspectRatio = image.width / image.height;
            const containerAspectRatio = containerW / containerH;

            let renderW, renderH;
            if (imgAspectRatio > containerAspectRatio) {
                renderW = containerW;
                renderH = containerW / imgAspectRatio;
            } else {
                renderH = containerH;
                renderW = containerH * imgAspectRatio;
            }

            canvas.width = maskCanvas.width = renderW;
            canvas.height = maskCanvas.height = renderH;
            
            // Create a more visible cursor with a black outline for better contrast
            const svgCursor = `
                <svg xmlns="http://www.w3.org/2000/svg" width="${brushSize}" height="${brushSize}" viewBox="0 0 ${brushSize} ${brushSize}">
                    <circle cx="${brushSize / 2}" cy="${brushSize / 2}" r="${brushSize / 2 - 1}" fill="none" stroke="black" stroke-width="2.5"/>
                    <circle cx="${brushSize / 2}" cy="${brushSize / 2}" r="${brushSize / 2 - 1}" fill="none" stroke="white" stroke-width="1"/>
                </svg>
            `.trim();
            const cursorUrl = `url('data:image/svg+xml;utf8,${encodeURIComponent(svgCursor)}') ${brushSize / 2} ${brushSize / 2}, auto`;
            maskCanvas.style.cursor = cursorUrl;

            ctx.drawImage(image, 0, 0, renderW, renderH);
        };
    }, [imageUrl, brushSize]);

    useEffect(() => {
        drawImageOnCanvas();
        window.addEventListener('resize', drawImageOnCanvas);
        return () => window.removeEventListener('resize', drawImageOnCanvas);
    }, [drawImageOnCanvas]);

    const getCoords = (e: MouseEvent) => {
        const canvas = maskCanvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    const startDrawing = (e: MouseEvent) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const ctx = maskCanvasRef.current?.getContext('2d');
        ctx?.beginPath();
    };

    const draw = (e: MouseEvent) => {
        if (!isDrawing) return;
        const canvas = maskCanvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;

        const { x, y } = getCoords(e);

        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (tool === 'paint') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = 'red';
        } else { // erase
            ctx.globalCompositeOperation = 'destination-out';
        }
        
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    useEffect(() => {
        const canvas = maskCanvasRef.current;
        if (!canvas) return;
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseleave', stopDrawing);
        return () => {
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mouseup', stopDrawing);
            canvas.removeEventListener('mousemove', draw);
            canvas.removeEventListener('mouseleave', stopDrawing);
        };
    }, [isDrawing, tool, brushSize]);
    
    const getMaskAsBase64 = async (): Promise<string | null> => {
        const maskCanvas = maskCanvasRef.current;
        if (!maskCanvas) return null;

        return new Promise((resolve) => {
            const finalMaskCanvas = document.createElement('canvas');
            finalMaskCanvas.width = maskCanvas.width;
            finalMaskCanvas.height = maskCanvas.height;
            const ctx = finalMaskCanvas.getContext('2d');
            if(!ctx) return resolve(null);
            
            // Draw a black background
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, finalMaskCanvas.width, finalMaskCanvas.height);
            
            // Punch out the masked area
            ctx.globalCompositeOperation = 'destination-out';
            ctx.drawImage(maskCanvas, 0, 0);

            // Fill the punched-out area with white
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, finalMaskCanvas.width, finalMaskCanvas.height);
            
            // Draw the mask on top again, to get the actual masked area in white
            ctx.globalCompositeOperation = 'destination-in';
            ctx.drawImage(maskCanvas, 0, 0);
            
            resolve(finalMaskCanvas.toDataURL('image/png'));
        });
    };

    return {
        canvasRef,
        maskCanvasRef,
        setTool,
        setBrushSize,
        getMaskAsBase64,
    };
};