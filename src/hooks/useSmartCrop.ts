import { useCallback, useRef, useEffect } from "react";
import { workerManager } from "./WorkerManager"; // Импортируем менеджер, который мы создали ранее
import { BrowserAPIs } from "./useSSRSupport"; // SSR safety checks

interface SmartPoint {
  x: number;
  y: number;
}

interface FocalPoint {
  x: number;
  y: number;
  score: number;
}

export type { SmartPoint, FocalPoint };

type Priority = 0 | 1 | 2; // 0 = visible, 1 = preload, 2 = background

export const useSmartCrop = () => {
  const isAnalyzing = useRef(false);
  const currentTaskIdRef = useRef<string | null>(null);
  
  // SSR safety: Check if browser APIs are available
  const isSupported = useRef(() => {
    return BrowserAPIs.hasWebWorker() && BrowserAPIs.hasCanvas() && BrowserAPIs.hasImageData();
  });

  /**
   * Analyze image with optional priority support
   * Priority: 0 = visible (user can see), 1 = preload (near viewport), 2 = background
   * 
   * maxPoints: Number of focal points to find (default: 1)
   *   - If 1: Returns single SmartPoint (backward compatible)
   *   - If > 1: Returns array of FocalPoint objects with confidence scores
   * 
   * SSR Safe: Returns null if running on server or browser APIs unavailable
   */
  const analyzeImage = useCallback(
    async (
      source: HTMLCanvasElement | HTMLImageElement | ImageBitmap,
      priority: Priority = 2,
      maxPoints: number = 1
    ): Promise<SmartPoint | FocalPoint[] | null> => {
      // SSR Safety: Skip analysis on server or if APIs not available
      if (!isSupported.current()) {
        console.warn('⚠️ SmartCrop: Browser APIs not available (SSR or old browser)');
        return null;
      }

      // 1. Предварительные проверки
      if (isAnalyzing.current) return null;

      const srcW = source instanceof HTMLCanvasElement ? source.width : (source as HTMLImageElement).naturalWidth || source.width;
      const srcH = source instanceof HTMLCanvasElement ? source.height : (source as HTMLImageElement).naturalHeight || source.height;

      if (srcW === 0 || srcH === 0) return null;
      if (source instanceof HTMLImageElement && !source.complete) return null;

      isAnalyzing.current = true;

      // 2. Подготовка миниатюры (64x64)
      // Это по-прежнему делается в основном потоке, так как воркер не имеет доступа к DOM-элементам
      const size = 64;
      let canvas: OffscreenCanvas | HTMLCanvasElement;
      if (typeof OffscreenCanvas !== 'undefined') {
        canvas = new OffscreenCanvas(size, size);
      } else {
        canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
      }

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
        const imageData = ctx.getImageData(0, 0, size, size);

        // 3. Отправка данных в Worker с приоритетом
        const pixels = new Uint8Array(imageData.data.buffer);

        // ВЫЗОВ ВОРКЕРА с поддержкой отмены и приоритета
        const analysisPromise = workerManager.analyze(pixels, size, size, priority, maxPoints);
        
        // Сохраняем ID текущей задачи для последующей отмены
        currentTaskIdRef.current = (analysisPromise as any).taskId;

        const result = await analysisPromise;

        if (!result) return null;

        // Если это множественные точки
        if (Array.isArray(result)) {
          return result.map(point => ({
            x: (point.x / size) * 100,
            y: (point.y / size) * 100,
            score: point.score
          }));
        }

        // Если это одна точка
        return {
          x: (result.x / size) * 100,
          y: (result.y / size) * 100,
        };
      } catch (e) {
        // Игнорируем ошибки отмены (они ожидаемы)
        if ((e as any)?.message !== 'Task cancelled') {
          console.warn("SmartCrop: Worker analysis failed", e);
        }
        return null;
      } finally {
        isAnalyzing.current = false;
        currentTaskIdRef.current = null;
      }
    },
    []
  );

  /**
   * Cancel current analysis task if running
   */
  const cancelAnalysis = useCallback(() => {
    if (currentTaskIdRef.current) {
      const cancelled = workerManager.cancelTask(currentTaskIdRef.current);
      if (cancelled) {
        currentTaskIdRef.current = null;
      }
      return cancelled;
    }
    return false;
  }, []);

  /**
   * Update priority of current task if it's queued
   */
  const updatePriority = useCallback((newPriority: Priority) => {
    if (currentTaskIdRef.current) {
      return workerManager.updatePriority(currentTaskIdRef.current, newPriority);
    }
    return false;
  }, []);

  /**
   * Cleanup on unmount - cancel any pending analysis
   */
  useEffect(() => {
    return () => {
      // Отменяем текущую задачу при размонтировании компонента
      cancelAnalysis();
    };
  }, [cancelAnalysis]);

  return { 
    analyzeImage, 
    cancelAnalysis,
    updatePriority,
    isReady: true
  };
};