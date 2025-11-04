import type { Crop } from 'react-image-crop';

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const applyAdjustments = (base64: string, brightness: number, contrast: number, angle: number, gamma: number, sharpness: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) {
                return reject(new Error('Could not get canvas context'));
            }

            const rad = (angle % 360) * Math.PI / 180;
            const sin = Math.abs(Math.sin(rad));
            const cos = Math.abs(Math.cos(rad));
            
            const newWidth = Math.floor(img.naturalWidth * cos + img.naturalHeight * sin);
            const newHeight = Math.floor(img.naturalWidth * sin + img.naturalHeight * cos);

            canvas.width = newWidth;
            canvas.height = newHeight;
            
            ctx.translate(newWidth / 2, newHeight / 2);
            ctx.rotate(rad);
            ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
            ctx.rotate(-rad);
            ctx.translate(-newWidth / 2, -newHeight / 2);

            if (gamma !== 100 || sharpness !== 0 || brightness !== 100 || contrast !== 100) {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                const gammaCorrection = 1 / (gamma / 100);
                const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
                
                // Temporary canvas for sharpening
                let sharpCanvas: HTMLCanvasElement | null = null;
                let sharpCtx: CanvasRenderingContext2D | null = null;
                let sharpData: Uint8ClampedArray | null = null;

                if (sharpness > 0) {
                    sharpCanvas = document.createElement('canvas');
                    sharpCanvas.width = canvas.width;
                    sharpCanvas.height = canvas.height;
                    sharpCtx = sharpCanvas.getContext('2d');
                    sharpCtx?.putImageData(imageData, 0, 0);
                    sharpData = imageData.data.slice(); // a copy for convolution
                }

                for (let i = 0; i < data.length; i += 4) {
                    // Brightness & Contrast
                    data[i] = Math.max(0, Math.min(255, (data[i] - 128) * (contrast/100) + 128 + (brightness - 100)));
                    data[i+1] = Math.max(0, Math.min(255, (data[i+1] - 128) * (contrast/100) + 128 + (brightness - 100)));
                    data[i+2] = Math.max(0, Math.min(255, (data[i+2] - 128) * (contrast/100) + 128 + (brightness - 100)));
                    
                    // Gamma
                    data[i] = Math.pow(data[i] / 255, gammaCorrection) * 255;
                    data[i + 1] = Math.pow(data[i + 1] / 255, gammaCorrection) * 255;
                    data[i + 2] = Math.pow(data[i + 2] / 255, gammaCorrection) * 255;
                }

                // Sharpening (Convolution)
                if (sharpness > 0 && sharpData) {
                    const s = sharpness / 250;
                    const kernel = [
                        [0, -s, 0],
                        [-s, 1 + 4 * s, -s],
                        [0, -s, 0]
                    ];

                    for (let y = 1; y < canvas.height - 1; y++) {
                        for (let x = 1; x < canvas.width - 1; x++) {
                            for (let c = 0; c < 3; c++) { // R, G, B
                                let sum = 0;
                                for (let ky = -1; ky <= 1; ky++) {
                                    for (let kx = -1; kx <= 1; kx++) {
                                        const pixelIndex = ((y + ky) * canvas.width + (x + kx)) * 4 + c;
                                        sum += sharpData[pixelIndex] * kernel[ky + 1][kx + 1];
                                    }
                                }
                                const outputIndex = (y * canvas.width + x) * 4 + c;
                                data[outputIndex] = Math.max(0, Math.min(255, sum));
                            }
                        }
                    }
                }

                ctx.putImageData(imageData, 0, 0);
            }
            
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = (error) => reject(error);
        img.src = base64;
    });
};


export const cropImage = (image: HTMLImageElement, crop: Crop, zoom: number = 1): Promise<string | null> => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        
        canvas.width = crop.width * scaleX;
        canvas.height = crop.height * scaleY;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            resolve(null);
            return;
        }

        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width * scaleX,
            crop.height * scaleY
        );
        
        resolve(canvas.toDataURL('image/png'));
    });
};

export const resizeImage = (base64: string, width: number, height: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context'));
            }
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = (error) => reject(error);
        img.src = base64;
    });
};

export const downloadImage = (base64: string, format: 'jpeg' | 'png' | 'webp', originalName: string) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const mimeType = `image/${format}`;
        const dataUrl = canvas.toDataURL(mimeType, 0.9);
        
        const link = document.createElement('a');
        const fileName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
        link.download = `${fileName}-restored.${format}`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    img.src = base64;
};