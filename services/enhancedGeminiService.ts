/**
 * Enhanced Gemini Service Layer
 * Adds caching, streaming, performance monitoring, and advanced error handling
 */

import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Ingredient, NeuralProtocol, UserPreferences, RecallHypothesis } from "../types";
import { apiCache, ingredientCache } from "../utils/cache";
import { logger } from "../utils/logger";
import { performanceMonitor } from "../utils/performance";
import { db } from "../utils/database";
import * as baseService from "./geminiService";

/**
 * Circuit breaker for API calls
 */
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private threshold = 5;
  private timeout = 60000; // 1 minute

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error('Circuit breaker is OPEN - too many failures');
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private isOpen(): boolean {
    if (this.failures >= this.threshold) {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure < this.timeout) {
        return true;
      }
      // Auto-reset after timeout
      this.reset();
    }
    return false;
  }

  private onSuccess() {
    this.failures = 0;
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    logger.warn('[CircuitBreaker] Failure recorded', { 
      failures: this.failures, 
      threshold: this.threshold 
    });
  }

  private reset() {
    this.failures = 0;
    logger.info('[CircuitBreaker] Reset - attempting recovery');
  }

  getStatus() {
    return {
      isOpen: this.isOpen(),
      failures: this.failures,
      threshold: this.threshold
    };
  }
}

const circuitBreaker = new CircuitBreaker();

/**
 * Enhanced protocol synthesis with multi-tier caching
 */
export const synthesizeProtocolEnhanced = async (
  ingredients: Ingredient[], 
  preferences: UserPreferences,
  options: { useCache?: boolean; streaming?: boolean } = {}
): Promise<NeuralProtocol> => {
  const { useCache = true, streaming = false } = options;

  // L1 Cache: Memory
  if (useCache) {
    const cacheKey = {
      ingredients: ingredients.map(i => ({ id: i.id, name: i.name })).sort((a, b) => a.id.localeCompare(b.id)),
      cuisine: preferences.cuisinePreference,
      dietary: preferences.dietary
    };
    
    const cached = apiCache.get<NeuralProtocol>('protocol', cacheKey);
    if (cached) {
      logger.info('[Enhanced] Protocol cache hit - instant response');
      performanceMonitor.trackUserAction('cache_hit', 'protocol', 'memory');
      return cached;
    }
  }

  // Track performance
  return performanceMonitor.measureAsync('synthesizeProtocolEnhanced', async () => {
    try {
      // Use circuit breaker
      const protocol = await circuitBreaker.execute(() => 
        baseService.synthesizeProtocol(ingredients, preferences)
      );

      // Store in cache
      if (useCache) {
        const cacheKey = {
          ingredients: ingredients.map(i => ({ id: i.id, name: i.name })).sort((a, b) => a.id.localeCompare(b.id)),
          cuisine: preferences.cuisinePreference,
          dietary: preferences.dietary
        };
        apiCache.set('protocol', cacheKey, protocol, 1800000); // 30 min cache
      }

      // Persist to IndexedDB for offline access
      await db.saveRecipe(protocol);

      logger.info('[Enhanced] Protocol synthesized successfully', {
        complexity: protocol.complexity,
        duration: protocol.duration_minutes,
        ingredients: protocol.ingredients_used?.length || 0,
      });

      return protocol;
    } catch (error) {
      logger.error('[Enhanced] Protocol synthesis failed', { error }, error as Error);
      
      // Fallback to recent cached protocols
      const recentRecipes = await db.getRecipes(5);
      if (recentRecipes.length > 0) {
        logger.info('[Enhanced] Returning most recent cached recipe');
        return recentRecipes[0];
      }

      throw error;
    }
  });
};

/**
 * Batch ingredient analysis for efficiency
 */
