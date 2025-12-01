---
sidebar_position: 1
---

# LiteRtProvider

The `<LiteRtProvider>` component initializes the LiteRT runtime and provides configuration to all child components.

## Usage

```tsx
import { LiteRtProvider } from 'react-litert';

function App() {
  return (
    <LiteRtProvider config={config}>
      <YourApp />
    </LiteRtProvider>
  );
}
```

## Props

### `config?: LiteRtConfig`

Configuration object for the LiteRT runtime.

#### `wasmRoot?: string`

Path where LiteRT WASM files are located. This should be a URL path relative to your application root or an absolute URL.

**Example:**
```tsx
config={{
  wasmRoot: '/litert-wasm/',
}}
```

#### `preferAccelerators?: ("webgpu" | "wasm")[]`

Preferred accelerators in order of preference. The runtime will try each accelerator in order until one is available.

**Default:** `["webgpu", "wasm"]`

**Example:**
```tsx
config={{
  preferAccelerators: ['webgpu', 'wasm'], // Try WebGPU first, fallback to WASM
}}
```

#### `tfBackend?: "webgpu" | "wasm" | "cpu"`

TensorFlow.js backend to initialize. If not specified, TensorFlow.js backends are not initialized.

**Example:**
```tsx
config={{
  tfBackend: 'webgpu', // Use WebGPU backend for TensorFlow.js
}}
```

#### `autoShareWebGpuWithTfjs?: boolean`

Automatically share the WebGPU device with TensorFlow.js. This allows both LiteRT and TensorFlow.js to use the same WebGPU device efficiently.

**Default:** `true`

**Example:**
```tsx
config={{
  autoShareWebGpuWithTfjs: true,
}}
```

#### `onRuntimeError?: (error: Error) => void`

Error handler callback for runtime-level errors.

**Example:**
```tsx
config={{
  onRuntimeError: (error) => {
    console.error('LiteRT runtime error:', error);
    // Handle error (e.g., show notification, log to analytics)
  },
}}
```

## Complete Example

```tsx
import { LiteRtProvider } from 'react-litert';

function App() {
  return (
    <LiteRtProvider
      config={{
        wasmRoot: '/litert-wasm/',
        preferAccelerators: ['webgpu', 'wasm'],
        tfBackend: 'webgpu',
        autoShareWebGpuWithTfjs: true,
        onRuntimeError: (error) => {
          console.error('Runtime error:', error);
        },
      }}
    >
      <YourApp />
    </LiteRtProvider>
  );
}
```

## Notes

- The provider must wrap all components that use react-litert hooks
- Configuration is memoized, so changing the config object won't cause re-initialization
- The runtime is initialized lazily when the first model is loaded

