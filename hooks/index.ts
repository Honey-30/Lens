/**
 * React custom hooks for advanced functionality
 * Provides reusable logic for common patterns
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../utils/database';
import { performanceMonitor } from '../utils/performance';

/**
 * Advanced debounce hook with leading/trailing edge support
 */
export function useDebounce<T>(value: T, delay: number, options: { leading?: boolean; trailing?: boolean } = { trailing: true }): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const previousValueRef = useRef<T>(value);

  useEffect(() => {
    const { leading = false, trailing = true } = options;

    if (leading && previousValueRef.current !== value) {
      setDebouncedValue(value);
      previousValueRef.current = value;
      return;
    }

    if (trailing) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setDebouncedValue(value);
        previousValueRef.current = value;
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, options.leading, options.trailing]);

  return debouncedValue;
}

/**
 * Intersection Observer hook for lazy loading and visibility tracking
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
): IntersectionObserverEntry | null {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setEntry(entry);
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, options.threshold, options.root, options.rootMargin]);

  return entry;
}

/**
 * Local storage hook with automatic JSON serialization
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * IndexedDB hook for persisting complex data structures
 */
export function useIndexedDB<T>(storeName: 'ingredients' | 'recipes' | 'analytics') {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const getter = storeName === 'ingredients' ? db.getIngredients : 
                     storeName === 'recipes' ? db.getRecipes :
                     () => Promise.resolve([]);
      const result = await getter();
      setData(result as T[]);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [storeName]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = useCallback(async (item: T) => {
    try {
      const saver = storeName === 'ingredients' ? db.saveIngredient :
                    storeName === 'recipes' ? db.saveRecipe :
                    null;
      if (saver) {
        await saver(item);
        await refresh();
      }
    } catch (err) {
      setError(err as Error);
    }
  }, [storeName, refresh]);

  return { data, loading, error, refresh, save };
}

/**
 * Network status hook with online/offline detection
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [effectiveType, setEffectiveType] = useState<string>('4g');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection type if available
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      setEffectiveType(connection.effectiveType || '4g');
      connection.addEventListener('change', () => {
        setEffectiveType(connection.effectiveType || '4g');
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, effectiveType, isSlowConnection: effectiveType === 'slow-2g' || effectiveType === '2g' };
}

/**
 * Performance tracking hook
 */
export function usePerformanceTracking(componentName: string) {
  const mountTime = useRef(Date.now());

  useEffect(() => {
    const renderTime = Date.now() - mountTime.current;
    performanceMonitor.trackUserAction('component_render', 'performance', componentName, renderTime);

    return () => {
      const lifetimeTime = Date.now() - mountTime.current;
      performanceMonitor.trackUserAction('component_unmount', 'performance', componentName, lifetimeTime);
    };
  }, [componentName]);
}

/**
 * Async operation hook with loading, error, and retry support
 */
export function useAsyncOperation<T, Args extends any[]>(
  operation: (...args: Args) => Promise<T>,
  deps: React.DependencyList = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const execute = useCallback(async (...args: Args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await performanceMonitor.measureAsync(
        operation.name || 'async_operation',
        () => operation(...args)
      );
      setData(result);
      setRetryCount(0);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, deps);

  const retry = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  return { data, loading, error, execute, retry, retryCount };
}

/**
 * Optimistic UI update hook
 */
export function useOptimisticUpdate<T>(
  initialData: T,
  updateFn: (data: T) => Promise<T>
) {
  const [data, setData] = useState<T>(initialData);
  const [isPending, setIsPending] = useState(false);
  const previousDataRef = useRef<T>(initialData);

  const update = useCallback(async (optimisticData: T) => {
    previousDataRef.current = data;
    setData(optimisticData);
    setIsPending(true);

    try {
      const result = await updateFn(optimisticData);
      setData(result);
      return result;
    } catch (error) {
      // Rollback on error
      setData(previousDataRef.current);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, [data, updateFn]);

  return { data, update, isPending };
}

/**
 * Media query hook for responsive design
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}
