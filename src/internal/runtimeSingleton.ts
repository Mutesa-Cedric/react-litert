import { loadLiteRt } from "@litertjs/core";
import type { LiteRtConfig } from "../types/public";

let runtimePromise: Promise<void> | null = null;

export default {
    async load(config: LiteRtConfig): Promise<void> {
        if (runtimePromise) return runtimePromise;

        runtimePromise = (async () => {
            const wasmRoot = config.wasmRoot || "/litert-wasm/";
            await loadLiteRt(wasmRoot);

            // tf backend initialization (optional)
            if (config.tfBackend) {
                const tf = await import("@tensorflow/tfjs-core");
                await tf.setBackend(config.tfBackend);
            }

            // share WebGPU device with TFJS (optional)
            if (config.autoShareWebGpuWithTfjs !== false) {
                try {
                    const tf = await import("@tensorflow/tfjs-core");
                    const { setWebGpuDevice } = await import("@litertjs/core");

                    const backend = tf.backend();
                    if ((backend as any)?.device) {
                        setWebGpuDevice((backend as any).device);
                    }
                } catch {
                    console.warn("Failed to share WebGPU device with TFJS");
                }
            }
        })();

        return runtimePromise;
    },
};
