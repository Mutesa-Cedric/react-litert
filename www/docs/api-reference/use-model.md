---
sidebar_position: 1
---

# useModel

The primary hook for loading and running `.tflite` models.

## Import

```tsx
import { useModel } from 'react-litert';
```

## Usage

```tsx
import * as tf from '@tensorflow/tfjs-core';
import { useModel } from 'react-litert';

function MyComponent() {
  const { status, run, error, accelerator } = useModel({
    modelUrl: '/models/my_model.tflite',
    runtime: 'tfjs', // 'tfjs' | 'litert'
  });

  // Use the model...
}
```

## Options

### `modelUrl: string`

**Required.** URL or path to the `.tflite` model file.

```tsx
useModel({
  modelUrl: '/models/mobilenet_v2.tflite',
  runtime: 'tfjs',
});
```

### `runtime: 'tfjs' | 'litert'`

Specifies which runtime to use.

- `'tfjs'` - Use TensorFlow.js tensors (default if omitted)
- `'litert'` - Use raw LiteRT tensors

```tsx
// With TensorFlow.js
const model1 = useModel({
  modelUrl: '/model.tflite',
  runtime: 'tfjs',
});

// With raw LiteRT
const model2 = useModel({
  modelUrl: '/model.tflite',
  runtime: 'litert',
});
```

### `id?: string`

Optional cache key for the model. If not provided, the `modelUrl` is used as the cache key.

```tsx
useModel({
  modelUrl: '/models/my_model.tflite',
  runtime: 'tfjs',
  id: 'my-custom-key',
});
```

### `acceleratorPreference?: ('webgpu' | 'wasm')[]`

Override the global accelerator preference for this specific model.

```tsx
useModel({
  modelUrl: '/models/my_model.tflite',
  runtime: 'tfjs',
  acceleratorPreference: ['wasm'], // Force WASM
});
```

### `lazy?: boolean`

If `true`, the model won't be loaded until `run()` is called for the first time.

**Default:** `false`

```tsx
useModel({
  modelUrl: '/models/my_model.tflite',
  runtime: 'tfjs',
  lazy: true,
});
```

### `inputStyle?: 'single' | 'array' | 'named'`

How to interpret the input when calling `run()`. Only relevant for TensorFlow.js runtime.

- `'single'` - Single tensor input
- `'array'` - Array of tensors
- `'named'` - Named tensors (Record)

**Default:** Automatically detected from model signature

## Returns

### `status: LiteRtModelStatus`

Current status of the model:

- `'idle'` - Model loading hasn't started
- `'initializing-runtime'` - Setting up WebGPU/WASM runtime
- `'compiling'` - Compiling the model
- `'ready'` - Model is ready to use
- `'error'` - An error occurred

### `error: Error | null`

Error object if `status === 'error'`, otherwise `null`.

### `accelerator: 'webgpu' | 'wasm' | null`

The accelerator being used by the model. `null` if not yet determined.

### `run(input, signature?): Promise<output>`

Function to run inference on the model.

**For `runtime: 'tfjs'`:**

- **Parameters:**
  - `input: TfjsInput` - TensorFlow.js tensor, array of tensors, or named tensors
  - `signature?: string` - Optional signature name for multi-signature models
- **Returns:** `Promise<TfjsOutput>` - TensorFlow.js tensor(s)

**For `runtime: 'litert'`:**

- **Parameters:**
  - `input: LiteRtInput` - LiteRT tensor, array of tensors, or named tensors
  - `signature?: string` - Optional signature name for multi-signature models
- **Returns:** `Promise<LiteRtOutput>` - LiteRT tensor(s)

**Throws:** Error if model is not ready

```tsx
// With TensorFlow.js
const { run } = useModel({
  modelUrl: '/models/my_model.tflite',
  runtime: 'tfjs',
});

const output = await run(inputTensor);

// With raw LiteRT
const { run: runRaw } = useModel({
  modelUrl: '/models/my_model.tflite',
  runtime: 'litert',
});

const output = await runRaw(literTensor);
```

### `inputDetails: LiteRtTensorInfo[] | null`

Array of input tensor information. `null` until model is loaded.

Each `LiteRtTensorInfo` contains:

- `name: string` - Tensor name
- `index: number` - Tensor index
- `shape: number[]` - Tensor shape
- `dtype: 'float32' | 'int32'` - Data type

```tsx
const { inputDetails } = useModel({
  modelUrl: '/model.tflite',
  runtime: 'tfjs',
});

console.log('Input shape:', inputDetails?.[0].shape);
```

### `outputDetails: LiteRtTensorInfo[] | null`

Array of output tensor information. `null` until model is loaded.

## Examples

### Image Classification with TensorFlow.js

```tsx
import * as tf from '@tensorflow/tfjs-core';
import { useModel } from 'react-litert';

function ImageClassifier() {
  const { status, run, error, accelerator } = useModel({
    modelUrl: '/models/mobilenet_v2.tflite',
    runtime: 'tfjs',
  });

  async function classify(image: tf.Tensor4D) {
    if (status !== 'ready') {
      throw new Error('Model not ready');
    }

    const output = await run(image);

    // Handle output
    if (Array.isArray(output)) {
      const predictions = await output[0].data();
      return predictions;
    } else {
      const predictions = await output.data();
      return predictions;
    }
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
      <button onClick={() => classify(imageTensor)}>Classify</button>
    </div>
  );
}
```

### Raw LiteRT Tensors

```tsx
import { createTensor } from '@litertjs/core';
import { useModel } from 'react-litert';

function RawModelExample() {
  const { status, run } = useModel({
    modelUrl: '/models/linear.tflite',
    runtime: 'litert',
  });

  async function runInference() {
    if (status !== 'ready') {
      throw new Error('Model not ready');
    }

    // Create LiteRT tensor
    const input = createTensor('float32', [1], new Float32Array([5.0]));

    // Run inference
    const output = await run(input);

    // Access output data
    if (Array.isArray(output)) {
      console.log('Output:', output[0].data());
    }
  }

  if (status !== 'ready') {
    return <div>Loading...</div>;
  }

  return <button onClick={runInference}>Run Inference</button>;
}
```

### Multi-Signature Models

```tsx
const { run } = useModel({
  modelUrl: '/models/multi_signature.tflite',
  runtime: 'tfjs',
});

// Run with specific signature
const output = await run(input, 'serving_default');
```

## Migration from Deprecated Hooks

### From `useLiteRtTfjsModel`

```tsx
// Before
const { run } = useLiteRtTfjsModel({
  modelUrl: '/model.tflite',
});

// After
const { run } = useModel({
  modelUrl: '/model.tflite',
  runtime: 'tfjs',
});
```

### From `useLiteRtModel`

```tsx
// Before
const { runRaw } = useLiteRtModel({
  modelUrl: '/model.tflite',
});

// After
const { run } = useModel({
  modelUrl: '/model.tflite',
  runtime: 'litert',
});
```

## See Also

- [LiteRtProvider](./litert-provider) - Configure the global runtime
- [useLiteRtRuntime](./use-litert-runtime) - Access runtime status
