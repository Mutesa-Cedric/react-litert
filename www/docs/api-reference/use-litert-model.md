---
sidebar_position: 3
---

# useLiteRtModel

:::danger DEPRECATED
This hook is deprecated and will be removed in v1.0.0. Please use [`useModel`](./use-model) with `runtime: 'litert'` instead.

**Migration:**

```tsx
// Before
const { runRaw } = useLiteRtModel({ modelUrl: '/model.tflite' });

// After
const { run } = useModel({ modelUrl: '/model.tflite', runtime: 'litert' });
```

:::

Hook for loading and running `.tflite` models with raw LiteRT tensors (no TensorFlow.js dependency).

## Import

```tsx
import { useLiteRtModel } from 'react-litert/core';
```

## Usage

```tsx
import { createTensor } from '@litertjs/core';
import { useLiteRtModel } from 'react-litert/core';

function MyComponent() {
  const { status, runRaw, error, accelerator } = useLiteRtModel({
    modelUrl: '/models/my_model.tflite',
  });

  async function runInference() {
    const input = createTensor('float32', [1, 224, 224, 3], data);
    const output = await runRaw(input);
    console.log(output);
  }
}
```

## When to Use

Use `useLiteRtModel` when you:

- Don't want to include TensorFlow.js in your bundle
- Need full control over tensor creation and manipulation
- Want to work directly with LiteRT's tensor API

## Options

Same as `useLiteRtTfjsModel`:

- `modelUrl: string` - **Required.** URL to the `.tflite` model
- `id?: string` - Optional cache key
- `acceleratorPreference?: ("webgpu" | "wasm")[]` - Override accelerator preference
- `lazy?: boolean` - Load on-demand

## Returns

### `status: LiteRtModelStatus`

Same as `useLiteRtTfjsModel`.

### `error: Error | null`

Same as `useLiteRtTfjsModel`.

### `accelerator: "webgpu" | "wasm" | null`

Same as `useLiteRtTfjsModel`.

### `model: CompiledModel | null`

The underlying LiteRT compiled model. `null` until model is ready.

### `runRaw(input, signature?): Promise<Out>`

Function to run inference with raw LiteRT tensors.

**Parameters:**

- `input` - LiteRT tensor(s):
  - Single tensor: `Tensor`
  - Array: `Tensor[]`
  - Named: `Record<string, Tensor>`
- `signature` - Optional signature name for multi-signature models

**Returns:** Promise resolving to output tensor(s)

```tsx
import { createTensor } from '@litertjs/core';

const { runRaw } = useLiteRtModel({
  modelUrl: '/models/my_model.tflite',
});

// Single tensor
const input = createTensor('float32', [1, 224, 224, 3], imageData);
const output = await runRaw(input);

// Array input
const inputs = [tensor1, tensor2];
const outputs = await runRaw(inputs);

// Named input
const inputs = { input1: tensor1, input2: tensor2 };
const outputs = await runRaw(inputs);
```

### `inputDetails: LiteRtTensorInfo[] | null`

Same as `useLiteRtTfjsModel`.

### `outputDetails: LiteRtTensorInfo[] | null`

Same as `useLiteRtTfjsModel`.

## Complete Example

```tsx
import { createTensor } from '@litertjs/core';
import { useLiteRtModel } from 'react-litert/core';

function RawModelExample() {
  const { status, runRaw, error } = useLiteRtModel({
    modelUrl: '/models/linear.tflite',
  });

  async function runInference() {
    if (status !== 'ready') {
      throw new Error('Model not ready');
    }

    // Create input tensor manually
    const input = createTensor('float32', [1], new Float32Array([5.0]));

    // Run inference
    const output = await runRaw(input);

    // Access output data
    const outputData = output.data();
    console.log('Output:', outputData);
  }

  if (status === 'error') {
    return <div>Error: {error?.message}</div>;
  }

  if (status !== 'ready') {
    return <div>Loading...</div>;
  }

  return <button onClick={runInference}>Run Inference</button>;
}
```

## Working with LiteRT Tensors

To create and manipulate LiteRT tensors, use the `@litertjs/core` package:

```tsx
import { createTensor } from '@litertjs/core';

// Create a tensor
const tensor = createTensor(
  'float32',           // dtype: 'float32' | 'int32'
  [1, 224, 224, 3],    // shape
  new Float32Array(...) // data
);

// Access tensor properties
console.log(tensor.shape);   // [1, 224, 224, 3]
console.log(tensor.dtype);   // 'float32'
console.log(tensor.data());  // Float32Array
```
