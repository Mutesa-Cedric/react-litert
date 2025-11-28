import type { LiteRtConfig } from '../types/public';
import { loadLiteRt } from '@litertjs/core';

let runtimePromise: Promise<void> | null = null;

export default {
  async load(config: LiteRtConfig): Promise<void> {
    if (runtimePromise) return runtimePromise;

    runtimePromise = (async () => {
      try {
        const wasmRoot = config.wasmRoot || '/litert-wasm/';
        try {
          await loadLiteRt(wasmRoot);
        } catch (e) {
          // If LiteRT is already loading/loaded, we treat it as success
          const errorMessage = e instanceof Error ? e.message : String(e);
          if (errorMessage.includes('already loading') || errorMessage.includes('already loaded')) {
            // Already initialized, proceed
          } else {
            throw e;
          }
        }

        /*
         * tf backend initialization, we will also ship tf backends for both backend-cpu and backend-gpu
         * we must ensure that at least CPU backend is available for tf operations
         */
        try {
          const tf = await import('@tensorflow/tfjs-core');

          if (config.tfBackend) {
            // Try to set requested backend - if it fails, we fallback to CPU
            try {
              await tf.setBackend(config.tfBackend);
              await tf.ready();
            } catch (backendError) {
              const errorMsg =
                backendError instanceof Error ? backendError.message : String(backendError);
              if (errorMsg.includes('not found in registry')) {
                console.warn(
                  `[LiteRT] Backend '${config.tfBackend}' not available. Falling back to CPU backend.`
                );
                // Fallback to CPU backend (always available)
                await tf.setBackend('cpu');
                await tf.ready();
              } else {
                console.warn(
                  `[LiteRT] Failed to initialize backend '${config.tfBackend}', falling back to CPU:`,
                  backendError
                );
                await tf.setBackend('cpu');
                await tf.ready();
              }
            }
          } else {
            // No backend specified, ensure CPU backend is available
            try {
              await tf.setBackend('cpu');
              await tf.ready();
            } catch (e) {
              console.warn('[LiteRT] Failed to initialize CPU backend:', e);
            }
          }
        } catch (e) {
          // Backend initialization is optional, we don't fail runtime initialization
          console.warn('[LiteRT] Failed to initialize TensorFlow.js backend (non-fatal):', e);
        }

        // share WebGPU device with TFJS (optional)
        if (config.autoShareWebGpuWithTfjs !== false) {
          try {
            const tf = await import('@tensorflow/tfjs-core');
            const { setWebGpuDevice } = await import('@litertjs/core');

            const backend = tf.backend();
            if ((backend as any)?.device) {
              setWebGpuDevice((backend as any).device);
            }
          } catch (e) {
            console.warn('[LiteRT] Failed to share WebGPU device with TFJS:', e);
          }
        }
      } catch (e) {
        console.error('[LiteRT] Runtime loading failed:', e);
        runtimePromise = null; // Reset on error so it can be retried
        throw e;
      }
    })();

    return runtimePromise;
  },
};
