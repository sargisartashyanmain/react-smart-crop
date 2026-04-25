/**
 * @package react-smart-crop-wasm
 * 
 * Smart responsive image cropping using WebAssembly for optimal performance.
 * Includes blur-up placeholders, priority queue, and full SSR/Next.js support.
 * 
 * This library exports:
 * - SmartCropImage: React component for intelligent image cropping with blur-up placeholder
 * - useSmartCrop: Hook for custom smart crop implementations with task management
 * - useSSRSupport hooks: Utilities for SSR-safe rendering in Next.js
 * - blurUpGenerator utilities: For custom blur-up implementations
 * 
 * All exports include full TypeScript typings and SSR safety checks.
 */

// Main exports
export * from './hooks/useSmartCrop';
export type { SmartPoint, FocalPoint } from './hooks/useSmartCrop';
export { SmartCropImage } from './components/SmartCropImage';

// SSR Support hooks
export { 
  useIsMounted, 
  useIsSSR, 
  useClientOnly, 
  useWithSSRSupport, 
  useDeferredEffect,
  BrowserAPIs 
} from './hooks/useSSRSupport';

// Blur-up utilities
export { 
  estimateBlurUpPoint, 
  createBlurredCanvas, 
  generateBlurDataUrl, 
  generateBlurSvgPlaceholder 
} from './utils/blurUpGenerator';