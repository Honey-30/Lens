/**
 * Offline Features Service
 * Premium offline capabilities for CulinaryLens
 * - Recipe Library with offline storage
 * - Meal Planning & Calendar
 * - Smart Shopping Lists with sync
 * - Favorites & Collections
 */

import { db } from '../utils/database';
import { logger } from '../utils/logger';
import { NeuralProtocol, Ingredient } from '../types';

// Types for offline features
export interface SavedRecipe {
  id: string;
  protocol: NeuralProtocol;
  ingredients: Ingredient[];
  savedAt: number;
  favorite: boolean;
  tags: string[];
  notes?: string;
  cookCount: number;
  lastCooked?: number;
  rating?: number;
}

export interface MealPlan {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipeId: string;
  recipeName: string;
  servings: number;
  notes?: string;
  completed: boolean;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: 'produce' | 'protein' | 'dairy' | 'grains' | 'spices' | 'other';
  checked: boolean;
  recipeId?: string;
  addedAt: number;
  priority: 'low' | 'medium' | 'high';
}

export interface RecipeCollection {
  id: string;
  name: string;
  description?: string;
  recipeIds: string[];
  createdAt: number;
  coverImage?: string;
  color?: string;
}

// IndexedDB Store Names
const STORES = {
  RECIPES: 'saved_recipes',
  MEAL_PLANS: 'meal_plans',
  SHOPPING_LIST: 'shopping_list',
  COLLECTIONS: 'recipe_collections',
};

