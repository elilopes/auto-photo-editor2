import { GoogleGenAI, Modality } from "@google/genai";
import { extractVideoFrame } from "../utils/imageUtils";
import type { VideoInfo } from "../types";

const imageFileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64.split(',')[1],
      mimeType
    },
  };
};

export const processImageWithGemini = async (prompt: string, imageBase64: string, imageType: string): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-2.5-flash-image';
    const imagePart = imageFileToGenerativePart(imageBase64, imageType);

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          imagePart,
          { text: prompt },
        ],
      },
      config: {
          responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
    }
    return null;

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
};

export const vectorizeImage = async (imageBase64: string, imageType: string): Promise<string | null> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const imagePart = imageFileToGenerativePart(imageBase64, imageType);
        const prompt = "Analyze the provided image and convert its main subject into a simplified Scalable Vector Graphic (SVG). The output must be ONLY the raw SVG code, starting with `<svg` and ending with `</svg>`. Do not include any other text, explanations, or markdown formatting like ```svg.";

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: {
                parts: [
                    imagePart,
                    { text: prompt },
                ],
            },
        });

        const textResponse = response.text.trim();
        
        // Check for raw SVG
        if (textResponse.startsWith('<svg') && textResponse.endsWith('</svg>')) {
            return textResponse;
        }

        // Check for markdown-wrapped SVG, now also accepting 'xml'
        const svgMatch = textResponse.match(/```(?:svg|xml)?\s*([\s\S]*?)\s*```/);
        if (svgMatch && svgMatch[1]) {
            const extracted = svgMatch[1].trim();
            if (extracted.startsWith('<svg') && extracted.endsWith('</svg>')) {
                return extracted;
            }
        }
        
        console.error("Failed to extract valid SVG code from response:", textResponse);
        throw new Error("The AI did not return valid SVG code. Please try again or with a simpler image.");

    } catch (error) {
        console.error('Error calling Gemini API for vectorization:', error);
        throw error;
    }
};

export const performVirtualTryOn = async (imageBase64: string, imageType: string, clothingDescription: string): Promise<string | null> => {
    const prompt = `Analyze the person in this image. Your task is to perform a virtual try-on. First, accurately identify and isolate the person's head. Then, generate a new, full-body, photorealistic image of that same person wearing the following outfit: '${clothingDescription}'. The new body should be realistically posed and proportioned for the clothing. The head must be seamlessly blended onto the new body, maintaining the original person's identity, expression, and lighting. The background should be a simple, neutral studio setting. Return only the final image.`;
    return processImageWithGemini(prompt, imageBase64, imageType);
};

export const processInpaintingWithGemini = async (prompt: string, imageBase64: string, imageType: string, maskBase64: string): Promise<string | null> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const model = 'gemini-2.5-flash-image';
      const imagePart = imageFileToGenerativePart(imageBase64, imageType);
      const maskPart = imageFileToGenerativePart(maskBase64, 'image/png');
  
      const response = await ai.models.generateContent({
        model: model,
        contents: {
          parts: [
            imagePart,
            maskPart,
            { text: prompt },
          ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
      });
  
      for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
              const base64ImageBytes: string = part.inlineData.data;
              return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
          }
      }
      return null;
  
    } catch (error) {
      console.error('Error calling Gemini API for inpainting:', error);
      throw error;
    }
  };

export const convertGifToMp4 = async (imageBase64: string, imageType: string, dimensions: { width: number; height: number; }): Promise<string | null> => {
    const videoAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const aspectRatio = dimensions.width >= dimensions.height ? '16:9' : '9:16';
        let operation = await videoAi.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: "Faithfully convert this animated GIF into a smooth, high-quality MP4 video. Preserve the original motion, style, and aspect ratio as closely as possible.",
            image: {
                imageBytes: imageBase64.split(',')[1],
                mimeType: imageType,
            },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: aspectRatio,
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await videoAi.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (downloadLink) {
            return `${downloadLink}&key=${process.env.API_KEY}`;
        }
        return null;
    } catch (error) {
        console.error('Error converting GIF to MP4:', error);
        throw error;
    }
};

export const compressVideoWithGemini = async (videoFile: File, quality: 'high' | 'medium' | 'low', videoInfo: VideoInfo): Promise<string | null> => {
    const videoAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const representativeFrameBase64 = await extractVideoFrame(videoFile);

        const qualityPrompts = {
            high: "This image is a key frame from a video. Your task is to regenerate the entire video based on this single frame. The regenerated video should be a high-quality, compressed MP4 that logically represents the original video's content and motion.",
            medium: "This image is a key frame from a video. Your task is to regenerate the entire video based on this single frame. The regenerated video should be a compressed MP4, balancing quality with a smaller file size, that logically represents the original video's content and motion.",
            low: "This image is a key frame from a video. Your task is to regenerate the entire video based on this single frame. The regenerated video should be a highly compressed MP4 to achieve the smallest possible file size, while still logically representing the original video's content and motion."
        };
        
        const aspectRatio = videoInfo.width >= videoInfo.height ? '16:9' : '9:16';

        let operation = await videoAi.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: qualityPrompts[quality],
            image: {
                imageBytes: representativeFrameBase64.split(',')[1],
                mimeType: 'image/png',
            },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: aspectRatio,
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await videoAi.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (downloadLink) {
            return `${downloadLink}&key=${process.env.API_KEY}`;
        }
        return null;
    } catch (error) {
        console.error('Error compressing video:', error);
        throw error;
    }
};

export const generateVideoFromText = async (prompt: string): Promise<string | null> => {
    const videoAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        let operation = await videoAi.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9',
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await videoAi.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (downloadLink) {
            return `${downloadLink}&key=${process.env.API_KEY}`;
        }
        return null;
    } catch (error) {
        console.error('Error generating video from text:', error);
        throw error;
    }
};

export const generateImagesFromText = async (prompt: string): Promise<string[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 4,
                outputMimeType: 'image/png',
                aspectRatio: '1:1',
            },
        });

        return response.generatedImages.map(img => `data:image/png;base64,${img.image.imageBytes}`);
    } catch (error) {
        console.error('Error generating images:', error);
        throw error;
    }
};

export const searchWebForSimilarImages = async (imageBase64: string, imageType: string): Promise<{ summary: string; links: { uri: string; title: string }[] } | null> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const imagePart = imageFileToGenerativePart(imageBase64, imageType);

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    { text: "Based on the provided image, find and list websites containing visually similar images. Provide a brief summary and the source links." },
                    imagePart,
                ],
            },
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const summary = response.text;
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        
        const links = groundingChunks
            .map(chunk => ({
                uri: chunk.web?.uri || '',
                title: chunk.web?.title || 'Untitled',
            }))
            .filter(link => link.uri); // Filter out any empty URIs

        return { summary, links };

    } catch (error) {
        console.error('Error calling Gemini API for web search:', error);
        throw error;
    }
};