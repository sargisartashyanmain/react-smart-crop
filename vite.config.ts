import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { resolve } from 'path'
import dts from 'vite-plugin-dts';

/**
 * Vite configuration for react-smart-crop library.
 * 
 * Builds both ES and UMD formats with:
 * - TypeScript definitions generation
 * - WASM module copying to dist
 * - React peer dependency externalization
 * - Memory-efficient WASM handling
 */

export default defineConfig({
  plugins: [
    react(),
    // Generate TypeScript declaration files (.d.ts)
    dts({
      insertTypesEntry: true, // Add types to package.json exports
      include: ['src'],       // Include all src files in type checking
      staticImport: true,     // Exclude WASM artifacts from type generation
    }),
    // Copy WASM module artifacts to output directory
    viteStaticCopy({
      targets: [
      {
        src: 'src/wasm/smart_crop.wasm',
        dest: 'wasm'
      },
      {
        src: 'src/wasm/smart_crop.js',
        dest: 'wasm'
      }
    ]
  })],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ReactSmartCrop',
      formats: ['es', 'umd'],
      fileName: (format) => `react-smart-crop.${format}.js`,
    },
    rollupOptions: {
      // Exclude React from bundle (consumer provides via peerDependencies)
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        // Global variable names for UMD bundle
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime'
        },
      },
    },
  },
  // Allow Vite to handle WASM modules without static analysis issues
  optimizeDeps: {
    exclude: ['src/wasm/smart_crop.js']
  },
  worker: {
    format: 'es',
  }
})
