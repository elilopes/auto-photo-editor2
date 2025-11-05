
import type { Crop } from 'react-image-crop';

export interface ImageFile {
  name: string;
  type: string;
  base64: string;
  size: number;
}

export type Tool = 'restore' | 'colorize' | 'crop' | 'expand' | 'gif-to-mp4' | 'remove' | 'remove-background' | 'adjust' | 'cartoonify' | 'background-blur' | 'portrait-retouch' | 'generate' | 'auto-adjust' | '3d-drawing' | 'dollify' | 'change-color' | 'black-and-white' | 'art-effects' | 'web-search' | 'resize' | 'hold-my-doll' | 'photo-shoot' | 'art-movements' | 'hairstyle-trial' | 'contextual-text' | 'virtual-try-on';
