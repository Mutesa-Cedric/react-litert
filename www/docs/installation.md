---
sidebar_position: 2
---

# Installation

Install react-litert and its required dependencies.

## npm

```bash
npm install react-litert
```

## yarn

```bash
yarn add react-litert
```

## pnpm

```bash
pnpm add react-litert
```

## Peer Dependencies

react-litert requires React as a peer dependency. Make sure you have React installed:

```bash
npm install react
```

## Optional Dependencies

### TensorFlow.js (for tf.Tensor support)

If you want to use `useLiteRtTfjsModel` with TensorFlow.js tensors, install TensorFlow.js:

```bash
npm install @tensorflow/tfjs-core
```

The package includes TensorFlow.js backends (`@tensorflow/tfjs-backend-webgpu` and `@tensorflow/tfjs-backend-cpu`), so you don't need to install them separately.

### LiteRT WASM Files

You'll need to include the LiteRT WASM files in your application. You can:

1. **Copy from node_modules** (recommended for development):
   ```bash
   cp -r node_modules/@litertjs/core/dist/wasm public/litert-wasm
   ```

2. **Use a CDN** (for production):
   Set `wasmRoot` in your provider config to point to a CDN URL.

3. **Bundle with your app**:
   Configure your bundler to copy the WASM files to your output directory.

## Verify Installation

Create a simple test component to verify everything is set up correctly:

```tsx
import { LiteRtProvider } from 'react-litert';

function App() {
  return (
    <LiteRtProvider config={{ wasmRoot: '/litert-wasm/' }}>
      <div>react-litert is installed!</div>
    </LiteRtProvider>
  );
}
```

If this renders without errors, you're ready to go!

## Next Steps

- [Basic Usage](./basic-usage) - Learn how to use react-litert in your app
- [API Reference](./api-reference/litert-provider) - Detailed API documentation

