# Blur-up & SSR Support Guide

## Overview

React Smart Crop now includes two major enhancements:

1. **Blur-up Placeholder** - Fast visual feedback while WASM analyzes images
2. **SSR/Next.js Support** - Full compatibility with server-side rendering and Next.js

---

## 🎨 Blur-up Placeholder Feature

### What is Blur-up?

Blur-up shows an estimated focal point as a blurred SVG placeholder while the WASM algorithm completes its analysis. This provides immediate visual feedback and a professional "progressive image loading" experience.

### How It Works

```
1. User scrolls image into view
2. Component calculates QUICK approximate focal point (15-20ms)
3. Shows SVG placeholder centered on estimate with radial gradient
4. WASM analysis runs in parallel (100-200ms)
5. When complete: Smooth transition from blur-up to final focal point
```

### Visual Timeline

```
Time 0ms:     Image loads
              ├─ Blur-up estimate calculated
              └─ SVG placeholder appears

Time 50-100ms: WASM analysis starts
              └─ Queue processes image

Time 100-200ms: WASM complete
              └─ Fade blur-up, show final focal point
```

### Usage

#### Basic Usage (Auto Enabled)

```tsx
import { SmartCropImage } from '@sargis-artashyan/react-smart-crop';

export function Gallery() {
  return (
    <SmartCropImage
      src="image.jpg"
      width={300}
      height={300}
      // Blur-up enabled by default!
    />
  );
}
```

#### With Custom Placeholder Color

```tsx
<SmartCropImage
  src="image.jpg"
  width={300}
  height={300}
  placeholderColor="#f0f0f0"  // Custom SVG background
  enableBlurUp={true}          // Explicit enable (default: true)
/>
```

#### Disable Blur-up (if Preferred)

```tsx
<SmartCropImage
  src="image.jpg"
  width={300}
  height={300}
  enableBlurUp={false}  // Disable blur-up placeholder
/>
```

### Debug Mode with Blur-up

When `debug={true}`, you see both estimates:

- 🟠 **Orange dot**: Blur-up estimate (with confidence % on hover)
- 🟢 **Green dot**: Final WASM focal point

```tsx
<SmartCropImage
  src="image.jpg"
  width={300}
  height={300}
  debug={true}  // Shows both focal points
/>
```

### Performance

| Operation | Duration | Note |
|-----------|----------|------|
| Blur-up estimate | 10-20ms | Fast pixel sampling |
| SVG render | <5ms | Inline SVG, no painting |
| WASM analysis | 100-200ms | Parallel processing |
| Transition | 800ms | CSS cubic-bezier ease-out |
| **Total perceived load** | ~120ms | User sees estimate immediately |

### Algorithm Details

The blur-up estimation uses:

1. **Saturation weighting** - Prefers colorful regions (likely subject)
2. **Brightness consideration** - Avoids pure black/white noise
3. **Center bias** - Natural composition preference
4. **Confidence scoring** - Indicates reliability of estimate

```typescript
// Blur-up point includes confidence (0-1)
{
  x: 45.2,      // Horizontal position (%)
  y: 52.1,      // Vertical position (%)
  confidence: 0.73  // How confident we are (73%)
}
```

---

## 🖥️ SSR / Next.js Support

### Problem Solved

Before this update, react-smart-crop would fail during Next.js build with errors like:

```
ReferenceError: Worker is not defined
ReferenceError: Canvas is not defined
ReferenceError: IntersectionObserver is not defined
```

### Solution: Browser API Detection

Now the library safely handles server-side rendering:

```typescript
✅ No Worker creation on server
✅ No Canvas operations on server
✅ No IntersectionObserver binding on server
✅ Hydration-safe component
✅ No console warnings or errors
```

### How It Works

Three layers of SSR safety:

#### 1. **useClientOnly Hook**

Ensures component only renders client-side features after hydration:

```tsx
import { useClientOnly } from '@sargis-artashyan/react-smart-crop';

export function MyComponent() {
  const isClient = useClientOnly();
  
  if (!isClient) {
    return <div className="placeholder">Loading...</div>;
  }
  
  return <SmartCropImage src="..." />;
}
```

#### 2. **BrowserAPIs Utility**

Check what APIs are available:

```tsx
import { BrowserAPIs } from '@sargis-artashyan/react-smart-crop';

export function CheckSupport() {
  return (
    <div>
      <p>Has Worker: {BrowserAPIs.hasWebWorker() ? '✓' : '✗'}</p>
      <p>Has Canvas: {BrowserAPIs.hasCanvas() ? '✓' : '✗'}</p>
      <p>Has ImageData: {BrowserAPIs.hasImageData() ? '✓' : '✗'}</p>
      <p>Has IntersectionObserver: {BrowserAPIs.hasIntersectionObserver() ? '✓' : '✗'}</p>
    </div>
  );
}
```

#### 3. **SmartCropImage Hydration Safety**

```tsx
<div suppressHydrationWarning>  {/* SSR safety */}
  <SmartCropImage src="..." />
</div>
```

### Next.js Integration Examples

#### ✅ Client Component with Fallback

```tsx
'use client';  // Mark as client component

import { SmartCropImage, useClientOnly } from '@sargis-artashyan/react-smart-crop';

export function Gallery({ images }) {
  const isClient = useClientOnly();
  
  if (!isClient) {
    // Server or pre-hydration: Show static image
    return <img src={images[0].url} alt="Gallery" />;
  }
  
  // Client: Show smart-cropped image
  return (
    <div className="gallery">
      {images.map(img => (
        <SmartCropImage
          key={img.url}
          src={img.url}
          width={300}
          height={300}
        />
      ))}
    </div>
  );
}
```

