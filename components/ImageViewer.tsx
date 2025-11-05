
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import type { Tool } from '../types';
import { Image, Download, Globe, Link, Loader2 } from 'lucide-react';


interface ImageViewerProps {
  processedImage: string | null;
  generatedMp4Url: string | null;
  cartoonImages: string[] | null;
  generatedImages: string[] | null;
  threeDImages: string[] | null;
  dollImages: string[] | null;
  bwImages: string[] | null;
  artImages: string[] | null;
  photoShootImages: string[] | null;
  artMovementImages: string[] | null;
  hairstyleImages: string[] | null;
  virtualTryOnImage: string | null;
  webSearchResults: { summary: string; links: { uri: string; title: string }[] } | null;
  onDownloadCartoon: (base64: string, format: 'jpeg' | 'png' | 'webp') => void;
  onDownloadGeneratedImage: (base64: string, format: 'jpeg' | 'png' | 'webp') => void;
  onDownloadThreeDImage: (base64: string, format: 'jpeg' | 'png' | 'webp') => void;
  onDownloadDollImage: (base64: string, format: 'jpeg' | 'png' | 'webp') => void;
  onDownloadBwImage: (base64: string, format: 'jpeg' | 'png' | 'webp') => void;
  onDownloadArtImage: (base64: string, format: 'jpeg' | 'png' | 'webp') => void;
  onDownloadPhotoShootImage: (base64: string, format: 'jpeg' | 'png' | 'webp') => void;
  onDownloadArtMovementImage: (base64: string, format: 'jpeg' | 'png' | 'webp') => void;
  onDownloadHairstyleImage: (base64: string, format: 'jpeg' | 'png' | 'webp') => void;
  onDownloadVirtualTryOnImage: (base64: string, format: 'jpeg' | 'png' | 'webp') => void;
  activeTool: Tool | null;
  imgRef: React.RefObject<HTMLImageElement>;
  maskCanvasRef: React.RefObject<HTMLCanvasElement>;
  crop: Crop | undefined;
  setCrop: (crop: Crop | undefined) => void;
  brightness: number;
  contrast: number;
  angle: number;
  gamma: number; // For passing to styles, though not directly used in CSS
  sharpness: number;
  zoom: number;
  isLoading: boolean;
  loadingMessage: string;
}

const LoadingIndicator: React.FC<{ message: string }> = ({ message }) => (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm rounded-xl">
        <Loader2 className="w-16 h-16 text-blue-400 animate-spin" />
        <h2 className="mt-6 text-2xl font-bold text-white">Please wait...</h2>
        {message && <p className="mt-2 text-lg text-gray-300">{message}</p>}
    </div>
);

const GeneratedImageOption: React.FC<{
    image: string;
    onDownload: (format: 'jpeg' | 'png' | 'webp') => void;
  }> = ({ image, onDownload }) => {
    const [showOptions, setShowOptions] = useState(false);
    return (
      <div className="flex flex-col items-center space-y-2 p-2 bg-gray-800 rounded-lg h-full">
        <div className="w-full flex-grow flex items-center justify-center overflow-hidden rounded-md min-h-0">
           <img src={image} alt="Generated image" className="w-full h-full object-contain" />
        </div>
        <div className="relative w-full">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="w-full flex items-center justify-center space-x-2 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={20} />
            <span>Save</span>
          </button>
          {showOptions && (
            <div className="absolute bottom-full mb-2 w-full bg-gray-700 rounded-lg shadow-xl p-2 space-y-1 z-10">
              <button onClick={() => { onDownload('jpeg'); setShowOptions(false); }} className="w-full text-left p-2 hover:bg-gray-600 rounded">as JPEG</button>
              <button onClick={() => { onDownload('png'); setShowOptions(false); }} className="w-full text-left p-2 hover:bg-gray-600 rounded">as PNG</button>
              <button onClick={() => { onDownload('webp'); setShowOptions(false); }} className="w-full text-left p-2 hover:bg-gray-600 rounded">as WEBP</button>
            </div>
          )}
        </div>
      </div>
    );
};
  