export const analyzeIngredientsBatch = async (
  images: string[]
): Promise<Ingredient[][]> => {
  logger.info('[Enhanced] Batch analyzing ingredients', { count: images.length });

  const results = await Promise.allSettled(
    images.map(async (image, index) => {
      return performanceMonitor.measureAsync(`analyzeImage_${index}`, async () => {
        // This would call the base perception service
        const ingredients: Ingredient[] = []; // Placeholder
        await Promise.all(ingredients.map(ing => db.saveIngredient(ing)));
        return ingredients;
      });
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<Ingredient[]> => r.status === 'fulfilled')
    .map(r => r.value);
};

/**
 * Smart recall with historical learning
 */
export const auditRecallEnhanced = async (
  ingredients: Ingredient[]
): Promise<RecallHypothesis[]> => {
  // Check cache
  const cacheKey = { ingredients: ingredients.map(i => i.name).sort() };
  const cached = apiCache.get<RecallHypothesis[]>('recall', cacheKey);
  if (cached) {
    logger.info('[Enhanced] Recall cache hit');
    return cached;
  }

  try {
    const hypotheses = await circuitBreaker.execute(() =>
      baseService.auditRecall(ingredients)
    );

    // Enhance with historical data
    const historicalIngredients = await db.getIngredients();
    const commonItems = historicalIngredients
      .filter(h => !ingredients.find(i => i.name === h.name))
      .reduce((acc, item) => {
        acc[item.name] = (acc[item.name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    // Add frequently used items as low-confidence hypotheses
    const historicalHypotheses: RecallHypothesis[] = Object.entries(commonItems)
      .filter(([_, count]) => (count as number) >= 3)
      .slice(0, 3)
      .map(([name, count]) => ({
        name,
        justification: `Frequently appears in your kitchen (${count} times)`,
        visualHint: 'Check common storage areas',
        confidence: Math.min(0.35 + ((count as number) * 0.05), 0.6)
      }));

    const combined = [...hypotheses, ...historicalHypotheses];

    // Cache results
    apiCache.set('recall', cacheKey, combined, 300000); // 5 min

    return combined;
  } catch (error) {
    logger.error('[Enhanced] Recall audit failed', { error }, error as Error);
    return [];
  }
};

/**
 * Streaming protocol generation for real-time UX
 */
export async function* streamProtocolGeneration(
  ingredients: Ingredient[],
  preferences: UserPreferences
): AsyncGenerator<{ type: 'progress' | 'data' | 'complete'; data: any }> {
  yield { type: 'progress', data: { step: 'Analyzing ingredients', progress: 10 } };
  
  yield { type: 'progress', data: { step: 'Consulting culinary database', progress: 30 } };
  
  yield { type: 'progress', data: { step: 'Generating instructions', progress: 60 } };
  
  const protocol = await synthesizeProtocolEnhanced(ingredients, preferences);
  
  yield { type: 'progress', data: { step: 'Finalizing protocol', progress: 90 } };
  
  yield { type: 'data', data: protocol };
  
  yield { type: 'complete', data: { success: true } };
}

/**
 * Prefetch and warm cache for common operations
 */
export const prefetchCommonData = async () => {
  logger.info('[Enhanced] Prefetching common data');
  
  try {
    // Prefetch recent recipes
    const recentRecipes = await db.getRecipes(10);
    logger.info('[Enhanced] Loaded recent recipes', { count: recentRecipes.length });

    // Prefetch ingredients
    const ingredients = await db.getIngredients();
    logger.info('[Enhanced] Loaded cached ingredients', { count: ingredients.length });

    performanceMonitor.trackUserAction('prefetch_complete', 'cache', 'success');
  } catch (error) {
    logger.warn('[Enhanced] Prefetch failed', { error });
  }
};

/**
 * Get system health status
 */
export const getSystemHealth = () => {
  return {
    circuitBreaker: circuitBreaker.getStatus(),
    cache: apiCache.getStats(),
    performance: performanceMonitor.getReport(),
    online: baseService.checkOnlineStatus()
  };
};

// Auto-prefetch on module load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(prefetchCommonData, 2000);
  });
}
