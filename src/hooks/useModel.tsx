import { getCachedModel, setCachedModel } from '../internal/modelCache';
import type {
  Accelerator,
  InferModelResult,
  LiteRtInput,
  LiteRtModelStatus,
  LiteRtOutput,
  TfjsInput,
  TfjsOutput,
  UseModelOptions,
} from '../types/public';
import { useLiteRtRuntime } from './useLiteRtRuntime';
import { loadAndCompile, Tensor, type CompiledModel } from '@litertjs/core';
import { runWithTfjsTensors } from '@litertjs/tfjs-interop';
import type * as tf from '@tensorflow/tfjs-core';
import { useCallback, useEffect, useState } from 'react';

/**
 * A unified hook for running models with either TensorFlow.js or LiteRT runtime.
 *
 * @example
 * // Using TensorFlow.js runtime
 * const { run } = useModel({
 *   modelUrl: '/models/model.tflite',
 *   runtime: 'tfjs',
 * });
 * // `run` will have type: (input: TfjsInput) => Promise<TfjsOutput>
 *
 * @example
 * // Using LiteRT runtime (use when you want to deal with raw LiteRT tensors)
 * const { run } = useModel({
 *   modelUrl: '/models/model.tflite',
 *   runtime: 'litert',
 * });
 * // `run` will have type: (input: LiteRtInput) => Promise<LiteRtOutput>
 */
export function useModel<const T extends UseModelOptions>(options: T): InferModelResult<T> {
  const runtime = useLiteRtRuntime();

  const [status, setStatus] = useState<LiteRtModelStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [accelerator, setAccelerator] = useState<Accelerator | null>(null);
  const [model, setModel] = useState<CompiledModel | null>(null);

  // Unique key for caching
  const cacheKey = options.id || options.modelUrl;

  useEffect(() => {
    if (runtime.status !== 'ready') return;

    const cached = getCachedModel(cacheKey);
    if (cached) {
      setModel(cached);
      setStatus('ready');
      return;
    }

    async function compile() {
      try {
        setStatus('compiling');

        const accPrefs = options.acceleratorPreference || ['webgpu', 'wasm'];
        let compiled: CompiledModel | null = null;

        for (const acc of accPrefs) {
          try {
            compiled = await loadAndCompile(options.modelUrl, {
              accelerator: acc,
            });
            setAccelerator(acc);
            break;
          } catch {
            // try next accelerator
          }
        }

        if (!compiled) throw new Error('Failed to compile model');

        // Cache globally
        setCachedModel(cacheKey, compiled);
        setModel(compiled);
        setStatus('ready');
      } catch (e) {
        setStatus('error');
        setError(e as Error);
      }
    }

    compile();
  }, [runtime.status, options.modelUrl]);

  const runRaw = async (input: LiteRtInput, signature?: string): Promise<LiteRtOutput> => {
    if (!model) throw new Error('Model not ready');
    return signature
      ? (model.run(signature, input as Tensor | Tensor[]) as LiteRtOutput)
      : (model.run(input as Tensor | Tensor[]) as LiteRtOutput);
  };

  const runWithTfjs = useCallback(
    async (input: TfjsInput, signature?: string): Promise<TfjsOutput> => {
      if (status !== 'ready' || !model) {
        throw new Error('LiteRT model is not ready yet');
      }

      if (signature) {
        // multi-signature model
        return runWithTfjsTensors(
          model,
          signature,
          input as tf.Tensor | tf.Tensor[] | Record<string, tf.Tensor>
        ) as unknown as Promise<TfjsOutput>;
      }

      // default signature
      return runWithTfjsTensors(
        model,
        input as tf.Tensor | tf.Tensor[] | Record<string, tf.Tensor>
      ) as unknown as Promise<TfjsOutput>;
    },
    [status, model]
  );

  // will be running with tfjs unless specified otherwise
  const run = options.runtime === 'litert' ? runRaw : runWithTfjs;

  return {
    status: status,
    error: error,
    accelerator: accelerator,
    run,
    inputDetails:
      model?.getInputDetails()?.map((detail) => ({
        name: detail.name,
        index: detail.index,
        shape: Array.from(detail.shape),
        dtype: detail.dtype,
      })) || null,
    outputDetails:
      model?.getOutputDetails()?.map((detail) => ({
        name: detail.name,
        index: detail.index,
        shape: Array.from(detail.shape),
        dtype: detail.dtype,
      })) || null,
  } as InferModelResult<T>;
}