const GeneratedImageViewer: React.FC<{
    images: string[];
    onDownload: (base64: string, format: 'jpeg' | 'png' | 'webp') => void;
}> = ({ images, onDownload }) => {
    return (
        <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-4 p-4">
            {images.map((img, index) => (
                <GeneratedImageOption
                    key={index}
                    image={img}
                    onDownload={(format) => onDownload(img, format)}
                />
            ))}
        </div>
    );
};

const CartoonOption: React.FC<{
    image: string;
    title: string;
    onDownload: (format: 'jpeg' | 'png' | 'webp') => void;
  }> = ({ image, title, onDownload }) => {
    const [showOptions, setShowOptions] = useState(false);
    return (
      <div className="flex flex-col items-center space-y-2 p-2 bg-gray-800 rounded-lg h-full w-full">
        <h3 className="text-md font-semibold">{title}</h3>
        <div className="w-full flex-grow flex items-center justify-center overflow-hidden rounded-md min-h-0">
           <img src={image} alt={title} className="w-full h-full object-contain" />
        </div>
        <div className="relative w-full">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="w-full flex items-center justify-center space-x-2 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={20} />
            <span>Save Style</span>
          </button>
          {showOptions && (
            <div className="absolute bottom-full mb-2 w-full bg-gray-700 rounded-lg shadow-xl p-2 space-y-1 z-10">
              <button onClick={() => { onDownload('jpeg'); setShowOptions(false); }} className="w-full text-left p-2 hover:bg-gray-600 rounded">as JPEG</button>
              <button onClick={() => { onDownload('png'); setShowOptions(false); }} className="w-full text-left p-2 hover:bg-gray-600 rounded">as PNG</button>
              <button onClick={() => { onDownload('webp'); setShowOptions(false); }} className="w-full text-left p-2 hover:bg-gray-600 rounded">as WEBP</button>
            </div>
          )}
        </div>
      </div>
    );
};
  
const CartoonViewer: React.FC<{
      images: string[];
      onDownload: (base64: string, format: 'jpeg' | 'png' | 'webp') => void;
}> = ({ images, onDownload }) => {
      const titles = ["Modern Animated", "Classic Comic", "Anime/Manga", "Watercolor"];
      return (
          <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-4 p-4">
              {images.map((img, index) => (
                  <CartoonOption
                      key={index}
                      image={img}
                      title={titles[index]}
                      onDownload={(format) => onDownload(img, format)}
                  />
              ))}
          </div>
      );
};

const BwOption: React.FC<{
    image: string;
    title: string;
    onDownload: (format: 'jpeg' | 'png' | 'webp') => void;
  }> = ({ image, title, onDownload }) => {
    const [showOptions, setShowOptions] = useState(false);
    return (
      <div className="flex flex-col items-center space-y-2 p-2 bg-gray-800 rounded-lg h-full w-full">
        <h3 className="text-md font-semibold">{title}</h3>
        <div className="w-full flex-grow flex items-center justify-center overflow-hidden rounded-md min-h-0">
           <img src={image} alt={title} className="w-full h-full object-contain" />
        </div>
        <div className="relative w-full">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="w-full flex items-center justify-center space-x-2 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={20} />
            <span>Save Style</span>
          </button>
          {showOptions && (
            <div className="absolute bottom-full mb-2 w-full bg-gray-700 rounded-lg shadow-xl p-2 space-y-1 z-10">
              <button onClick={() => { onDownload('jpeg'); setShowOptions(false); }} className="w-full text-left p-2 hover:bg-gray-600 rounded">as JPEG</button>
              <button onClick={() => { onDownload('png'); setShowOptions(false); }} className="w-full text-left p-2 hover:bg-gray-600 rounded">as PNG</button>
              <button onClick={() => { onDownload('webp'); setShowOptions(false); }} className="w-full text-left p-2 hover:bg-gray-600 rounded">as WEBP</button>
            </div>
          )}
        </div>
      </div>
    );
};

const BwViewer: React.FC<{
    images: string[];
    onDownload: (base64: string, format: 'jpeg' | 'png' | 'webp') => void;
}> = ({ images, onDownload }) => {
    const titles = ["Classic", "High Contrast", "Soft Vintage", "Film Noir"];
    return (
        <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-4 p-4">
            {images.map((img, index) => (
                <BwOption
                    key={index}
                    image={img}
                    title={titles[index]}
                    onDownload={(format) => onDownload(img, format)}
                />
            ))}
        </div>
    );
};

