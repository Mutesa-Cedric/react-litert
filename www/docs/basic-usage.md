---
sidebar_position: 3
---

# Basic Usage

Learn how to use react-litert in your React application.

## Setup the Provider

First, wrap your application with `<LiteRtProvider>`:

```tsx
import { LiteRtProvider } from 'react-litert';

function App() {
  return (
    <LiteRtProvider
      config={{
        wasmRoot: '/litert-wasm/',
        preferAccelerators: ['webgpu', 'wasm'],
        tfBackend: 'webgpu',
      }}
    >
      <YourApp />
    </LiteRtProvider>
  );
}
```

### Configuration Options

- `wasmRoot` - Path where LiteRT WASM files are located (required)
- `preferAccelerators` - Preferred accelerators in order (default: `['webgpu', 'wasm']`)
- `tfBackend` - TensorFlow.js backend to use (optional)
- `autoShareWebGpuWithTfjs` - Share WebGPU device with TensorFlow.js (default: `true`)
- `onRuntimeError` - Error handler callback (optional)

## Using the `useModel` Hook

The `useModel` hook is the primary way to load and run models.

### With TensorFlow.js (Recommended)

Use `runtime: 'tfjs'` to work with TensorFlow.js tensors:

```tsx
import * as tf from '@tensorflow/tfjs-core';
import { useModel } from 'react-litert';

function ImageClassifier() {
  const { status, run, error, accelerator } = useModel({
    modelUrl: '/models/mobilenet_v2.tflite',
    runtime: 'tfjs',
  });

  async function classify(image: tf.Tensor4D) {
    if (status !== 'ready') return;

    const output = await run(image);

    // Handle different output formats
    if (Array.isArray(output)) {
      const predictions = await output[0].data();
      console.log('Predictions:', predictions);
    } else {
      const predictions = await output.data();
      console.log('Predictions:', predictions);
    }
  }

  if (status === 'idle' || status === 'initializing-runtime' || status === 'compiling') {
    return <div>Loading model...</div>;
  }

  if (status === 'error') {
    return <div>Error: {error?.message}</div>;
  }

  return (
    <div>
      <p>Model ready! Accelerator: {accelerator}</p>
      <button onClick={() => classify(imageTensor)}>Classify Image</button>
    </div>
  );
}
```

### With Raw LiteRT Tensors

Use `runtime: 'litert'` for direct LiteRT tensor manipulation (no TensorFlow.js dependency):

```tsx
import { createTensor } from '@litertjs/core';
import { useModel } from 'react-litert';

function RawInference() {
  const { status, run } = useModel({
    modelUrl: '/models/my_model.tflite',
    runtime: 'litert', // Works with raw LiteRT Tensors
  });

  async function predict() {
    if (status !== 'ready') return;

    // Create a LiteRT tensor
    const input = createTensor('float32', [1, 224, 224, 3], new Float32Array(224 * 224 * 3));

    const output = await run(input);
    console.log('Output:', output);
  }

  return <button onClick={predict}>Run Inference</button>;
}
```

## Model Status

The hook returns a `status` field that indicates the current state:

- `idle` - Model loading hasn't started
- `initializing-runtime` - Setting up WebGPU/WASM runtime
- `compiling` - Compiling the model
- `ready` - Model is ready to use
- `error` - An error occurred (check `error` field)

## Input/Output Details

You can inspect the model's input and output shapes:

```tsx
const { inputDetails, outputDetails } = useLiteRtTfjsModel({
  modelUrl: '/models/my_model.tflite',
});

console.log('Input shape:', inputDetails?.[0].shape);
console.log('Output shape:', outputDetails?.[0].shape);
```

## Model Options

### Caching

Models are automatically cached by URL. To use a custom cache key:

```tsx
const { run } = useModel({
  modelUrl: '/models/my_model.tflite',
  runtime: 'tfjs',
  id: 'my-custom-cache-key', // Custom cache key
});
```

### Accelerator Preference

Specify which accelerators to try in order:

```tsx
const { run } = useModel({
  modelUrl: '/models/my_model.tflite',
  runtime: 'tfjs',
  acceleratorPreference: ['webgpu', 'wasm'], // Try WebGPU first, fallback to WASM
});
```

### Lazy Loading

Load models only when needed:

```tsx
const { run } = useModel({
  modelUrl: '/models/my_model.tflite',
  runtime: 'tfjs',
  lazy: true, // Don't load until run() is called
});
```

## Migration from Deprecated Hooks

If you're using the deprecated hooks, here's how to migrate to `useModel`:

### From `useLiteRtTfjsModel`

**Before:**

```tsx
const { run } = useLiteRtTfjsModel({ modelUrl: '/model.tflite' });
```

**After:**

```tsx
const { run } = useModel({ modelUrl: '/model.tflite', runtime: 'tfjs' });
```

### From `useLiteRtModel`

**Before:**

```tsx
const { runRaw } = useLiteRtModel({ modelUrl: '/model.tflite' });
```

**After:**

```tsx
const { run } = useModel({ modelUrl: '/model.tflite', runtime: 'litert' });
```

## Next Steps

- [API Reference](./api-reference/litert-provider) - Detailed API documentation
- [Advanced Usage](./advanced-usage) - Raw LiteRT tensors and advanced features
- [Examples](./examples) - Complete example applications
