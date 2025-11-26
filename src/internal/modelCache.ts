import { CompiledModel } from '@litertjs/core';

const modelCache = new Map<string, CompiledModel>();

export const getCachedModel = (key: string): CompiledModel | null => {
  return modelCache.get(key) ?? null;
};

export const setCachedModel = (key: string, model: CompiledModel) => {
  modelCache.set(key, model);
};

export const deleteCachedModel = (key: string) => {
  const model = modelCache.get(key);

  // this is essential for cleanup and freeing allocated resources
  model?.delete();

  modelCache.delete(key);
};
