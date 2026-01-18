/**
 * IndexedDB abstraction for robust client-side data persistence
 * Provides structured storage for ingredients, recipes, and user preferences
 */

interface DBSchema {
  ingredients: {
    key: string;
    value: any;
    indexes: { 'by-category': string; 'by-freshness': number };
  };
  recipes: {
    key: string;
    value: any;
    indexes: { 'by-cuisine': string; 'by-complexity': string };
  };
  analytics: {
    key: string;
    value: any;
    indexes: { 'by-timestamp': number };
  };
}

class DatabaseManager {
  private db: IDBDatabase | null = null;
  private dbName = 'CulinaryLensDB';
  private version = 2;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Ingredients store
        if (!db.objectStoreNames.contains('ingredients')) {
          const ingredientStore = db.createObjectStore('ingredients', { keyPath: 'id' });
          ingredientStore.createIndex('by-category', 'category', { unique: false });
          ingredientStore.createIndex('by-freshness', 'vitality_score', { unique: false });
          ingredientStore.createIndex('by-timestamp', 'timestamp', { unique: false });
        }

        // Recipes store
        if (!db.objectStoreNames.contains('recipes')) {
          const recipeStore = db.createObjectStore('recipes', { keyPath: 'id' });
          recipeStore.createIndex('by-cuisine', 'cuisinePreference', { unique: false });
          recipeStore.createIndex('by-complexity', 'complexity', { unique: false });
          recipeStore.createIndex('by-timestamp', 'timestamp', { unique: false });
        }

        // Analytics store
        if (!db.objectStoreNames.contains('analytics')) {
          const analyticsStore = db.createObjectStore('analytics', { keyPath: 'id', autoIncrement: true });
          analyticsStore.createIndex('by-timestamp', 'timestamp', { unique: false });
          analyticsStore.createIndex('by-event', 'event', { unique: false });
        }

        // Sessions store for offline queue
        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  async saveIngredient(ingredient: any): Promise<void> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['ingredients'], 'readwrite');
      const store = transaction.objectStore('ingredients');
      const request = store.put({ ...ingredient, timestamp: Date.now() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getIngredients(filter?: { category?: string; minFreshness?: number }): Promise<any[]> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['ingredients'], 'readonly');
      const store = transaction.objectStore('ingredients');
      const request = store.getAll();

      request.onsuccess = () => {
        let results = request.result;
        
        if (filter?.category) {
          results = results.filter(i => i.category === filter.category);
        }
        if (filter?.minFreshness !== undefined) {
          results = results.filter(i => i.vitality_score >= filter.minFreshness!);
        }

        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveRecipe(recipe: any): Promise<void> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['recipes'], 'readwrite');
      const store = transaction.objectStore('recipes');
      const request = store.put({ ...recipe, timestamp: Date.now() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getRecipes(limit = 20): Promise<any[]> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['recipes'], 'readonly');
      const store = transaction.objectStore('recipes');
      const index = store.index('by-timestamp');
      const request = index.openCursor(null, 'prev');
      const results: any[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && results.length < limit) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async trackEvent(event: string, data: any): Promise<void> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['analytics'], 'readwrite');
      const store = transaction.objectStore('analytics');
      const request = store.add({
        event,
        data,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearOldData(daysToKeep = 30): Promise<void> {
    if (!this.db) await this.initialize();

    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);

    const stores = ['ingredients', 'recipes', 'analytics'];
    
    for (const storeName of stores) {
      await new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const index = store.index('by-timestamp');
        const request = index.openCursor(IDBKeyRange.upperBound(cutoffTime));

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      });
    }
  }

  async exportData(): Promise<any> {
    if (!this.db) await this.initialize();

    const [ingredients, recipes, analytics] = await Promise.all([
      this.getIngredients(),
      this.getRecipes(1000),
      this.getAnalytics(1000)
    ]);

    return {
      version: this.version,
      exportDate: new Date().toISOString(),
      ingredients,
      recipes,
      analytics
    };
  }

  private async getAnalytics(limit: number): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['analytics'], 'readonly');
      const store = transaction.objectStore('analytics');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result.slice(0, limit));
      request.onerror = () => reject(request.error);
    });
  }
}

export const db = new DatabaseManager();
