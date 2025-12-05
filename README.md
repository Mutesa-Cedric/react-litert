# react-litert

**A React library for running on-device AI with Google's LiteRT runtime**

## Features

- Unified `useModel` hook for all model loading
- Automatic accelerator selection (WebGPU → WASM fallback)
- Support for both TensorFlow.js and raw LiteRT tensors
- Global runtime initialization via `<LiteRtProvider>`
- Built-in model caching

---

## Installation

```bash
npm install react-litert
```

## Quick Start

### 1. Wrap your application in `<LiteRtProvider>`

```tsx
import { LiteRtProvider } from 'react-litert';

export function App() {
  return (
    <LiteRtProvider
      config={{
        wasmRoot: '/litert-wasm/',
        preferAccelerators: ['webgpu', 'wasm'],
        tfBackend: 'webgpu',
      }}
    >
      <Main />
    </LiteRtProvider>
  );
}
```

### 2. Use the `useModel` hook

```tsx
import * as tf from '@tensorflow/tfjs-core';
import { useModel } from 'react-litert';

export function Main() {
  const { status, run, error } = useModel({
    modelUrl: '/models/mobilenet_v2.tflite',
    runtime: 'tfjs', // Use 'tfjs' for TensorFlow.js tensors
  });

  async function predict(input: tf.Tensor4D) {
    const output = await run(input);
    console.log(output);
  }

  if (status !== 'ready') return <p>Status: {status}</p>;
  if (error) return <p>Error: {error.message}</p>;

  return <p>Model loaded. Call predict().</p>;
}
```

## API Reference

### `<LiteRtProvider>`

Initializes the LiteRT runtime globally.

**Config options:**

```ts
{
  wasmRoot?: string;                      // Path to WASM files
  preferAccelerators?: ('webgpu' | 'wasm')[]; // Accelerator preference order
  tfBackend?: 'webgpu' | 'wasm' | 'cpu';  // TensorFlow.js backend
  autoShareWebGpuWithTfjs?: boolean;      // Share WebGPU device (default: true)
  onRuntimeError?: (error: Error) => void;
}
```

### `useModel(options)`

The primary hook for loading and running models.

**Options:**

```ts
{
  modelUrl: string;                      // Path to .tflite model
  runtime: 'tfjs' | 'litert';           // Runtime selection (default: 'tfjs')
  id?: string;                          // Cache key
  acceleratorPreference?: ('webgpu' | 'wasm')[];
  lazy?: boolean;
}
```

**Returns:**

```ts
{
  status: LiteRtModelStatus;            // 'idle' | 'compiling' | 'ready' | 'error'
  error: Error | null;
  accelerator: 'webgpu' | 'wasm' | null;
  run: (input, signature?) => Promise<output>;
  inputDetails: LiteRtTensorInfo[] | null;
  outputDetails: LiteRtTensorInfo[] | null;
}
```

**Examples:**

```tsx
// With TensorFlow.js
const { run } = useModel({
  modelUrl: '/model.tflite',
  runtime: 'tfjs',
});

// With raw LiteRT tensors
const { run } = useModel({
  modelUrl: '/model.tflite',
  runtime: 'litert',
});
```

## Advanced Usage (Raw LiteRT Tensors)

For users who want **no TensorFlow.js** and full control over LiteRT tensors:

```tsx
import { createTensor } from '@litertjs/core';
import { useModel } from 'react-litert';

export function RawExample() {
  const { status, run } = useModel({
    modelUrl: '/models/linear.tflite',
    runtime: 'litert', // Use raw LiteRT tensors
  });

  async function predict() {
    // Create LiteRT tensor manually
    const input = createTensor('float32', [1], new Float32Array([5]));

    // Run inference with raw LiteRT tensors
    const output = await run(input);
    console.log(output);
  }

  if (status === 'ready') predict();
  return <p>Model status: {status}</p>;
}
```

## Licence

[MIT](./LICENSE)
