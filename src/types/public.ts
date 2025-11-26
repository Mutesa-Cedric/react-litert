import type * as tf from "@tensorflow/tfjs-core";
import type { CompiledModel, Tensor } from "@litertjs/core";

// ---------- Shared Types ----------
export type Accelerator = "webgpu" | "wasm";

export type LiteRtRuntimeStatus = "idle" | "loading" | "ready" | "error";

export type LiteRtModelStatus =
    | "idle"
    | "initializing-runtime"
    | "compiling"
    | "ready"
    | "error";


// ---------- Provider Config ----------
export interface LiteRtConfig {
    /** Path where LiteRT WASM files live, e.g. "/litert-wasm/" */
    wasmRoot?: string;

    /** Preferred accelerators in order. Default: ["webgpu", "wasm"] */
    preferAccelerators?: Accelerator[];

    /** Optional TensorFlow.js backend to initialize */
    tfBackend?: "webgpu" | "wasm" | "cpu";

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
    dtype: "float32" | "int32";
}

export interface UseLiteRtModelOptions {
    modelUrl: string;
    id?: string;
    acceleratorPreference?: Accelerator[];
    lazy?: boolean;
}


export interface UseLiteRtModelResult<
    In = Tensor | Tensor[] | Record<string, Tensor>,
    Out = Tensor[] | Record<string, Tensor>
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

export interface UseLiteRtTfjsModelOptions extends UseLiteRtModelOptions {
    inputStyle?: "single" | "array" | "named";
}

export interface UseLiteRtTfjsModelResult<
    In = tf.Tensor | tf.Tensor[] | Record<string, tf.Tensor>,
    Out = tf.Tensor[] | Record<string, tf.Tensor>
> {
    status: LiteRtModelStatus;
    error: Error | null;
    accelerator: Accelerator | null;

    run: (input: In, signature?: string) => Promise<Out>;

    inputDetails: LiteRtTensorInfo[] | null;
    outputDetails: LiteRtTensorInfo[] | null;
}


export type TfjsInput =
    | tf.Tensor
    | tf.Tensor[]
    | Record<string, tf.Tensor>;

export type TfjsOutput =
    | tf.Tensor
    | tf.Tensor[]
    | Record<string, tf.Tensor>;

export type LiteRtInput =
    | Tensor
    | Tensor[]
    | Record<string, Tensor>;

export type LiteRtOutput =
    | Tensor[]
    | Record<string, Tensor>;