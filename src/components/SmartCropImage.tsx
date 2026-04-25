import React, { useRef, useEffect, useState } from 'react';
import { useSmartCrop } from '../hooks/useSmartCrop';
import { useClientOnly, BrowserAPIs } from '../hooks/useSSRSupport';
import { estimateBlurUpPoint, generateBlurSvgPlaceholder } from '../utils/blurUpGenerator';

/**
 * SmartCropImage component props interface.
 * 
 * @property src - Image URL or path (must support CORS for cross-origin)
 * @property width - Container width (px, %, viewport units)
 * @property height - Container height (px, %, viewport units)
 * @property debug - Enable focal point visualization (default: false)
 * @property className - Custom CSS class for styling
 * @property alt - Alternative text for accessibility
 * @property enableBlurUp - Show blur-up placeholder during analysis (default: true)
 * @property placeholderColor - SVG placeholder background color (default: #e2e8f0)
 */
interface Props {
  src: string;
  width: number | string;
  height: number | string;
  debug?: boolean;
  className?: string;
  alt?: string;
  enableBlurUp?: boolean;
  placeholderColor?: string;
}

/**
 * SmartCropImage - React component for automatic image focal point detection.
 * 
 * Uses a C++ WASM algorithm to analyze image composition and identify the most
 * visually important region. Non-destructive cropping via CSS object-position.
 * 
 * Features:
 * - Lazy loading (Intersection Observer)
 * - CORS-safe cross-origin images
 * - Memory-efficient WASM processing
 * - Priority-based queue (visible images processed first)
 * - Task cancellation on unmount
 * - Race condition protection
 * - Smart blur-up placeholder during analysis
 * - Full SSR/Next.js support (no hydration warnings)
 * - Optional debug visualization
 */
