import {
    loadAndCompile,
    type CompiledModel,
    type Tensor,
} from "@litertjs/core";
import { useEffect, useState } from "react";

import { getCachedModel, setCachedModel } from "../internal/modelCache";
import { useLiteRtRuntime } from "./useLiteRtRuntime";

import type {
    Accelerator,
    LiteRtInput,
    LiteRtModelStatus,
    LiteRtOutput,
    UseLiteRtModelOptions,
    UseLiteRtModelResult
} from "../types/public";

export function useLiteRtModel<
    In = LiteRtInput,
    Out = LiteRtOutput
>(options: UseLiteRtModelOptions): UseLiteRtModelResult<In, Out> {
    const runtime = useLiteRtRuntime();

    const [status, setStatus] = useState<LiteRtModelStatus>("idle");
    const [error, setError] = useState<Error | null>(null);
    const [accelerator, setAccelerator] = useState<Accelerator | null>(null);
    const [model, setModel] = useState<CompiledModel | null>(null);

    // Unique key for caching
    const cacheKey = options.id || options.modelUrl;

    useEffect(() => {
        if (runtime.status !== "ready") return;

        const cached = getCachedModel(cacheKey);
        if (cached) {
            setModel(cached);
            setStatus("ready");
            return;
        }

        async function compile() {
            try {
                setStatus("compiling");

                const accPrefs = options.acceleratorPreference || ["webgpu", "wasm"];
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

                if (!compiled) throw new Error("Failed to compile model");

                // Cache globally
                setCachedModel(cacheKey, compiled);
                setModel(compiled);
                setStatus("ready");
            } catch (e) {
                setStatus("error");
                setError(e as Error);
            }
        }

        compile();
    }, [runtime.status, options.modelUrl]);

    const runRaw = async (
        input: In,
        signature?: string
    ): Promise<Out> => {
        if (!model) throw new Error("Model not ready");
        return signature
            ? (model.run(signature, input as Tensor | Tensor[]) as Out)
            : (model.run(input as Tensor | Tensor[]) as Out);
    };

    return {
        status,
        model,
        error,
        accelerator,
        runRaw,
        inputDetails: model?.getInputDetails()?.map(detail => ({
            name: detail.name,
            index: detail.index,
            shape: Array.from(detail.shape),
            dtype: detail.dtype
        })) || null,
        outputDetails: model?.getOutputDetails()?.map(detail => ({
            name: detail.name,
            index: detail.index,
            shape: Array.from(detail.shape),
            dtype: detail.dtype
        })) || null,
    };
}
