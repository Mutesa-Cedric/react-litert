import type { CompiledModel, Tensor } from '@litertjs/core';
import type * as tf from '@tensorflow/tfjs-core';

// ---------- Shared Types ----------
export type Accelerator = 'webgpu' | 'wasm';

export type LiteRtRuntimeStatus = 'idle' | 'loading' | 'ready' | 'error';

export type LiteRtModelStatus = 'idle' | 'initializing-runtime' | 'compiling' | 'ready' | 'error';

// ---------- Provider Config ----------
export interface LiteRtConfig {
  /** Path where LiteRT WASM files live, e.g. "/litert-wasm/" */
  wasmRoot?: string;

  /** Preferred accelerators in order. Default: ["webgpu", "wasm"] */
  preferAccelerators?: Accelerator[];

  /** Optional TensorFlow.js backend to initialize */
  tfBackend?: 'webgpu' | 'wasm' | 'cpu';

  /** Automatically share TFJS WebGPU device with LiteRT (default: true) */
  autoShareWebGpuWithTfjs?: boolean;

  /** Runtime-level error handler */
  onRuntimeError?: (error: Error) => void;
}

export interface LiteRtProviderProps {
  config?: LiteRtConfig;
  children: React.ReactNode;
}

// ---------- Runtime Hook ----------

export interface UseLiteRtRuntimeResult {
  status: LiteRtRuntimeStatus;
  error: Error | null;
  supportsWebGpu: boolean;
  supportsWasm: boolean;
}

// ---------- Model Hooks (LiteRT tensors) ----------

export interface LiteRtTensorInfo {
  name: string;
  index: number;
  shape: number[];
  dtype: 'float32' | 'int32';
}

/**
 * @deprecated Use `UseModelOptions` instead. This interface will be removed in a v1.0.0.
 */
export interface UseLiteRtModelOptions {
  modelUrl: string;
  id?: string;
  acceleratorPreference?: Accelerator[];
  lazy?: boolean;
}

/**
 * @deprecated Use `UseModelResult` instead. This interface will be removed in a v1.0.0.
 */
export interface UseLiteRtModelResult<
  In = Tensor | Tensor[] | Record<string, Tensor>,
  Out = Tensor[] | Record<string, Tensor>,
> {
  status: LiteRtModelStatus;
  error: Error | null;
  accelerator: Accelerator | null;

  /** The underlying LiteRT compiled model, or null while loading. */
  model: CompiledModel | null;

  /** Low-level run using LiteRT tensors. */
  runRaw: (input: In, signature?: string) => Promise<Out>;

  inputDetails: LiteRtTensorInfo[] | null;
  outputDetails: LiteRtTensorInfo[] | null;
}

// ---------- Model Hooks (tf.Tensor) ----------

/**
 * @deprecated Use `UseModelOptions` instead. This interface will be removed in a v1.0.0.
 */
export interface UseLiteRtTfjsModelOptions extends UseLiteRtModelOptions {
  inputStyle?: 'single' | 'array' | 'named';
}

/**
 * @deprecated Use `UseModelResult` instead. This interface will be removed in a v1.0.0.
 */
export interface UseLiteRtTfjsModelResult<
  In = tf.Tensor | tf.Tensor[] | Record<string, tf.Tensor>,
  Out = tf.Tensor[] | Record<string, tf.Tensor>,
> {
  status: LiteRtModelStatus;
  error: Error | null;
  accelerator: Accelerator | null;

  run: (input: In, signature?: string) => Promise<Out>;

  inputDetails: LiteRtTensorInfo[] | null;
  outputDetails: LiteRtTensorInfo[] | null;
}

// unified model hook
export interface UseModelOptions extends UseLiteRtModelOptions {
  modelUrl: string;
  id?: string;
  acceleratorPreference?: Accelerator[];
  lazy?: boolean;
  inputStyle?: 'single' | 'array' | 'named';
  /*
   * @default 'tfjs'
   * @description The runtime to use for the model.
   */
  runtime?: 'tfjs' | 'litert';
}

export interface UseModelResult<
  In =
    | tf.Tensor
    | tf.Tensor[]
    | Record<string, tf.Tensor>
    | Tensor
    | Tensor[]
    | Record<string, Tensor>,
  Out = tf.Tensor | tf.Tensor[] | Record<string, tf.Tensor> | Tensor[] | Record<string, Tensor>,
> {
  status: LiteRtModelStatus;
  error: Error | null;
  accelerator: Accelerator | null;
  run: (input: In, signature?: string) => Promise<Out>;
  inputDetails: LiteRtTensorInfo[] | null;
  outputDetails: LiteRtTensorInfo[] | null;
}

export type UseTfjsModelOptions = Omit<UseModelOptions, 'runtime'> & {
  runtime: 'tfjs';
};

export type UseLiteRtOnlyModelOptions = Omit<UseModelOptions, 'runtime'> & {
  runtime: 'litert';
};

export type UseTfjsModelResult = UseModelResult<TfjsInput, TfjsOutput>;
export type UseLiteRtOnlyModelResult = UseModelResult<LiteRtInput, LiteRtOutput>;

// Helper type to infer the correct result based on runtime
export type InferModelResult<T extends UseModelOptions> = T extends { runtime: 'litert' }
  ? UseLiteRtOnlyModelResult
  : T extends { runtime: 'tfjs' }
    ? UseTfjsModelResult
    : T extends { runtime?: undefined }
      ? UseTfjsModelResult
      : UseTfjsModelResult;

export type TfjsInput = tf.Tensor | tf.Tensor[] | Record<string, tf.Tensor>;

export type TfjsOutput = tf.Tensor | tf.Tensor[] | Record<string, tf.Tensor>;

export type LiteRtInput = Tensor | Tensor[] | Record<string, Tensor>;

export type LiteRtOutput = Tensor[] | Record<string, Tensor>;

export type ModelInput = TfjsInput | LiteRtInput;

export type ModelOutput = TfjsOutput | LiteRtOutput;
