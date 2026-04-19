# Contributing to react-smart-crop

First off, thank you for considering contributing to **react-smart-crop**! It's people like you that make this library such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

---

## How Can I Contribute?

### Reporting Bugs 🐛

Before creating bug reports, please check the [issue list](https://github.com/sargisartashyanmain/react-smart-crop/issues) as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps which reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots and animated GIFs if possible**
- **Include your OS, browser version, React version**

### Suggesting Enhancements ✨

Enhancement suggestions are tracked as [GitHub issues](https://github.com/sargisartashyanmain/react-smart-crop/issues). When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and expected behavior**
- **Explain why this enhancement would be useful**

### Pull Requests 🚀

- Follow the coding style of the project
- Include appropriate test cases when applicable
- Update relevant documentation
- Include a clear commit message
- Link related issues in your PR description

---

## Development Setup

### Prerequisites

- **Node.js** 18+ and npm
- **Emscripten SDK** (for WASM compilation)
- **Git** for version control

### Step 1: Clone the Repository

```bash
git clone https://github.com/sargisartashyanmain/react-smart-crop.git
cd react-smart-crop
```

### Step 2: Install Node Dependencies

```bash
npm install
```

### Step 3: Setup Emscripten (Optional - Only if modifying C++)

Emscripten is required only if you're making changes to the C++ source code in `core/src/main.cpp`.

#### On macOS/Linux:

```bash
# Clone Emscripten SDK
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk

# Install the latest version
./emsdk install latest
./emsdk activate latest

# Add to your shell profile (~/.bashrc, ~/.zshrc, etc.)
source ~/emsdk/emsdk_env.sh
```

#### On Windows (PowerShell):

```powershell
# Clone Emscripten SDK
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk

# Install the latest version
.\emsdk.bat install latest
.\emsdk.bat activate latest

# Add to environment variables (System Properties > Environment Variables)
# Path: C:\emsdk\emscripten\main
```

#### Verify Installation:

```bash
emcc --version
# Should output: emcc (Emscripten gcc/clang-like replacement) X.X.X
```

### Step 4: Build WASM Module

```bash
# From the project root
./scripts/build-wasm.sh
```

Expected output:
```
🚀 Compiling C++ to WebAssembly...
✅ WASM compilation successful. Module generated: src/wasm/
```

### Step 5: Start Development Server

```bash
npm run dev
```

This starts the Vite dev server on `http://localhost:5173/`. The demo app will automatically reload when you make changes.

### Step 6: Build for Production

```bash
npm run build
```

This builds both the library and the demo:
1. Compiles TypeScript to JavaScript
2. Bundles into ES and UMD formats
3. Generates `.d.ts` type definitions

### Step 7: Lint Code

```bash
npm run lint
```

Runs ESLint to check code style and catch common mistakes.

---

## Project Structure

```
react-smart-crop/
├── core/                      # C++ source code
│   └── src/
│       └── main.cpp          # WASM algorithm implementation
├── src/                       # React TypeScript library
│   ├── components/
│   │   └── SmartCropImage.tsx # Main component
│   ├── hooks/
│   │   └── useSmartCrop.ts    # Core hook
│   ├── wasm/
│   │   ├── smart_crop.js      # WASM wrapper (auto-generated)
│   │   └── wasm.d.ts          # Type declarations
│   └── index.ts               # Main export
├── demo/                      # React demo application
│   ├── src/
│   │   ├── App.tsx            # Demo UI
│   │   ├── context/           # State management
│   │   ├── i18n/              # Translations
│   │   └── main.tsx           # Entry point
│   ├── vite.config.ts
│   └── package.json
├── scripts/
│   └── build-wasm.sh         # WASM compilation script
└── README.md
```

---

## Making Changes to the Algorithm

If you're improving the C++ algorithm in `core/src/main.cpp`:

### 1. Before Modifying

- Understand the current algorithm (see [How It Works](README.md#-how-it-works) section)
- Add comments explaining your changes
- Consider performance implications

### 2. Make Changes

```cpp
// core/src/main.cpp
// Example: improving edge detection
EMSCRIPTEN_BINDINGS(smart_crop) {
  function("findSmartCrop", &findSmartCrop);
}
```

### 3. Rebuild WASM

```bash
./scripts/build-wasm.sh
```

### 4. Test in Demo

```bash
npm run dev
# Test the changes in the browser
# Use the debug checkbox to visualize heatmap
```

### 5. Commit and Push

```bash
git add core/src/main.cpp src/wasm/
git commit -m "Improve edge detection algorithm"
git push origin feature/edge-detection-improvement
```

---

## Making Changes to the React Component

### 1. TypeScript Files

All TypeScript/TSX files should:
- Have clear, descriptive names
- Include JSDoc comments for exported functions/components
- Use strict TypeScript mode
- Follow existing code style

### 2. Styling

The component uses CSS-in-JS for styling. Maintain consistency with existing patterns.

### 3. Testing Changes

```bash
# Start dev server
npm run dev

# Try your changes with different:
# - Image sizes and formats
# - Container sizes (responsive)
# - Debug mode enabled/disabled
# - Different browsers/devices
```

---

## Commit Message Guidelines

- Use the imperative mood ("add feature" not "added feature")
- Reference issues and pull requests liberally after the first line
- Example:

```
Add skin tone detection improvement

- Enhance saliency scoring for portrait photos
- Fix issue with light-skinned subjects
- Closes #42
```

---

## Documentation

When adding features:

1. **Update README.md** if it's user-facing
2. **Add JSDoc comments** in the source code
3. **Update type definitions** (.d.ts files)
4. **Update the demo** if showing new functionality

---

## Performance Considerations

When making changes:

- ⚡ Keep WASM module size minimal
- 🎯 Avoid unnecessary memory allocations
- 📱 Test on mobile devices
- 🔍 Check bundle size impact: `npm run build`

---

## Getting Help

- 📖 [Read the README](README.md)
- 💬 [GitHub Discussions](https://github.com/sargisartashyanmain/react-smart-crop/discussions)
- 🐛 [GitHub Issues](https://github.com/sargisartashyanmain/react-smart-crop/issues)
- 📧 Feel free to reach out on Discussions

---

## Filing an Issue

### Before Submitting an Issue

- **Check the documentation** — Your answer might be in the README
- **Check existing issues** — Someone might have asked already
- **Search in discussions** — Community might have a solution

### Issue Labels

- `bug` — Something isn't working
- `enhancement` — Feature request
- `documentation` — Improvements to docs
- `help wanted` — Looking for contributions
- `good first issue` — Good for first-time contributors

---

## Review Process

1. **Automated checks** run (linting, type checking)
2. **Code review** by maintainers
3. **Approval** and merge
4. **Release** in next version

---

## Thank You! 🙏

Your contributions make **react-smart-crop** better for everyone. We appreciate your effort!

---

**Made with ❤️ in Armenia**
