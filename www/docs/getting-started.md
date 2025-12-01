---
sidebar_position: 1
---

# Getting Started

**react-litert** is a React integration for Google's LiteRT.js, providing a simple API for loading and running `.tflite` models in React applications using WebGPU or WASM with TensorFlow.js tensors.

## What is react-litert?

react-litert makes it easy to run TensorFlow Lite models in your React applications. It provides:

- **React-friendly model loading** - Simple hooks for loading and using models
- **Automatic accelerator selection** - WebGPU → WASM fallback
- **tf.Tensor integration** - Works seamlessly with TensorFlow.js
- **Global runtime initialization** - Configure once with `<LiteRtProvider>`
- **Built-in model caching** - Avoids re-compilation of models

## Quick Example

Here's a minimal example to get you started:

```tsx
import { LiteRtProvider, useLiteRtTfjsModel } from 'react-litert';
import * as tf from '@tensorflow/tfjs-core';

function App() {
  return (
    <LiteRtProvider
      config={{
        wasmRoot: '/litert-wasm/',
        preferAccelerators: ['webgpu', 'wasm'],
      }}
    >
      <ImageClassifier />
    </LiteRtProvider>
  );
}

function ImageClassifier() {
  const { status, run } = useLiteRtTfjsModel({
    modelUrl: '/models/mobilenet_v2.tflite',
  });

  async function classify(image: tf.Tensor4D) {
    const output = await run(image);
    console.log('Predictions:', output);
  }

  if (status !== 'ready') return <div>Loading model...</div>;

  return <button onClick={() => classify(imageTensor)}>Classify</button>;
}
```

## Key Concepts

### 1. Provider Setup

Wrap your application with `<LiteRtProvider>` to configure the LiteRT runtime globally. This sets up WebGPU/WASM support and TensorFlow.js backends.

### 2. Model Hooks

Use `useLiteRtTfjsModel` to load and run models with TensorFlow.js tensors, or `useLiteRtModel` for raw LiteRT tensors (no TensorFlow.js dependency).

### 3. Model Status

Models go through several states:
- `idle` - Not started
- `initializing-runtime` - Setting up WebGPU/WASM
- `compiling` - Compiling the model
- `ready` - Ready to run inference
- `error` - Something went wrong

## Next Steps

- [Installation](./installation) - Install react-litert and its dependencies
- [Basic Usage](./basic-usage) - Learn how to use the hooks
- [API Reference](./api-reference/litert-provider) - Detailed API documentation

