import { useEffect, useRef, useState } from 'react';

/**
 * useIsMounted - Hook for proper client-side rendering in SSR environments
 * 
 * In Next.js and SSR, components render twice:
 * 1. On server (no DOM APIs available)
 * 2. On client (hydration + interactive features)
 * 
 * This hook ensures we only use browser APIs after hydration is complete.
 * 
 * @returns boolean - true if component is mounted on client
 */
export function useIsMounted(): boolean {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
}

/**
 * useIsSSR - Hook to detect SSR environment
 * 
 * Returns true if running on server (for conditional exports/imports)
 * 
 * @returns boolean - true if on server
 */
export function useIsSSR(): boolean {
  return typeof window === 'undefined';
}

/**
 * useClientOnly - Hook to ensure code only runs on client
 * 
 * Prevents hydration mismatches and errors from server-side rendering.
 * Use for features that require DOM/Worker/Canvas.
 * 
 * Example:
 * ```tsx
 * const isClient = useClientOnly();
 * if (!isClient) return <div>Loading...</div>;
 * // Now safe to use refs, workers, canvas, etc.
 * ```
 * 
 * @returns boolean - true only after client hydration
 */
export function useClientOnly(): boolean {
  return useIsMounted();
}

/**
 * useWithSSRSupport - Hook for conditional rendering with SSR support
 * 
 * Helps split server and client rendering without hydration issues.
 * 
 * Example:
 * ```tsx
 * const { isClient, isServer } = useWithSSRSupport();
 * 
 * if (isServer) {
 *   return <StaticPlaceholder />;
 * }
 * 
 * return <SmartCropImage src="..." />;
 * ```
 */
export function useWithSSRSupport() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return {
    isClient,
    isServer: !isClient
  };
}

/**
 * Safely check if browser APIs are available
 * 
 * Use this for polyfill detection in SSR-safe way
 */
export const BrowserAPIs = {
  hasWorker: (): boolean => typeof Worker !== 'undefined',
  hasCanvas: (): boolean => typeof HTMLCanvasElement !== 'undefined',
  hasImageData: (): boolean => typeof ImageData !== 'undefined',
  hasOffscreenCanvas: (): boolean => typeof OffscreenCanvas !== 'undefined',
  hasIntersectionObserver: (): boolean => typeof IntersectionObserver !== 'undefined',
  hasWebWorker: (): boolean => {
    if (typeof window === 'undefined') return false;
    return typeof Worker !== 'undefined';
  }
};

/**
 * Defer client-side effect until hydration is complete
 * 
 * In Next.js, sometimes effects run before hydration completes.
 * This wrapper ensures consistency.
 * 
 * @param effect - Effect function to run
 * @param deps - Dependency array
 */
export function useDeferredEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList
) {
  const hasRun = useRef(false);

  useEffect(() => {
    // Skip first render to ensure hydration complete
    if (!hasRun.current) {
      hasRun.current = true;
      return;
    }

    return effect();
  }, deps);
}
