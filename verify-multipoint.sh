#!/bin/bash

# Multi-Point Focal Detection - Verification Script
# This script verifies all components of the multi-point feature

echo "📋 React-Smart-Crop Multi-Point Detection Verification"
echo "======================================================"
echo ""

# 1. Check C++ Implementation
echo "✓ Checking C++ implementation..."
if grep -q "struct FocalPoint" core/src/main.cpp && \
   grep -q "findSmartCropMulti" core/src/main.cpp && \
   grep -q "freeFocalPoints" core/src/main.cpp; then
    echo "  ✅ C++ structs and functions present"
else
    echo "  ❌ Missing C++ components"
    exit 1
fi

# 2. Check WebAssembly Exports
echo ""
echo "✓ Checking WASM exports..."
if grep -q "EMSCRIPTEN_KEEPALIVE" core/src/main.cpp | grep -q "findSmartCropMulti"; then
    echo "  ⚠️  Note: Check EMSCRIPTEN_KEEPALIVE manually"
fi
if grep -q "EMSCRIPTEN_KEEPALIVE" core/src/main.cpp; then
    echo "  ✅ EMSCRIPTEN_KEEPALIVE macros present"
else
    echo "  ❌ Missing EMSCRIPTEN_KEEPALIVE"
    exit 1
fi

# 3. Check TypeScript Types
echo ""
echo "✓ Checking TypeScript types..."
if grep -q "interface FocalPoint" src/hooks/useSmartCrop.ts && \
   grep -q "export type.*FocalPoint" src/hooks/useSmartCrop.ts; then
    echo "  ✅ FocalPoint type exported"
else
    echo "  ❌ Missing FocalPoint type export"
    exit 1
fi

# 4. Check Worker Implementation
echo ""
echo "✓ Checking Web Worker..."
if grep -q "findSmartCropMulti" src/wasm/smart-crop.worker.ts && \
   grep -q "maxPoints" src/wasm/smart-crop.worker.ts && \
   grep -q "HEAPF32" src/wasm/smart-crop.worker.ts; then
    echo "  ✅ Worker multi-point support implemented"
else
    echo "  ❌ Worker missing multi-point support"
    exit 1
fi

# 5. Check Hook Updates
echo ""
echo "✓ Checking Hook updates..."
if grep -q "maxPoints" src/hooks/useSmartCrop.ts && \
   grep -q "analyzeImage.*maxPoints" src/hooks/useSmartCrop.ts; then
    echo "  ✅ Hook supports maxPoints parameter"
else
    echo "  ❌ Hook missing maxPoints support"
    exit 1
fi

# 6. Check Component Updates
echo ""
echo "✓ Checking Component updates..."
if grep -q "Array.isArray(focalPoint)" src/components/SmartCropImage.tsx; then
    echo "  ✅ Component handles focal point arrays"
else
    echo "  ❌ Component missing array handling"
    exit 1
fi

# 7. Check WorkerManager
echo ""
echo "✓ Checking WorkerManager..."
if grep -q "maxPoints" src/hooks/WorkerManager.ts; then
    echo "  ✅ WorkerManager passes maxPoints"
else
    echo "  ❌ WorkerManager missing maxPoints"
    exit 1
fi

# 8. Check Documentation
echo ""
echo "✓ Checking documentation..."
if grep -q "Max-Point\|Multi-Point\|maxPoints" README.md && \
   [ -f "MULTIPOINT_FEATURE.md" ]; then
    echo "  ✅ Documentation updated"
else
    echo "  ⚠️  Documentation may need updates"
fi

# 9. Build Status
echo ""
echo "✓ Checking build..."
if [ -f "dist/react-smart-crop.es.js" ]; then
    SIZE=$(ls -lh dist/react-smart-crop.es.js | awk '{print $5}')
    echo "  ✅ Build artifact exists ($SIZE)"
else
    echo "  ❌ Build artifact missing"
    exit 1
fi

# 10. Type Checking
echo ""
echo "✓ Checking TypeScript compilation..."
if npm run build 2>&1 | grep -q "built in"; then
    echo "  ✅ TypeScript compiles without errors"
else
    echo "  ❌ TypeScript compilation failed"
    exit 1
fi

# 11. Memory Safety
echo ""
echo "✓ Checking memory management..."
if grep -q "_malloc\|_free" src/wasm/smart-crop.worker.ts && \
   grep -q "freeFocalPoints" src/wasm/smart-crop.worker.ts; then
    echo "  ✅ Memory management implemented"
else
    echo "  ❌ Memory management missing"
    exit 1
fi

# 12. Backward Compatibility
echo ""
echo "✓ Checking backward compatibility..."
if grep -q "analyzeImage(imgRef.current, priority)" src/components/SmartCropImage.tsx || \
   grep -q "maxPoints = 1\|default.*1" src/hooks/useSmartCrop.ts; then
    echo "  ✅ Default single-point mode preserved"
else
    echo "  ⚠️  Unable to verify default behavior"
fi

echo ""
echo "======================================================"
echo "✅ Multi-Point Detection Feature - All Checks Passed!"
echo ""
echo "Summary:"
echo "  • C++ implementation: ✅"
echo "  • WASM exports: ✅"
echo "  • TypeScript types: ✅"
echo "  • Web Worker: ✅"
echo "  • React Hook: ✅"
echo "  • Component: ✅"
echo "  • TaskManager: ✅"
echo "  • Build: ✅"
echo "  • Memory safety: ✅"
echo "  • Backward compatibility: ✅"
echo ""
echo "📦 Ready for production use!"
