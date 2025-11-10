import React, { useState, useEffect } from 'react';
import type { Tool, ImageFile, VideoFile, VideoInfo } from '../types';
import { Sparkles, Wand2, Palette, Crop as CropIcon, Expand, Download, Undo, Check, FileVideo, KeyRound, Upload, Brush, Trash2, Layers, SlidersHorizontal, RefreshCcw, ChevronDown, Smile, Droplets, UserCheck, BrainCircuit, Box, SmilePlus, Eye, ZoomIn, ZoomOut, Paintbrush, Globe, Scaling, Info, Shirt, Camera, GalleryThumbnails, Scissors, Pilcrow, Hourglass, Film, Shapes } from 'lucide-react';

interface ControlPanelProps {
  mediaType: 'image' | 'video' | null;
  imageFile: ImageFile | null;
  videoFile: VideoFile | null;
  videoInfo: VideoInfo | null;
  onAutoAdjust: () => void;
  onRestore: () => void;
  onColorize: () => void;
  onExpand: () => void;
  onRemoveBackground: () => void;
  onPortraitRetouch: () => void;
  onContextualText: () => void;
  contextualTextPrompt: string;
  setContextualTextPrompt: (prompt: string) => void;
  onCartoonify: () => void;
  onGenerateBwStyles: () => void;
  on3dDrawing: () => void;
  onDollify: () => void;
  onGenerateFavicons: () => void;
  onVectorize: () => void;
  onWebSearch: () => void;
  onGifToMp4: () => void;
  onCompactVideo: (quality: 'high' | 'medium' | 'low') => void;
  isApiKeySelected: boolean;
  setIsApiKeySelected: (isSelected: boolean) => void;
  onGenerateArtStyles: () => void;
  onArtMovements: () => void;
  onHoldMyDoll: () => void;
  onPhotoShoot: () => void;
  onHairstyleTrial: () => void;
  onAgeChange: () => void;
  onVirtualTryOn: (clothingDescription: string) => void;
  onCrop: () => void;
  onCropConfirm: () => void;
  onResize: (width: number, height: number) => void;
  currentDimensions: { width: number, height: number } | null;
  onRemoveObject: () => void;
  onApplyRemove: () => void;
  onBlurBackground: () => void;
  onApplyBlur: () => void;
  onChangeColor: () => void;
  onApplyColorChange: () => void;
  colorChangePrompt: string;
  setColorChangePrompt: (prompt: string) => void;
  onClearMask: () => void;
  onDownload: (format: 'jpeg' | 'png' | 'webp') => void;
  onVideoDownload: () => void;
  onUndo: () => void;
  onUploadNew: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isUndoDisabled: boolean;
  activeTool: Tool | null;
  isMediaLoaded: boolean;
  isEditingMode: boolean;
  isProcessedVideoReady: boolean;
  isLoading: boolean;
  brightness: number;
  setBrightness: (value: number) => void;
  contrast: number;
  setContrast: (value: number) => void;
  angle: number;
  setAngle: (value: number) => void;
  gamma: number;
  setGamma: (value: number) => void;
  sharpness: number;
  setSharpness: (value: number) => void;
  onResetAdjustments: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

const ControlButton: React.FC<{ icon: React.ReactNode, text: string, onClick: () => void, description?: string }> = ({ icon, text, onClick, description }) => (
    <button onClick={onClick} className="w-full flex items-center space-x-3 p-3 rounded-lg text-left text-gray-200 bg-gray-700 hover:bg-blue-600 transition-all duration-200 group">
        <div className="flex-shrink-0 bg-gray-800 p-2 rounded-md group-hover:bg-blue-700">{icon}</div>
        <div>
            <span className="font-medium">{text}</span>
            {description && <p className="text-xs text-gray-400 group-hover:text-gray-200">{description}</p>}
        </div>
    </button>
);

const formatBytes = (bytes: number | null, decimals = 2) => {
    if (bytes === null || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const ImageInfoCollapse: React.FC<{
    fileName: string | null;
    fileType: string | null;
    fileSize: number | null;
    dimensions: { width: number; height: number } | null;
}> = ({ fileName, fileType, fileSize, dimensions }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="bg-gray-800 rounded-lg">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-3 rounded-lg text-left font-medium bg-gray-700 text-gray-200 hover:bg-gray-600">
                <span className="flex items-center"><Info size={18} className="mr-2"/> Image Information</span>
                <ChevronDown size={20} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 flex-shrink-0 mr-2">Filename:</span>
                        <span className="font-mono text-gray-200 truncate text-right" title={fileName || ''}>{fileName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Dimensions:</span>
                        <span className="font-mono text-gray-200">{dimensions ? `${dimensions.width} x ${dimensions.height}` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Type:</span>
                        <span className="font-mono text-gray-200">{fileType || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Size:</span>
                        <span className="font-mono text-gray-200">{formatBytes(fileSize)}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

const VideoInfoCollapse: React.FC<{
    file: VideoFile | null;
    info: VideoInfo | null;
}> = ({ file, info }) => {
    const [isOpen, setIsOpen] = useState(true);

    const formatDuration = (seconds: number | undefined) => {
        if (seconds === undefined) return 'N/A';
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    return (
        <div className="bg-gray-800 rounded-lg">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-3 rounded-lg text-left font-medium bg-gray-700 text-gray-200 hover:bg-gray-600">
                <span className="flex items-center"><Info size={18} className="mr-2"/> Video Information</span>
                <ChevronDown size={20} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && file && (
                <div className="p-4 space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 flex-shrink-0 mr-2">Filename:</span>
                        <span className="font-mono text-gray-200 truncate text-right" title={file.name}>{file.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Resolution:</span>
                        <span className="font-mono text-gray-200">{info ? `${info.width} x ${info.height}` : 'Loading...'}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-gray-400">Duration:</span>
                        <span className="font-mono text-gray-200">{formatDuration(info?.duration)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Type:</span>
                        <span className="font-mono text-gray-200">{file.type}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Size:</span>
                        <span className="font-mono text-gray-200">{formatBytes(file.size)}</span>
                    </div>
                </div>
            )}
        </div>
    );
};


const AdjustmentControls: React.FC<Pick<ControlPanelProps, 'brightness' | 'setBrightness' | 'contrast' | 'setContrast' | 'angle' | 'setAngle' | 'gamma' | 'setGamma' | 'sharpness' | 'setSharpness' | 'onResetAdjustments'>> = 
({ brightness, setBrightness, contrast, setContrast, angle, setAngle, gamma, setGamma, sharpness, setSharpness, onResetAdjustments }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="bg-gray-800 rounded-lg">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-3 rounded-lg text-left font-medium bg-gray-700 text-gray-200 hover:bg-gray-600">
                <span className="flex items-center"><SlidersHorizontal size={18} className="mr-2"/> Adjustments</span>
                <ChevronDown size={20} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Brightness: {brightness}%</label>
                        <input type="range" min="0" max="200" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Contrast: {contrast}%</label>
                        <input type="range" min="0" max="200" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Gamma: {Number(gamma / 100).toFixed(2)}</label>
                        <input type="range" min="10" max="300" value={gamma} onChange={(e) => setGamma(Number(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Sharpness: {sharpness}%</label>
                        <input type="range" min="0" max="300" value={sharpness} onChange={(e) => setSharpness(Number(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Angle: {angle}°</label>
                        <input type="range" min="-180" max="180" value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
                    </div>
                    <div className="flex items-center space-x-2">
                         <button onClick={onResetAdjustments} className="w-full py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center">
                            <RefreshCcw size={16} className="mr-2"/> Reset Adjustments
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const ViewControls: React.FC<{
    activeTool: Tool | null;
    isMediaLoaded: boolean;
    onCrop: () => void;
    onCropConfirm: () => void;
    zoom: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onResetZoom: () => void;
}> = ({ activeTool, isMediaLoaded, onCrop, onCropConfirm, zoom, onZoomIn, onZoomOut, onResetZoom }) => {
    const [isOpen, setIsOpen] = useState(true);
    const nonZoomableTools: (Tool | null)[] = ['gif-to-mp4', 'cartoonify', '3d-drawing', 'dollify', 'generate', 'web-search', 'black-and-white', 'art-effects', 'photo-shoot', 'art-movements', 'hairstyle-trial', 'virtual-try-on', 'change-age', 'favicon', 'vectorize'];
    const isZoomable = isMediaLoaded && !nonZoomableTools.includes(activeTool);

    return (
        <div className="bg-gray-800 rounded-lg">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-3 rounded-lg text-left font-medium bg-gray-700 text-gray-200 hover:bg-gray-600">
                <span className="flex items-center"><Eye size={18} className="mr-2"/> View & Crop</span>
                <ChevronDown size={20} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 space-y-4">
                    {/* Zoom Controls */}
                    <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-400">Zoom</label>
                        <div className="flex items-center space-x-1 bg-gray-900 p-1 rounded-md">
                            <button onClick={onZoomOut} disabled={!isZoomable} className="p-1 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"><ZoomOut size={18} /></button>
                            <span className="w-12 text-center text-sm font-mono">{Math.round(zoom * 100)}%</span>
                            <button onClick={onZoomIn} disabled={!isZoomable} className="p-1 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"><ZoomIn size={18} /></button>
                            <button onClick={onResetZoom} disabled={!isZoomable} className="p-1 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"><RefreshCcw size={16} /></button>
                        </div>
                    </div>
                    {/* Crop Tool */}
                    <div>
                        <button onClick={onCrop} className={`w-full flex items-center p-3 rounded-lg text-left font-medium ${activeTool === 'crop' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}`}>
                            <CropIcon size={18} className="mr-2"/>
                            <span>Crop Tool</span>
                        </button>
                        {activeTool === 'crop' && (
                             <button onClick={onCropConfirm} className="w-full mt-2 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
                                <Check size={20} className="mr-2"/> Apply Crop
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const ResizeCollapse: React.FC<{
    onResize: (width: number, height: number) => void;
    currentDimensions: { width: number, height: number } | null;
}> = ({ onResize, currentDimensions }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [customWidth, setCustomWidth] = useState(currentDimensions?.width.toString() || '');
    const [customHeight, setCustomHeight] = useState(currentDimensions?.height.toString() || '');

    useEffect(() => {
        setCustomWidth(currentDimensions?.width.toString() || '');
        setCustomHeight(currentDimensions?.height.toString() || '');
    }, [currentDimensions]);

    const handleApplyCustom = () => {
        const width = Number(customWidth);
        const height = Number(customHeight);
        if (width > 0 && height > 0 && Number.isInteger(width) && Number.isInteger(height)) {
            onResize(width, height);
        } else {
            alert('Please enter valid, whole numbers for width and height.');
        }
    };
    
    const PresetButton: React.FC<{ text: string, w: number, h: number }> = ({ text, w, h }) => (
        <button onClick={() => onResize(w,h)} className="w-full text-left p-2 rounded-md bg-gray-700 hover:bg-blue-600 transition-colors">
            {text} <span className="text-xs text-gray-400">({w}x{h})</span>
        </button>
    );

    return (
        <div className="bg-gray-800 rounded-lg">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-3 rounded-lg text-left font-medium bg-gray-700 text-gray-200 hover:bg-gray-600">
                <span className="flex items-center"><Scaling size={18} className="mr-2"/> Resize Image</span>
                <ChevronDown size={20} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 space-y-4">
                    <div className="text-center text-sm text-gray-400 bg-gray-900 p-2 rounded-md">
                        Current Size: <span className="font-mono">{currentDimensions ? `${currentDimensions.width} x ${currentDimensions.height}` : 'N/A'}</span>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-300 mb-2">Social Media Presets</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <PresetButton text="IG Square" w={1080} h={1080} />
                            <PresetButton text="IG Portrait" w={1080} h={1350} />
                            <PresetButton text="IG Story" w={1080} h={1920} />
                            <PresetButton text="Facebook Post" w={1200} h={630} />
                            <PresetButton text="Twitter Post" w={1600} h={900} />
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-300 mb-2">Custom Size</h4>
                        <div className="flex items-center space-x-2">
                            <input
                                type="number"
                                placeholder="Width"
                                value={customWidth}
                                onChange={(e) => setCustomWidth(e.target.value)}
                                className="w-full p-2 bg-gray-700 text-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            <span className="text-gray-400">x</span>
                            <input
                                type="number"
                                placeholder="Height"
                                value={customHeight}
                                onChange={(e) => setCustomHeight(e.target.value)}
                                className="w-full p-2 bg-gray-700 text-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <button onClick={handleApplyCustom} className="w-full mt-2 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
                            <Check size={20} className="mr-2"/> Apply Custom Size
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const AIFunctionsCollapse: React.FC<{
    onRestore: () => void;
    onPortraitRetouch: () => void;
    onColorize: () => void;
    onExpand: () => void;
    onRemoveBackground: () => void;
    onContextualText: () => void;
    contextualTextPrompt: string;
    setContextualTextPrompt: (value: string) => void;
    onCartoonify: () => void;
    onGenerateBwStyles: () => void;
    on3dDrawing: () => void;
    onDollify: () => void;
    onHoldMyDoll: () => void;
    onPhotoShoot: () => void;
    onHairstyleTrial: () => void;
    onAgeChange: () => void;
    onGenerateFavicons: () => void;
    onVectorize: () => void;
    onWebSearch: () => void;
    onGifToMp4: () => void;
    imageFile: ImageFile | null;
    isApiKeySelected: boolean;
    setIsApiKeySelected: (isSelected: boolean) => void;
    isMediaLoaded: boolean;
  }> = (props) => {
      const [isOpen, setIsOpen] = useState(true);
  
      return (
          <div className="bg-gray-800 rounded-lg">
              <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-3 rounded-lg text-left font-medium bg-gray-700 text-gray-200 hover:bg-gray-600">
                  <span className="flex items-center"><BrainCircuit size={18} className="mr-2"/> AI Functions</span>
                  <ChevronDown size={20} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                  <div className="p-4 space-y-3">
                      <ControlButton icon={<Wand2 size={20} />} text="Restore Photo" onClick={props.onRestore} />
                      <ControlButton icon={<UserCheck size={20} />} text="Retouch Portrait" onClick={props.onPortraitRetouch} />
                      <ControlButton icon={<Palette size={20} />} text="Colorize" onClick={props.onColorize} />
                      <ControlButton icon={<Droplets size={20} />} text="Generate B&W Styles" onClick={props.onGenerateBwStyles} />
                      <ControlButton icon={<Expand size={20} />} text="Expand Image" onClick={props.onExpand} />
                      <ControlButton icon={<Layers size={20} />} text="Remove Background" onClick={props.onRemoveBackground} />
                      <ControlButton icon={<Smile size={20} />} text="Cartoonify" onClick={props.onCartoonify} />
                      <ControlButton icon={<Box size={20} />} text="Transform to 3D Drawing" onClick={props.on3dDrawing} />
                      <ControlButton icon={<SmilePlus size={20} />} text="Dollify" onClick={props.onDollify} />
                      <ControlButton icon={<SmilePlus size={20} />} text="Hold My Doll" onClick={props.onHoldMyDoll} description="Creates a doll of you and puts it in your hands." />
                      <ControlButton icon={<Camera size={20} />} text="AI Photo Shoot" onClick={props.onPhotoShoot} description="Generate 4 new poses in 4 new scenes." />
                      <ControlButton icon={<Scissors size={20} />} text="Hairstyle Trial" onClick={props.onHairstyleTrial} description="Try on 4 different hairstyles." />
                      <ControlButton icon={<Hourglass size={20} />} text="Change Age" onClick={props.onAgeChange} description="See yourself as a baby and as elderly." />
                      <ControlButton icon={<Globe size={20} />} text="Generate Favicon" onClick={props.onGenerateFavicons} description="Create icon set for your website." />
                      <ControlButton icon={<Shapes size={20} />} text="Convert to Vector (SVG)" onClick={props.onVectorize} description="Create a scalable vector graphic." />
                      <ControlButton icon={<Globe size={20} />} text="Web Image Search" onClick={props.onWebSearch} />
                      
                      <div className="bg-gray-900 p-4 rounded-lg space-y-3">
                          <h3 className="font-semibold text-white flex items-center"><Pilcrow size={18} className="mr-2" />Contextual Text</h3>
                          <textarea
                              value={props.contextualTextPrompt}
                              onChange={(e) => props.setContextualTextPrompt(e.target.value)}
                              placeholder="e.g., Happy Birthday, Summer 2024..."
                              className="w-full h-24 p-2 bg-gray-700 text-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                          <button
                              onClick={props.onContextualText}
                              disabled={!props.contextualTextPrompt.trim() || !props.isMediaLoaded}
                              className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              <Pilcrow size={20} className="mr-2" /> Add Text to Image
                          </button>
                      </div>

                      {props.imageFile?.type === 'image/gif' && (
                        <div className="bg-gray-900 p-4 rounded-lg space-y-3">
                            <h3 className="font-semibold text-white flex items-center"><FileVideo size={18} className="mr-2" />Convert GIF to MP4</h3>
                            <p className="text-sm text-gray-400">Convert your animated GIF into a high-quality video file.</p>
                            {!props.isApiKeySelected ? (
                                <div className="text-center p-2 bg-yellow-900/50 rounded-lg">
                                  <p className="text-sm text-yellow-300 mb-2">Video conversion requires an API key.</p>
                                  <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline mb-2 block">Learn about billing</a>
                                  <button 
                                      onClick={async () => {
                                          if (window.aistudio && window.aistudio.openSelectKey) {
                                            await window.aistudio.openSelectKey();
                                            props.setIsApiKeySelected(true);
                                          }
                                      }}
                                      className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                                  >
                                      <KeyRound size={20} className="mr-2" /> Select API Key
                                  </button>
                              </div>
                          ) : (
                              <button
                                  onClick={props.onGifToMp4}
                                  disabled={!props.isMediaLoaded}
                                  className="w-full py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                  <FileVideo size={20} className="mr-2" /> Convert to MP4
                              </button>
                          )}
                        </div>
                      )}
                  </div>
              )}
          </div>
      );
}

const ArtisticEffectsCollapse: React.FC<{
    onGenerateArtStyles: () => void;
    onArtMovements: () => void;
  }> = (props) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="bg-gray-800 rounded-lg">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-3 rounded-lg text-left font-medium bg-gray-700 text-gray-200 hover:bg-gray-600">
                <span className="flex items-center"><Paintbrush size={18} className="mr-2"/> Artistic Effects</span>
                <ChevronDown size={20} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 space-y-3">
                    <ControlButton 
                        icon={<Palette size={20} />} 
                        text="Generate B&W Styles" 
                        onClick={props.onGenerateArtStyles} 
                        description="Create 4 artistic black & white variations." 
                    />
                    <ControlButton 
                        icon={<GalleryThumbnails size={20} />} 
                        text="Art Movements" 
                        onClick={props.onArtMovements} 
                        description="Recreate image in 4 famous art styles." 
                    />
                </div>
            )}
        </div>
    );
};

const VirtualTryOnCollapse: React.FC<{
    onVirtualTryOn: (clothingDescription: string) => void;
}> = ({ onVirtualTryOn }) => {
    const [isOpen, setIsOpen] = useState(true);
    const clothingOptions = [
        { name: "Black Tuxedo", prompt: "A classic black tuxedo with a white shirt and bow tie." },
        { name: "Red Gown", prompt: "A vibrant red, floor-length evening gown." },
        { name: "Leather Jacket", prompt: "A casual outfit with blue jeans, a white t-shirt, and a brown leather jacket." },
        { name: "Summer Dress", prompt: "A light and airy summer dress with a floral pattern." },
        { name: "Business Suit", prompt: "A sharp, modern dark grey business suit with a light blue shirt." },
        { name: "Athleisure Wear", prompt: "Comfortable and stylish athleisure wear, including joggers and a hoodie." },
    ];

    return (
        <div className="bg-gray-800 rounded-lg">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-3 rounded-lg text-left font-medium bg-gray-700 text-gray-200 hover:bg-gray-600">
                <span className="flex items-center"><Shirt size={18} className="mr-2"/> Virtual Try-On</span>
                <ChevronDown size={20} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4">
                    <p className="text-sm text-gray-400 mb-3 text-center">Select an outfit to try on. The AI will place your face on a model wearing the selected clothes.</p>
                    <div className="grid grid-cols-2 gap-2">
                        {clothingOptions.map(option => (
                            <button key={option.name} onClick={() => onVirtualTryOn(option.prompt)} className="p-3 bg-gray-700 rounded-lg text-white font-medium hover:bg-blue-600 transition-colors text-center">
                                {option.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const VideoToolsCollapse: React.FC<{
    onCompactVideo: (quality: 'high' | 'medium' | 'low') => void;
    isApiKeySelected: boolean;
    setIsApiKeySelected: (isSelected: boolean) => void;
}> = ({ onCompactVideo, isApiKeySelected, setIsApiKeySelected }) => {
    const [isOpen, setIsOpen] = useState(true);

    const qualityOptions: {key: 'high' | 'medium' | 'low'; label: string; description: string}[] = [
        { key: 'high', label: 'High Quality', description: 'Best balance of quality and size.' },
        { key: 'medium', label: 'Good Quality', description: 'Smaller file, minimal quality loss.' },
        { key: 'low', label: 'Smallest File', description: 'Maximum compression.' },
    ];

    const content = (
        <div className="p-4 space-y-3">
            <p className="text-sm text-gray-400 text-center">Reduce file size and convert to a web-friendly MP4 format.</p>
            {qualityOptions.map(({ key, label, description }) => (
                <button
                    key={key}
                    onClick={() => onCompactVideo(key)}
                    className="w-full text-left p-3 rounded-lg bg-gray-700 hover:bg-blue-600 transition-colors group"
                >
                    <div className="font-medium text-gray-200">{label}</div>
                    <div className="text-xs text-gray-400 group-hover:text-gray-200">{description}</div>
                </button>
            ))}
        </div>
    );

    const apiKeyPrompt = (
         <div className="p-4 space-y-3">
             <div className="text-center p-2 bg-yellow-900/50 rounded-lg">
                <p className="text-sm text-yellow-300 mb-2">Video processing requires an API key.</p>
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline mb-2 block">Learn about billing</a>
                <button 
                    onClick={async () => {
                        if (window.aistudio && window.aistudio.openSelectKey) {
                          await window.aistudio.openSelectKey();
                          setIsApiKeySelected(true);
                        }
                    }}
                    className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                    <KeyRound size={20} className="mr-2" /> Select API Key
                </button>
            </div>
        </div>
    );

    return (
        <div className="bg-gray-800 rounded-lg">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-3 rounded-lg text-left font-medium bg-gray-700 text-gray-200 hover:bg-gray-600">
                <span className="flex items-center"><Film size={18} className="mr-2"/> Compact & Convert Video</span>
                <ChevronDown size={20} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (isApiKeySelected ? content : apiKeyPrompt)}
        </div>
    );
}

export const ControlPanel: React.FC<ControlPanelProps> = (props) => {
    const [showDownloadOptions, setShowDownloadOptions] = useState(false);

    const isImageMode = props.mediaType === 'image';
    const isVideoMode = props.mediaType === 'video';

    return (
        <div className="bg-gray-900 rounded-xl p-4 flex flex-col space-y-4">
            <h2 className="text-xl font-bold text-center border-b border-gray-700 pb-2">Tools</h2>
            
            <div>
                <input
                    type="file"
                    id="new-file-upload"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
                    onChange={props.onUploadNew}
                />
                <label
                    htmlFor="new-file-upload"
                    className="w-full flex items-center justify-center space-x-2 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors cursor-pointer"
                >
                    <Upload size={20} />
                    <span>Upload New File</span>
                </label>
            </div>
            
            {isImageMode && (
              <>
                <ImageInfoCollapse
                    fileName={props.imageFile?.name || null}
                    fileType={props.imageFile?.type || null}
                    fileSize={props.imageFile?.size || null}
                    dimensions={props.currentDimensions}
                />

                <h2 className="text-xl font-bold text-center border-b border-gray-700 pb-2">Image Editing Tools</h2>
                
                <ControlButton icon={<Sparkles size={20} />} text="Auto-Adjust" onClick={props.onAutoAdjust} />

                <AIFunctionsCollapse
                    onRestore={props.onRestore}
                    onPortraitRetouch={props.onPortraitRetouch}
                    onColorize={props.onColorize}
                    onExpand={props.onExpand}
                    onRemoveBackground={props.onRemoveBackground}
                    onContextualText={props.onContextualText}
                    contextualTextPrompt={props.contextualTextPrompt}
                    setContextualTextPrompt={props.setContextualTextPrompt}
                    onCartoonify={props.onCartoonify}
                    onGenerateBwStyles={props.onGenerateBwStyles}
                    on3dDrawing={props.on3dDrawing}
                    onDollify={props.onDollify}
                    onHoldMyDoll={props.onHoldMyDoll}
                    onPhotoShoot={props.onPhotoShoot}
                    onHairstyleTrial={props.onHairstyleTrial}
                    onAgeChange={props.onAgeChange}
                    onGenerateFavicons={props.onGenerateFavicons}
                    onVectorize={props.onVectorize}
                    onWebSearch={props.onWebSearch}
                    onGifToMp4={props.onGifToMp4}
                    imageFile={props.imageFile}
                    isApiKeySelected={props.isApiKeySelected}
                    setIsApiKeySelected={props.setIsApiKeySelected}
                    isMediaLoaded={props.isMediaLoaded}
                />

                <VirtualTryOnCollapse onVirtualTryOn={props.onVirtualTryOn} />

                <ArtisticEffectsCollapse
                    onGenerateArtStyles={props.onGenerateArtStyles}
                    onArtMovements={props.onArtMovements}
                />

                <ViewControls
                    activeTool={props.activeTool}
                    isMediaLoaded={props.isMediaLoaded}
                    onCrop={props.onCrop}
                    onCropConfirm={props.onCropConfirm}
                    zoom={props.zoom}
                    onZoomIn={props.onZoomIn}
                    onZoomOut={props.onZoomOut}
                    onResetZoom={props.onResetZoom}
                />

                <ResizeCollapse
                    onResize={props.onResize}
                    currentDimensions={props.currentDimensions}
                />

                <AdjustmentControls 
                    brightness={props.brightness}
                    setBrightness={props.setBrightness}
                    contrast={props.contrast}
                    setContrast={props.setContrast}
                    angle={props.angle}
                    setAngle={props.setAngle}
                    gamma={props.gamma}
                    setGamma={props.setGamma}
                    sharpness={props.sharpness}
                    setSharpness={props.setSharpness}
                    onResetAdjustments={props.onResetAdjustments}
                />

                <div className="bg-gray-800 p-4 rounded-lg space-y-3">
                    <button onClick={props.onRemoveObject} className={`w-full flex items-center justify-between p-3 rounded-lg text-left font-medium ${props.activeTool === 'remove' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}`}>
                        <span className="flex items-center"><Brush size={18} className="mr-2"/> Remove Object</span>
                    </button>
                    {props.activeTool === 'remove' && (
                        <div className="space-y-2 pt-2">
                            <p className="text-xs text-gray-400 text-center">Draw in red to mark areas for removal.</p>
                            <button onClick={props.onClearMask} className="w-full mt-2 py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center">
                                <Trash2 size={20} className="mr-2"/> Clear Mask
                            </button>
                            <button onClick={props.onApplyRemove} className="w-full mt-2 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
                                <Check size={20} className="mr-2"/> Apply Removal
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg space-y-3">
                    <button onClick={props.onBlurBackground} className={`w-full flex items-center justify-between p-3 rounded-lg text-left font-medium ${props.activeTool === 'background-blur' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}`}>
                        <span className="flex items-center"><Droplets size={18} className="mr-2"/> Background Blur</span>
                    </button>
                    {props.activeTool === 'background-blur' && (
                        <div className="space-y-2 pt-2">
                            <p className="text-xs text-gray-400 text-center">Draw to mark the area to keep in focus.</p>
                            <button onClick={props.onClearMask} className="w-full mt-2 py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center">
                                <Trash2 size={20} className="mr-2"/> Clear Mask
                            </button>
                            <button onClick={props.onApplyBlur} className="w-full mt-2 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
                                <Check size={20} className="mr-2"/> Apply Blur
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-gray-800 p-4 rounded-lg space-y-3">
                    <button onClick={props.onChangeColor} className={`w-full flex items-center justify-between p-3 rounded-lg text-left font-medium ${props.activeTool === 'change-color' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}`}>
                        <span className="flex items-center"><Palette size={18} className="mr-2"/> Change Color</span>
                    </button>
                    {props.activeTool === 'change-color' && (
                        <div className="space-y-2 pt-2">
                            <p className="text-xs text-gray-400 text-center">Draw to mark the area to recolor.</p>
                            <input
                                type="text"
                                placeholder="e.g., 'bright red' or 'sky blue'"
                                value={props.colorChangePrompt}
                                onChange={(e) => props.setColorChangePrompt(e.target.value)}
                                className="w-full mt-1 p-2 bg-gray-700 text-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            <button onClick={props.onClearMask} className="w-full mt-2 py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center">
                                <Trash2 size={20} className="mr-2"/> Clear Mask
                            </button>
                            <button onClick={props.onApplyColorChange} className="w-full mt-2 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
                                <Check size={20} className="mr-2"/> Apply Color Change
                            </button>
                        </div>
                    )}
                </div>
              </>
            )}

            {isVideoMode && (
                <>
                    <VideoInfoCollapse file={props.videoFile} info={props.videoInfo} />
                    <h2 className="text-xl font-bold text-center border-b border-gray-700 pb-2">Video Editing Tools</h2>
                    <VideoToolsCollapse
                        onCompactVideo={props.onCompactVideo}
                        isApiKeySelected={props.isApiKeySelected}
                        setIsApiKeySelected={props.setIsApiKeySelected}
                    />
                </>
            )}

            <div className="pt-4 mt-auto space-y-2">
                {isImageMode && (
                    <button onClick={props.onUndo} disabled={props.isUndoDisabled} className="w-full flex items-center justify-center space-x-2 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <Undo size={20} />
                        <span>Undo</span>
                    </button>
                )}
                {isImageMode && (
                    <div className="relative">
                        <button 
                          onClick={() => setShowDownloadOptions(!showDownloadOptions)} 
                          disabled={!props.isMediaLoaded || props.activeTool === 'cartoonify' || props.activeTool === 'generate' || props.activeTool === '3d-drawing' || props.activeTool === 'dollify' || props.activeTool === 'black-and-white' || props.activeTool === 'art-effects' || props.activeTool === 'photo-shoot' || props.activeTool === 'art-movements' || props.activeTool === 'hairstyle-trial' || props.activeTool === 'virtual-try-on' || props.activeTool === 'change-age' || props.activeTool === 'favicon' || props.activeTool === 'vectorize'}
                          className="w-full flex items-center justify-center space-x-2 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <Download size={20} />
                            <span>Save Image</span>
                        </button>
                        {showDownloadOptions && (
                            <div className="absolute bottom-full mb-2 w-full bg-gray-700 rounded-lg shadow-xl p-2 space-y-1">
                                <button onClick={() => { props.onDownload('jpeg'); setShowDownloadOptions(false); }} className="w-full text-left p-2 hover:bg-gray-600 rounded">as JPEG</button>
                                <button onClick={() => { props.onDownload('png'); setShowDownloadOptions(false); }} className="w-full text-left p-2 hover:bg-gray-600 rounded">as PNG</button>
                                <button onClick={() => { props.onDownload('webp'); setShowDownloadOptions(false); }} className="w-full text-left p-2 hover:bg-gray-600 rounded">as WEBP</button>
                            </div>
                        )}
                    </div>
                )}
                 {isVideoMode && (
                    <button 
                        onClick={props.onVideoDownload} 
                        disabled={!props.isProcessedVideoReady}
                        className="w-full flex items-center justify-center space-x-2 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download size={20} />
                        <span>Save Video as MP4</span>
                    </button>
                )}
            </div>
        </div>
    );
};
