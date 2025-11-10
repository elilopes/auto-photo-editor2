import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { Crop } from 'react-image-crop';
import { Header } from './components/Header';
import { InitialScreen } from './components/InitialScreen';
import { EditorLayout } from './components/EditorLayout';
import { ControlPanel } from './components/ControlPanel';
import { MediaViewer } from './components/ImageViewer';
import { processImageWithGemini, convertGifToMp4, processInpaintingWithGemini, generateImagesFromText, searchWebForSimilarImages, performVirtualTryOn, compressVideoWithGemini, vectorizeImage, generateVideoFromText } from './services/geminiService';
import { applyAdjustments, cropImage, downloadImage, fileToBase64, resizeImage, downloadVideo } from './utils/imageUtils';
import type { Tool, ImageFile, VideoFile, VideoInfo } from './types';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<ImageFile | null>(null);
  const [videoFile, setVideoFile] = useState<VideoFile | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [generatedMp4Url, setGeneratedMp4Url] = useState<string | null>(null);
  const [cartoonImages, setCartoonImages] = useState<string[] | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
  const [threeDImages, setThreeDImages] = useState<string[] | null>(null);
  const [dollImages, setDollImages] = useState<string[] | null>(null);
  const [bwImages, setBwImages] = useState<string[] | null>(null);
  const [artImages, setArtImages] = useState<string[] | null>(null);
  const [photoShootImages, setPhotoShootImages] = useState<string[] | null>(null);
  const [artMovementImages, setArtMovementImages] = useState<string[] | null>(null);
  const [hairstyleImages, setHairstyleImages] = useState<string[] | null>(null);
  const [ageChangeImages, setAgeChangeImages] = useState<string[] | null>(null);
  const [virtualTryOnImage, setVirtualTryOnImage] = useState<string | null>(null);
  const [webSearchResults, setWebSearchResults] = useState<{ summary: string; links: { uri: string; title: string }[] } | null>(null);
  const [faviconImages, setFaviconImages] = useState<string[] | null>(null);
  const [vectorizedSvg, setVectorizedSvg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [history, setHistory] = useState<string[]>([]);
  const [isApiKeySelected, setIsApiKeySelected] = useState<boolean>(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [angle, setAngle] = useState(0);
  const [gamma, setGamma] = useState(100);
  const [sharpness, setSharpness] = useState(0);
  const [colorChangePrompt, setColorChangePrompt] = useState('');
  const [contextualTextPrompt, setContextualTextPrompt] = useState('');
  const [zoom, setZoom] = useState(1);
  const [imageDimensions, setImageDimensions] = useState<{width: number; height: number} | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);

  const graffitiFeatures = useMemo(() => {
    const features = [
        'Restore', 'Colorize', 'Resize', 'Crop', 'GIF to MP4', 'Remove Background', 
        'Cartoonify', '3D Drawing', 'Expand', 'Portrait Retouch', 'Web Search', 
        'Adjustments', 'Art Effects', 'Generate', 'Remove Object', 'Blur Background', 
        'Change Color', 'Virtual Try-On', 'Hairstyle Trial', 'Change Age', 'Compact Video',
        'Favicon', 'Vectorize'
    ];
    const colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590', '#6a4c93'];

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
    setAngle(0);
    setGamma(100);
    setSharpness(0);
  };

  const getAdjustedImage = useCallback(async (): Promise<string> => {
    const imageToAdjust = history.length > 0 ? history[history.length - 1] : processedImage;
    if (!imageToAdjust) return '';
    if (brightness === 100 && contrast === 100 && angle === 0 && gamma === 100 && sharpness === 0) {
        return imageToAdjust;
    }
    const adjusted = await applyAdjustments(imageToAdjust, brightness, contrast, angle, gamma, sharpness);
    return adjusted;
  }, [processedImage, history, brightness, contrast, angle, gamma, sharpness]);
  
  const resetAllViews = () => {
    setGeneratedMp4Url(null);
    setCartoonImages(null);
    setGeneratedImages(null);
    setThreeDImages(null);
    setDollImages(null);
    setBwImages(null);
    setArtImages(null);
    setPhotoShootImages(null);
    setArtMovementImages(null);
    setHairstyleImages(null);
    setAgeChangeImages(null);
    setVirtualTryOnImage(null);
    setWebSearchResults(null);
    setProcessedVideoUrl(null);
    setFaviconImages(null);
    setVectorizedSvg(null);
  };
  
  const updateProcessedImage = (newImage: string, keepAdjustments = false) => {
    setProcessedImage(newImage);
    resetAllViews();
    setHistory(prev => [...prev, newImage]);
    if (!keepAdjustments) {
      resetAdjustments();
    }
  }

  const handleFileUpload = async (file: File) => {
    if (file.type.startsWith('image/')) {
        const base64 = await fileToBase64(file);
        setImageFile({ name: file.name, type: file.type, base64, size: file.size });
        setVideoFile(null); // Switch to image mode
    } else if (file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        setVideoFile({ name: file.name, type: file.type, url, file, size: file.size });
        setImageFile(null); // Switch to video mode
    } else {
        alert('Please upload a valid image or video file.');
        return;
    }
    setActiveTool(null);
    setCrop(undefined);
    resetAllViews();
    setZoom(1);
};


  const handleNewFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
        await handleFileUpload(files[0]);
    }
    if (event.target) {
        event.target.value = '';
    }
  };

  const handleUndo = () => {
    resetAllViews();
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
    resetAllViews();
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
  }, [imageFile, processedImage, getAdjustedImage]);

  const handleMultipleIndividualImageRequests = useCallback(async (
    prompts: string[], 
    message: string, 
    tool: Tool, 
    setter: React.Dispatch<React.SetStateAction<string[] | null>>
  ) => {
    if (!imageFile) return;
    setIsLoading(true);
    setLoadingMessage(message);
    setActiveTool(tool);
    resetAllViews();
    setProcessedImage(null); // Hide the main viewer image

    try {
      const imageToSend = await getAdjustedImage();
      const resultsPromises = prompts.map(prompt => 
        processImageWithGemini(prompt, imageToSend, imageFile.type)
      );
      const results = await Promise.all(resultsPromises);
      const filteredResults = results.filter((r): r is string => r !== null);
      
      if (filteredResults.length > 0) {
        setter(filteredResults);
      } else {
        alert("The AI could not generate images for this request. Please try again.");
        setActiveTool(null);
        setProcessedImage(history[history.length - 1]);
      }
    } catch (error) {
      console.error("Error processing multi-image request:", error);
      alert("An error occurred while generating the images. Please try again.");
      setActiveTool(null);
      setProcessedImage(history[history.length - 1]);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [imageFile, getAdjustedImage, history]);
  
  const handleGifToMp4 = async () => {
    if (!processedImage || !imageFile || !imageDimensions) return;
     if (imageFile.type !== 'image/gif') {
        alert("Please upload a GIF file to convert.");
        return;
    }
    setIsLoading(true);
    setLoadingMessage('Converting GIF to MP4... This may take a few minutes.');
    setActiveTool('gif-to-mp4');
    setWebSearchResults(null);
    try {
        const imageToSend = await getAdjustedImage();
        const videoUrl = await convertGifToMp4(imageToSend, imageFile.type, imageDimensions);
        if (videoUrl) {
            setGeneratedMp4Url(videoUrl);
            setProcessedImage(null);
            resetAllViews();
        }
    } catch (error: any) {
        console.error("Error converting GIF:", error);
        if (error.message?.includes("Requested entity was not found.")) {
            alert("Your API key is invalid. Please select a valid key and try again.");
            setIsApiKeySelected(false);
        } else {
            alert("An error occurred while converting the GIF. Please try again.");
        }
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  };

  const handleCompactVideo = async (quality: 'high' | 'medium' | 'low') => {
    if (!videoFile || !videoInfo) {
      alert("Video metadata has not loaded yet. Please wait a moment and try again.");
      return;
    }

    const messages = {
        high: 'Compressing video (High Quality)...',
        medium: 'Compressing video (Good Quality)...',
        low: 'Compressing video (Smallest File)...'
    };

    setIsLoading(true);
    setLoadingMessage(`${messages[quality]} This may take several minutes.`);
    setActiveTool('compact-video');
    resetAllViews();

    try {
        const resultUrl = await compressVideoWithGemini(videoFile.file, quality, videoInfo);
        if (resultUrl) {
            setProcessedVideoUrl(resultUrl);
        } else {
            throw new Error("Video processing returned no result.");
        }
    } catch (error: any) {
        console.error("Error compacting video:", error);
        if (error.message?.includes("Requested entity was not found.")) {
            alert("Your API key is invalid. Please select a valid key and try again.");
            setIsApiKeySelected(false);
        } else {
            alert("An error occurred while compacting the video. Please try again.");
        }
        // Reset view on error
        setActiveTool(null);
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  };

  const handleVideoMetadataLoad = (info: VideoInfo) => {
    setVideoInfo(info);
  };

  const handleAutoAdjust = () => {
    handleRequest("Automatically enhance and balance the quality, sharpness, and lighting of this old photograph. If the photograph is black and white, also colorize it with realistic colors. If it is already in color, do not change the existing colors.", "Auto-adjusting image...", 'auto-adjust');
  };
  const handleRestore = () => {
    handleRequest("Restore this damaged old photograph. Remove scratches, fix tears, clean up blemishes, and improve overall quality. IMPORTANT: Do not add color or change the existing colors. If the photo is black and white, it must remain black and white.", "Restoring photo...", 'restore');
  }
  const handleColorize = () => {
    handleRequest("Colorize this black and white photograph. IMPORTANT: Do not restore, repair, or alter the original texture, scratches, or imperfections. Only add realistic color to the existing image.", "Colorizing photo...", 'colorize');
  };
  const handleExpand = () => {
    handleRequest("Expand the boundaries of this image (outpainting), continuing the scene naturally and realistically.", "Expanding image...", 'expand');
  }

  const handleRemoveBackground = () => {
    handleRequest(
        "Remove the background from this image, leaving only the main subject. The new background must be transparent. Output the result as a PNG file.", 
        "Removing background...", 
        'remove-background'
    );
  };

  const handlePortraitRetouch = () => {
    handleRequest(
      "Perform a professional portrait retouch on this photograph. Focus on the human face(s). The retouching should be natural and subtle. Specific tasks: 1. Smooth the skin to reduce minor wrinkles, expression lines, and imperfections, but preserve the natural skin texture. Do not make it look like plastic. 2. Whiten the teeth slightly for a brighter, healthier smile. The whitening should look natural, not overly bright. 3. Remove temporary blemishes like acne or spots. Do not remove permanent features like moles or scars unless they are very minor. 4. Subtly even out the skin tone, reducing redness or blotchiness. Ensure the final skin tone looks natural and matches the person's ethnicity. IMPORTANT: Only apply these changes to the person's face and do not alter the background, hair, or clothing.",
      "Retouching portrait...",
      'portrait-retouch'
    );
  };

  const handleContextualText = () => {
    if (!contextualTextPrompt.trim()) {
        alert('Please enter the text you want to add.');
        return;
    }
    const prompt = `Analyze this image. The user wants to add the following text: '${contextualTextPrompt}'. Your task is to intelligently integrate this text into the image. Consider the image's content, style, and composition. Choose the most appropriate: 1. **Positioning**: Where should the text be placed to look natural and aesthetically pleasing? 2. **Font/Style**: What font or style fits the image? (e.g., elegant script for a wedding photo, carved letters on a tree, neon glow on a city wall, written in the sand on a beach). 3. **Color and Lighting**: What color should the text be? How should it be affected by the image's lighting and shadows? Make it look like a real part of the scene. Apply the text and return the modified image.`;
    handleRequest(prompt, "Adding text intelligently...", 'contextual-text');
  };

  const handleHoldMyDoll = () => {
    const prompt = "This is a two-part task. First, analyze the main person in the photograph to understand their facial features, hairstyle, and clothing. Second, create a photorealistic miniature doll that is a replica of this person. Finally, edit the original image to show the person naturally holding this newly created doll. Ensure the hands, lighting, and shadows are realistic and perfectly match the original photo's style, creating a single, seamless image.";
    handleRequest(prompt, "Creating your mini-me doll...", 'hold-my-doll');
  };

  const handlePhotoShoot = () => {
    const prompts = [
      "Analyze the main person in the provided photograph. Generate a new, full-body, photorealistic image of this exact same person casually leaning against a graffiti-covered brick wall in a vibrant city alley. Ensure the person's face, hair, and key features are consistently and accurately reproduced. Return only the resulting image.",
      "Analyze the main person in the provided photograph. Generate a new, full-body, photorealistic image of this exact same person sitting at a rustic wooden table in a cozy, Parisian café, holding a coffee cup. Ensure the person's face, hair, and key features are consistently and accurately reproduced. Return only the resulting image.",
      "Analyze the main person in the provided photograph. Generate a new, full-body, photorealistic image of this exact same person walking along a beautiful, sunny beach at sunset. Ensure the person's face, hair, and key features are consistently and accurately reproduced. Return only the resulting image.",
      "Analyze the main person in the provided photograph. Generate a new, full-body, photorealistic image of this exact same person dressed in professional attire, confidently standing in a modern, minimalist office with a city view. Ensure the person's face, hair, and key features are consistently and accurately reproduced. Return only the resulting image."
    ];
    handleMultipleIndividualImageRequests(prompts, "Generating your AI photo shoot...", 'photo-shoot', setPhotoShootImages);
  };

  const handleHairstyleTrial = () => {
    const prompts = [
      "Analyze the main person in the provided photograph. Generate a new, photorealistic image of this exact same person but with a chic, chin-length bob hairstyle. Ensure the person's face, features, and the background are consistently and accurately reproduced, with only the hairstyle changing. Return only the resulting image.",
      "Analyze the main person in the provided photograph. Generate a new, photorealistic image of this exact same person but with long, wavy beach curls. Ensure the person's face, features, and the background are consistently and accurately reproduced, with only the hairstyle changing. Return only the resulting image.",
      "Analyze the main person in the provided photograph. Generate a new, photorealistic image of this exact same person but with a stylish pixie cut. Ensure the person's face, features, and the background are consistently and accurately reproduced, with only the hairstyle changing. Return only the resulting image.",
      "Analyze the main person in the provided photograph. Generate a new, photorealistic image of this exact same person but with an elegant braided updo. Ensure the person's face, features, and the background are consistently and accurately reproduced, with only the hairstyle changing. Return only the resulting image."
    ];
    handleMultipleIndividualImageRequests(prompts, "Generating hairstyle trials...", 'hairstyle-trial', setHairstyleImages);
  };
  
  const handleAgeChange = () => {
    const prompts = [
      "Analyze the main person in the provided photograph. Generate a new, photorealistic image of this exact same person but as a baby/toddler. Ensure the person's key facial features are recognizable but adapted to a very young age. The background should be simple and neutral. Return only the resulting image.",
      "Analyze the main person in the provided photograph. Generate a new, photorealistic image of this exact same person but as an elderly person (around 80 years old). Add realistic signs of aging like wrinkles, graying hair, and changes in skin texture, while ensuring the person's core identity remains recognizable. The background should be simple and neutral. Return only the resulting image."
    ];
    handleMultipleIndividualImageRequests(prompts, "Changing age...", 'change-age', setAgeChangeImages);
  };
  
  const handleVirtualTryOn = async (clothingDescription: string) => {
    if (!imageFile) return;
    setIsLoading(true);
    setLoadingMessage(`Dressing you up...`);
    setActiveTool('virtual-try-on');
    resetAllViews();
    setProcessedImage(null);

    try {
        const imageToSend = await getAdjustedImage();
        const result = await performVirtualTryOn(imageToSend, imageFile.type, clothingDescription);
        if (result) {
            setVirtualTryOnImage(result);
        } else {
            alert("The AI could not generate the try-on image. Please try again.");
            setActiveTool(null);
            setProcessedImage(history[history.length - 1]);
        }
    } catch (error) {
        console.error("Error with virtual try-on:", error);
        alert("An error occurred during the virtual try-on. Please try again.");
        setActiveTool(null);
        setProcessedImage(history[history.length - 1]);
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  };

  const handleCartoonify = () => {
    const prompts = [
      "Transform this photo into a modern animated movie style. Return only the resulting image.",
      "Transform this photo into a classic comic book style. Return only the resulting image.",
      "Transform this photo into a Japanese anime/manga style. Return only the resulting image.",
      "Transform this photo into a watercolor cartoon style. Return only the resulting image."
    ];
    handleMultipleIndividualImageRequests(prompts, "Cartoonifying...", 'cartoonify', setCartoonImages);
  };

  const handleBlackAndWhiteStyles = () => {
    const prompts = [
      "Transform this photo into a classic, balanced black and white style. Return only the resulting image.",
      "Transform this photo into a high-contrast, dramatic black and white style with deep blacks and bright whites. Return only the resulting image.",
      "Transform this photo into a soft, low-contrast black and white style with a vintage feel. Return only the resulting image.",
      "Transform this photo into a grainy, film-noir style black and white. Return only the resulting image."
    ];
    handleMultipleIndividualImageRequests(prompts, "Generating B&W styles...", 'black-and-white', setBwImages);
  };

  const handleGenerateArtStyles = () => {
    const prompts = [
      "Transform this photo into a classic, high-contrast film noir style with deep blacks and dramatic shadows. Return only the resulting image.",
      "Transform this photo into a soft-focus, low-contrast monochrome with a dreamy, ethereal feel. Return only the resulting image.",
      "Transform this photo into a vintage sepia-toned black and white, giving it an old-photograph look. Return only the resulting image.",
      "Transform this photo into a grainy, high-speed film black and white effect, simulating classic reportage photography. Return only the resulting image."
    ];
    handleMultipleIndividualImageRequests(prompts, "Generating artistic B&W styles...", 'art-effects', setArtImages);
  };

  const handleArtMovements = () => {
    const prompts = [
      "Recreate this photo in the style of Impressionism, with visible brush strokes and an emphasis on light. Return only the resulting image.",
      "Recreate this photo in the style of Cubism, breaking down the subject into geometric forms and showing it from multiple viewpoints. Return only the resulting image.",
      "Recreate this photo in the style of Surrealism, creating a dreamlike, bizarre, and illogical scene. Return only the resulting image.",
      "Recreate this photo in the style of the Baroque artistic movement, with dramatic, intense lighting (chiaroscuro), rich colors, and a sense of movement and grandeur. Return only the resulting image."
    ];
    handleMultipleIndividualImageRequests(prompts, "Applying artistic movements...", 'art-movements', setArtMovementImages);
  };

  const handle3dDrawing = () => {
    const prompts = [
      "Transform this photo into a clean 3D line art drawing. Return only the resulting image.",
      "Transform this photo into a photorealistic clay model render. Return only the resulting image."
    ];
    handleMultipleIndividualImageRequests(prompts, "Creating 3D drawings...", '3d-drawing', setThreeDImages);
  };

  const handleDollify = () => {
    const prompts = [
      "Transform the person in this photo to look like a porcelain doll. Return only the resulting image.",
      "Transform the person in this photo to look like a classic rag doll. Return only the resulting image.",
      "Transform the person in this photo to look like a ball-jointed doll (BJD). Return only the resulting image.",
      "Transform the person in this photo to look like a plastic toy action figure. Return only the resulting image."
    ];
    handleMultipleIndividualImageRequests(prompts, "Dollifying...", 'dollify', setDollImages);
  };

  const handleGenerateFavicons = () => {
    const prompts = [
        "Convert the main subject of this image into a simple, clear 16x16 pixel icon suitable for a website favicon. Output as a PNG with a transparent background. Return only the resulting image.",
        "Convert the main subject of this image into a simple, clear 32x32 pixel icon suitable for a website favicon. Output as a PNG with a transparent background. Return only the resulting image.",
        "Convert the main subject of this image into a simple, clear 48x48 pixel icon suitable for a website favicon. Output as a PNG with a transparent background. Return only the resulting image.",
        "Convert the main subject of this image into a simple, clear 192x192 pixel icon suitable for a website favicon, for use as a web app manifest icon. Output as a PNG with a transparent background. Return only the resulting image."
    ];
    handleMultipleIndividualImageRequests(prompts, "Generating favicons...", 'favicon', setFaviconImages);
  };

  const handleVectorize = async () => {
    if (!imageFile) return;
    setIsLoading(true);
    setLoadingMessage("Converting to vector SVG...");
    setActiveTool('vectorize');
    resetAllViews();
    setProcessedImage(null); // Hide the main viewer image

    try {
        const imageToSend = await getAdjustedImage();
        const result = await vectorizeImage(imageToSend, imageFile.type);
        if (result) {
            setVectorizedSvg(result);
        } else {
             throw new Error("Vectorization returned no result.");
        }
    } catch (error: any) {
        console.error("Error vectorizing image:", error);
        alert(error.message || "An error occurred during vectorization. Please try again.");
        setActiveTool(null);
        setProcessedImage(history[history.length - 1]);
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  };
  
  const handleGenerateVideoFromJsonPrompt = async (prompt: string) => {
    setIsLoading(true);
    const waitMessage = `Please wait...
Por favor, espere...
Veuillez patienter...
कृपया प्रतीक्षा करें...
Пожалуйста, подождите...

Generating video. This can take several minutes.`;
    setLoadingMessage(waitMessage);
    setActiveTool('json-prompt-builder');
    resetAllViews();
    setImageFile(null);
    setVideoFile(null);

    try {
        const fullPrompt = `Generate a video based on the following JSON description. The 'subject' and 'setting' fields are the most important. The other fields provide guidance on the artistic direction.\n\n${prompt}`;
        const resultUrl = await generateVideoFromText(fullPrompt);
        if (resultUrl) {
            setProcessedVideoUrl(resultUrl);
            const dummyFile = new File([], "generated-video.mp4", { type: "video/mp4" });
            setVideoFile({
                name: "generated-video.mp4",
                type: "video/mp4",
                url: '', // No local blob URL
                file: dummyFile,
                size: 0
            });
        } else {
            throw new Error("Video generation returned no result.");
        }
    } catch (error: any) {
        console.error("Error generating video from JSON prompt:", error);
        if (error.message?.includes("Requested entity was not found.")) {
            alert("Your API key is invalid. Please select a valid key and try again.");
            setIsApiKeySelected(false);
        } else {
            alert("An error occurred while generating the video. Please try again.");
        }
        setActiveTool(null);
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  };

  const handleGenerateImages = async (prompt: string) => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setLoadingMessage("Generating images...");
    setActiveTool('generate');
    setProcessedImage(null);
    resetAllViews();
    try {
        const images = await generateImagesFromText(prompt);
        if (images.length > 0) {
            setGeneratedImages(images);
            // Create a dummy image file to transition to editor view
            setImageFile({
                name: 'generated-image.png',
                type: 'image/png',
                base64: images[0],
                size: 0
            });
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
    setLoadingMessage("Searching the web...");
    setActiveTool('web-search');
    try {
        const imageToSend = await getAdjustedImage();
        const results = await searchWebForSimilarImages(imageToSend, imageFile.type);
        setWebSearchResults(results);
    } catch (error) {
        console.error("Error searching web:", error);
        alert("An error occurred during the web search.");
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  };

  const handleCropConfirm = async () => {
    if (crop && imgRef.current) {
        const croppedImage = await cropImage(imgRef.current, crop, zoom);
        if (croppedImage) {
            updateProcessedImage(croppedImage);
        }
    }
    setActiveTool(null);
    setCrop(undefined);
  };

  const handleResize = async (width: number, height: number) => {
    if (!processedImage) return;
    setIsLoading(true);
    setLoadingMessage("Resizing image...");
    try {
        const resized = await resizeImage(processedImage, width, height);
        updateProcessedImage(resized);
    } catch (error) {
        console.error("Error resizing image:", error);
        alert("Could not resize the image.");
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  };

  const handleApplyInpainting = async (prompt: string, message: string) => {
    if (!imageFile || !maskCanvasRef.current) return;
    const mask = maskCanvasRef.current.toDataURL('image/png');

    setIsLoading(true);
    setLoadingMessage(message);
    try {
        const imageToSend = await getAdjustedImage();
        const result = await processInpaintingWithGemini(prompt, imageToSend, imageFile.type, mask);
        if (result) {
            updateProcessedImage(result, true);
        }
    } catch (error) {
        console.error("Error with inpainting:", error);
        alert("An error occurred during the operation. Please try again.");
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
        setActiveTool(null);
    }
  };

  const handleApplyRemove = () => handleApplyInpainting("Remove the area marked in red from the image. Fill the space realistically.", "Removing object...");
  const handleApplyBlur = () => handleApplyInpainting("Apply a realistic background blur (bokeh) to this image. The area marked in white should remain in sharp focus. Everything else should be blurred.", "Applying background blur...");
  const handleApplyColorChange = () => {
      if (!colorChangePrompt.trim()) {
          alert('Please describe the new color.');
          return;
      }
      const prompt = `Change the color of the area marked in white to '${colorChangePrompt}'. The change should be realistic and preserve textures.`;
      handleApplyInpainting(prompt, "Changing color...");
  };

  const handleClearMask = () => {
      if (maskCanvasRef.current) {
          const ctx = maskCanvasRef.current.getContext('2d');
          ctx?.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
      }
  };

  const handleDownload = (format: 'jpeg' | 'png' | 'webp') => {
      if (processedImage && imageFile) {
          downloadImage(processedImage, format, imageFile.name);
      }
  };

  const handleVideoDownload = async () => {
    if (processedVideoUrl && videoFile) {
        setIsLoading(true);
        setLoadingMessage('Downloading video...');
        try {
            await downloadVideo(processedVideoUrl, videoFile.name);
        } catch (error) {
            console.error("Download failed:", error);
            alert("Could not download the video. Please try again.");
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }
  };

  const handleDownloadSvg = (svgString: string) => {
    if (imageFile) {
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const fileName = imageFile.name.substring(0, imageFile.name.lastIndexOf('.')) || imageFile.name;
        link.download = `${fileName}-vector.svg`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
  };

  const createDownloadHandler = (name: string) => (base64: string, format: 'jpeg' | 'png' | 'webp') => {
      if (imageFile) {
          const fileName = imageFile.name.substring(0, imageFile.name.lastIndexOf('.')) || imageFile.name;
          downloadImage(base64, format, `${fileName}-${name}`);
      }
  };
  
  const handleDownloadGeneratedImage = createDownloadHandler('generated');
  const handleDownloadCartoon = createDownloadHandler('cartoon');
  const handleDownloadThreeDImage = createDownloadHandler('3d');
  const handleDownloadDollImage = createDownloadHandler('doll');
  const handleDownloadBwImage = createDownloadHandler('bw');
  const handleDownloadArtImage = createDownloadHandler('art');
  const handleDownloadPhotoShootImage = createDownloadHandler('photoshoot');
  const handleDownloadArtMovementImage = createDownloadHandler('art-movement');
  const handleDownloadHairstyleImage = createDownloadHandler('hairstyle');
  const handleDownloadAgeChangeImage = createDownloadHandler('age-change');
  const handleDownloadVirtualTryOnImage = createDownloadHandler('virtual-try-on');
  const handleDownloadFaviconImage = createDownloadHandler('favicon');

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.1, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.1, 0.2));
  const onResetZoom = () => setZoom(1);

  const mediaType = imageFile ? 'image' : videoFile ? 'video' : null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Header />
      {!mediaType ? (
        <InitialScreen
            onFileUpload={handleFileUpload}
            onGenerateImages={handleGenerateImages}
            onGenerateVideoFromJsonPrompt={handleGenerateVideoFromJsonPrompt}
            isApiKeySelected={isApiKeySelected}
            setIsApiKeySelected={setIsApiKeySelected}
            isLoading={isLoading}
            graffitiFeatures={graffitiFeatures}
        />
      ) : (
        <EditorLayout>
          <MediaViewer
            processedImage={processedImage}
            videoFile={videoFile}
            processedVideoUrl={processedVideoUrl}
            onVideoMetadataLoad={handleVideoMetadataLoad}
            generatedMp4Url={generatedMp4Url}
            cartoonImages={cartoonImages}
            generatedImages={generatedImages}
            threeDImages={threeDImages}
            dollImages={dollImages}
            bwImages={bwImages}
            artImages={artImages}
            photoShootImages={photoShootImages}
            artMovementImages={artMovementImages}
            hairstyleImages={hairstyleImages}
            ageChangeImages={ageChangeImages}
            virtualTryOnImage={virtualTryOnImage}
            webSearchResults={webSearchResults}
            faviconImages={faviconImages}
            vectorizedSvg={vectorizedSvg}
            onDownloadCartoon={handleDownloadCartoon}
            onDownloadGeneratedImage={handleDownloadGeneratedImage}
            onDownloadThreeDImage={handleDownloadThreeDImage}
            onDownloadDollImage={handleDownloadDollImage}
            onDownloadBwImage={handleDownloadBwImage}
            onDownloadArtImage={handleDownloadArtImage}
            onDownloadPhotoShootImage={handleDownloadPhotoShootImage}
            onDownloadArtMovementImage={handleDownloadArtMovementImage}
            onDownloadHairstyleImage={handleDownloadHairstyleImage}
            onDownloadAgeChangeImage={handleDownloadAgeChangeImage}
            onDownloadVirtualTryOnImage={handleDownloadVirtualTryOnImage}
            onDownloadFaviconImage={handleDownloadFaviconImage}
            onDownloadSvg={handleDownloadSvg}
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
            isLoading={isLoading}
            loadingMessage={loadingMessage}
          />
          <ControlPanel
            mediaType={mediaType}
            imageFile={imageFile}
            videoFile={videoFile}
            videoInfo={videoInfo}
            onAutoAdjust={handleAutoAdjust}
            onRestore={handleRestore}
            onColorize={handleColorize}
            onExpand={handleExpand}
            onRemoveBackground={handleRemoveBackground}
            onPortraitRetouch={handlePortraitRetouch}
            onContextualText={handleContextualText}
            contextualTextPrompt={contextualTextPrompt}
            setContextualTextPrompt={setContextualTextPrompt}
            onCartoonify={handleCartoonify}
            onGenerateBwStyles={handleBlackAndWhiteStyles}
            on3dDrawing={handle3dDrawing}
            onDollify={handleDollify}
            onGenerateFavicons={handleGenerateFavicons}
            onVectorize={handleVectorize}
            onWebSearch={handleWebSearch}
            onGifToMp4={handleGifToMp4}
            onCompactVideo={handleCompactVideo}
            isApiKeySelected={isApiKeySelected}
            setIsApiKeySelected={setIsApiKeySelected}
            onGenerateArtStyles={handleGenerateArtStyles}
            onArtMovements={handleArtMovements}
            onHoldMyDoll={handleHoldMyDoll}
            onPhotoShoot={handlePhotoShoot}
            onHairstyleTrial={handleHairstyleTrial}
            onAgeChange={handleAgeChange}
            onVirtualTryOn={handleVirtualTryOn}
            onCrop={() => setActiveTool('crop')}
            onCropConfirm={handleCropConfirm}
            onResize={handleResize}
            currentDimensions={imageDimensions}
            onRemoveObject={() => setActiveTool('remove')}
            onApplyRemove={handleApplyRemove}
            onBlurBackground={() => setActiveTool('background-blur')}
            onApplyBlur={handleApplyBlur}
            onChangeColor={() => setActiveTool('change-color')}
            onApplyColorChange={handleApplyColorChange}
            colorChangePrompt={colorChangePrompt}
            setColorChangePrompt={setColorChangePrompt}
            onClearMask={handleClearMask}
            onDownload={handleDownload}
            onVideoDownload={handleVideoDownload}
            onUndo={handleUndo}
            onUploadNew={handleNewFileUpload}
            isUndoDisabled={history.length <= 1}
            activeTool={activeTool}
            isMediaLoaded={!!processedImage || !!videoFile}
            isEditingMode={activeTool !== 'generate' && !videoFile}
            isProcessedVideoReady={!!processedVideoUrl}
            isLoading={isLoading}
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
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetZoom={onResetZoom}
          />
        </EditorLayout>
      )}
    </div>
  );
};

export default App;