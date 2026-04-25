# WorkerManager: Priority Queue & Task Cancellation

## Overview

The enhanced `WorkerManager` implements a sophisticated task scheduling system for WASM image analysis with:
- **Priority-based queue** for intelligent task ordering
- **Parallelism limit** (4 concurrent tasks) for resource efficiency
- **Task cancellation** for cleanup and memory management
- **Auto-priority adjustment** based on element visibility

## Architecture

```
┌─────────────────────────────────────────┐
│   SmartCropImage Component              │
│   (Tracks visibility via Observer)      │
└──────────────┬──────────────────────────┘
               │ analyzeImage(image, priority)
               │ updatePriority(newPriority)
               │ cancelAnalysis()
               ↓
┌─────────────────────────────────────────┐
│   useSmartCrop Hook                     │
│   (Manages current analysis lifecycle)  │
└──────────────┬──────────────────────────┘
               │ workerManager.analyze()
               │ workerManager.cancelTask()
               │ workerManager.updatePriority()
               ↓
┌─────────────────────────────────────────┐
│   WorkerManager                         │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Queue: QueuedTask[]              │ │
│  │  Active: Map<id, QueuedTask>      │ │
│  │  maxParallel: 4                   │ │  
│  └───────────────────────────────────┘ │
│                                         │
│  - Priority-based sorting (0-2)         │
│  - Automatic processing                │
│  - Dynamic priority updates             │
│  - Task cancellation                   │
└──────────────┬──────────────────────────┘
               │ worker.postMessage()
               ↓
         Web Worker
     (WASM Analysis)
```

## Priority System

Three priority levels for different scenarios:

### Priority 0: Visible (RED - Urgent)
- Element is currently visible in viewport
- User can see the image
- **When to use**: Initial analysis of on-screen images
- **Example**: Images in hero, above-the-fold content

```typescript
analyzeImage(imgElement, 0)  // High priority
```

### Priority 1: Preload (YELLOW - Normal)
- Element near viewport (trigger area)
- Likely to become visible soon
- **When to use**: Images within 100px of viewport
- **Example**: Images just below fold, upcoming carousel slides

```typescript
analyzeImage(imgElement, 1)  // Medium priority
```

### Priority 2: Background (GRAY - Low)
- Element far from viewport
- Unlikely to be visible soon
- **When to use**: Off-screen images, far future content
- **Example**: Images at bottom of page, hidden sections

```typescript
analyzeImage(imgElement, 2)  // Low priority (default)
```

## Usage Examples

### Basic Usage (Same as Before)

```typescript
import { SmartCropImage } from '@sargis-artashyan/react-smart-crop';

export function Gallery() {
  return (
    <div className="gallery">
      <SmartCropImage
        src="image1.jpg"
        width={300}
        height={300}
        alt="Gallery item 1"
      />
      <SmartCropImage
        src="image2.jpg"
        width={300}
        height={300}
        alt="Gallery item 2"
      />
    </div>
  );
}
```

The component automatically:
- Tracks visibility with IntersectionObserver
- Sets priority 0 when visible
- Updates to priority 1-2 when hidden
- Cancels analysis on unmount

### Advanced: Custom Priority Management

```typescript
import { useSmartCrop } from '@sargis-artashyan/react-smart-crop';

export function CustomAnalyzer() {
  const { analyzeImage, updatePriority, cancelAnalysis } = useSmartCrop();
  const imgRef = useRef<HTMLImageElement>(null);

  // Start analysis with specific priority
  const startAnalysis = async (priority = 0) => {
    const result = await analyzeImage(imgRef.current!, priority);
    console.log('Focal point:', result);
  };

  // Change priority of current task
  const boostPriority = () => {
    updatePriority(0);  // Promote to high priority
    console.log('Task priority boosted!');
  };

  // Cancel analysis if needed
  const stopAnalysis = () => {
    const wasCancelled = cancelAnalysis();
    console.log('Analysis cancelled:', wasCancelled);
  };

  return (
    <div>
      <img ref={imgRef} src="image.jpg" />
      <button onClick={() => startAnalysis(0)}>Analyze Now (High Priority)</button>
      <button onClick={boostPriority}>Boost Priority</button>
      <button onClick={stopAnalysis}>Cancel</button>
    </div>
  );
}
```

### Advanced: Queue Monitoring

```typescript
import { workerManager } from '@sargis-artashyan/react-smart-crop/hooks';

export function QueueMonitor() {
  const [stats, setStats] = useState(workerManager.getStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(workerManager.getStats());
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const { activeTaskCount, queueLength, totalTasks, maxParallel, isReady } = stats;

  return (
    <div className="monitor">
      <p>Active: {activeTaskCount}/{maxParallel}</p>
      <p>Queued: {queueLength}</p>
      <p>Total: {totalTasks}</p>
      <p>WASM: {isReady ? '✓ Ready' : '⏳ Loading'}</p>
      
      {/* Visual progress bar */}
      <div className="bar">
        <div 
          className="fill" 
          style={{ width: `${(activeTaskCount / maxParallel) * 100}%` }}
        />
      </div>
    </div>
  );
}
```

