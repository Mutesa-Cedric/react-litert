---
sidebar_position: 4
---

# API Reference

Complete API documentation for **react-litert**. This section provides detailed information about all components, hooks, types, and configuration options.

## Overview

react-litert provides a simple, React-friendly API for running TensorFlow Lite models in the browser. The library consists of:

- **1 Provider Component** - `<LiteRtProvider>` for global configuration
- **1 Primary Hook** - `useModel` for loading and running models
- **1 Runtime Hook** - `useLiteRtRuntime` for runtime information
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

### `useModel`

**The primary hook for loading and running models.** Supports both TensorFlow.js and raw LiteRT tensors with automatic type inference.

```tsx
const { status, run, error } = useModel({
  modelUrl: '/models/mobilenet_v2.tflite',
  runtime: 'tfjs', // or 'litert'
});
```

**When to use:**

- For all model loading (replaces `useLiteRtTfjsModel` and `useLiteRtModel`)
- Use `runtime: 'tfjs'` for TensorFlow.js tensors
- Use `runtime: 'litert'` for raw LiteRT tensors

**[Read full documentation →](api-reference/use-model)**

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

---

## Deprecated Hooks

The following hooks are deprecated and will be removed in v1.0.0. Please migrate to `useModel`.

### `useLiteRtTfjsModel` (deprecated)

Replaced by `useModel({ runtime: 'tfjs' })`.

**[Migration guide →](api-reference/use-litert-tfjs-model)**

### `useLiteRtModel` (deprecated)

Replaced by `useModel({ runtime: 'litert' })`.

**[Migration guide →](api-reference/use-litert-model)**

## Common Types

### `LiteRtModelStatus`

```typescript
type LiteRtModelStatus =
  | 'idle' // Not started
  | 'initializing-runtime' // Setting up WebGPU/WASM
  | 'compiling' // Compiling the model
  | 'ready' // Ready to use
  | 'error'; // Error occurred
```

### `LiteRtConfig`

```typescript
interface LiteRtConfig {
  wasmRoot?: string;
  preferAccelerators?: ('webgpu' | 'wasm')[];
  tfBackend?: 'webgpu' | 'wasm' | 'cpu';
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
  dtype: 'float32' | 'int32';
}
```

## Quick Reference

| API                | Purpose              | Import From    |
| ------------------ | -------------------- | -------------- |
| `<LiteRtProvider>` | Configure runtime    | `react-litert` |
| `useModel`         | Load and run models  | `react-litert` |
| `useLiteRtRuntime` | Check runtime status | `react-litert` |

## Related Documentation

- [Getting Started](getting-started) - Quick start guide
- [Installation](installation) - Setup instructions
- [Basic Usage](basic-usage) - Common usage patterns
- [Advanced Usage](advanced-usage) - Advanced techniques
- [Examples](examples) - Complete example applications
