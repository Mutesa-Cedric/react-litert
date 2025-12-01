---
sidebar_position: 5
---

# Advanced Usage

Advanced patterns and techniques for using react-litert.

## Raw LiteRT Tensors

For applications that don't want to include TensorFlow.js, use `useLiteRtModel` from `react-litert/core`:

```tsx
import { useLiteRtModel } from 'react-litert/core';
import { createTensor } from '@litertjs/core';

function RawExample() {
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

## Multi-Signature Models

Some models support multiple signatures. Specify the signature when calling `run()`:

```tsx
const { run } = useLiteRtTfjsModel({
  modelUrl: '/models/multi_signature_model.tflite',
});

// Use default signature
const output1 = await run(input);

// Use specific signature
const output2 = await run(input, 'my_signature_name');
```

## Model Caching

Models are automatically cached by URL. Use custom cache keys to share models across components:

```tsx
// Component 1
const { run: run1 } = useLiteRtTfjsModel({
  modelUrl: '/models/model.tflite',
  id: 'shared-model',
});

// Component 2 - Reuses the same compiled model
const { run: run2 } = useLiteRtTfjsModel({
  modelUrl: '/models/model.tflite',
  id: 'shared-model',
});
```

## Lazy Loading

Load models only when needed:

```tsx
const { status, run } = useLiteRtTfjsModel({
  modelUrl: '/models/heavy_model.tflite',
  lazy: true, // Don't load until run() is called
});

function handleClick() {
  // Model loads here on first call
  run(input).then(output => {
    console.log(output);
  });
}
```

## Error Handling

Handle errors at multiple levels:

```tsx
// Provider-level error handling
<LiteRtProvider
  config={{
    onRuntimeError: (error) => {
      console.error('Runtime error:', error);
      // Log to analytics, show notification, etc.
    },
  }}
>
  <App />
</LiteRtProvider>

// Component-level error handling
function MyComponent() {
  const { status, error, run } = useLiteRtTfjsModel({
    modelUrl: '/models/my_model.tflite',
  });

  if (status === 'error') {
    return <ErrorDisplay error={error} />;
  }

  async function handleRun() {
    try {
      const output = await run(input);
      // Handle success
    } catch (err) {
      // Handle inference error
      console.error('Inference error:', err);
    }
  }
}
```

## Custom Accelerator Selection

Override accelerator preference per model:

```tsx
// Force WASM for a specific model
const { run } = useLiteRtTfjsModel({
  modelUrl: '/models/model.tflite',
  acceleratorPreference: ['wasm'], // Skip WebGPU, use WASM only
});

// Try WebGPU only
const { run } = useLiteRtTfjsModel({
  modelUrl: '/models/model.tflite',
  acceleratorPreference: ['webgpu'], // Fail if WebGPU not available
});
```

## Input Style Detection

The hook automatically detects input style from the model signature. You can also specify it explicitly:

```tsx
// Single tensor input
const { run } = useLiteRtTfjsModel({
  modelUrl: '/models/model.tflite',
  inputStyle: 'single',
});
// run: (input: tf.Tensor) => Promise<tf.Tensor>

// Array input
const { run } = useLiteRtTfjsModel({
  modelUrl: '/models/model.tflite',
  inputStyle: 'array',
});
// run: (input: tf.Tensor[]) => Promise<tf.Tensor[]>

// Named input
const { run } = useLiteRtTfjsModel({
  modelUrl: '/models/model.tflite',
  inputStyle: 'named',
});
// run: (input: Record<string, tf.Tensor>) => Promise<Record<string, tf.Tensor>>
```

## TypeScript Types

For better type safety, specify input/output types:

```tsx
import type * as tf from '@tensorflow/tfjs-core';

const { run } = useLiteRtTfjsModel<tf.Tensor4D, tf.Tensor2D>({
  modelUrl: '/models/model.tflite',
});

// run now has proper types
const output: tf.Tensor2D = await run(inputTensor);
```

## Performance Tips

1. **Preload models** - Don't use `lazy: true` if you know you'll need the model
2. **Reuse compiled models** - Use the same `id` for models loaded in multiple components
3. **Batch inference** - Process multiple inputs in a single batch when possible
4. **WebGPU first** - Prefer WebGPU for better performance when available
5. **Share WebGPU device** - Keep `autoShareWebGpuWithTfjs: true` for efficiency

## Debugging

Check model details:

```tsx
const { inputDetails, outputDetails, accelerator, status } = useLiteRtTfjsModel({
  modelUrl: '/models/model.tflite',
});

console.log('Input details:', inputDetails);
console.log('Output details:', outputDetails);
console.log('Accelerator:', accelerator);
console.log('Status:', status);
```

## Next Steps

- [Examples](./examples) - Complete example applications
- [API Reference](./api-reference/litert-provider) - Detailed API documentation

