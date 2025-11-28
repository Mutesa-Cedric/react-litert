import runtimeSingleton from '../internal/runtimeSingleton';
import type { LiteRtRuntimeStatus, UseLiteRtRuntimeResult } from '../types/public';
import { useLiteRtConfig } from '@/providers/LiteRtProvider';
import { isWebGPUSupported } from '@litertjs/core';
import { useEffect, useRef, useState } from 'react';

export function useLiteRtRuntime(): UseLiteRtRuntimeResult {
  const config = useLiteRtConfig();

  const [status, setStatus] = useState<LiteRtRuntimeStatus>('idle');
  const [error, setError] = useState<Error | null>(null);

  // StrictMode guard
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function initRuntime() {
      try {
        setStatus('loading');
        // Singleton ensures we only run this once globally
        await runtimeSingleton.load(config);
        setStatus('ready');
      } catch (e) {
        const err = e as Error;
        setError(err);
        setStatus('error');

        config.onRuntimeError?.(err);
      }
    }

    initRuntime();
  }, [config]);

  return {
    status,
    error,
    supportsWebGpu: isWebGPUSupported(),
    supportsWasm: true, // always true as fallback
  };
}
