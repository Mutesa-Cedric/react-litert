---
sidebar_position: 4
---

# API Reference

Complete API documentation for **react-litert**. This section provides detailed information about all components, hooks, types, and configuration options.

## Overview

react-litert provides a simple, React-friendly API for running TensorFlow Lite models in the browser. The library consists of:

- **1 Provider Component** - `<LiteRtProvider>` for global configuration
- **3 Hooks** - For loading models and accessing runtime information
- **Multiple Configuration Options** - To customize runtime behavior

## Provider Component

### `<LiteRtProvider>`

The root provider component that initializes the LiteRT runtime and makes it available to all child components.

```tsx
<LiteRtProvider config={{ wasmRoot: '/litert-wasm/' }}>
  <App />
</LiteRtProvider>
```

**When to use:** Wrap your entire application (or the part using models) with this provider.

**[Read full documentation →](api-reference/litert-provider)**

## Model Hooks

### `useLiteRtTfjsModel`

**Recommended hook for most use cases.** Load and run `.tflite` models with TensorFlow.js tensor support.

```tsx
const { status, run, error } = useLiteRtTfjsModel({
  modelUrl: '/models/mobilenet_v2.tflite',
});
```

**When to use:** 
- You're already using TensorFlow.js in your project
- You want the convenience of `tf.Tensor` objects
- You need image preprocessing with `tf.browser.fromPixels()`

**[Read full documentation →](api-reference/use-litert-tfjs-model)**

---

### `useLiteRtModel`

Lower-level hook for running models with raw LiteRT tensors (no TensorFlow.js dependency).

```tsx
const { status, runRaw, model } = useLiteRtModel({
  modelUrl: '/models/my_model.tflite',
});
```

**When to use:**
- You want to minimize bundle size (no TensorFlow.js)
- You need direct access to LiteRT's tensor API
- You're building a lightweight application

**[Read full documentation →](api-reference/use-litert-model)**

---

### `useLiteRtRuntime`

Hook for checking runtime status and capabilities.

```tsx
const { status, supportsWebGpu, supportsWasm } = useLiteRtRuntime();
```

**When to use:**
- Display runtime capabilities to users
- Conditionally render based on available accelerators
- Debug runtime initialization issues

**[Read full documentation →](api-reference/use-litert-runtime)**

## Common Types

### `LiteRtModelStatus`

```typescript
type LiteRtModelStatus = 
  | "idle"                  // Not started
  | "initializing-runtime"  // Setting up WebGPU/WASM
  | "compiling"             // Compiling the model
  | "ready"                 // Ready to use
  | "error";                // Error occurred
```

### `LiteRtConfig`

```typescript
interface LiteRtConfig {
  wasmRoot?: string;
  preferAccelerators?: ("webgpu" | "wasm")[];
  tfBackend?: "webgpu" | "wasm" | "cpu";
  autoShareWebGpuWithTfjs?: boolean;
  onRuntimeError?: (error: Error) => void;
}
```

### `LiteRtTensorInfo`

```typescript
interface LiteRtTensorInfo {
  name: string;
  index: number;
  shape: number[];
  dtype: "float32" | "int32";
}
```

## Quick Reference

| API | Purpose | Import From |
|-----|---------|-------------|
| `<LiteRtProvider>` | Configure runtime | `react-litert` |
| `useLiteRtTfjsModel` | Load model with tf.Tensor | `react-litert` |
| `useLiteRtModel` | Load model with raw tensors | `react-litert/core` |
| `useLiteRtRuntime` | Check runtime status | `react-litert` |

## Related Documentation

- [Getting Started](getting-started) - Quick start guide
- [Installation](installation) - Setup instructions
- [Basic Usage](basic-usage) - Common usage patterns
- [Advanced Usage](advanced-usage) - Advanced techniques
- [Examples](examples) - Complete example applications