## Performance Scenarios

### Scenario 1: Image Gallery (20 visible images)
**Before**: All 20 start analyzing immediately → browser lag
**After**: First 4 analyze, rest queued by priority → smooth loading

```
Time 0ms:    [Task1, Task2, Task3, Task4] running  (4/4 slots)
             [Task5-20] queued, sorted by priority

Time 100ms:  [Task2, Task3, Task4, Task5] running  (Task1 complete)
             [Task6-20] queued

Time 200ms:  [Task3, Task4, Task5, Task6] running  (Task2 complete)
             [Task7-20] queued
```

### Scenario 2: Viewport Change (User scrolls)
**Before**: Off-screen images still analyze (wasted resources)
**After**: Priority updated, off-screen tasks wait or get cancelled

```
Image enters viewport:
  - Priority: 2 (background) → 0 (visible)
  - If queued: re-sorted, moved to front
  - If active: continues (already processing)

Image leaves viewport:
  - Priority: 0 (visible) → 2 (background)
  - If queued: re-sorted, moved to back
  - If active: continues (can't interrupt)
  - If not started: cancel via cancelAnalysis()
```

### Scenario 3: Component Unmount
**Before**: Task still processes, result ignored
**After**: Task cancelled, memory freed immediately

```typescript
useEffect(() => {
  return () => {
    // Auto-called when component unmounts
    cancelAnalysis();  // Frees memory, stops worker if not active
  };
}, [cancelAnalysis]);
```

## Configuration

Adjust parallelism limit in [WorkerManager.ts](src/hooks/WorkerManager.ts):

```typescript
private readonly MAX_PARALLEL_TASKS = 4;  // Change this value
```

**Recommendations**:
- **Mobile (low-end)**: 2-3 tasks
- **Mobile (high-end)**: 4-6 tasks
- **Desktop**: 4-8 tasks
- **Server/Node**: 8-16 tasks (if applicable)

## Monitoring & Debugging

### Console Output Example

```
📥 [a1b2c3] Task queued (priority: 0, queue length: 0)
📤 [a1b2c3] Task sent (priority: 0, active: 1/4, queue: 2)
⏱️ Analysis send time: 0.45ms
📥 [d4e5f6] Task queued (priority: 1, queue length: 1)
📤 [d4e5f6] Task sent (priority: 1, active: 2/4, queue: 1)
✓ RESULT: a1b2c3 completed
📤 [d4e5f6] Task sent (priority: 1, active: 2/4, queue: 0)
🚫 [g7h8i9] Task cancelled (was queued)
🔄 [d4e5f6] Priority updated to 0
```

### Enable Full Statistics

```typescript
const stats = workerManager.getStats();
console.table({
  'Active Tasks': stats.activeTaskCount,
  'Queued Tasks': stats.queueLength,
  'Max Parallel': stats.maxParallel,
  'Total Tasks': stats.totalTasks,
  'WASM Ready': stats.isReady
});
```

## Memory Management

### Before Optimization
```
Gallery of 20 images → All 20 Uint8Array buffers in memory
                        + 20 canvas contexts
                        = High memory usage
```

### After Optimization
```
Gallery of 20 images → Only 4 Uint8Array buffers active
                        (rest waiting in queue for transfer)
                        + Cancelled tasks freed immediately
                        = 80% less memory per concurrent operation
```

## Browser Compatibility

- ✅ All modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (Chrome Mobile, Safari iOS)
- ⚠️ Requires Worker support (available in 99%+ browsers)
- ⚠️ WASM support required (available in 95%+ browsers)

## Troubleshooting

### Tasks Not Processing

**Problem**: Tasks stuck in queue
**Solution**: Check `workerManager.getStats().isReady`

```typescript
const stats = workerManager.getStats();
if (!stats.isReady) {
  console.warn('WASM module still initializing...');
}
```

### Memory Leak

**Problem**: Tasks accumulating in memory
**Solution**: Ensure `cancelAnalysis()` called on unmount

```typescript
// ✓ Correct
useEffect(() => {
  return () => cancelAnalysis();  // Auto-cleanup
}, [cancelAnalysis]);

// ✗ Wrong
// (no cleanup - memory leak)
```

### Slow Processing

**Problem**: Images analyzing slower than expected
**Solution**: Check parallelism limit and system resources

```typescript
const stats = workerManager.getStats();
console.log(`${stats.activeTaskCount}/${stats.maxParallel} slots in use`);

// If always maxed out, increase MAX_PARALLEL_TASKS
// If mostly idle, check if images visible/loaded
```

## Future Enhancements

- [ ] Adaptive parallelism based on device performance
- [ ] Task retries for failed analyses
- [ ] Worker pool with multiple worker threads
- [ ] Priority inheritance for related tasks
- [ ] Analytics/performance metrics collection
- [ ] AbortController integration (native cancellation)