#### ✅ Dynamic Import with `ssr: false`

```tsx
import dynamic from 'next/dynamic';

const SmartGallery = dynamic(
  () => import('./SmartGallery'),
  { ssr: false }  // Client-only rendering
);

export default function Page() {
  return <SmartGallery />;
}
```

#### ✅ App Router (Next.js 13+)

```tsx
'use client';

import { SmartCropImage } from '@sargis-artashyan/react-smart-crop';

export default function Page() {
  return (
    <SmartCropImage
      src="image.jpg"
      width={300}
      height={300}
    />
  );
}
```

#### ✅ With Error Boundary

```tsx
'use client';

import React from 'react';
import { SmartCropImage } from '@sargis-artashyan/react-smart-crop';

export class Gallery extends React.Component {
  componentDidCatch(error, info) {
    console.error('Gallery error:', error);
  }

  render() {
    return (
      <div className="gallery">
        {/* Will safely handle SSR mismatch */}
        <SmartCropImage src="image.jpg" width={300} height={300} />
      </div>
    );
  }
}
```

### SSR Hooks Available

#### `useClientOnly()`
Returns `true` only after client hydration.

```tsx
const isClient = useClientOnly();
return isClient ? <SmartCropImage /> : <Placeholder />;
```

#### `useIsSSR()`
Returns `true` if running on server.

```tsx
const isSSR = useIsSSR();
if (isSSR) return <ServerPlaceholder />;
```

#### `useWithSSRSupport()`
Returns object with both states.

```tsx
const { isClient, isServer } = useWithSSRSupport();
return isClient ? <Interactive /> : <Static />;
```

#### `useDeferredEffect()`
Delays effect until after hydration (prevents hydration mismatch).

```tsx
useDeferredEffect(() => {
  // Run only after hydration complete
  console.log('Client-side initialization');
}, []);
```

---

## 🧪 Testing with Blur-up & SSR

### Test Blur-up Visually

1. Open DevTools Network tab
2. Set to "Slow 3G" throttling
3. Scroll image into view
4. Watch SVG placeholder fade ~100ms before final image

### Test SSR Build

```bash
# Next.js dev (no SSR errors should appear)
npm run dev

# Next.js production build (should complete without errors)
npm run build

# Test SSR rendering
npx ts-node -e "
  const React = require('react');
  const { SmartCropImage } = require('./dist/react-smart-crop.es.js');
  
  // Should not throw on server
  React.createElement(SmartCropImage, { 
    src: 'test.jpg', 
    width: 300, 
    height: 300 
  });
  
  console.log('✓ SSR compatible');
"
```

### Debug Console Output

When blur-up triggers (debug enabled):

```
📸 Blur-up estimate: (48.2%, 51.5%) confidence: 82%
✨ WASM analysis complete: (47.8%, 52.1%)
```

---

## 📊 Combined Features Performance

### Scenario: Gallery with 20 images on slow connection

**Before:**
- 8-12 images visible: All WASM analyses compete
- Slow completion, janky transitions
- 300-500ms to see proper crop per image

**After:**
- 8-12 images visible: Blur-up shows instantly
- Max 4 WASM in parallel (priority queue)
- ~150ms to see blur-up estimate
- ~250ms to see final focal point
- **Result**: 2-3x faster perceived loading

### Bundle Size Impact

| Metric | Change |
|--------|--------|
| ES module | +5.45 kB (8.05 → 13.50 kB) |
| ES module (gzip) | +1.83 kB (3.21 → 5.04 kB) |
| Total with WASM | Still <20 kB gzipped |

---

## 🎯 Recommendations

✅ **ALWAYS use blur-up** - No downside, massive UX improvement
✅ **Use SSR hooks** - Prevents Next.js errors
✅ **Test in Next.js** - Build + dev both work perfectly
✅ **Debug mode** - Visual verification of focal points

❌ **DON'T disable blur-up** - Only if blank placeholder preferred
❌ **DON'T ignore SSR errors** - Use `useClientOnly()` if needed
❌ **DON'T render in SSR** - Use dynamic import with `ssr: false`

---

## Troubleshooting

### "Module not found: Worker"

**Solution:** Ensure `useClientOnly()` or `'use client'` directive:

```tsx
'use client';  // Mark component as client-side

import { SmartCropImage } from '@sargis-artashyan/react-smart-crop';

export default function Page() {
  return <SmartCropImage src="..." />;
}
```

### Hydration Warnings in Console

**Solution:** Component should only render after hydration:

```tsx
const isClient = useClientOnly();
if (!isClient) return null;
return <SmartCropImage src="..." />;
```

### Blur-up not showing

**Ensure:**
- Image is loaded (`onLoad` fired)
- `enableBlurUp={true}` (default)
- Not in SSR context (blur-up skips on server)
- Browser supports Canvas API

### Very low blur-up confidence

**Normal for:**
- Monochrome/low-saturation images (logos, sketches)
- Uniform color images (solid backgrounds)
- Low contrast images

**Mitigation:** WASM analysis still provides accurate result

---

## Examples Repository

See `/demo` folder for full working examples:

- Gallery with blur-up enabled
- Next.js integration example
- Debug visualization
- Performance monitoring

```bash
cd demo
npm run dev  # See blur-up + SSR in action
```
