/**
 * Priority levels for task scheduling:
 * 0 = Visible (high priority) - user currently sees the image
 * 1 = Preloading (medium priority) - near viewport
 * 2 = Background (low priority) - far off-screen
 */
type Priority = 0 | 1 | 2;

interface QueuedTask {
    id: string;
    pixels: Uint8Array;
    width: number;
    height: number;
    priority: Priority;
    maxPoints?: number;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
    cancelled: boolean;
    createdAt: number;
}

class WorkerManager {
    private worker: Worker | null = null;
    private activeTasks: Map<string, QueuedTask> = new Map();
    private queue: QueuedTask[] = [];
    private isReady: boolean = false;
    
    // Configuration
    private readonly MAX_PARALLEL_TASKS = 4;
    private activeTaskCount = 0;

    constructor() {
        if (typeof window !== 'undefined') {
            try {
                this.worker = new Worker(
                    new URL('../wasm/smart-crop.worker.ts', import.meta.url),
                    { type: 'module' }
                );
                this.setupListeners();
                this.worker.postMessage({ type: 'INIT', id: 'init-task' });
            } catch (e) {
                console.error('❌ Failed to initialize Worker:', e);
                this.worker = null;
            }
        } else {
            console.warn('⚠️ WorkerManager: Running on server (SSR). Worker will not be initialized.');
        }
    }

    private setupListeners() {
        if (!this.worker) return;

        this.worker.onmessage = (event) => {
            const { type, id, payload } = event.data;

            if (type === 'READY') {
                this.isReady = true;
                console.log('✅ Worker ready, processing queue...');
                this.processQueue();
            } else if (type === 'RESULT' || type === 'ERROR') {
                this.handleTaskCompletion(id, type, payload);
            }
        };

        this.worker.onerror = (e) => {
            console.error('❌ Worker Error:', e);
        };
    }

    /**
     * Handle task completion and trigger queue processing
     */
    private handleTaskCompletion(id: string, type: string, payload: any) {
        const task = this.activeTasks.get(id);
        if (!task) return;

        if (type === 'RESULT') {
            task.resolve(payload);
        } else if (type === 'ERROR') {
            task.reject(payload);
        }

        this.activeTasks.delete(id);
        this.activeTaskCount--;

        // Process next task from queue
        this.processQueue();
    }

    /**
     * Sort queue by priority and creation time (FIFO within same priority)
     */
    private sortQueue() {
        this.queue.sort((a, b) => {
            // First sort by priority (lower number = higher priority)
            if (a.priority !== b.priority) {
                return a.priority - b.priority;
            }
            // Then by creation time (earlier first - FIFO)
            return a.createdAt - b.createdAt;
        });
    }

    /**
     * Process queued tasks respecting parallelism limit
     */
    private processQueue() {
        while (this.activeTaskCount < this.MAX_PARALLEL_TASKS && this.queue.length > 0) {
            const task = this.queue.shift();
            if (!task) break;

            // Skip cancelled tasks
            if (task.cancelled) {
                task.reject(new Error('Task cancelled'));
                continue;
            }

            this.executeTask(task);
        }
    }

    /**
     * Send task to worker
     */
    private executeTask(task: QueuedTask) {
        if (!this.worker) {
            task.reject(new Error('Worker not initialized'));
            return;
        }

        this.activeTasks.set(task.id, task);
        this.activeTaskCount++;

        const start = performance.now();
        

        // Use Transferable Objects for 0-copy transfer
        this.worker.postMessage(
            {
                type: 'ANALYZE',
                id: task.id,
                payload: { pixels: task.pixels, width: task.width, height: task.height, maxPoints: task.maxPoints }
            },
            [task.pixels.buffer] // Transfer ownership of ArrayBuffer
        );

        // Log timing
        const elapsed = performance.now() - start;
    }

    /**
     * Queue a new analysis task with priority
     * Priority: 0 = visible, 1 = preload, 2 = background
     * maxPoints: Number of focal points to find (default: 1)
     */
    public analyze(
        pixels: Uint8Array,
        width: number,
        height: number,
        priority: Priority = 2,
        maxPoints?: number
    ): Promise<{ x: number; y: number } | Array<{ x: number; y: number; score: number }>> & { cancel: () => void; taskId: string } {
        const taskId = Math.random().toString(36).substring(7);
        let resolveTask: any;
        let rejectTask: any;

        const promise = new Promise<{ x: number; y: number } | Array<{ x: number; y: number; score: number }>>((resolve, reject) => {
            resolveTask = resolve;
            rejectTask = reject;
        });

        const task: QueuedTask = {
            id: taskId,
            pixels,
            width,
            height,
            priority,
            maxPoints,
            resolve: resolveTask,
            reject: rejectTask,
            cancelled: false,
            createdAt: Date.now()
        };

        // Add to queue
        this.queue.push(task);
        
        // Re-sort queue by priority
        this.sortQueue();

        

        // Try to process if we have capacity
        this.processQueue();

        // Return promise with cancel method and taskId
        (promise as any).cancel = () => this.cancelTask(taskId);
        (promise as any).taskId = taskId;
        return promise as any;
    }

    /**
     * Cancel a queued or active task
     */
    public cancelTask(taskId: string): boolean {
        // Try to find in queue
        const queueIndex = this.queue.findIndex(t => t.id === taskId);
        if (queueIndex !== -1) {
            const task = this.queue.splice(queueIndex, 1)[0];
            task.reject(new Error('Task cancelled'));
            console.log(`🚫 [${taskId}] Task cancelled (was queued)`);
            return true;
        }

        // Try to find in active tasks
        const activeTask = this.activeTasks.get(taskId);
        if (activeTask) {
            activeTask.cancelled = true;
            console.log(`🚫 [${taskId}] Task marked for cancellation (currently active)`);
            return true;
        }

        console.log(`⚠️ [${taskId}] Task not found (already completed or cancelled)`);
        return false;
    }

    /**
     * Update task priority (for visible/invisible status changes)
     */
    public updatePriority(taskId: string, newPriority: Priority): boolean {
        const task = this.queue.find(t => t.id === taskId);
        if (!task) {
            console.log(`⚠️ [${taskId}] Task not found in queue for priority update`);
            return false;
        }

        task.priority = newPriority;
        this.sortQueue();
        console.log(`🔄 [${taskId}] Priority updated to ${newPriority}`);
        return true;
    }

    /**
     * Get queue statistics for debugging
     * SSR Safe: Returns zero stats if worker not available
     */
    public getStats() {
        return {
            activeTaskCount: this.activeTaskCount,
            queueLength: this.queue.length,
            totalTasks: this.activeTaskCount + this.queue.length,
            maxParallel: this.MAX_PARALLEL_TASKS,
            isReady: this.isReady,
            isAvailable: this.worker !== null
        };
    }
}

export const workerManager = new WorkerManager();