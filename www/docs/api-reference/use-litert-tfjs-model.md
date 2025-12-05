---
sidebar_position: 2
---

# useLiteRtTfjsModel

:::danger DEPRECATED
This hook is deprecated and will be removed in v1.0.0. Please use [`useModel`](./use-model) with `runtime: 'tfjs'` instead.

**Migration:**

```tsx
// Before
const { run } = useLiteRtTfjsModel({ modelUrl: '/model.tflite' });

// After
const { run } = useModel({ modelUrl: '/model.tflite', runtime: 'tfjs' });
```

:::

Hook for loading and running `.tflite` models with TensorFlow.js tensors.

## Import

```tsx
import { useLiteRtTfjsModel } from 'react-litert';
```

## Usage

```tsx
import * as tf from '@tensorflow/tfjs-core';
import { useLiteRtTfjsModel } from 'react-litert';

function MyComponent() {
  const { status, run, error, accelerator, inputDetails, outputDetails } = useLiteRtTfjsModel({
    modelUrl: '/models/my_model.tflite',
  });

  // Use the model...
}
```

## Options

### `modelUrl: string`

**Required.** URL or path to the `.tflite` model file.

```tsx
useLiteRtTfjsModel({
  modelUrl: '/models/mobilenet_v2.tflite',
});
```

### `id?: string`

Optional cache key for the model. If not provided, the `modelUrl` is used as the cache key.

```tsx
useLiteRtTfjsModel({
  modelUrl: '/models/my_model.tflite',
  id: 'my-custom-key', // Use this for caching
});
```

### `acceleratorPreference?: ("webgpu" | "wasm")[]`

Override the global accelerator preference for this specific model.

```tsx
useLiteRtTfjsModel({
  modelUrl: '/models/my_model.tflite',
  acceleratorPreference: ['wasm'], // Force WASM for this model
});
```

### `lazy?: boolean`

If `true`, the model won't be loaded until `run()` is called for the first time.

**Default:** `false`

```tsx
useLiteRtTfjsModel({
  modelUrl: '/models/my_model.tflite',
  lazy: true, // Load on-demand
});
```

### `inputStyle?: "single" | "array" | "named"`

How to interpret the input when calling `run()`. This affects the type signature of the `run` function.

- `"single"` - Single tensor input: `run(tensor: tf.Tensor)`
- `"array"` - Array of tensors: `run(tensors: tf.Tensor[])`
- `"named"` - Named tensors: `run(tensors: Record<string, tf.Tensor>)`

**Default:** Automatically detected from model signature

## Returns

### `status: LiteRtModelStatus`

Current status of the model:

- `"idle"` - Model loading hasn't started
- `"initializing-runtime"` - Setting up WebGPU/WASM runtime
- `"compiling"` - Compiling the model
- `"ready"` - Model is ready to use
- `"error"` - An error occurred

### `error: Error | null`

Error object if `status === "error"`, otherwise `null`.

### `accelerator: "webgpu" | "wasm" | null`

The accelerator being used by the model. `null` if not yet determined.

### `run(input, signature?): Promise<Out>`

Function to run inference on the model.

**Parameters:**

- `input` - Input tensor(s). Type depends on `inputStyle`:
  - Single tensor: `tf.Tensor`
  - Array: `tf.Tensor[]`
  - Named: `Record<string, tf.Tensor>`
- `signature` - Optional signature name for multi-signature models

**Returns:** Promise resolving to output tensor(s)

**Throws:** Error if model is not ready

```tsx
const { run } = useLiteRtTfjsModel({
  modelUrl: '/models/my_model.tflite',
});

// Single tensor input
const output = await run(inputTensor);

// Array input
const output = await run([tensor1, tensor2]);

// Named input
const output = await run({ input1: tensor1, input2: tensor2 });

// Multi-signature model
const output = await run(inputTensor, 'my_signature');
```

### `inputDetails: LiteRtTensorInfo[] | null`

Array of input tensor information. `null` until model is loaded.

Each `LiteRtTensorInfo` contains:

- `name: string` - Tensor name
- `index: number` - Tensor index
- `shape: number[]` - Tensor shape
- `dtype: "float32" | "int32"` - Data type

### `outputDetails: LiteRtTensorInfo[] | null`

Array of output tensor information. `null` until model is loaded.

## Complete Example

```tsx
import * as tf from '@tensorflow/tfjs-core';
import { useLiteRtTfjsModel } from 'react-litert';

function ImageClassifier() {
  const { status, run, error, accelerator, inputDetails, outputDetails } = useLiteRtTfjsModel({
    modelUrl: '/models/mobilenet_v2.tflite',
  });

  async function classify(image: tf.Tensor4D) {
    if (status !== 'ready') {
      throw new Error('Model not ready');
    }

    const output = await run(image);
    const predictions = await output.data();
    return predictions;
  }

  if (status === 'error') {
    return <div>Error: {error?.message}</div>;
  }

  if (status !== 'ready') {
    return <div>Loading model... ({status})</div>;
  }

  return (
    <div>
      <p>Model ready! Using {accelerator}</p>
      {inputDetails && <p>Input shape: {inputDetails[0].shape.join('x')}</p>}
      {outputDetails && <p>Output shape: {outputDetails[0].shape.join('x')}</p>}
      {/* Your UI here */}
    </div>
  );
}
```
