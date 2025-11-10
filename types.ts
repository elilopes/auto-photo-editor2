import type { Crop } from 'react-image-crop';

export interface ImageFile {
  name: string;
  type: string;
  base64: string;
  size: number;
}

export interface VideoFile {
  name: string;
  type: string;
  url: string; // Blob URL for local playback
  file: File; // The original File object
  size: number;
}

export interface VideoInfo {
    width: number;
    height: number;
    duration: number;
}

export type Tool = 'restore' | 'colorize' | 'crop' | 'expand' | 'gif-to-mp4' | 'remove' | 'remove-background' | 'adjust' | 'cartoonify' | 'background-blur' | 'portrait-retouch' | 'generate' | 'auto-adjust' | '3d-drawing' | 'dollify' | 'change-color' | 'black-and-white' | 'art-effects' | 'web-search' | 'resize' | 'hold-my-doll' | 'photo-shoot' | 'art-movements' | 'hairstyle-trial' | 'contextual-text' | 'virtual-try-on' | 'change-age' | 'compact-video' | 'favicon' | 'vectorize' | 'json-prompt-builder';