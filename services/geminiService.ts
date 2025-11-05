
import { GoogleGenAI, Modality } from "@google/genai";

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64.split(',')[1],
      mimeType
    },
  };
};

export const processImageWithGemini = async (prompt: string, imageBase64: string, imageType: string): Promise<string | null> => {
  try {
    // Fix: Instantiate the client here to ensure the latest API key is used for every request.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-2.5-flash-image';
    const imagePart = fileToGenerativePart(imageBase64, imageType);

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
    // Fix: Re-throw the error so it can be handled by the UI component.
    throw error;
  }
};

export const processInpaintingWithGemini = async (prompt: string, imageBase64: string, imageType: string, maskBase64: string): Promise<string | null> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const model = 'gemini-2.5-flash-image';
      const imagePart = fileToGenerativePart(imageBase64, imageType);
      const maskPart = fileToGenerativePart(maskBase64, 'image/png');
  
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

export const generateVideoFromImage = async (prompt: string, imageBase64: string, imageType: string): Promise<string | null> => {
    // Re-initialize the client to ensure the latest API key from the selection dialog is used.
    const videoAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        let operation = await videoAi.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            image: {
                imageBytes: imageBase64.split(',')[1],
                mimeType: imageType,
            },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9' 
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await videoAi.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (downloadLink) {
             // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
            return `${downloadLink}&key=${process.env.API_KEY}`;
        }
        return null;
    } catch (error) {
        console.error('Error generating video:', error);
        throw error; // Re-throw to be caught by the component
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
        throw error; // Re-throw to be caught by the component
    }
};

export const searchWebForSimilarImages = async (imageBase64: string, imageType: string): Promise<{ summary: string; links: { uri: string; title: string }[] } | null> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const imagePart = fileToGenerativePart(imageBase64, imageType);

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
