import type * as tf from "@tensorflow/tfjs-core";


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
    In = import("@litertjs/core").Tensor |
    import("@litertjs/core").Tensor[] |
    Record<string, import("@litertjs/core").Tensor>,
    Out = import("@litertjs/core").Tensor[] |
    Record<string, import("@litertjs/core").Tensor>
> {
    status: LiteRtModelStatus;
    error: Error | null;
    accelerator: Accelerator | null;

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
