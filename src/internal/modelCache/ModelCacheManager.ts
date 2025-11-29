import { CompiledModel } from '@litertjs/core';

interface ModelCacheEntry {
  key: string;
  model: CompiledModel;
  refCount: number;
  loadedAt: number;
}

export class ModelCacheManager {
  private cache: Map<string, ModelCacheEntry> = new Map();

  get(key: string): CompiledModel | null {
    const entry = this.cache.get(key);
    if (entry) {
      entry.refCount++;
      return entry.model;
    }
    return null;
  }
  set(key: string, model: CompiledModel): void {
    if (this.cache.has(key)) {
      this.clearModel(key, true);
    }
    const entry: ModelCacheEntry = {
      key,
      model,
      refCount: 1,
      loadedAt: Date.now(),
    };
    this.cache.set(key, entry);
  }

  clearModel(key: string, force: boolean = false): void {
    const entry = this.cache.get(key);
    if (!entry) return;
    entry.refCount--;
    if (entry.refCount <= 0 || force) {
      entry.model.delete();
      this.cache.delete(key);
    }
  }

  clearAll(): void {
    for (const entry of this.cache.values()) {
      entry.model.delete();
    }
    this.cache.clear();
  }

  getAll(): Array<{ key: string; refCount: number; loadedAt: number }> {
    return Array.from(this.cache.values()).map((entry) => ({
      key: entry.key,
      refCount: entry.refCount,
      loadedAt: entry.loadedAt,
    }));
  }
}
