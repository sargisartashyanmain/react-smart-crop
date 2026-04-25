#!/bin/bash
if ! command -v emcc &> /dev/null
then
    source "$HOME/emsdk/emsdk_env.sh"
fi

mkdir -p src/wasm

echo "🚀 Compiling C++ to WebAssembly (Multi-focus update)..."

emcc core/src/main.cpp \
    -O3 \
    -s WASM=1 \
    -s MODULARIZE=1 \
    -s EXPORT_ES6=1 \
    -s EXPORTED_RUNTIME_METHODS='["HEAPU8", "HEAPF32", "getValue"]' \
    -s "EXPORTED_FUNCTIONS=['_malloc', '_free', '_findSmartCrop', '_findSmartCropMulti', '_freeFocalPoints']" \
    -msimd128 \
    -fno-exceptions \
    -o src/wasm/smart_crop.js

if [ $? -eq 0 ]; then
    echo "✅ WASM compilation successful. Module generated in src/wasm/"
else
    echo "❌ WASM compilation failed!"
    exit 1
fi