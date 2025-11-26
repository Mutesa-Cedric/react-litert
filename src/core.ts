/*
 * this entry file is meant to separate useLiteRtModel and useLiteRtTfjsModel since the first hook is not proposed unless you want to deal with LiteRT tensors directly without tfjs
 */

export { type UseLiteRtModelOptions, type UseLiteRtModelResult } from './types/public';

export { useLiteRtModel } from './hooks/useLiteRtModel';
