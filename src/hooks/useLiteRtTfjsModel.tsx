import { useCallback } from "react";
import { runWithTfjsTensors } from "@litertjs/tfjs-interop";
import type * as tf from "@tensorflow/tfjs-core";
import { useLiteRtModel } from "./useLiteRtModel";
import type {
    TfjsInput,
    TfjsOutput,
    UseLiteRtTfjsModelOptions,
    UseLiteRtTfjsModelResult,
} from "../types/public";

export function useLiteRtTfjsModel<
    In = TfjsInput,
    Out = TfjsOutput
>(options: UseLiteRtTfjsModelOptions): UseLiteRtTfjsModelResult<In, Out> {
    const base = useLiteRtModel<any, any>(options);

    const run = useCallback(
        async (input: In, signature?: string): Promise<Out> => {
            if (base.status !== "ready" || !base.model) {
                throw new Error("LiteRT model is not ready yet");
            }

            if (signature) {
                // multi-signature model
                return runWithTfjsTensors(base.model, signature, input as tf.Tensor | tf.Tensor[] | Record<string, tf.Tensor>) as unknown as Promise<Out>;
            }

            // default signature
            return runWithTfjsTensors(base.model, input as tf.Tensor | tf.Tensor[] | Record<string, tf.Tensor>) as unknown as Promise<Out>;
        },
        [base.status, base.model]
    );

    return {
        status: base.status,
        error: base.error,
        accelerator: base.accelerator,
        run,
        inputDetails: base.inputDetails,
        outputDetails: base.outputDetails,
    };
}