const ArtOption: React.FC<{
    image: string;
    title: string;
    onDownload: (format: 'jpeg' | 'png' | 'webp') => void;
  }> = ({ image, title, onDownload }) => {
    const [showOptions, setShowOptions] = useState(false);
    return (
      <div className="flex flex-col items-center space-y-2 p-2 bg-gray-800 rounded-lg h-full w-full">
        <h3 className="text-md font-semibold">{title}</h3>
        <div className="w-full flex-grow flex items-center justify-center overflow-hidden rounded-md min-h-0">
           <img src={image} alt={title} className="w-full h-full object-contain" />
        </div>
        <div className="relative w-full">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="w-full flex items-center justify-center space-x-2 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={20} />
            <span>Save Style</span>
          </button>
          {showOptions && (
            <div className="absolute bottom-full mb-2 w-full bg-gray-700 rounded-lg shadow-xl p-2 space-y-1 z-10">
              <button onClick={() => { onDownload('jpeg'); setShowOptions(false); }} className="w-full text-left p-2 hover:bg-gray-600 rounded">as JPEG</button>
              <button onClick={() => { onDownload('png'); setShowOptions(false); }} className="w-full text-left p-2 hover:bg-gray-600 rounded">as PNG</button>
              <button onClick={() => { onDownload('webp'); setShowOptions(false); }} className="w-full text-left p-2 hover:bg-gray-600 rounded">as WEBP</button>
            </div>
          )}
        </div>
      </div>
    );
};
  
const ArtViewer: React.FC<{
      images: string[];
      onDownload: (base64: string, format: 'jpeg' | 'png' | 'webp') => void;
}> = ({ images, onDownload }) => {
      const titles = ["Film Noir", "Soft Focus", "Vintage Sepia", "Grainy Film"];
      return (
          <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-4 p-4">
              {images.map((img, index) => (
                  <ArtOption
                      key={index}
                      image={img}
                      title={titles[index]}
                      onDownload={(format) => onDownload(img, format)}
                  />
              ))}
          </div>
      );
};

const PhotoShootOption: React.FC<{
    image: string;
    title: string;
    onDownload: (format: 'jpeg' | 'png' | 'webp') => void;
  }> = ({ image, title, onDownload }) => {
    const [showOptions, setShowOptions] = useState(false);
    return (
      <div className="flex flex-col items-center space-y-2 p-2 bg-gray-800 rounded-lg h-full w-full">
        <h3 className="text-md font-semibold">{title}</h3>
        <div className="w-full flex-grow flex items-center justify-center overflow-hidden rounded-md min-h-0">
           <img src={image} alt={title} className="w-full h-full object-contain" />
        </div>
        <div className="relative w-full">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="w-full flex items-center justify-center space-x-2 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={20} />
            <span>Save Photo</span>
          </button>
          {showOptions && (
            <div className="absolute bottom-full mb-2 w-full bg-gray-700 rounded-lg shadow-xl p-2 space-y-1 z-10">
              <button onClick={() => { onDownload('jpeg'); setShowOptions(false); }} className="w-full text-left p-2 hover:bg-gray-600 rounded">as JPEG</button>
              <button onClick={() => { onDownload('png'); setShowOptions(false); }} className="w-full text-left p-2 hover:bg-gray-600 rounded">as PNG</button>
              <button onClick={() => { onDownload('webp'); setShowOptions(false); }} className="w-full text-left p-2 hover:bg-gray-600 rounded">as WEBP</button>
            </div>
          )}
        </div>
      </div>
    );
};
  
const PhotoShootViewer: React.FC<{
      images: string[];
      onDownload: (base64: string, format: 'jpeg' | 'png' | 'webp') => void;
}> = ({ images, onDownload }) => {
      const titles = ["Urban Alley", "Parisian Café", "Sunset Beach", "Modern Office"];
      return (
          <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-4 p-4">
              {images.map((img, index) => (
                  <PhotoShootOption
                      key={index}
                      image={img}
                      title={titles[index]}
                      onDownload={(format) => onDownload(img, format)}
                  />
              ))}
          </div>
      );
};

