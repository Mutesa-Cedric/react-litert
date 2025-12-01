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

## Using a Model with TensorFlow.js

The easiest way to use models is with `useLiteRtTfjsModel`, which works with TensorFlow.js tensors:

```tsx
import { useLiteRtTfjsModel } from 'react-litert';
import * as tf from '@tensorflow/tfjs-core';

function ImageClassifier() {
  const { status, run, error } = useLiteRtTfjsModel({
    modelUrl: '/models/mobilenet_v2.tflite',
  });

  async function classify(image: tf.Tensor4D) {
    if (status !== 'ready') return;
    
    const output = await run(image);
    // output is a tf.Tensor or array of tf.Tensors
    const predictions = await output.data();
    console.log('Predictions:', predictions);
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

## Model Caching

Models are automatically cached by URL. To use a custom cache key:

```tsx
const { run } = useLiteRtTfjsModel({
  modelUrl: '/models/my_model.tflite',
  id: 'my-custom-cache-key', // Optional: custom cache key
});
```

## Lazy Loading

Load models only when needed:

```tsx
const { run } = useLiteRtTfjsModel({
  modelUrl: '/models/my_model.tflite',
  lazy: true, // Don't load until run() is called
});
```

## Next Steps

- [API Reference](./api-reference/litert-provider) - Detailed API documentation
- [Advanced Usage](./advanced-usage) - Raw LiteRT tensors and advanced features
- [Examples](./examples) - Complete example applications

