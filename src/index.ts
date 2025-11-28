/*
 * Including Tensorflow backends in the bundle to avoid the need to import them in client apps
 */
import '@tensorflow/tfjs-backend-webgpu';
import '@tensorflow/tfjs-backend-cpu';

export type {
  Accelerator,
  LiteRtConfig,
  LiteRtModelStatus,
  LiteRtRuntimeStatus,
  LiteRtTensorInfo,
  UseLiteRtRuntimeResult,
  UseLiteRtTfjsModelOptions,
  UseLiteRtTfjsModelResult,
} from './types/public';

export { useLiteRtRuntime } from './hooks/useLiteRtRuntime';
export { useLiteRtTfjsModel } from './hooks/useLiteRtTfjsModel';
export { LiteRtProvider } from './providers/LiteRtProvider';