const ArtMovementOption: React.FC<{
    image: string;
    title: string;
    onDownload: (format: 'jpeg' | 'png' | 'webp') => void;
  }> = ({ image, title, onDownload }) => {
    const [showOptions, setShowOptions] = useState(false);
    return (
      <div className="flex flex-col items-center space-y-2 p-2 bg-gray-800 rounded-lg h-full w-full">
        <h3 className="text-md font-semibold">{title}</h3>
        <div className="w-full flex-grow flex items-center justify-center overflow-hidden rounded-md min-h-0">
           <img src={image} alt={title} className="w-full h-full object-contain" />
        </div>
        <div className="relative w-full">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="w-full flex items-center justify-center space-x-2 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={20} />
            <span>Save Style</span>
          </button>
          {showOptions && (
            <div className="absolute bottom-full mb-2 w-full bg-gray-700 rounded-lg shadow-xl p-2 space-y-1 z-10">
              <button onClick={() => { onDownload('jpeg'); setShowOptions(false); }} className="w-full text-left p-2 hover:bg-gray-600 rounded">as JPEG</button>
              <button onClick={() => { onDownload('png'); setShowOptions(false); }} className="w-full text-left p-2 hover:bg-gray-600 rounded">as PNG</button>
              <button onClick={() => { onDownload('webp'); setShowOptions(false); }} className="w-full text-left p-2 hover:bg-gray-600 rounded">as WEBP</button>
            </div>
          )}
        </div>
      </div>
    );
};
  
const ArtMovementViewer: React.FC<{
      images: string[];
      onDownload: (base64: string, format: 'jpeg' | 'png' | 'webp') => void;
}> = ({ images, onDownload }) => {
      const titles = ["Impressionism", "Cubism", "Surrealism", "Baroque"];
      return (
          <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-4 p-4">
              {images.map((img, index) => (
                  <ArtMovementOption
                      key={index}
                      image={img}
                      title={titles[index]}
                      onDownload={(format) => onDownload(img, format)}
                  />
              ))}
          </div>
      );
};

const HairstyleOption: React.FC<{
    image: string;
    title: string;
    onDownload: (format: 'jpeg' | 'png' | 'webp') => void;
  }> = ({ image, title, onDownload }) => {
    const [showOptions, setShowOptions] = useState(false);
    return (
      <div className="flex flex-col items-center space-y-2 p-2 bg-gray-800 rounded-lg h-full w-full">
        <h3 className="text-md font-semibold">{title}</h3>
        <div className="w-full flex-grow flex items-center justify-center overflow-hidden rounded-md min-h-0">
           <img src={image} alt={title} className="w-full h-full object-contain" />
        </div>
        <div className="relative w-full">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="w-full flex items-center justify-center space-x-2 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={20} />
            <span>Save Hairstyle</span>
          </button>
          {showOptions && (
            <div className="absolute bottom-full mb-2 w-full bg-gray-700 rounded-lg shadow-xl p-2 space-y-1 z-10">
              <button onClick={() => { onDownload('jpeg'); setShowOptions(false); }} className="w-full text-left p-2 hover:bg-gray-600 rounded">as JPEG</button>
              <button onClick={() => { onDownload('png'); setShowOptions(false); }} className="w-full text-left p-2 hover:bg-gray-600 rounded">as PNG</button>
              <button onClick={() => { onDownload('webp'); setShowOptions(false); }} className="w-full text-left p-2 hover:bg-gray-600 rounded">as WEBP</button>
            </div>
          )}
        </div>
      </div>
    );
};
  
const HairstyleViewer: React.FC<{
      images: string[];
      onDownload: (base64: string, format: 'jpeg' | 'png' | 'webp') => void;
}> = ({ images, onDownload }) => {
      const titles = ["Chin-Length Bob", "Beach Curls", "Pixie Cut", "Braided Updo"];
      return (
          <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-4 p-4">
              {images.map((img, index) => (
                  <HairstyleOption
                      key={index}
                      image={img}
                      title={titles[index]}
                      onDownload={(format) => onDownload(img, format)}
                  />
              ))}
          </div>
      );
};