class OfflineFeaturesService {
  private dbName = 'culinary_lens_offline';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        logger.error('[OfflineFeatures] Database initialization failed', {}, request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        logger.info('[OfflineFeatures] Database initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains(STORES.RECIPES)) {
          const recipeStore = db.createObjectStore(STORES.RECIPES, { keyPath: 'id' });
          recipeStore.createIndex('favorite', 'favorite', { unique: false });
          recipeStore.createIndex('savedAt', 'savedAt', { unique: false });
          recipeStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
        }

        if (!db.objectStoreNames.contains(STORES.MEAL_PLANS)) {
          const mealStore = db.createObjectStore(STORES.MEAL_PLANS, { keyPath: 'id' });
          mealStore.createIndex('date', 'date', { unique: false });
          mealStore.createIndex('recipeId', 'recipeId', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.SHOPPING_LIST)) {
          const shoppingStore = db.createObjectStore(STORES.SHOPPING_LIST, { keyPath: 'id' });
          shoppingStore.createIndex('checked', 'checked', { unique: false });
          shoppingStore.createIndex('category', 'category', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.COLLECTIONS)) {
          const collectionStore = db.createObjectStore(STORES.COLLECTIONS, { keyPath: 'id' });
          collectionStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        logger.info('[OfflineFeatures] Database schema created');
      };
    });
  }

  // ===== RECIPE MANAGEMENT =====

  async saveRecipe(
    protocol: NeuralProtocol,
    ingredients: Ingredient[],
    tags: string[] = []
  ): Promise<SavedRecipe> {
    const recipe: SavedRecipe = {
      id: `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      protocol,
      ingredients,
      savedAt: Date.now(),
      favorite: false,
      tags,
      cookCount: 0,
    };

    await this._saveToStore(STORES.RECIPES, recipe);
    logger.info('[OfflineFeatures] Recipe saved', { recipeId: recipe.id });
    return recipe;
  }

  async getSavedRecipes(): Promise<SavedRecipe[]> {
    const recipes = await this._getAllFromStore<SavedRecipe>(STORES.RECIPES);
    return recipes.sort((a, b) => b.savedAt - a.savedAt);
  }

  async getFavoriteRecipes(): Promise<SavedRecipe[]> {
    const recipes = await this.getSavedRecipes();
    return recipes.filter(r => r.favorite);
  }

  async toggleFavorite(recipeId: string): Promise<void> {
    const recipe = await this._getFromStore<SavedRecipe>(STORES.RECIPES, recipeId);
    if (recipe) {
      recipe.favorite = !recipe.favorite;
      await this._saveToStore(STORES.RECIPES, recipe);
      logger.info('[OfflineFeatures] Recipe favorite toggled', { recipeId, favorite: recipe.favorite });
    }
  }

  async deleteRecipe(recipeId: string): Promise<void> {
    await this._deleteFromStore(STORES.RECIPES, recipeId);
    logger.info('[OfflineFeatures] Recipe deleted', { recipeId });
  }

  async updateRecipeNotes(recipeId: string, notes: string): Promise<void> {
    const recipe = await this._getFromStore<SavedRecipe>(STORES.RECIPES, recipeId);
    if (recipe) {
      recipe.notes = notes;
      await this._saveToStore(STORES.RECIPES, recipe);
    }
  }

  async rateRecipe(recipeId: string, rating: number): Promise<void> {
    const recipe = await this._getFromStore<SavedRecipe>(STORES.RECIPES, recipeId);
    if (recipe) {
      recipe.rating = Math.min(5, Math.max(1, rating));
      await this._saveToStore(STORES.RECIPES, recipe);
    }
  }

  async incrementCookCount(recipeId: string): Promise<void> {
    const recipe = await this._getFromStore<SavedRecipe>(STORES.RECIPES, recipeId);
    if (recipe) {
      recipe.cookCount += 1;
      recipe.lastCooked = Date.now();
      await this._saveToStore(STORES.RECIPES, recipe);
    }
  }

  // ===== MEAL PLANNING =====

  async addMealPlan(plan: Omit<MealPlan, 'id'>): Promise<MealPlan> {
    const mealPlan: MealPlan = {
      ...plan,
      id: `meal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    await this._saveToStore(STORES.MEAL_PLANS, mealPlan);
    logger.info('[OfflineFeatures] Meal plan added', { planId: mealPlan.id, date: mealPlan.date });
    return mealPlan;
  }

  async getMealPlansForDate(date: string): Promise<MealPlan[]> {
    const allPlans = await this._getAllFromStore<MealPlan>(STORES.MEAL_PLANS);
    return allPlans.filter(p => p.date === date);
  }

  async getMealPlansForWeek(startDate: string): Promise<MealPlan[]> {
    const allPlans = await this._getAllFromStore<MealPlan>(STORES.MEAL_PLANS);
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    return allPlans.filter(p => {
      const planDate = new Date(p.date);
      return planDate >= start && planDate < end;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }

  async toggleMealComplete(mealId: string): Promise<void> {
    const meal = await this._getFromStore<MealPlan>(STORES.MEAL_PLANS, mealId);
    if (meal) {
      meal.completed = !meal.completed;
      await this._saveToStore(STORES.MEAL_PLANS, meal);
    }
  }

  async deleteMealPlan(mealId: string): Promise<void> {
    await this._deleteFromStore(STORES.MEAL_PLANS, mealId);
    logger.info('[OfflineFeatures] Meal plan deleted', { mealId });
  }

  // ===== SHOPPING LIST =====

  async addShoppingItem(item: Omit<ShoppingListItem, 'id' | 'addedAt'>): Promise<ShoppingListItem> {
    const shoppingItem: ShoppingListItem = {
      ...item,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      addedAt: Date.now(),
    };

    await this._saveToStore(STORES.SHOPPING_LIST, shoppingItem);
    logger.info('[OfflineFeatures] Shopping item added', { itemId: shoppingItem.id });
    return shoppingItem;
  }

  async getShoppingList(): Promise<ShoppingListItem[]> {
    const items = await this._getAllFromStore<ShoppingListItem>(STORES.SHOPPING_LIST);
    // Sort: unchecked first, then by priority, then by category
    return items.sort((a, b) => {
      if (a.checked !== b.checked) return a.checked ? 1 : -1;
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (a.priority !== b.priority) return priorityOrder[a.priority] - priorityOrder[b.priority];
      return a.category.localeCompare(b.category);
    });
  }

  async toggleShoppingItem(itemId: string): Promise<void> {
    const item = await this._getFromStore<ShoppingListItem>(STORES.SHOPPING_LIST, itemId);
    if (item) {
      item.checked = !item.checked;
      await this._saveToStore(STORES.SHOPPING_LIST, item);
    }
  }

  async deleteShoppingItem(itemId: string): Promise<void> {
    await this._deleteFromStore(STORES.SHOPPING_LIST, itemId);
  }

  async clearCheckedItems(): Promise<void> {
    const items = await this.getShoppingList();
    const checkedItems = items.filter(item => item.checked);
    
    for (const item of checkedItems) {
      await this.deleteShoppingItem(item.id);
    }
    
    logger.info('[OfflineFeatures] Cleared checked items', { count: checkedItems.length });
  }

  async addRecipeToShoppingList(recipeId: string): Promise<void> {
    const recipe = await this._getFromStore<SavedRecipe>(STORES.RECIPES, recipeId);
    if (!recipe) return;

    // Extract missing ingredients and add to shopping list
    for (const ingredient of recipe.ingredients) {
      await this.addShoppingItem({
        name: ingredient.name,
        quantity: ingredient.quantity || 1,
        unit: ingredient.unit || 'unit',
        category: this._categorizeIngredient(ingredient.name),
        checked: false,
        recipeId: recipeId,
        priority: 'medium',
      });
    }

    logger.info('[OfflineFeatures] Recipe added to shopping list', { recipeId });
  }

  // ===== COLLECTIONS =====

  async createCollection(name: string, description?: string, color?: string): Promise<RecipeCollection> {
    const collection: RecipeCollection = {
      id: `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      recipeIds: [],
      createdAt: Date.now(),
      color,
    };

    await this._saveToStore(STORES.COLLECTIONS, collection);
    logger.info('[OfflineFeatures] Collection created', { collectionId: collection.id });
    return collection;
  }

  async getCollections(): Promise<RecipeCollection[]> {
    const collections = await this._getAllFromStore<RecipeCollection>(STORES.COLLECTIONS);
    return collections.sort((a, b) => b.createdAt - a.createdAt);
  }

  async addRecipeToCollection(collectionId: string, recipeId: string): Promise<void> {
    const collection = await this._getFromStore<RecipeCollection>(STORES.COLLECTIONS, collectionId);
    if (collection && !collection.recipeIds.includes(recipeId)) {
      collection.recipeIds.push(recipeId);
      await this._saveToStore(STORES.COLLECTIONS, collection);
    }
  }

  async removeRecipeFromCollection(collectionId: string, recipeId: string): Promise<void> {
    const collection = await this._getFromStore<RecipeCollection>(STORES.COLLECTIONS, collectionId);
    if (collection) {
      collection.recipeIds = collection.recipeIds.filter(id => id !== recipeId);
      await this._saveToStore(STORES.COLLECTIONS, collection);
    }
  }

  async deleteCollection(collectionId: string): Promise<void> {
    await this._deleteFromStore(STORES.COLLECTIONS, collectionId);
  }

  // ===== STATS & INSIGHTS =====

  async getStats() {
    const recipes = await this.getSavedRecipes();
    const mealPlans = await this._getAllFromStore<MealPlan>(STORES.MEAL_PLANS);
    const shoppingItems = await this.getShoppingList();

    return {
      totalRecipes: recipes.length,
      favoriteRecipes: recipes.filter(r => r.favorite).length,
      totalCooks: recipes.reduce((sum, r) => sum + r.cookCount, 0),
      plannedMeals: mealPlans.length,
      completedMeals: mealPlans.filter(m => m.completed).length,
      shoppingItems: shoppingItems.length,
      uncheckedItems: shoppingItems.filter(i => !i.checked).length,
      mostCooked: recipes.sort((a, b) => b.cookCount - a.cookCount)[0] || null,
    };
  }

  // ===== HELPER METHODS =====

  private _categorizeIngredient(name: string): ShoppingListItem['category'] {
    const nameLower = name.toLowerCase();
    
    if (/(tomato|lettuce|carrot|onion|pepper|vegetable|fruit)/i.test(nameLower)) return 'produce';
    if (/(chicken|beef|pork|fish|meat|protein)/i.test(nameLower)) return 'protein';
    if (/(milk|cheese|yogurt|cream|butter)/i.test(nameLower)) return 'dairy';
    if (/(rice|pasta|bread|flour|grain)/i.test(nameLower)) return 'grains';
    if (/(salt|pepper|spice|herb|cumin|paprika)/i.test(nameLower)) return 'spices';
    
    return 'other';
  }

  private async _saveToStore<T>(storeName: string, data: T): Promise<void> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async _getFromStore<T>(storeName: string, key: string): Promise<T | null> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  private async _getAllFromStore<T>(storeName: string): Promise<T[]> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  private async _deleteFromStore(storeName: string, key: string): Promise<void> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineFeatures = new OfflineFeaturesService();
