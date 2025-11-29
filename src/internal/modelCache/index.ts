import { ModelCacheManager } from './ModelCacheManager';
import { CompiledModel } from '@litertjs/core';

const cacheManager = new ModelCacheManager();

export const getCachedModel = (key: string): CompiledModel | null => {
  return cacheManager.get(key) ?? null;
};

export const setCachedModel = (key: string, model: CompiledModel) => {
  cacheManager.set(key, model);
};

export const deleteCachedModel = (key: string) => {
  cacheManager.clearModel(key);
};

export const clearAllCachedModels = () => {
  cacheManager.clearAll();
};

export const getAllCachedModels = () => {
  return cacheManager.getAll();
};