const ThreeDOption: React.FC<{
    image: string;
    title: string;
    onDownload: (format: 'jpeg' | 'png' | 'webp') => void;
  }> = ({ image, title, onDownload }) => {
    const [showOptions, setShowOptions] = useState(false);
    return (
      <div className="flex flex-col items-center space-y-2 p-2 bg-gray-800 rounded-lg h-full w-full">
        <h3 className="text-md font-semibold">{title}</h3>
        <div className="w-full flex-grow flex items-center justify-center overflow-hidden rounded-md min-h-0">
           <img src={image} alt={title} className="w-full h-full object-contain" />
        </div>
        <div className="relative w-full">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="w-full flex items-center justify-center space-x-2 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={20} />
            <span>Save Style</span>
          </button>
          {showOptions && (
            <div className="absolute bottom-full mb-2 w-full bg-gray-700 rounded-lg shadow-xl p-2 space-y-1 z-10">
              <button onClick={() => { onDownload('jpeg'); setShowOptions(false); }} className="w-full text-left p-2 hover:bg-gray-600 rounded">as JPEG</button>
              <button onClick={() => { onDownload('png'); setShowOptions(false); }} className="w-full text-left p-2 hover:bg-gray-600 rounded">as PNG</button>
              <button onClick={() => { onDownload('webp'); setShowOptions(false); }} className="w-full text-left p-2 hover:bg-gray-600 rounded">as WEBP</button>
            </div>
          )}
        </div>
      </div>
    );
};

const ThreeDViewer: React.FC<{
    images: string[];
    onDownload: (base64: string, format: 'jpeg' | 'png' | 'webp') => void;
}> = ({ images, onDownload }) => {
    const titles = ["3D Line Art", "Clay Model Render"];
    return (
        <div className="w-full h-full grid grid-cols-2 gap-4 p-4">
            {images.map((img, index) => (
                <ThreeDOption
                    key={index}
                    image={img}
                    title={titles[index]}
                    onDownload={(format) => onDownload(img, format)}
                />
            ))}
        </div>
    );
};

const DollOption: React.FC<{
    image: string;
    title: string;
    onDownload: (format: 'jpeg' | 'png' | 'webp') => void;
  }> = ({ image, title, onDownload }) => {
    const [showOptions, setShowOptions] = useState(false);
    return (
      <div className="flex flex-col items-center space-y-2 p-2 bg-gray-800 rounded-lg h-full w-full">
        <h3 className="text-md font-semibold">{title}</h3>
        <div className="w-full flex-grow flex items-center justify-center overflow-hidden rounded-md min-h-0">
           <img src={image} alt={title} className="w-full h-full object-contain" />
        </div>
        <div className="relative w-full">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="w-full flex items-center justify-center space-x-2 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={20} />
            <span>Save Style</span>
          </button>
          {showOptions && (
            <div className="absolute bottom-full mb-2 w-full bg-gray-700 rounded-lg shadow-xl p-2 space-y-1 z-10">
              <button onClick={() => { onDownload('jpeg'); setShowOptions(false); }} className="w-full text-left p-2 hover:bg-gray-600 rounded">as JPEG</button>
              <button onClick={() => { onDownload('png'); setShowOptions(false); }} className="w-full text-left p-2 hover:bg-gray-600 rounded">as PNG</button>
              <button onClick={() => { onDownload('webp'); setShowOptions(false); }} className="w-full text-left p-2 hover:bg-gray-600 rounded">as WEBP</button>
            </div>
          )}
        </div>
      </div>
    );
};

const DollViewer: React.FC<{
    images: string[];
    onDownload: (base64: string, format: 'jpeg' | 'png' | 'webp') => void;
}> = ({ images, onDownload }) => {
    const titles = ["Porcelain Doll", "Rag Doll", "Ball-Jointed Doll", "Plastic Toy"];
    return (
        <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-4 p-4">
            {images.map((img, index) => (
                <DollOption
                    key={index}
                    image={img}
                    title={titles[index]}
                    onDownload={(format) => onDownload(img, format)}
                />
            ))}
        </div>
    );
};

