---
sidebar_position: 6
---

# Examples

Complete example applications demonstrating react-litert usage.

## Image Classification

A complete image classification example using MobileNet V2.

**Location:** [`examples/image-classification`](https://github.com/Mutesa-Cedric/react-litert/tree/main/examples/image-classification)

### Features

- Load and run MobileNet V2 model
- Upload and classify images
- Display predictions with confidence scores
- WebGPU/WASM acceleration

### Key Code

```tsx
import { LiteRtProvider, useLiteRtTfjsModel } from 'react-litert';
import * as tf from '@tensorflow/tfjs-core';

function App() {
  return (
    <LiteRtProvider
      config={{
        wasmRoot: '/litert-wasm/',
        preferAccelerators: ['webgpu', 'wasm'],
        tfBackend: 'webgpu',
      }}
    >
      <ImageClassifier />
    </LiteRtProvider>
  );
}

function ImageClassifier() {
  const { status, run } = useLiteRtTfjsModel({
    modelUrl: '/models/mobilenet_v2_1.0_224.tflite',
  });

  async function classifyImage(imageFile: File) {
    // Load and preprocess image
    const image = await loadImage(imageFile);
    const tensor = tf.browser.fromPixels(image)
      .resizeBilinear([224, 224])
      .expandDims(0)
      .div(255.0);

    // Run inference
    const output = await run(tensor);
    const predictions = await output.data();

    // Process results
    return getTopPredictions(predictions);
  }

  // ... rest of component
}
```

### Running the Example

```bash
cd examples/image-classification
npm install
npm run dev
```

## Creating Your Own Example

### Basic Setup

1. **Install dependencies:**

```bash
npm install react-litert @tensorflow/tfjs-core
```

2. **Set up the provider:**

```tsx
import { LiteRtProvider } from 'react-litert';

function App() {
  return (
    <LiteRtProvider
      config={{
        wasmRoot: '/litert-wasm/',
        preferAccelerators: ['webgpu', 'wasm'],
      }}
    >
      <YourComponent />
    </LiteRtProvider>
  );
}
```

3. **Use a model:**

```tsx
import { useLiteRtTfjsModel } from 'react-litert';

function YourComponent() {
  const { status, run } = useLiteRtTfjsModel({
    modelUrl: '/models/your_model.tflite',
  });

  async function runInference(input) {
    const output = await run(input);
    return output;
  }

  // ... rest of component
}
```

### Common Patterns

#### Image Preprocessing

```tsx
import * as tf from '@tensorflow/tfjs-core';

async function preprocessImage(imageFile: File): Promise<tf.Tensor4D> {
  const img = new Image();
  img.src = URL.createObjectURL(imageFile);
  await img.decode();

  return tf.browser
    .fromPixels(img)
    .resizeBilinear([224, 224])
    .expandDims(0)
    .div(255.0) as tf.Tensor4D;
}
```

#### Handling Model Output

```tsx
async function processOutput(output: tf.Tensor) {
  const data = await output.data();
  const predictions = Array.from(data);
  
  // Get top 5 predictions
  const top5 = predictions
    .map((score, index) => ({ index, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  
  return top5;
}
```

#### Error Handling

```tsx
function ModelComponent() {
  const { status, error, run } = useLiteRtTfjsModel({
    modelUrl: '/models/model.tflite',
  });

  if (status === 'error') {
    return <div>Error: {error?.message}</div>;
  }

  async function handleRun() {
    try {
      const output = await run(input);
      // Handle success
    } catch (err) {
      console.error('Inference failed:', err);
      // Handle error
    }
  }
}
```

## More Examples

Check out the [`examples`](https://github.com/Mutesa-Cedric/react-litert/tree/main/examples) directory in the repository for more complete examples.

## Contributing Examples

Have a great example? Consider contributing it to the repository! Examples help other developers learn how to use react-litert effectively.

## Next Steps

- [Getting Started](./getting-started) - Learn the basics
- [API Reference](./api-reference/litert-provider) - Detailed API documentation
- [Advanced Usage](./advanced-usage) - Advanced patterns and techniques

