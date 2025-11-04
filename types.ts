import type { Crop } from 'react-image-crop';

export interface ImageFile {
  name: string;
  type: string;
  base64: string;
  size: number;
}

export type Tool = 'restore' | 'colorize' | 'crop' | 'expand' | 'video' | 'remove' | 'remove-background' | 'adjust' | 'cartoonify' | 'background-blur' | 'portrait-retouch' | 'generate' | 'auto-adjust' | '3d-drawing' | 'dollify' | 'change-color' | 'black-and-white' | 'art-effects' | 'web-search' | 'resize';