const WebSearchResultsViewer: React.FC<{
    sourceImage: string;
    results: { summary: string; links: { uri: string; title: string }[] };
}> = ({ sourceImage, results }) => {
    return (
        <div className="w-full h-full flex flex-col lg:flex-row gap-4 p-4 bg-gray-900 rounded-lg">
            {/* Left Panel: Source Image & Summary */}
            <div className="lg:w-1/3 flex flex-col space-y-4">
                <h2 className="text-xl font-bold text-center text-white">Source Image</h2>
                <div className="w-full h-48 lg:h-auto lg:flex-grow bg-black rounded-md flex items-center justify-center overflow-hidden">
                    <img src={sourceImage} alt="Source for search" className="max-w-full max-h-full object-contain" />
                </div>
                {results.summary && (
                    <>
                        <h3 className="text-lg font-semibold text-white pt-2">AI Summary</h3>
                        <p className="text-sm text-gray-300 bg-gray-800 p-3 rounded-md overflow-y-auto">
                            {results.summary}
                        </p>
                    </>
                )}
            </div>

            {/* Right Panel: Search Results */}
            <div className="lg:w-2/3 flex flex-col">
                <h2 className="text-xl font-bold text-center text-white mb-4 flex items-center justify-center">
                    <Globe size={24} className="mr-2" /> Web Results
                </h2>
                <div className="flex-grow bg-gray-800 rounded-md p-2 overflow-y-auto">
                    <ul className="space-y-3">
                        {results.links.map((link, index) => (
                            <li key={index}>
                                <a
                                    href={link.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block p-3 bg-gray-700 rounded-lg hover:bg-blue-600 transition-colors group"
                                >
                                    <h4 className="font-semibold text-blue-300 group-hover:text-white truncate">{link.title}</h4>
                                    <p className="text-xs text-gray-400 group-hover:text-gray-200 flex items-center gap-1 truncate">
                                        <Link size={12} /> {link.uri}
                                    </p>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};


export const ImageViewer: React.FC<ImageViewerProps> = ({ processedImage, generatedMp4Url, cartoonImages, generatedImages, threeDImages, dollImages, bwImages, artImages, photoShootImages, artMovementImages, hairstyleImages, virtualTryOnImage, webSearchResults, onDownloadCartoon, onDownloadGeneratedImage, onDownloadThreeDImage, onDownloadDollImage, onDownloadBwImage, onDownloadArtImage, onDownloadPhotoShootImage, onDownloadArtMovementImage, onDownloadHairstyleImage, onDownloadVirtualTryOnImage, activeTool, imgRef, maskCanvasRef, crop, setCrop, brightness, contrast, angle, gamma, sharpness, zoom, isLoading, loadingMessage }) => {
    const [isDrawing, setIsDrawing] = useState(false);
    const drawingWrapperRef = useRef<HTMLDivElement>(null);
    const viewerContainerRef = useRef<HTMLDivElement>(null);
    const isMaskingToolActive = activeTool === 'remove' || activeTool === 'background-blur' || activeTool === 'change-color';

    useEffect(() => {
        const canvas = maskCanvasRef.current;
        const image = imgRef.current;
        if (isMaskingToolActive && canvas && image) {
          const setupCanvasDimensions = () => {
            if (image.naturalWidth > 0 && image.naturalHeight > 0) {
              canvas.width = image.naturalWidth;
              canvas.height = image.naturalHeight;
            }
          };
    
          if (image.complete) {
            setupCanvasDimensions();
          } else {
            image.onload = setupCanvasDimensions;
          }
    
          return () => {
            if (image) {
              image.onload = null;
            }
          };
        }
      }, [activeTool, processedImage, imgRef, maskCanvasRef, isMaskingToolActive]);

      const getScaledCoords = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
        const imageEl = imgRef.current;
        if (!imageEl || !imageEl.complete || imageEl.naturalWidth === 0) {
          return null;
        }
      
        // 1. Get dimensions
        const naturalWidth = imageEl.naturalWidth;
        const naturalHeight = imageEl.naturalHeight;
      
        const boxRect = imageEl.getBoundingClientRect();
        const boxWidth = boxRect.width;
        const boxHeight = boxRect.height;
      
        // 2. Calculate the rendered image's dimensions and position inside its box due to `object-contain`
        const naturalAspectRatio = naturalWidth / naturalHeight;
        const boxAspectRatio = boxWidth / boxHeight;
      
        let renderedWidth, renderedHeight, renderedX, renderedY;
      
        if (naturalAspectRatio > boxAspectRatio) {
          // Image is wider than the box, letterboxed vertically
          renderedWidth = boxWidth;
          renderedHeight = boxWidth / naturalAspectRatio;
          renderedX = boxRect.left;
          renderedY = boxRect.top + (boxHeight - renderedHeight) / 2;
        } else {
          // Image is taller, letterboxed horizontally
          renderedHeight = boxHeight;
          renderedWidth = boxHeight * naturalAspectRatio;
          renderedX = boxRect.left + (boxWidth - renderedWidth) / 2;
          renderedY = boxRect.top;
        }
      
        // 3. Get cursor position from the event
        let cursorX, cursorY;
        if ('touches' in e.nativeEvent) {
          cursorX = (e.nativeEvent as TouchEvent).touches[0].clientX;
          cursorY = (e.nativeEvent as TouchEvent).touches[0].clientY;
        } else {
          cursorX = (e.nativeEvent as MouseEvent).clientX;
          cursorY = (e.nativeEvent as MouseEvent).clientY;
        }
      
        // 4. Check if cursor is within the rendered image bounds
        if (
          cursorX < renderedX ||
          cursorX > renderedX + renderedWidth ||
          cursorY < renderedY ||
          cursorY > renderedY + renderedHeight
        ) {
          return null;
        }
      
        // 5. Calculate cursor position relative to the rendered image (0 to 1)
        const relativeX = (cursorX - renderedX) / renderedWidth;
        const relativeY = (cursorY - renderedY) / renderedHeight;
      
        // 6. Scale relative position to the natural image dimensions for canvas coordinates
        const canvasX = relativeX * naturalWidth;
        const canvasY = relativeY * naturalHeight;
      
        return { x: canvasX, y: canvasY };
      };
    
      const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isMaskingToolActive) return;
        e.preventDefault();
        const coords = getScaledCoords(e);
        const canvas = maskCanvasRef.current;
        const image = imgRef.current;
        if (!coords || !canvas || !image) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const naturalWidth = image.naturalWidth;
        const naturalHeight = image.naturalHeight;
        const imageAspectRatio = naturalWidth / naturalHeight;
        const containerAspectRatio = image.clientWidth / image.clientHeight;
        
        let renderedWidth;
        if (imageAspectRatio > containerAspectRatio) {
            renderedWidth = image.clientWidth;
        } else {
            renderedWidth = image.clientHeight * imageAspectRatio;
        }
        const scale = naturalWidth / renderedWidth;
        ctx.lineWidth = 20 * scale;
        
        if (activeTool === 'remove') {
            ctx.strokeStyle = 'rgb(255, 0, 0)';
        } else { // For background-blur and change-color
            ctx.strokeStyle = 'rgb(255, 255, 255)';
        }
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        setIsDrawing(true);
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
      };
    
      const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !isMaskingToolActive) return;
        e.preventDefault();
        const coords = getScaledCoords(e);
        if (!coords) {
            stopDrawing();
            return;
        }

        const ctx = maskCanvasRef.current?.getContext('2d');
        if (!ctx) return;

        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      };
    
      const stopDrawing = () => {
        if (!isDrawing) return;
        const ctx = maskCanvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.closePath();
        }
        setIsDrawing(false);
      };

    const sharpnessValue = sharpness / 250; // Scale for kernel
    const sharpnessFilter = sharpness > 0 ? 'url(#sharpness-filter)' : '';

    const imageStyles: React.CSSProperties = {
        filter: `brightness(${brightness}%) contrast(${contrast}%) ${sharpnessFilter}`.trim(),
        transform: `rotate(${angle}deg)`,
        transition: 'transform 0.2s ease-in-out',
        maxWidth: '100%',
        maxHeight: '100%',
    };

    const scaledWrapperStyle: React.CSSProperties = {
        transform: `scale(${zoom})`,
        transformOrigin: 'center',
        transition: 'transform 0.1s ease-out',
        // The following properties are important for ReactCrop to work correctly when zoomed.
        display: 'inline-block',
        lineHeight: 0
    };

    const renderContent = () => {
        if (activeTool === 'web-search' && webSearchResults && processedImage) {
            return <WebSearchResultsViewer sourceImage={processedImage} results={webSearchResults} />;
        }

        if (generatedImages?.length) {
            return <GeneratedImageViewer images={generatedImages} onDownload={onDownloadGeneratedImage} />;
        }

        if (generatedMp4Url) {
            return (
                 <video src={generatedMp4Url} controls autoPlay loop style={imageStyles}>
                    Your browser does not support the video tag.
                 </video>
            );
        }
        
        if (activeTool === 'virtual-try-on' && virtualTryOnImage) {
            return (
                <div className="w-full h-full flex items-center justify-center p-4">
                    <GeneratedImageOption
                        image={virtualTryOnImage}
                        onDownload={(format) => onDownloadVirtualTryOnImage(virtualTryOnImage, format)}
                    />
                </div>
            );
        }

        if (activeTool === 'cartoonify' && cartoonImages?.length) {
            return <CartoonViewer images={cartoonImages} onDownload={onDownloadCartoon} />;
        }
        
        if (activeTool === 'art-effects' && artImages?.length) {
            return <ArtViewer images={artImages} onDownload={onDownloadArtImage} />;
        }

        if (activeTool === 'photo-shoot' && photoShootImages?.length) {
            return <PhotoShootViewer images={photoShootImages} onDownload={onDownloadPhotoShootImage} />;
        }

        if (activeTool === 'art-movements' && artMovementImages?.length) {
            return <ArtMovementViewer images={artMovementImages} onDownload={onDownloadArtMovementImage} />;
        }

        if (activeTool === 'hairstyle-trial' && hairstyleImages?.length) {
            return <HairstyleViewer images={hairstyleImages} onDownload={onDownloadHairstyleImage} />;
        }

        if (activeTool === 'black-and-white' && bwImages?.length) {
            return <BwViewer images={bwImages} onDownload={onDownloadBwImage} />;
        }

        if (activeTool === '3d-drawing' && threeDImages?.length) {
            return <ThreeDViewer images={threeDImages} onDownload={onDownloadThreeDImage} />;
        }

        if (activeTool === 'dollify' && dollImages?.length) {
            return <DollViewer images={dollImages} onDownload={onDownloadDollImage} />;
        }

        if (!processedImage) {
            return (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-gray-500">
                    <Image size={64}/>
                    <p className="mt-4 text-lg">Your image will appear here</p>
                </div>
            )
        }
        
        if (activeTool === 'crop') {
            return (
                <ReactCrop crop={crop} onChange={c => setCrop(c)}>
                    <img ref={imgRef} src={processedImage} alt="To crop" className="object-contain" style={imageStyles} />
                </ReactCrop>
            );
        }

        if (isMaskingToolActive) {
            return (
                <div
                  ref={drawingWrapperRef}
                  className="relative"
                  style={{ display: 'inline-block', cursor: 'crosshair', lineHeight: 0, ...imageStyles }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                >
                  <img ref={imgRef} src={processedImage} alt="To edit" className="max-w-full max-h-full object-contain" style={{ pointerEvents: 'none' }}/>
                  <canvas
                    ref={maskCanvasRef}
                    className="absolute top-0 left-0 w-full h-full"
                    style={{ opacity: 0.5, pointerEvents: 'none' }}
                  />
                </div>
            );
        }

        return <img ref={imgRef} src={processedImage} alt="Processed" className="object-contain" style={imageStyles} />;
    };

    return (
        <div className="relative lg:col-span-9 bg-black rounded-xl flex items-center justify-center p-4 overflow-hidden h-[85vh]">
            {isLoading && <LoadingIndicator message={loadingMessage} />}
            <svg style={{ position: 'absolute', height: 0, width: 0 }}>
                <defs>
                    <filter id="sharpness-filter">
                    <feConvolveMatrix
                        order="3"
                        kernelMatrix={`0 ${-sharpnessValue} 0 ${-sharpnessValue} ${1 + 4 * sharpnessValue} ${-sharpnessValue} 0 ${-sharpnessValue} 0`}
                    />
                    </filter>
                </defs>
            </svg>
            <div ref={viewerContainerRef} className="w-full h-full overflow-auto">
                <div className="w-full h-full flex items-center justify-center">
                    <div style={scaledWrapperStyle}>
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};