export const SmartCropImage: React.FC<Props> = ({
  src,
  width,
  height,
  debug = false,
  className = "",
  alt = "",
  enableBlurUp = true,
  placeholderColor = '#e2e8f0'
}) => {
  const isClient = useClientOnly(); // SSR safety
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [focalPoint, setFocalPoint] = useState<{ x: number; y: number } | { x: number; y: number; score: number }[]>({ x: 50, y: 50 });
  const [blurUpPoint, setBlurUpPoint] = useState<{x: number; y: number; confidence: number} | null>(null);
  const [hasIntersected, setHasIntersected] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const { analyzeImage, cancelAnalysis, updatePriority, isReady } = useSmartCrop();

  // Intersection Observer: Track visibility and defer WASM analysis until viewport
  // When visible, use priority 0 (high); when invisible, use priority 2 (background)
  useEffect(() => {
    // SSR safety: skip on server
    if (!isClient || !BrowserAPIs.hasIntersectionObserver()) {
      setHasIntersected(true);
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Mark that element has entered viewport at least once (for lazy analysis)
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }

        // Track current visibility for priority management
        setIsVisible(entry.isIntersecting);

        // Update task priority based on visibility
        if (entry.isIntersecting) {
          updatePriority(0); // High priority: visible
        } else if (hasIntersected) {
          updatePriority(2); // Low priority: off-screen
        }
      },
      { rootMargin: '100px' } // Start analysis 100px before viewport
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [hasIntersected, updatePriority, isClient]);

  // Generate blur-up placeholder when image loads
  // This creates an estimated focal point for visual feedback
  useEffect(() => {
    if (!enableBlurUp || status !== 'loaded' || !imgRef.current || !isClient) return;
    if (!BrowserAPIs.hasCanvas() || !BrowserAPIs.hasImageData()) return;

    try {
      // Create temporary canvas for blur-up calculation
      const tempCanvas = document.createElement('canvas');
      const size = 64;
      tempCanvas.width = size;
      tempCanvas.height = size;

      const ctx = tempCanvas.getContext('2d', { willReadFrequently: true, alpha: false });
      if (!ctx) return;

      // Draw image at reduced size
      ctx.drawImage(imgRef.current, 0, 0, size, size);
      const imageData = ctx.getImageData(0, 0, size, size);

      // Estimate focal point quickly (before WASM completes)
      const estimate = estimateBlurUpPoint(imageData, size);
      setBlurUpPoint(estimate);

      console.log(
        `📸 Blur-up estimate: (${estimate.x.toFixed(1)}%, ${estimate.y.toFixed(1)}%) confidence: ${(estimate.confidence * 100).toFixed(0)}%`
      );
    } catch (e) {
      console.warn('Blur-up estimation failed (non-fatal):', e);
      // Fail silently - blur-up is just a UX nicety
    }
  }, [status, enableBlurUp, isClient]);

  // Execute smart crop analysis when conditions are met
  // Runs once image is loaded, WASM is ready, and component is visible
  useEffect(() => {
    let isCurrentRequest = true;

    const performAnalysis = async () => {
      // Guard: SSR safety, ensure image is loaded, WASM ready
      if (!isClient || status !== 'loaded' || !isReady || !imgRef.current || !hasIntersected) return;

      try {
        // Use priority 0 (visible) if currently in viewport, otherwise 1 (preload)
        const priority = isVisible ? (0 as const) : (1 as const);

        const result = await analyzeImage(imgRef.current, priority);

        // Race condition protection: ignore stale results if image URL changed
        if (result && isCurrentRequest) {
          setFocalPoint(result);
          
          // Log analysis completion - handle both single and multiple points
          if (Array.isArray(result)) {
            console.log(
              `✨ WASM analysis complete: Found ${result.length} focal points`
            );
          } else {
            console.log(
              `✨ WASM analysis complete: (${result.x.toFixed(1)}%, ${result.y.toFixed(1)}%)`
            );
          }
        }
      } catch (err) {
        // Ignore cancellation errors (expected behavior)
        if ((err as any)?.message !== 'Task cancelled') {
          console.error("SmartCrop Analysis failed:", err);
        }
      }
    };

    performAnalysis();

    return () => {
      isCurrentRequest = false;
    };
  }, [src, status, isReady, hasIntersected, isVisible, analyzeImage, isClient]);

  // Reset component state when image URL changes
  // Ensures clean state for new image analysis
  useEffect(() => {
    setStatus('loading');
    setFocalPoint({ x: 50, y: 50 }); // Default center focal point
    setHasIntersected(false);
    setIsVisible(false);
  }, [src]);

  // Cleanup: cancel any pending analysis when component unmounts
  // Prevents wasted computation and memory leaks
  useEffect(() => {
    return () => {
      cancelAnalysis();
    };
  }, [cancelAnalysis]);

  return (
    <div
      ref={containerRef}
      className={`smart-crop-container ${className}`}
      style={{
        position: 'relative',
        width,
        height,
        overflow: 'hidden',
        backgroundColor: placeholderColor,
      }}
      suppressHydrationWarning // SSR: Prevent hydration mismatch warning
    >
      {/* Blur-up SVG placeholder (shows estimated focal point) */}
      {enableBlurUp && blurUpPoint && status === 'loading' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: blurUpPoint.confidence * 0.6, // Fade if low confidence
            transition: 'opacity 0.6s ease-out'
          }}
          dangerouslySetInnerHTML={{
            __html: generateBlurSvgPlaceholder(
              blurUpPoint,
              typeof width === 'string' ? 300 : (width as number),
              typeof height === 'string' ? 300 : (height as number),
              placeholderColor
            )
          }}
        />
      )}

      {/* Main image with smart crop positioning */}
      <img
        ref={imgRef}
        src={src}
        crossOrigin="anonymous"
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          // Apply WASM-computed focal point via CSS (non-destructive cropping)
          // If multiple points, use the first one for positioning
          objectPosition: `${Array.isArray(focalPoint) ? focalPoint[0]?.x ?? 50 : focalPoint.x}% ${Array.isArray(focalPoint) ? focalPoint[0]?.y ?? 50 : focalPoint.y}%`,
          // Smooth transition: blur-up → final focal point
          transition: 'object-position 0.8s cubic-bezier(0.33, 1, 0.68, 1), opacity 0.4s ease',
          opacity: status === 'loaded' ? 1 : 0,
          display: status === 'error' ? 'none' : 'block',
        }}
      />

      {/* Display error state when image fails to load */}
      {status === 'error' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: '#94a3b8',
          textAlign: 'center',
          padding: '10px'
        }}>
          ⚠️ Error loading image
        </div>
      )}

      {/* Debug mode: visualize detected focal points */}
      {debug && isClient && status === 'loaded' && (
        <>
          {/* Blur-up estimate (if available) */}
          {blurUpPoint && (
            <div
              style={{
                position: 'absolute',
                left: `${blurUpPoint.x}%`,
                top: `${blurUpPoint.y}%`,
                width: '10px',
                height: '10px',
                background: `rgba(255, 165, 0, ${blurUpPoint.confidence * 0.5})`,
                border: '1px solid orange',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                zIndex: 9
              }}
              title={`Blur-up estimate (${(blurUpPoint.confidence * 100).toFixed(0)}% confidence)`}
            />
          )}

          {/* WASM focal point(s) - single or multiple */}
          {Array.isArray(focalPoint) ? (
            // Multiple focal points - render all with size based on score
            focalPoint.map((point, idx) => (
              <div
                key={`point-${idx}`}
                style={{
                  position: 'absolute',
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  width: `${14 + (point.score || 0) * 6}px`,
                  height: `${14 + (point.score || 0) * 6}px`,
                  background: `rgba(0, 255, 100, ${0.9 * (1 - idx * 0.2)})`,
                  border: `${2 - idx}px solid white`,
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                  zIndex: 10 - idx,
                  boxShadow: `0 0 ${10 - idx * 2}px rgba(0,0,0,0.4)`,
                  opacity: 1 - idx * 0.15
                }}
                title={`Focal point ${idx + 1} (score: ${(point.score * 100).toFixed(0)}%)`}
              />
            ))
          ) : (
            // Single focal point (original behavior)
            <div
              style={{
                position: 'absolute',
                left: `${focalPoint.x}%`,
                top: `${focalPoint.y}%`,
                width: '14px',
                height: '14px',
                background: 'rgba(0, 255, 100, 0.9)',
                border: '2px solid white',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                zIndex: 10,
                boxShadow: '0 0 10px rgba(0,0,0,0.4)',
              }}
              title="WASM focal point"
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'inherit',
                  animation: 'smart-crop-ping 1.5s infinite'
                }}
              />
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes smart-crop-ping {
          75%, 100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
};