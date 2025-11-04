import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { Crop } from 'react-image-crop';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { EditorLayout } from './components/EditorLayout';
import { ControlPanel } from './components/ControlPanel';
import { ImageViewer } from './components/ImageViewer';
import { processImageWithGemini, generateVideoFromImage, processInpaintingWithGemini, generateImagesFromText, searchWebForSimilarImages } from './services/geminiService';
import { applyAdjustments, cropImage, downloadImage, fileToBase64, resizeImage } from './utils/imageUtils';
import type { Tool, ImageFile } from './types';
import { Dna } from 'lucide-react';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<ImageFile | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [cartoonImages, setCartoonImages] = useState<string[] | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
  const [threeDImages, setThreeDImages] = useState<string[] | null>(null);
  const [dollImages, setDollImages] = useState<string[] | null>(null);
  const [webSearchResults, setWebSearchResults] = useState<{ summary: string; links: { uri: string; title: string }[] } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [history, setHistory] = useState<string[]>([]);
  const [isApiKeySelected, setIsApiKeySelected] = useState<boolean>(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [rotation, setRotation] = useState(0); // Kept for potential future use with steps
  const [angle, setAngle] = useState(0);
  const [gamma, setGamma] = useState(100);
  const [sharpness, setSharpness] = useState(0);
  const [colorChangePrompt, setColorChangePrompt] = useState('');
  const [zoom, setZoom] = useState(1);
  const [imageDimensions, setImageDimensions] = useState<{width: number; height: number} | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);

  const graffitiFeatures = useMemo(() => {
    const features = [
        'Restore', 'Colorize', 'Resize', 'Crop', 'Animate', 'Remove Background', 
        'Cartoonify', '3D Drawing', 'Expand', 'Portrait Retouch', 'Web Search', 
        'Adjustments', 'Art Effects', 'Generate', 'Remove Object', 'Blur Background', 'Change Color'
    ];
    const colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590'];

    return features.map((feature, index) => {
        const style: React.CSSProperties = {
            position: 'absolute',
            top: `${Math.random() * 90}%`,
            left: `${Math.random() * 90}%`,
            transform: `rotate(${Math.random() * 60 - 30}deg)`,
            fontSize: `${Math.random() * 3 + 2.5}rem`, // 2.5rem to 5.5rem
            color: colors[index % colors.length],
            zIndex: 0,
            opacity: 0.25,
            whiteSpace: 'nowrap',
        };
        return <div key={feature} className="graffiti" style={style}>{feature}</div>;
    });
  }, []);

  useEffect(() => {
    const checkApiKey = async () => {
        if(window.aistudio) {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setIsApiKeySelected(hasKey);
        }
    };
    checkApiKey();
  }, []);

  useEffect(() => {
    if (processedImage) {
        const img = new window.Image();
        img.onload = () => {
            setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        };
        img.src = processedImage;
    } else {
        setImageDimensions(null);
    }
  }, [processedImage]);

  useEffect(() => {
    if (imageFile?.base64) {
      setProcessedImage(imageFile.base64);
      setHistory([imageFile.base64]);
      resetAdjustments();
    } else {
      setProcessedImage(null);
      setHistory([]);
    }
  }, [imageFile]);

  const resetAdjustments = () => {
    setBrightness(100);
    setContrast(100);
    setRotation(0);
    setAngle(0);
    setGamma(100);
    setSharpness(0);
  };

  const getAdjustedImage = useCallback(async (): Promise<string> => {
    const imageToAdjust = cartoonImages ? history[history.length - 1] : processedImage;
    if (!imageToAdjust) return '';
    if (brightness === 100 && contrast === 100 && angle === 0 && gamma === 100 && sharpness === 0) {
        return imageToAdjust;
    }
    const adjusted = await applyAdjustments(imageToAdjust, brightness, contrast, angle, gamma, sharpness);
    return adjusted;
  }, [processedImage, cartoonImages, history, brightness, contrast, angle, gamma, sharpness]);
  
  const updateProcessedImage = (newImage: string, keepAdjustments = false) => {
    setProcessedImage(newImage);
    setGeneratedVideoUrl(null);
    setCartoonImages(null);
    setGeneratedImages(null);
    setThreeDImages(null);
    setDollImages(null);
    setWebSearchResults(null);
    setHistory(prev => [...prev, newImage]);
    if (!keepAdjustments) {
      resetAdjustments();
    }
  }

  const handleImageUpload = (file: ImageFile) => {
    setImageFile(file);
    setActiveTool(null);
    setCrop(undefined);
    setBeforeImage(null);
    setGeneratedVideoUrl(null);
    setCartoonImages(null);
    setGeneratedImages(null);
    setThreeDImages(null);
    setDollImages(null);
    setWebSearchResults(null);
    setZoom(1);
  };

  const handleNewFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const base64 = await fileToBase64(file);
        handleImageUpload({ name: file.name, type: file.type, base64, size: file.size });
      } else {
        alert('Please upload a valid image file (JPEG, PNG, WEBP).');
      }
    }
    if (event.target) {
        event.target.value = '';
    }
  };

  const handleUndo = () => {
    setGeneratedVideoUrl(null);
    setCartoonImages(null);
    setGeneratedImages(null);
    setThreeDImages(null);
    setDollImages(null);
    setWebSearchResults(null);
    resetAdjustments();
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      setHistory(newHistory);
      setProcessedImage(newHistory[newHistory.length - 1]);
    }
  };

  const handleRequest = useCallback(async (prompt: string, message: string, tool: Tool | null) => {
    if (!imageFile) return;
    setIsLoading(true);
    setLoadingMessage(message);
    setActiveTool(tool);
    setGeneratedVideoUrl(null);
    setCartoonImages(null);
    setGeneratedImages(null);
    setThreeDImages(null);
    setDollImages(null);
    setWebSearchResults(null);
    try {
      const imageToSend = await getAdjustedImage();
      const result = await processImageWithGemini(prompt, imageToSend, imageFile.type);
      if (result) {
        updateProcessedImage(result);
      }
    } catch (error) {
      console.error("Error processing image:", error);
      alert("An error occurred while processing the image. Please try again.");
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [imageFile, getAdjustedImage]);
  
  const handleAnimateImage = async (prompt: string) => {
    if (!processedImage || !imageFile) return;
    setIsLoading(true);
    setLoadingMessage('Animating image... This may take a few minutes.');
    setActiveTool('video');
    setWebSearchResults(null);
    try {
        const imageToSend = await getAdjustedImage();
        const videoUrl = await generateVideoFromImage(prompt, imageToSend, imageFile.type);
        if (videoUrl) {
            setGeneratedVideoUrl(videoUrl);
            setProcessedImage(null);
            setBeforeImage(null);
            setCartoonImages(null);
            setGeneratedImages(null);
            setThreeDImages(null);
            setDollImages(null);
        }
    } catch (error: any) {
        console.error("Error generating video:", error);
        if (error.message?.includes("Requested entity was not found.")) {
            alert("Your API key is invalid. Please select a valid key and try again.");
            setIsApiKeySelected(false);
        } else {
            alert("An error occurred while generating the video. Please try again.");
        }
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  };

  const handleAutoAdjust = async () => {
    if (!imageFile || !processedImage) return;

    setIsLoading(true);
    setLoadingMessage("Auto-adjusting image...");
    setActiveTool('auto-adjust');

    // Clear other special view states
    setGeneratedVideoUrl(null);
    setCartoonImages(null);
    setGeneratedImages(null);
    setThreeDImages(null);
    setDollImages(null);
    setWebSearchResults(null);

    try {
      const imageToSend = await getAdjustedImage();
      const prompt = "Automatically enhance and balance the quality, sharpness, and lighting of this old photograph. If the photograph is black and white, also colorize it with realistic colors. If it is already in color, do not change the existing colors.";
      const result = await processImageWithGemini(prompt, imageToSend, imageFile.type);
      if (result) {
        updateProcessedImage(result);
      } else {
        // If result is null, don't change the image, just reset the tool
        setActiveTool(null);
        setBeforeImage(null);
        throw new Error("Auto-adjustment failed to produce an image.");
      }
    } catch (error) {
      console.error("Error auto-adjusting image:", error);
      alert("An error occurred while auto-adjusting the image. Please try again.");
      // On error, revert the tool state
      setActiveTool(null);
      setBeforeImage(null);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };
  const handleRestore = () => {
    setBeforeImage(null);
    handleRequest("Restore this damaged old photograph. Remove scratches, fix tears, clean up blemishes, and improve overall quality. IMPORTANT: Do not add color or change the existing colors. If the photo is black and white, it must remain black and white.", "Restoring photo...", null);
  }
  const handleColorize = () => {
    if (!processedImage) return;
    setBeforeImage(null);
    handleRequest("Colorize this black and white photograph. IMPORTANT: Do not restore, repair, or alter the original texture, scratches, or imperfections. Only add realistic color to the existing image.", "Colorizing photo...", null);
  };
  const handleExpand = () => {
    setBeforeImage(null);
    handleRequest("Expand the boundaries of this image (outpainting), continuing the scene naturally and realistically.", "Expanding image...", null);
  }

  const handleRemoveBackground = () => {
    setBeforeImage(null);
    handleRequest(
        "Remove the background from this image, leaving only the main subject. The new background must be transparent. Output the result as a PNG file.", 
        "Removing background...", 
        'remove-background'
    );
  };

  const handlePortraitRetouch = () => {
    setBeforeImage(null);
    handleRequest(
      "Perform a professional portrait retouch on this photograph. Focus on the human face(s). The retouching should be natural and subtle. Specific tasks: 1. Smooth the skin to reduce minor wrinkles, expression lines, and imperfections, but preserve the natural skin texture. Do not make it look like plastic. 2. Whiten the teeth slightly for a brighter, healthier smile. The whitening should look natural, not overly bright. 3. Remove temporary blemishes like acne or spots. Do not remove permanent features like moles or scars unless they are very minor. 4. Subtly even out the skin tone, reducing redness or blotchiness. Ensure the final skin tone looks natural and matches the person's ethnicity. IMPORTANT: Only apply these changes to the person/people in the photo. The background and clothing should remain untouched.",
      "Retouching portrait...",
      'portrait-retouch'
    );
  };

  const handleCartoonify = async () => {
    if (!imageFile) return;
    setIsLoading(true);
    setLoadingMessage("Applying cartoon styles...");
    setActiveTool('cartoonify');
    setGeneratedVideoUrl(null);
    setProcessedImage(null);
    setBeforeImage(null);
    setGeneratedImages(null);
    setThreeDImages(null);
    setDollImages(null);
    setWebSearchResults(null);

    try {
      const imageToSend = await getAdjustedImage();
      const prompt1 = "Transform this photo into a vibrant, colorful cartoon with bold outlines, similar to a modern animated movie style.";
      const prompt2 = "Convert this image into a classic, hand-drawn comic book style cartoon, using halftones and a more muted color palette.";
      const prompt3 = "Reimagine this photo in a Japanese anime/manga style, featuring sharp lines, cel-shading, and expressive features.";
      const prompt4 = "Turn this image into a soft, whimsical watercolor cartoon illustration with gentle lines and blended colors.";

      const [result1, result2, result3, result4] = await Promise.all([
        processImageWithGemini(prompt1, imageToSend, imageFile.type),
        processImageWithGemini(prompt2, imageToSend, imageFile.type),
        processImageWithGemini(prompt3, imageToSend, imageFile.type),
        processImageWithGemini(prompt4, imageToSend, imageFile.type)
      ]);

      if (result1 && result2 && result3 && result4) {
        setCartoonImages([result1, result2, result3, result4]);
      } else {
        throw new Error("One or more cartoon styles could not be generated.");
      }
    } catch (error) {
      console.error("Error generating cartoon styles:", error);
      alert("An error occurred while cartoonifying the image. Please try again.");
      setActiveTool(null);
      setProcessedImage(history[history.length - 1]);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handle3dDrawing = async () => {
    if (!imageFile) return;
    setIsLoading(true);
    setLoadingMessage("Generating 3D drawing styles...");
    setActiveTool('3d-drawing');
    setGeneratedVideoUrl(null);
    setProcessedImage(null);
    setBeforeImage(null);
    setGeneratedImages(null);
    setCartoonImages(null);
    setDollImages(null);
    setWebSearchResults(null);
  
    try {
      const imageToSend = await getAdjustedImage();
      const prompt1 = "Convert this photo into a 3D line drawing with clean, sharp black outlines on a white background, giving it a technical, architectural sketch look.";
      const prompt2 = "Transform this image into a stylized 3D model render with soft ambient occlusion shading and subtle depth, resembling a clay model or digital sculpture.";
  
      const [result1, result2] = await Promise.all([
        processImageWithGemini(prompt1, imageToSend, imageFile.type),
        processImageWithGemini(prompt2, imageToSend, imageFile.type),
      ]);
  
      if (result1 && result2) {
        setThreeDImages([result1, result2]);
      } else {
        throw new Error("One or more 3D styles could not be generated.");
      }
    } catch (error) {
      console.error("Error generating 3D styles:", error);
      alert("An error occurred while generating 3D drawings. Please try again.");
      setActiveTool(null);
      setProcessedImage(history[history.length - 1]);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleDollify = async () => {
    if (!imageFile) return;
    setIsLoading(true);
    setLoadingMessage("Applying doll styles...");
    setActiveTool('dollify');
    setGeneratedVideoUrl(null);
    setProcessedImage(null);
    setBeforeImage(null);
    setGeneratedImages(null);
    setThreeDImages(null);
    setCartoonImages(null);
    setWebSearchResults(null);

    try {
      const imageToSend = await getAdjustedImage();
      const prompt1 = "Transform this photo into the style of a delicate, vintage porcelain doll with a glossy finish, rosy cheeks, and glass-like eyes.";
      const prompt2 = "Reimagine this person as a charming, handcrafted rag doll with button eyes, stitched details, and a soft, fabric texture.";
      const prompt3 = "Convert this image to look like a modern, articulated ball-jointed doll (BJD) with large, expressive eyes, a matte resin finish, and distinct joints.";
      const prompt4 = "Turn this photo into a cute, stylized plastic toy doll, similar to a 'Funko Pop' or 'chibi' character, with oversized features and a simple, clean look.";

      const [result1, result2, result3, result4] = await Promise.all([
        processImageWithGemini(prompt1, imageToSend, imageFile.type),
        processImageWithGemini(prompt2, imageToSend, imageFile.type),
        processImageWithGemini(prompt3, imageToSend, imageFile.type),
        processImageWithGemini(prompt4, imageToSend, imageFile.type)
      ]);

      if (result1 && result2 && result3 && result4) {
        setDollImages([result1, result2, result3, result4]);
      } else {
        throw new Error("One or more doll styles could not be generated.");
      }
    } catch (error) {
      console.error("Error generating doll styles:", error);
      alert("An error occurred while applying doll styles to the image. Please try again.");
      setActiveTool(null);
      setProcessedImage(history[history.length - 1]);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };
  
  // Black and White Handlers
  const handleClassicBW = () => handleRequest("Convert this photo to a classic, balanced black and white grayscale. Preserve details and texture. Do not add any color tint.", "Applying Classic B&W...", null);
  const handleHighContrastBW = () => handleRequest("Convert this photo to a high-contrast black and white image. Make the blacks deep and the whites bright for a dramatic, punchy, film noir effect.", "Applying High Contrast B&W...", null);
  const handleSepia = () => handleRequest("Apply a classic sepia tone to this photograph. Convert it to monochrome first, then add a warm, brownish tint for an antique, vintage look.", "Applying Sepia Tone...", null);
  const handleBlueTone = () => handleRequest("Apply a cyanotype (blue tone) effect to this image. Convert it to monochrome and then give it a cool, rich blue tint throughout.", "Applying Blue Tone...", null);

  // Art Effect Handlers
  const handleLomo = () => handleRequest("Apply a strong Lomo camera effect to this image. This should include high contrast, oversaturated colors (especially reds and blues), and a prominent dark vignette around the edges.", "Applying Lomo Effect...", null);
  const handleVintageFade = () => handleRequest("Give this photo a faded, vintage look. Desaturate the colors slightly, reduce the contrast to make the blacks appear grayish, and apply a subtle warm (yellowish/orange) tint to the entire image.", "Applying Vintage Fade...", null);
  const handleGoldenHour = () => handleRequest("Apply a 'golden hour' effect to this photo. Enhance the warm tones, add a soft, diffused glow to the highlights, and give the entire image a radiant, warm, sunset-like feel.", "Applying Golden Hour Effect...", null);
  const handleCyberpunk = () => handleRequest("Transform this photo with a cyberpunk neon aesthetic. Increase the contrast significantly, and shift the color palette so that highlights become vibrant magenta and cyan, and shadows become deep blues and purples. It should look like it was taken in a futuristic, neon-lit city.", "Applying Cyberpunk Effect...", null);


  const handleGenerateImages = async (prompt: string) => {
    setIsLoading(true);
    setLoadingMessage("Generating images from your prompt...");
    setActiveTool('generate');
    // Clear the entire editor state for a fresh start
    setImageFile(null);
    setProcessedImage(null);
    setBeforeImage(null);
    setHistory([]);
    setGeneratedVideoUrl(null);
    setCartoonImages(null);
    setThreeDImages(null);
    setDollImages(null);
    setWebSearchResults(null);
    resetAdjustments();
    setZoom(1);

    try {
      const results = await generateImagesFromText(prompt);
      if (results && results.length > 0) {
        setGeneratedImages(results);
      } else {
        throw new Error("Could not generate images from the prompt.");
      }
    } catch (error: any) {
        console.error("Error generating images:", error);
        if (error.message?.includes("Requested entity was not found.")) {
            alert("Your API key is invalid. Please select a valid key and try again.");
            setIsApiKeySelected(false);
        } else {
            alert("An error occurred while generating images. Please try again.");
        }
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };
  
  const handleWebSearch = async () => {
    if (!processedImage || !imageFile) return;

    setIsLoading(true);
    setLoadingMessage("Searching the web for similar images...");
    setActiveTool('web-search');

    // Clear previous results/special views
    setGeneratedVideoUrl(null);
    setCartoonImages(null);
    setGeneratedImages(null);
    setThreeDImages(null);
    setDollImages(null);
    setWebSearchResults(null);

    try {
        const imageToSend = await getAdjustedImage();
        const results = await searchWebForSimilarImages(imageToSend, imageFile.type);
        if (results && results.links.length > 0) {
            setWebSearchResults(results);
        } else {
            alert("Could not find any similar images on the web.");
            setActiveTool(null); // Reset tool if no results
        }
    } catch (error) {
        console.error("Error searching for web images:", error);
        alert("An error occurred while searching the web. Please try again.");
        setActiveTool(null); // Reset tool on error
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  };

  const handleCropConfirm = async () => {
    if (imgRef.current && crop?.width && crop?.height) {
        const imageToCrop = await getAdjustedImage();
        
        const tempImg = new window.Image();
        await new Promise(resolve => {
            tempImg.onload = resolve;
            tempImg.src = imageToCrop;
        });

        const croppedImageBase64 = await cropImage(tempImg, crop, zoom);
        if (croppedImageBase64) {
            updateProcessedImage(croppedImageBase64);
        }
    }
    setActiveTool(null);
    setCrop(undefined);
    setBeforeImage(null);
  };

  const handleResize = async (width: number, height: number) => {
    if (!processedImage) return;
    setIsLoading(true);
    setLoadingMessage(`Resizing image to ${width}x${height}...`);
    try {
        const imageToResize = await getAdjustedImage();
        const resizedImage = await resizeImage(imageToResize, width, height);
        updateProcessedImage(resizedImage, true);
    } catch (error) {
        console.error("Error resizing image:", error);
        alert("An error occurred while resizing the image.");
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  };

  const handleClearMask = () => {
    if (maskCanvasRef.current) {
     const canvas = maskCanvasRef.current;
     const ctx = canvas.getContext('2d');
     ctx?.clearRect(0, 0, canvas.width, canvas.height);
   }
  };

  const handleApplyRemove = async () => {
    if (!processedImage || !imageFile || !maskCanvasRef.current) return;
  
    const maskCanvas = maskCanvasRef.current;
    const isMaskEmpty = !maskCanvas.getContext('2d')?.getImageData(0, 0, maskCanvas.width, maskCanvas.height).data.some(channel => channel !== 0);
    
    if(isMaskEmpty) {
      alert("Please mark the object you want to remove in red before applying.");
      return;
    }
  
    const maskBase64 = maskCanvas.toDataURL('image/png');
    
    setIsLoading(true);
    setLoadingMessage("Removing object...");
    setActiveTool('remove');
  
    try {
      const imageToSend = await getAdjustedImage();
      const prompt = "In the first image, remove the object that is highlighted in red in the second image (the mask). Fill the area where the object was with a realistic background that matches the surrounding context. Provide only the modified image as output.";
      const result = await processInpaintingWithGemini(prompt, imageToSend, imageFile.type, maskBase64);
      if (result) {
        updateProcessedImage(result);
      }
    } catch (error) {
      console.error("Error removing object:", error);
      alert("An error occurred while removing the object. Please try again.");
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
      setActiveTool(null);
      handleClearMask();
    }
  };

  const handleBlurBackground = async () => {
    if (!processedImage || !imageFile || !maskCanvasRef.current) return;

    const maskCanvas = maskCanvasRef.current;
    const isMaskEmpty = !maskCanvas.getContext('2d')?.getImageData(0, 0, maskCanvas.width, maskCanvas.height).data.some(channel => channel !== 0);
    
    if(isMaskEmpty) {
      alert("Please mark the object you want to keep in focus before applying.");
      return;
    }
  
    const maskBase64 = maskCanvas.toDataURL('image/png');
    
    setIsLoading(true);
    setLoadingMessage("Applying background blur...");
    setActiveTool('background-blur');

    try {
      const imageToSend = await getAdjustedImage();
      const prompt = "Using the second image (the mask), apply a realistic background blur (bokeh effect) to the first image. The area marked in white on the mask should remain sharp and in focus. The rest of the image should be blurred. Provide only the modified image as output.";
      const result = await processInpaintingWithGemini(prompt, imageToSend, imageFile.type, maskBase64);
      if (result) {
        updateProcessedImage(result);
      }
    } catch (error) {
      console.error("Error blurring background:", error);
      alert("An error occurred while applying the background blur. Please try again.");
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
      setActiveTool(null);
      handleClearMask();
    }
  };

  const handleApplyColorChange = async () => {
    if (!processedImage || !imageFile || !maskCanvasRef.current) return;
  
    if (!colorChangePrompt.trim()) {
      alert("Please describe the color you want to apply.");
      return;
    }
  
    const maskCanvas = maskCanvasRef.current;
    const isMaskEmpty = !maskCanvas.getContext('2d')?.getImageData(0, 0, maskCanvas.width, maskCanvas.height).data.some(channel => channel !== 0);
    
    if(isMaskEmpty) {
      alert("Please mark the area you want to recolor before applying.");
      return;
    }
  
    const maskBase64 = maskCanvas.toDataURL('image/png');
    
    setIsLoading(true);
    setLoadingMessage(`Changing color to ${colorChangePrompt}...`);
    setActiveTool('change-color');
  
    try {
      const imageToSend = await getAdjustedImage();
      const prompt = `Using the second image as a mask, change the color of the area marked in white on the mask in the first image to '${colorChangePrompt}'. Preserve all textures, shadows, and details. Only change the color.`;
      const result = await processInpaintingWithGemini(prompt, imageToSend, imageFile.type, maskBase64);
      if (result) {
        updateProcessedImage(result);
      }
    } catch (error) {
      console.error("Error changing color:", error);
      alert("An error occurred while changing the color. Please try again.");
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
      setActiveTool(null);
      handleClearMask();
      setColorChangePrompt('');
    }
  };
  
  const handleDownload = async (format: 'jpeg' | 'png' | 'webp') => {
    if (processedImage) {
        const imageToDownload = await getAdjustedImage();
        downloadImage(imageToDownload, format, imageFile?.name || 'edited-photo');
    }
  };

  const handleDownloadCartoon = (base64: string, format: 'jpeg' | 'png' | 'webp') => {
    downloadImage(base64, format, imageFile?.name || 'cartoon-photo');
  };

  const handleDownloadThreeDImage = (base64: string, format: 'jpeg' | 'png' | 'webp') => {
    downloadImage(base64, format, imageFile?.name || '3d-drawing');
  };

  const handleDownloadDollImage = (base64: string, format: 'jpeg' | 'png' | 'webp') => {
    downloadImage(base64, format, imageFile?.name || 'doll-style');
  };

  const handleDownloadGeneratedImage = (base64: string, format: 'jpeg' | 'png' | 'webp') => {
    downloadImage(base64, format, 'generated-image');
  };

  if (!imageFile && !generatedImages) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center relative overflow-hidden">
        {graffitiFeatures}
        <Header />
        <ImageUploader onImageUpload={handleImageUpload} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col">
      <Header />
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50">
          <Dna className="w-16 h-16 text-blue-400 animate-spin" />
          <p className="mt-4 text-lg font-semibold text-white">{loadingMessage}</p>
        </div>
      )}
      <EditorLayout>
        <ControlPanel
          imageFile={imageFile}
          onAutoAdjust={handleAutoAdjust}
          onRestore={handleRestore}
          onColorize={handleColorize}
          onExpand={handleExpand}
          onRemoveBackground={handleRemoveBackground}
          onPortraitRetouch={handlePortraitRetouch}
          onCartoonify={handleCartoonify}
          on3dDrawing={handle3dDrawing}
          onDollify={handleDollify}
          onGenerateImages={handleGenerateImages}
          onWebSearch={handleWebSearch}
          onAnimate={handleAnimateImage}
          isApiKeySelected={isApiKeySelected}
          setIsApiKeySelected={setIsApiKeySelected}
          onClassicBW={handleClassicBW}
          onHighContrastBW={handleHighContrastBW}
          onSepia={handleSepia}
          onBlueTone={handleBlueTone}
          onLomo={handleLomo}
          onVintageFade={handleVintageFade}
          onGoldenHour={handleGoldenHour}
          onCyberpunk={handleCyberpunk}
          onCrop={() => {
            const nextTool = activeTool === 'crop' ? null : 'crop';
            setActiveTool(nextTool);
            setZoom(1);
            if(nextTool === 'crop') {
                if (angle !== 0) {
                    alert("Rotation will be permanently applied before cropping. You can undo this change later.");
                }
            } else {
                setBeforeImage(null);
                setCrop(undefined);
            }
          }}
          onCropConfirm={handleCropConfirm}
          onResize={handleResize}
          currentDimensions={imageDimensions}
          onRemoveObject={() => {
            const nextTool = activeTool === 'remove' ? null : 'remove';
            setActiveTool(nextTool);
            setZoom(1);
            if (nextTool !== 'remove') {
              handleClearMask();
            }
          }}
          onApplyRemove={handleApplyRemove}
          onBlurBackground={() => {
            const nextTool = activeTool === 'background-blur' ? null : 'background-blur';
            setActiveTool(nextTool);
            setZoom(1);
            if (nextTool !== 'background-blur') {
              handleClearMask();
            }
          }}
          onApplyBlur={handleBlurBackground}
          onChangeColor={() => {
            const nextTool = activeTool === 'change-color' ? null : 'change-color';
            setActiveTool(nextTool);
            setZoom(1);
            if (nextTool !== 'change-color') {
              handleClearMask();
            }
          }}
          onApplyColorChange={handleApplyColorChange}
          colorChangePrompt={colorChangePrompt}
          setColorChangePrompt={setColorChangePrompt}
          onClearMask={handleClearMask}
          onDownload={handleDownload}
          onUndo={handleUndo}
          onUploadNew={handleNewFileUpload}
          isUndoDisabled={history.length <= 1 && !generatedVideoUrl && !cartoonImages && !generatedImages && !dollImages}
          activeTool={activeTool}
          isImageLoaded={!!processedImage || !!cartoonImages || !!generatedImages}
          isEditingMode={!!imageFile}
          brightness={brightness}
          setBrightness={setBrightness}
          contrast={contrast}
          setContrast={setContrast}
          angle={angle}
          setAngle={setAngle}
          gamma={gamma}
          setGamma={setGamma}
          sharpness={sharpness}
          setSharpness={setSharpness}
          onResetAdjustments={resetAdjustments}
          zoom={zoom}
          onZoomIn={() => setZoom(z => Math.min(3, z + 0.1))}
          onZoomOut={() => setZoom(z => Math.max(0.2, z - 0.1))}
          onResetZoom={() => setZoom(1)}
        />
        <ImageViewer
          beforeImage={beforeImage}
          processedImage={processedImage}
          generatedVideoUrl={generatedVideoUrl}
          cartoonImages={cartoonImages}
          generatedImages={generatedImages}
          threeDImages={threeDImages}
          dollImages={dollImages}
          webSearchResults={webSearchResults}
          onDownloadCartoon={handleDownloadCartoon}
          onDownloadGeneratedImage={handleDownloadGeneratedImage}
          onDownloadThreeDImage={handleDownloadThreeDImage}
          onDownloadDollImage={handleDownloadDollImage}
          activeTool={activeTool}
          imgRef={imgRef}
          maskCanvasRef={maskCanvasRef}
          crop={crop}
          setCrop={setCrop}
          brightness={brightness}
          contrast={contrast}
          angle={angle}
          gamma={gamma}
          sharpness={sharpness}
          zoom={zoom}
        />
      </EditorLayout>
    </div>
  );
};

export default App;