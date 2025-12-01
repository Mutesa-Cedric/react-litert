---
sidebar_position: 4
---

# useLiteRtRuntime

Hook for checking the LiteRT runtime status and capabilities.

## Import

```tsx
import { useLiteRtRuntime } from 'react-litert';
```

## Usage

```tsx
import { useLiteRtRuntime } from 'react-litert';

function RuntimeInfo() {
  const { status, error, supportsWebGpu, supportsWasm } = useLiteRtRuntime();

  return (
    <div>
      <p>Status: {status}</p>
      <p>WebGPU: {supportsWebGpu ? 'Yes' : 'No'}</p>
      <p>WASM: {supportsWasm ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

## Returns

### `status: LiteRtRuntimeStatus`

Current status of the runtime:
- `"idle"` - Runtime initialization hasn't started
- `"loading"` - Runtime is being initialized
- `"ready"` - Runtime is ready to use
- `"error"` - An error occurred during initialization

### `error: Error | null`

Error object if `status === "error"`, otherwise `null`.

### `supportsWebGpu: boolean`

Whether WebGPU is supported and available in the current environment.

### `supportsWasm: boolean`

Whether WASM is supported and available in the current environment.

## Use Cases

This hook is useful for:

1. **Displaying runtime capabilities** to users
2. **Conditional rendering** based on available accelerators
3. **Debugging** runtime initialization issues
4. **Feature detection** before loading models

## Example

```tsx
import { useLiteRtRuntime } from 'react-litert';

function RuntimeStatus() {
  const { status, error, supportsWebGpu, supportsWasm } = useLiteRtRuntime();

  if (status === 'loading') {
    return <div>Initializing runtime...</div>;
  }

  if (status === 'error') {
    return (
      <div>
        <p>Runtime error: {error?.message}</p>
        <p>WebGPU: {supportsWebGpu ? 'Available' : 'Not available'}</p>
        <p>WASM: {supportsWasm ? 'Available' : 'Not available'}</p>
      </div>
    );
  }

  return (
    <div>
      <h3>Runtime Status: {status}</h3>
      <ul>
        <li>WebGPU: {supportsWebGpu ? '✅ Available' : '❌ Not available'}</li>
        <li>WASM: {supportsWasm ? '✅ Available' : '❌ Not available'}</li>
      </ul>
      {!supportsWebGpu && !supportsWasm && (
        <p>⚠️ No accelerators available. Models may not work.</p>
      )}
    </div>
  );
}
```

## Notes

- The runtime is initialized automatically when the first model is loaded
- This hook provides read-only information about the runtime state
- Use this hook to check capabilities before attempting to load models

