import React, { useRef, useEffect, useState } from 'react';
import { useSmartCrop } from '../hooks/useSmartCrop';

/**
 * SmartCropImage component props interface.
 * 
 * @property src - Image URL or path (must support CORS for cross-origin)
 * @property width - Container width (px, %, viewport units)
 * @property height - Container height (px, %, viewport units)
 * @property debug - Enable focal point visualization (default: false)
 * @property className - Custom CSS class for styling
 * @property alt - Alternative text for accessibility
 */
interface Props {
  src: string;
  width: number | string;
  height: number | string;
  debug?: boolean;
  className?: string;
  alt?: string;
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
 * - Race condition protection
 * - Optional debug visualization
 */
export const SmartCropImage: React.FC<Props> = ({
  src,
  width,
  height,
  debug = false,
  className = "",
  alt = ""
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [focalPoint, setFocalPoint] = useState({ x: 50, y: 50 });
  const [hasIntersected, setHasIntersected] = useState(false);

  const { analyzeImage, isReady } = useSmartCrop();

  // Lazy load: defer WASM analysis until component enters viewport
  // Improves page performance by deferring expensive computations
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setHasIntersected(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasIntersected(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' } // Start analysis 100px before viewport
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [src]);

  // Execute smart crop analysis when conditions are met
  // Runs once image is loaded, WASM is ready, and component is visible
  useEffect(() => {
    let isCurrentRequest = true;

    const performAnalysis = async () => {
      // Guard: ensure image is loaded, WASM module ready, and component visible
      if (status !== 'loaded' || !isReady || !imgRef.current || !hasIntersected) return;

      try {
        const result = await analyzeImage(imgRef.current);

        // Race condition protection: ignore stale results if image URL changed
        if (result && isCurrentRequest) {
          setFocalPoint(result);
        }
      } catch (err) {
        console.error("SmartCrop Analysis failed:", err);
      }
    };

    performAnalysis();

    return () => {
      isCurrentRequest = false;
    };
  }, [src, status, isReady, hasIntersected, analyzeImage]);

  // Reset component state when image URL changes
  // Ensures clean state for new image analysis
  useEffect(() => {
    setStatus('loading');
    setFocalPoint({ x: 50, y: 50 }); // Default center focal point
    setHasIntersected(false);
  }, [src]);

  return (
    <div
      ref={containerRef}
      className={`smart-crop-container ${className}`}
      style={{
        position: 'relative',
        width,
        height,
        overflow: 'hidden',
        backgroundColor: '#e2e8f0', // placeholder color
      }}
    >
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
          objectPosition: `${focalPoint.x}% ${focalPoint.y}%`,
          // Smooth transition for seamless focal point changes
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

      {/* Debug mode: visualize detected focal point with pulsing indicator */}
      {debug && isReady && status === 'loaded' && (
        <div style={{
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
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'inherit',
            animation: 'smart-crop-ping 1.5s infinite'
          }} />
        </div>
      )}

      <style>{`
        @keyframes smart-crop-ping {
          75%, 100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
};