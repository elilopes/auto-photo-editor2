import React, { useState, useEffect } from 'react';
import type { Tool, ImageFile } from '../types';
// Fix: Replaced non-existent 'Cube' icon with 'Box' from lucide-react.
import { Sparkles, Wand2, Palette, Crop as CropIcon, Expand, Download, Undo, Check, Film, KeyRound, Upload, Brush, Trash2, Layers, SlidersHorizontal, RefreshCcw, ChevronDown, Smile, Droplets, UserCheck, BrainCircuit, Box, SmilePlus, Eye, ZoomIn, ZoomOut, Paintbrush, Globe, Scaling, Info } from 'lucide-react';

interface ControlPanelProps {
  imageFile: ImageFile | null;
  onAutoAdjust: () => void;
  onRestore: () => void;
  onColorize: () => void;
  onExpand: () => void;
  onRemoveBackground: () => void;
  onPortraitRetouch: () => void;
  onCartoonify: () => void;
  on3dDrawing: () => void;
  onDollify: () => void;
  onGenerateImages: (prompt: string) => void;
  onWebSearch: () => void;
  onAnimate: (prompt: string) => void;
  isApiKeySelected: boolean;
  setIsApiKeySelected: (isSelected: boolean) => void;
  onClassicBW: () => void;
  onHighContrastBW: () => void;
  onSepia: () => void;
  onBlueTone: () => void;
  onLomo: () => void;
  onVintageFade: () => void;
  onGoldenHour: () => void;
  onCyberpunk: () => void;
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
  onUndo: () => void;
  onUploadNew: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isUndoDisabled: boolean;
  activeTool: Tool | null;
  isImageLoaded: boolean;
  isEditingMode: boolean;
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

const ImageInfoCollapse: React.FC<{
    fileName: string | null;
    fileType: string | null;
    fileSize: number | null;
    dimensions: { width: number; height: number } | null;
}> = ({ fileName, fileType, fileSize, dimensions }) => {
    const [isOpen, setIsOpen] = useState(true);

    const formatBytes = (bytes: number | null, decimals = 2) => {
        if (bytes === null || bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

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
    isImageLoaded: boolean;
    onCrop: () => void;
    onCropConfirm: () => void;
    zoom: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onResetZoom: () => void;
}> = ({ activeTool, isImageLoaded, onCrop, onCropConfirm, zoom, onZoomIn, onZoomOut, onResetZoom }) => {
    const [isOpen, setIsOpen] = useState(true);
    const nonZoomableTools: (Tool | null)[] = ['video', 'cartoonify', '3d-drawing', 'dollify', 'generate', 'web-search'];
    const isZoomable = isImageLoaded && !nonZoomableTools.includes(activeTool);

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
    onCartoonify: () => void;
    on3dDrawing: () => void;
    onDollify: () => void;
    onWebSearch: () => void;
    onAnimate: (prompt: string) => void;
    animationPrompt: string;
    setAnimationPrompt: (value: string) => void;
    onGenerateImages: (prompt: string) => void;
    generationPrompt: string;
    setGenerationPrompt: (value: string) => void;
    isApiKeySelected: boolean;
    setIsApiKeySelected: (isSelected: boolean) => void;
    isImageLoaded: boolean;
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
                      <ControlButton icon={<Expand size={20} />} text="Expand Image" onClick={props.onExpand} />
                      <ControlButton icon={<Layers size={20} />} text="Remove Background" onClick={props.onRemoveBackground} />
                      <ControlButton icon={<Smile size={20} />} text="Cartoonify" onClick={props.onCartoonify} />
                      <ControlButton icon={<Box size={20} />} text="Transform to 3D Drawing" onClick={props.on3dDrawing} />
                      <ControlButton icon={<SmilePlus size={20} />} text="Dollify" onClick={props.onDollify} />
                      <ControlButton icon={<Globe size={20} />} text="Web Image Search" onClick={props.onWebSearch} />
                      
                      <div className="bg-gray-900 p-4 rounded-lg space-y-3">
                          <h3 className="font-semibold text-white flex items-center"><Film size={18} className="mr-2" />Animate Image</h3>
                          <textarea
                              value={props.animationPrompt}
                              onChange={(e) => props.setAnimationPrompt(e.target.value)}
                              placeholder="e.g., make the clouds move, add ripples to the water..."
                              className="w-full h-24 p-2 bg-gray-700 text-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                          {!props.isApiKeySelected ? (
                               <div className="text-center p-2 bg-yellow-900/50 rounded-lg">
                                  <p className="text-sm text-yellow-300 mb-2">Video generation requires an API key.</p>
                                  <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline mb-2 block">Learn about billing</a>
                                  <button 
                                      onClick={async () => {
                                          await window.aistudio.openSelectKey();
                                          props.setIsApiKeySelected(true);
                                      }}
                                      className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                                  >
                                      <KeyRound size={20} className="mr-2" /> Select API Key
                                  </button>
                              </div>
                          ) : (
                              <button
                                  onClick={() => props.onAnimate(props.animationPrompt)}
                                  disabled={!props.animationPrompt.trim() || !props.isImageLoaded}
                                  className="w-full py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                  <Film size={20} className="mr-2" /> Generate Video
                              </button>
                          )}
                      </div>
  
                       <div className="bg-gray-900 p-4 rounded-lg space-y-3">
                          <h3 className="font-semibold text-white flex items-center"><Sparkles size={18} className="mr-2" />Generate from Text</h3>
                          <textarea
                              value={props.generationPrompt}
                              onChange={(e) => props.setGenerationPrompt(e.target.value)}
                              placeholder="e.g., a cute cat astronaut on the moon, cinematic lighting..."
                              className="w-full h-24 p-2 bg-gray-700 text-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                          {!props.isApiKeySelected ? (
                              <div className="text-center p-2 bg-yellow-900/50 rounded-lg">
                                  <p className="text-sm text-yellow-300 mb-2">Image generation requires an API key.</p>
                                  <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline mb-2 block">Learn about billing</a>
                                  <button 
                                      onClick={async () => {
                                          await window.aistudio.openSelectKey();
                                          props.setIsApiKeySelected(true);
                                      }}
                                      className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                                  >
                                      <KeyRound size={20} className="mr-2" /> Select API Key
                                  </button>
                              </div>
                          ) : (
                              <button
                                  onClick={() => props.onGenerateImages(props.generationPrompt)}
                                  disabled={!props.generationPrompt.trim()}
                                  className="w-full py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                  <Sparkles size={20} className="mr-2" /> Generate 4 Images
                              </button>
                          )}
                      </div>
                  </div>
              )}
          </div>
      );
}

