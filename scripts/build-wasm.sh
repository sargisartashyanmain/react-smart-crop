#!/bin/bash

# Setup Emscripten environment (ensure emsdk is installed)
if ! command -v emcc &> /dev/null
then
    source "$HOME/emsdk/emsdk_env.sh"
fi

mkdir -p src/wasm

echo "🚀 Compiling C++ to WebAssembly..."

# Compile C++ source to WASM module using Emscripten
# Flags explanation:
emcc core/src/main.cpp \
    -O3 \                                    # Maximum optimization level
    -s WASM=1 \                             # Enable WebAssembly output
    -s MODULARIZE=1 \                       # Use modular JavaScript wrapper
    -s EXPORT_ES6=1 \                       # Export as ES6 module
    -s ALLOW_MEMORY_GROWTH=1 \              # Allow dynamic memory expansion
    -s EXPORTED_RUNTIME_METHODS='["HEAPU8"]' \  # Expose memory views
    -s "EXPORTED_FUNCTIONS=['_malloc', '_free', '_findSmartCrop']" \  # Export C functions
    -msimd128 \                             # Enable SIMD for vectorization
    -fno-exceptions \                       # Disable C++ exceptions for size
    -o src/wasm/smart_crop.js

if [ $? -eq 0 ]; then
    echo "✅ WASM compilation successful. Module generated: src/wasm/"
else
    echo "❌ WASM compilation failed!"
    exit 1
fi