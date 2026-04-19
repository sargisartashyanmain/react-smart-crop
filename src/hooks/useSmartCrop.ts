import { useState, useEffect, useCallback, useRef } from "react";
// @ts-ignore
import createModule from "../wasm/smart_crop.js";

/**
 * useSmartCrop - Hook for WASM-powered smart image crop analysis.
 * 
 * Manages:
 * - WASM module initialization and lifecycle
 * - Pixel data processing and memory management
 * - Asynchronous image analysis with race condition protection
 * 
 * Returns:
 * - analyzeImage(source): Analyzes HTMLImageElement, HTMLCanvasElement, or ImageBitmap
 * - isReady: Boolean indicating if WASM module is loaded
 */

interface SmartPoint {
  x: number;
  y: number;
}

export const useSmartCrop = () => {
  const [module, setModule] = useState<any>(null);
  const isMounted = useRef(true);
  const isAnalyzing = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    createModule({
      locateFile: (path: string) =>
        path.endsWith(".wasm") ? new URL(`../wasm/${path}`, import.meta.url).href : path,
    }).then((instance: any) => {
      if (isMounted.current) setModule(instance);
    });
    return () => { isMounted.current = false; };
  }, []);

  const analyzeImage = useCallback(
    async (source: HTMLCanvasElement | HTMLImageElement | ImageBitmap): Promise<SmartPoint | null> => {
      if (!module?._findSmartCrop || isAnalyzing.current) return null;

      // Validate image dimensions before processing
      // Skip if image is not fully loaded or dimensions are invalid
      const srcW = source instanceof HTMLCanvasElement ? source.width : (source as HTMLImageElement).naturalWidth || source.width;
      const srcH = source instanceof HTMLCanvasElement ? source.height : (source as HTMLImageElement).naturalHeight || source.height;

      if (srcW === 0 || srcH === 0) return null;

      if (source instanceof HTMLImageElement && !source.complete) return null;

      isAnalyzing.current = true;

      const size = 64;
      let canvas: OffscreenCanvas | HTMLCanvasElement;

      if (typeof OffscreenCanvas !== 'undefined') {
        canvas = new OffscreenCanvas(size, size);
      } else {
        canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
      }

      // Explicit TypeScript typing for canvas rendering context
      // Supports both OffscreenCanvasRenderingContext2D and CanvasRenderingContext2D
      const ctx = canvas.getContext("2d", { willReadFrequently: true, alpha: false }) as
        | CanvasRenderingContext2D
        | OffscreenCanvasRenderingContext2D
        | null;

      if (!ctx) {
        isAnalyzing.current = false;
        return null;
      }

      try {
        ctx.drawImage(source, 0, 0, size, size);
        const { data: pixels } = ctx.getImageData(0, 0, size, size);

        let ptr = 0;
        try {
          ptr = module._malloc(pixels.length);
          module.HEAPU8.set(pixels, ptr);

          const packedResult: bigint = module._findSmartCrop(size, size, ptr);

          // Unpack 64-bit result: lower 32 bits = x coordinate, upper 32 bits = y coordinate
          // Convert from pixel coordinates to percentages (0-100%)
          const xCoord = Number(packedResult & 0xFFFFFFFFn);
          const yCoord = Number(packedResult >> 32n);

          return {
            x: (xCoord / size) * 100,
            y: (yCoord / size) * 100,
          };
        } finally {
          if (ptr) module._free(ptr);
        }
      } catch (e) {
        console.warn("SmartCrop: Image analysis skipped", e);
        return null;
      } finally {
        isAnalyzing.current = false;
      }
    },
    [module]
  );

  return { analyzeImage, isReady: !!module };
};