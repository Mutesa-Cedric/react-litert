---
sidebar_position: 1
---

# Getting Started

**react-litert** is a React library for running on-device AI with Google's LiteRT runtime. Run TensorFlow Lite models directly in the browser with WebGPU or WASM acceleration.

## What is react-litert?

react-litert makes it easy to run TensorFlow Lite models in your React applications. It provides:

- **Unified `useModel` hook** - Single hook for all model loading
- **Automatic accelerator selection** - WebGPU → WASM fallback
- **Flexible runtime options** - Works with TensorFlow.js or raw LiteRT tensors
- **Global runtime initialization** - Configure once with `<LiteRtProvider>`
- **Built-in model caching** - Avoids re-compilation of models

## Quick Example

Here's a minimal example to get you started:

```tsx
import * as tf from '@tensorflow/tfjs-core';
import { LiteRtProvider, useModel } from 'react-litert';

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
  const { status, run } = useModel({
    modelUrl: '/models/mobilenet_v2.tflite',
    runtime: 'tfjs', // Use 'tfjs' for TensorFlow.js tensors
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

### 2. The `useModel` Hook

Use the unified `useModel` hook to load and run models:

- `runtime: 'tfjs'` - Works with TensorFlow.js tensors (default)
- `runtime: 'litert'` - Works with raw LiteRT tensors (no TensorFlow.js)

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
