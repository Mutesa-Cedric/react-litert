# react-litert

**React integration for Google’s LiteRT.js.**

A small API for loading and running `.tflite` models in React using WebGPU or WASM, with tf.Tensor input/output.

---

## Features

- React-friendly model loading
- Automatic accelerator selection (WebGPU → WASM fallback)
- tf.Tensor in → tf.Tensor out
- Global runtime initialization via `<LiteRtProvider>`
- Built-in model caching to avoid re-compilation

---

## Installation

```bash
npm install react-litert
```

## Usage

### 1. wrap your application in `<LiteRtProvider>`

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

### 2. Use a model

```tsx
import * as tf from '@tensorflow/tfjs-core'; // optional, if you want types
import { useLiteRtTfjsModel } from 'react-litert';

export function Main() {
  const { status, run, error } = useLiteRtTfjsModel({
    modelUrl: '/models/mobilenet_v2.tflite',
  });

  async function predict(t: tf.Tensor4D) {
    const out = await run(t);
    console.log(out);
  }

  if (status !== 'ready') return <p>Status: {status}</p>;
  if (error) return <p>Error: {error.message}</p>;

  return <p>Model loaded. Call predict().</p>;
}
```

## API

`<LiteRtProvider config>`

### Config fields:

```ts
wasmRoot?: string
preferAccelerators?: ("webgpu" | "wasm")[]
tfBackend?: "webgpu" | "wasm" | "cpu"
autoShareWebGpuWithTfjs?: boolean
onRuntimeError?: (error: Error) => void
```

### useLiteRtTfjsModel(options)

Loads a .tflite and returns a run() method that works with tf.Tensors.

#### Options:

```ts
modelUrl: string
id?: string (cache key)
acceleratorPreference?: ("webgpu" | "wasm")[]
lazy?: boolean
```

#### Returns:

```ts
status;
error;
accelerator;
run(input);
inputDetails;
outputDetails;
```

## Advanced usage (Raw LiteRT Tensors)

For users who want **no tfjs** and full control:

```tsx
import { createTensor } from '@litertjs/core';
import { useLiteRtModel } from 'react-litert/core';

export function RawExample() {
  const { status, runRaw } = useLiteRtModel({
    modelUrl: '/models/linear.tflite',
  });

  async function go() {
    // Create LiteRT tensor manually
    const input = createTensor('float32', [1], new Float32Array([5]));

    // Run inference with raw LiteRT tensors
    const out = await runRaw(input);

    console.log(out);
  }

  if (status === 'ready') go();
  return <p>Raw model status: {status}</p>;
}
```

you can use this hook from `react-litert/core`

```ts
import { useLiteRtModel } from 'react-litert/core';
```

## Licence

MIT
