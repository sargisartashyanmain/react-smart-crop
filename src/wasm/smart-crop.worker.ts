// @ts-ignore
import createModule from '../wasm/smart_crop.js';

let wasmModule: any = null;
let initPromise: Promise<boolean> | null = null;

/**
 * Инициализация WASM (однократно)
 */
const initWasm = async (): Promise<boolean> => {
    try {
        console.log('🔄 Initializing WASM...');

        wasmModule = await createModule({
            locateFile: (path: string) => {
                const url = new URL(`./${path}`, import.meta.url).href;
                console.log('📦 WASM file:', url);
                return url;
            }
        });

        console.log('✅ WASM initialized');
        return true;
    } catch (e) {
        console.error('❌ WASM init failed:', e);
        wasmModule = null;
        return false;
    }
};

/**
 * Гарантирует, что WASM инициализирован (без race condition)
 */
const ensureWasm = async (): Promise<boolean> => {
    if (wasmModule) return true;

    if (!initPromise) {
        initPromise = initWasm();
    }

    return initPromise;
};

/**
 * Глобальный error handler (очень важно для дебага)
 */
self.addEventListener('error', (e) => {
    console.error('🔥 Worker runtime error:', e.message, e.filename, e.lineno);
});

self.addEventListener('unhandledrejection', (e) => {
    console.error('🔥 Worker unhandled rejection:', e.reason);
});

/**
 * Основной обработчик сообщений
 */
self.onmessage = async (event: MessageEvent) => {
    const { type, payload, id } = event.data;

    try {
        // ===== INIT =====
        if (type === 'INIT') {
            const ok = await ensureWasm();

            if (!ok) {
                self.postMessage({
                    type: 'ERROR',
                    id,
                    payload: 'WASM init failed'
                });
                return;
            }

            self.postMessage({ type: 'READY', id });
            return;
        }

        // ===== ANALYZE =====
        if (type === 'ANALYZE') {
            if (!(await ensureWasm())) {
                throw new Error('WASM not initialized');
            }

            const { pixels, width, height, maxPoints } = payload;

            // ===== Валидация =====
            if (!pixels || pixels.length === 0) {
                throw new Error('Invalid pixel buffer');
            }

            if (!width || !height) {
                throw new Error('Invalid dimensions');
            }

            let pixelPtr = 0;
            let resultPtr = 0;

            try {
                // ===== malloc =====
                pixelPtr = wasmModule._malloc(pixels.length);

                if (!pixelPtr) {
                    throw new Error('WASM malloc failed');
                }

                // ===== copy pixels =====
                wasmModule.HEAPU8.set(pixels, pixelPtr);

                // ===== MULTI POINT =====
                if (maxPoints && maxPoints > 1) {
                    resultPtr = wasmModule._findSmartCropMulti(
                        width,
                        height,
                        pixelPtr,
                        maxPoints
                    );

                    if (!resultPtr) {
                        self.postMessage({
                            type: 'RESULT',
                            id,
                            payload: { points: [] }
                        });
                        return;
                    }

                    const points = [];
                    const base = resultPtr / 4; // float32 index

                    for (let i = 0; i < maxPoints; i++) {
                        const offset = base + i * 3;

                        const x = wasmModule.HEAPF32[offset];
                        const y = wasmModule.HEAPF32[offset + 1];
                        const score = wasmModule.HEAPF32[offset + 2];

                        if (!isNaN(x) && !isNaN(y) && x >= 0 && y >= 0) {
                            points.push({ x, y, score });
                        }
                    }

                    self.postMessage({
                        type: 'RESULT',
                        id,
                        payload: { points }
                    });

                    wasmModule._freeFocalPoints(resultPtr);
                } else {
                    // ===== SINGLE POINT =====
                    const result = wasmModule._findSmartCrop(
                        width,
                        height,
                        pixelPtr
                    );

                    if (typeof result !== 'bigint') {
                        throw new Error('Expected BigInt from WASM');
                    }

                    const x = Number(result & 0xFFFFFFFFn);
                    const y = Number(result >> 32n);

                    self.postMessage({
                        type: 'RESULT',
                        id,
                        payload: { x, y }
                    });
                }
            } finally {
                // ===== FREE MEMORY =====
                if (pixelPtr) wasmModule._free(pixelPtr);
            }
        }
    } catch (err) {
        console.error('❌ Worker error:', err);

        self.postMessage({
            type: 'ERROR',
            id,
            payload: err instanceof Error ? err.message : err
        });
    }
};