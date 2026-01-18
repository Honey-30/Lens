/**
 * Advanced caching layer with LRU eviction and TTL support
 * Provides intelligent caching for API responses to optimize performance and reduce costs
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  persistToStorage?: boolean;
}

class AdvancedCache {
  private cache: Map<string, CacheEntry<any>>;
  private config: CacheConfig;
  private hitCount: number = 0;
  private missCount: number = 0;

  constructor(config: CacheConfig = { maxSize: 100, defaultTTL: 300000 }) {
    this.config = config;
    this.cache = new Map();
    if (config.persistToStorage) {
      this.loadFromStorage();
    }
  }

  private generateKey(namespace: string, params: any): string {
    return `${namespace}:${JSON.stringify(params)}`;
  }

  get<T>(namespace: string, params: any): T | null {
    const key = this.generateKey(namespace, params);
    const entry = this.cache.get(key);

    if (!entry) {
      this.missCount++;
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.missCount++;
      return null;
    }

    // Update LRU metadata
    entry.accessCount++;
    entry.lastAccessed = now;
    this.hitCount++;

    return entry.data as T;
  }

  set<T>(namespace: string, params: any, data: T, ttl?: number): void {
    const key = this.generateKey(namespace, params);
    const now = Date.now();

    // Evict LRU entry if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      ttl: ttl || this.config.defaultTTL,
      accessCount: 0,
      lastAccessed: now
    });

    if (this.config.persistToStorage) {
      this.saveToStorage();
    }
  }

  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruScore = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      // LRU score: older last access + fewer accesses = lower priority
      const score = entry.lastAccessed / (entry.accessCount + 1);
      if (score < lruScore) {
        lruScore = score;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }

  clear(namespace?: string): void {
    if (namespace) {
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${namespace}:`)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
    if (this.config.persistToStorage) {
      this.saveToStorage();
    }
  }

  getStats() {
    const hitRate = this.hitCount / (this.hitCount + this.missCount) || 0;
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: (hitRate * 100).toFixed(2) + '%',
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        age: Date.now() - entry.timestamp,
        accessCount: entry.accessCount
      }))
    };
  }

  private saveToStorage(): void {
    try {
      const serialized = Array.from(this.cache.entries());
      localStorage.setItem('culinary_cache', JSON.stringify(serialized));
    } catch (err) {
      console.warn('[Cache] Failed to persist to storage:', err);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('culinary_cache');
      if (stored) {
        const entries = JSON.parse(stored);
        this.cache = new Map(entries);
      }
    } catch (err) {
      console.warn('[Cache] Failed to load from storage:', err);
    }
  }
}

export const apiCache = new AdvancedCache({
  maxSize: 200,
  defaultTTL: 600000, // 10 minutes
  persistToStorage: true
});

export const ingredientCache = new AdvancedCache({
  maxSize: 500,
  defaultTTL: 3600000, // 1 hour
  persistToStorage: true
});
