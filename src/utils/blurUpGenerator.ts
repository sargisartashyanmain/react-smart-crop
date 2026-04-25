/**
 * Blur-up Generator - Fast approximate focal point calculation
 * 
 * Quickly estimates the focal point before WASM analysis completes.
 * Used for progressive placeholder display.
 * 
 * Algorithm:
 * 1. Sample edge pixels (faster analysis)
 * 2. Calculate brightness/saturation heatmap
 * 3. Find approximate center of mass of high-saturation pixels
 * 4. Bias towards center (natural composition preference)
 */

interface BlurUpPoint {
  x: number;
  y: number;
  confidence: number; // 0-1, how confident we are in this estimate
}

/**
 * Calculate fast approximate focal point from ImageData
 * Used for blur-up placeholder before full WASM analysis
 * 
 * @param imageData - Canvas ImageData (RGBA pixels)
 * @param size - Image size (assumed square, typically 64x64)
 * @returns Approximate focal point {x, y} in percentage coordinates
 */
export function estimateBlurUpPoint(imageData: ImageData, size: number): BlurUpPoint {
  const data = imageData.data;
  const stride = imageData.width * 4; // RGBA = 4 bytes per pixel

  let brightnessTotal = 0;
  let saturationTotal = 0;
  let weightedX = 0;
  let weightedY = 0;
  let maxSaturation = 0;

  // Scan pixels and calculate weighted center
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const pixelIdx = (y * size + x) * 4;

      // Extract RGB (ignore alpha)
      const r = data[pixelIdx];
      const g = data[pixelIdx + 1];
      const b = data[pixelIdx + 2];

      // Calculate brightness (luminance)
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

      // Calculate saturation (simplified HSV)
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const saturation = max === 0 ? 0 : (max - min) / max;

      // Use saturation as weight (prefer colorful areas)
      // But also consider brightness to avoid pure black
      const weight = saturation * (brightness > 0.1 ? 1 : 0.3);

      brightnessTotal += brightness;
      saturationTotal += saturation;
      maxSaturation = Math.max(maxSaturation, saturation);

      // Accumulate weighted position
      weightedX += weight * x;
      weightedY += weight * y;
    }
  }

  const totalPixels = size * size;
  const avgBrightness = brightnessTotal / totalPixels;
  const avgSaturation = saturationTotal / totalPixels;

  // Calculate weighted center
  const totalWeight = saturationTotal;
  let focusX = weightedX / (totalWeight || 1);
  let focusY = weightedY / (totalWeight || 1);

  // Apply center-bias (natural composition preference)
  // Pull the focal point towards center if it's too far out
  const centerX = size / 2;
  const centerY = size / 2;
  const distanceFromCenter = Math.sqrt(
    Math.pow(focusX - centerX, 2) + Math.pow(focusY - centerY, 2)
  );

  if (distanceFromCenter > size * 0.3) {
    // Lerp towards center if too far
    const bias = 0.35; // How much to pull towards center
    focusX = focusX * (1 - bias) + centerX * bias;
    focusY = focusY * (1 - bias) + centerY * bias;
  }

  // Convert to percentage (0-100)
  const resultX = (focusX / size) * 100;
  const resultY = (focusY / size) * 100;

  // Calculate confidence score
  // Higher saturation variance = better focus area detection
  const saturationVariance = avgSaturation * (maxSaturation - avgSaturation);
  const confidence = Math.min(saturationVariance + 0.2, 1); // Bias slightly positive

  return {
    x: Math.max(0, Math.min(100, resultX)),
    y: Math.max(0, Math.min(100, resultY)),
    confidence: Math.round(confidence * 100) / 100
  };
}

/**
 * Create blurred canvas for blur-up effect
 * 
 * @param source - Image source (canvas, img, or bitmap)
 * @param size - Size to resize to (typically 64x64)
 * @param blurRadius - Blur radius in pixels (default: 12)
 * @returns Blurred canvas or null if fails
 */
export function createBlurredCanvas(
  source: HTMLCanvasElement | HTMLImageElement | ImageBitmap,
  size: number,
  blurRadius: number = 12
): HTMLCanvasElement | OffscreenCanvas | null {
  try {
    // Create offscreen canvas if available (better performance)
    let canvas: HTMLCanvasElement | OffscreenCanvas;
    if (typeof OffscreenCanvas !== 'undefined') {
      canvas = new OffscreenCanvas(size, size);
    } else {
      canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
    }

    const ctx = canvas.getContext('2d') as
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D
      | null;

    if (!ctx) return null;

    // Draw source scaled to canvas size
    ctx.drawImage(source, 0, 0, size, size);

    // Apply CSS filter for blur effect
    // Note: This is visual blur, structural blur requires separate processing
    const filterValue = `blur(${blurRadius}px)`;
    (ctx as any).filter = filterValue;

    return canvas;
  } catch (e) {
    console.warn('Failed to create blurred canvas:', e);
    return null;
  }
}

/**
 * Generate data URL for blurred image (for preview)
 * 
 * @param source - Image source
 * @param size - Canvas size (default: 64)
 * @param blurRadius - Blur amount (default: 12)
 * @returns Data URL with blurred image or null
 */
export async function generateBlurDataUrl(
  source: HTMLCanvasElement | HTMLImageElement | ImageBitmap,
  size: number = 64,
  blurRadius: number = 12
): Promise<string | null> {
  try {
    const blurred = createBlurredCanvas(source, size, blurRadius);
    if (!blurred) return null;

    // Convert to data URL
    if (blurred instanceof OffscreenCanvas) {
      const blob = await blurred.convertToBlob();
      return URL.createObjectURL(blob);
    } else {
      return blurred.toDataURL('image/png', 0.7);
    }
  } catch (e) {
    console.warn('Failed to generate blur data URL:', e);
    return null;
  }
}

/**
 * Generate inline SVG blur placeholder
 * Smaller footprint than data URLs for initial render
 * 
 * @param focalPoint - Estimated focal point
 * @param width - Placeholder width
 * @param height - Placeholder height
 * @param color - Base color (CSS color or hex)
 * @returns SVG string
 */
export function generateBlurSvgPlaceholder(
  focalPoint: BlurUpPoint,
  width: number,
  height: number,
  color: string = '#e0e7ff'
): string {
  // Create radial gradient centered at focal point
  const cx = focalPoint.x;
  const cy = focalPoint.y;

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="blur" cx="${cx}%" cy="${cy}%" r="60%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:0.4" />
          <stop offset="100%" style="stop-color:${color};stop-opacity:0.1" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="${color}" />
      <circle cx="${(width * cx) / 100}" cy="${(height * cy) / 100}" r="${Math.max(width, height) * 0.4}" fill="url(#blur)" />
    </svg>
  `.trim();
}