const ArtisticEffectsCollapse: React.FC<{
    onClassicBW: () => void;
    onHighContrastBW: () => void;
    onSepia: () => void;
    onBlueTone: () => void;
    onLomo: () => void;
    onVintageFade: () => void;
    onGoldenHour: () => void;
    onCyberpunk: () => void;
  }> = (props) => {
    const [isOpen, setIsOpen] = useState(true);
    const [activeSubMenu, setActiveSubMenu] = useState<'bw' | 'art' | null>(null);

    return (
        <div className="bg-gray-800 rounded-lg">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-3 rounded-lg text-left font-medium bg-gray-700 text-gray-200 hover:bg-gray-600">
                <span className="flex items-center"><Paintbrush size={18} className="mr-2"/> Artistic Effects</span>
                <ChevronDown size={20} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 space-y-3">
                    {/* B&W Styles */}
                    <button onClick={() => setActiveSubMenu(activeSubMenu === 'bw' ? null : 'bw')} className="w-full flex items-center justify-between p-3 rounded-lg text-left font-medium bg-gray-700 text-gray-200 hover:bg-gray-600">
                        <span className="flex items-center"><Droplets size={18} className="mr-2"/> Black & White Styles</span>
                        <ChevronDown size={20} className={`transition-transform duration-200 ${activeSubMenu === 'bw' ? 'rotate-180' : ''}`} />
                    </button>
                    {activeSubMenu === 'bw' && (
                        <div className="pl-4 pt-2 space-y-2 border-l-2 border-gray-600">
                            <ControlButton onClick={props.onClassicBW} icon={<></>} text="Classic" description="Balanced grayscale conversion." />
                            <ControlButton onClick={props.onHighContrastBW} icon={<></>} text="High Contrast" description="Dramatic, punchy B&W." />
                            <ControlButton onClick={props.onSepia} icon={<></>} text="Sepia" description="Warm, vintage brown tint." />
                            <ControlButton onClick={props.onBlueTone} icon={<></>} text="Blue Tone" description="Cool, cyanotype effect." />
                        </div>
                    )}
                    {/* Art Effects */}
                    <button onClick={() => setActiveSubMenu(activeSubMenu === 'art' ? null : 'art')} className="w-full flex items-center justify-between p-3 rounded-lg text-left font-medium bg-gray-700 text-gray-200 hover:bg-gray-600">
                        <span className="flex items-center"><Palette size={18} className="mr-2"/> Art Effects</span>
                        <ChevronDown size={20} className={`transition-transform duration-200 ${activeSubMenu === 'art' ? 'rotate-180' : ''}`} />
                    </button>
                    {activeSubMenu === 'art' && (
                        <div className="pl-4 pt-2 space-y-2 border-l-2 border-gray-600">
                           <ControlButton onClick={props.onLomo} icon={<></>} text="Lomo" description="Saturated, high-contrast look." />
                           <ControlButton onClick={props.onVintageFade} icon={<></>} text="Vintage Fade" description="Retro, washed-out colors." />
                           <ControlButton onClick={props.onGoldenHour} icon={<></>} text="Golden Hour" description="Soft, warm sunset glow." />
                           <ControlButton onClick={props.onCyberpunk} icon={<></>} text="Cyberpunk" description="Futuristic neon highlights." />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export const ControlPanel: React.FC<ControlPanelProps> = (props) => {
    const [showDownloadOptions, setShowDownloadOptions] = useState(false);
    const [animationPrompt, setAnimationPrompt] = useState('');
    const [generationPrompt, setGenerationPrompt] = useState('');

    return (
        <div className="lg:col-span-3 bg-gray-900 rounded-xl p-4 flex flex-col space-y-4 overflow-y-auto">
            <h2 className="text-xl font-bold text-center border-b border-gray-700 pb-2">Tools</h2>
            
            <div>
                <input
                    type="file"
                    id="new-file-upload"
                    className="hidden"
                    accept="image/jpeg, image/png, image/webp"
                    onChange={props.onUploadNew}
                />
                <label
                    htmlFor="new-file-upload"
                    className="w-full flex items-center justify-center space-x-2 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors cursor-pointer"
                >
                    <Upload size={20} />
                    <span>Upload New Image</span>
                </label>
            </div>
            
            {props.isEditingMode && (
              <>
                <ImageInfoCollapse
                    fileName={props.imageFile?.name || null}
                    fileType={props.imageFile?.type || null}
                    fileSize={props.imageFile?.size || null}
                    dimensions={props.currentDimensions}
                />

                <h2 className="text-xl font-bold text-center border-b border-gray-700 pb-2">Editing Tools</h2>
                
                <ControlButton icon={<Sparkles size={20} />} text="Auto-Adjust" onClick={props.onAutoAdjust} />

                <AIFunctionsCollapse
                    onRestore={props.onRestore}
                    onPortraitRetouch={props.onPortraitRetouch}
                    onColorize={props.onColorize}
                    onExpand={props.onExpand}
                    onRemoveBackground={props.onRemoveBackground}
                    onCartoonify={props.onCartoonify}
                    on3dDrawing={props.on3dDrawing}
                    onDollify={props.onDollify}
                    onWebSearch={props.onWebSearch}
                    onAnimate={props.onAnimate}
                    animationPrompt={animationPrompt}
                    setAnimationPrompt={setAnimationPrompt}
                    onGenerateImages={props.onGenerateImages}
                    generationPrompt={generationPrompt}
                    setGenerationPrompt={setGenerationPrompt}
                    isApiKeySelected={props.isApiKeySelected}
                    setIsApiKeySelected={props.setIsApiKeySelected}
                    isImageLoaded={props.isImageLoaded}
                />

                <ArtisticEffectsCollapse
                    onClassicBW={props.onClassicBW}
                    onHighContrastBW={props.onHighContrastBW}
                    onSepia={props.onSepia}
                    onBlueTone={props.onBlueTone}
                    onLomo={props.onLomo}
                    onVintageFade={props.onVintageFade}
                    onGoldenHour={props.onGoldenHour}
                    onCyberpunk={props.onCyberpunk}
                />

                <ViewControls
                    activeTool={props.activeTool}
                    isImageLoaded={props.isImageLoaded}
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
            
            <div className="pt-4 mt-auto space-y-2">
                <button onClick={props.onUndo} disabled={props.isUndoDisabled} className="w-full flex items-center justify-center space-x-2 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <Undo size={20} />
                    <span>Undo</span>
                </button>
                <div className="relative">
                    <button 
                      onClick={() => setShowDownloadOptions(!showDownloadOptions)} 
                      disabled={!props.isImageLoaded || props.activeTool === 'cartoonify' || props.activeTool === 'generate' || props.activeTool === '3d-drawing' || props.activeTool === 'dollify'}
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
            </div>
        </div>
    );
};