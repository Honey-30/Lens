/**
 * Intelligent Ingredient Substitution Service
 * AI-powered recommendations for dietary restrictions, allergies, and budget optimization
 */

import { logger } from '../utils/logger';
import { apiCache } from '../utils/cache';
import type { Ingredient } from '../types';
import { GoogleGenAI } from "@google/genai";

// Runtime API key
let runtimeApiKey: string | null = null;

export const setSubstitutionApiKey = (key: string | null) => {
  runtimeApiKey = key;
  logger.info('[Substitution] API key updated', { hasKey: !!key });
};

const getAI = () => {
  const apiKey = runtimeApiKey || process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export interface SubstitutionOption {
  original: string;
  substitute: string;
  reason: string;
  nutritionalImpact: 'similar' | 'better' | 'different';
  costImpact: 'cheaper' | 'similar' | 'expensive';
  availability: 'common' | 'moderate' | 'rare';
  flavorMatch: number; // 0-100
  textureMatch: number; // 0-100
  cookingAdjustments?: string;
}

export interface SubstitutionConstraints {
  dietary?: 'Vegan' | 'Vegetarian' | 'Keto' | 'Paleo' | 'Gluten-Free';
  allergies?: string[];
  budget?: 'low' | 'medium' | 'high';
  availability?: 'local' | 'supermarket' | 'specialty';
}

export interface CostOptimization {
  totalCost: number;
  savingsOpportunities: Array<{
    ingredient: string;
    currentCost: number;
    optimizedCost: number;
    savings: number;
    suggestion: string;
  }>;
  budgetTier: 'budget' | 'standard' | 'premium';
  recommendations: string[];
}

export interface ShoppingList {
  items: Array<{
    name: string;
    quantity: string;
    category: string;
    store: string;
    aisle: string;
    estimatedCost: number;
  }>;
  totalEstimatedCost: number;
  optimizationTips: string[];
}

/**
 * Find intelligent substitutions for ingredients
 */
export const findSubstitutions = async (
  ingredient: Ingredient,
  constraints: SubstitutionConstraints
): Promise<SubstitutionOption[]> => {
  const cacheKey = `substitution_${ingredient.name}_${JSON.stringify(constraints)}`;
  
  const cached = apiCache.get<SubstitutionOption[]>('substitution', cacheKey);
  if (cached) return cached;

  try {
    const ai = getAI();
    if (!ai) {
      return getFallbackSubstitutions(ingredient, constraints);
    }

    const prompt = `Find ingredient substitutions for: ${ingredient.name}

Constraints:
${constraints.dietary ? `- Dietary: ${constraints.dietary}` : ''}
${constraints.allergies?.length ? `- Allergies: ${constraints.allergies.join(', ')}` : ''}
${constraints.budget ? `- Budget: ${constraints.budget}` : ''}
${constraints.availability ? `- Availability: ${constraints.availability}` : ''}

Provide 3-5 substitution options with:
1. Substitute ingredient name
2. Reason for recommendation
3. Nutritional impact (similar/better/different)
4. Cost impact (cheaper/similar/expensive)
5. Availability (common/moderate/rare)
6. Flavor match score (0-100)
7. Texture match score (0-100)
8. Any cooking adjustments needed

Format as JSON array.`;

    const model = (ai as any).getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse AI response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const substitutions: SubstitutionOption[] = JSON.parse(jsonMatch[0]);
      apiCache.set('substitution', cacheKey, substitutions, 3600000);
      logger.info('[Substitution] Found AI substitutions', { ingredient: ingredient.name, count: substitutions.length });
      return substitutions;
    }

    return getFallbackSubstitutions(ingredient, constraints);
  } catch (error) {
    logger.error('[Substitution] Failed to find substitutions', { error, ingredient: ingredient.name });
    return getFallbackSubstitutions(ingredient, constraints);
  }
};

/**
 * Optimize recipe cost
 */
export const optimizeRecipeCost = async (
  ingredients: Ingredient[],
  targetBudget?: number
): Promise<CostOptimization> => {
  const cacheKey = `cost_opt_${ingredients.map(i => i.name).join('_')}`;
  
  const cached = apiCache.get<CostOptimization>('substitution', cacheKey);
  if (cached) return cached;

  try {
    // Estimate current costs
    const ingredientCosts = ingredients.map(ing => ({
      name: ing.name,
      estimatedCost: estimateIngredientCost(ing)
    }));

    const totalCost = ingredientCosts.reduce((sum, item) => sum + item.estimatedCost, 0);

    const ai = getAI();
    if (!ai) {
      return {
        totalCost,
        savingsOpportunities: [],
        budgetTier: totalCost < 15 ? 'budget' : totalCost < 40 ? 'standard' : 'premium',
        recommendations: ['Consider buying seasonal produce', 'Use store brands for staples']
      };
    }

    const prompt = `Optimize recipe costs for these ingredients:
${ingredientCosts.map(i => `- ${i.name}: $${i.estimatedCost.toFixed(2)}`).join('\n')}

Current total: $${totalCost.toFixed(2)}
${targetBudget ? `Target budget: $${targetBudget}` : ''}

Provide cost optimization strategies:
1. Identify most expensive ingredients
2. Suggest cheaper alternatives
3. Seasonal availability tips
4. Bulk buying opportunities
5. Store brand recommendations

Format as JSON with savingsOpportunities array and recommendations array.`;

    const model = (ai as any).getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const optimization = JSON.parse(jsonMatch[0]);
      const fullOptimization: CostOptimization = {
        totalCost,
        ...optimization,
        budgetTier: totalCost < 15 ? 'budget' : totalCost < 40 ? 'standard' : 'premium',
      };
      apiCache.set('substitution', cacheKey, fullOptimization, 3600000);
      return fullOptimization;
    }

    return {
      totalCost,
      savingsOpportunities: [],
      budgetTier: totalCost < 15 ? 'budget' : totalCost < 40 ? 'standard' : 'premium',
      recommendations: ['Consider buying seasonal produce']
    };
  } catch (error) {
    logger.error('[Substitution] Failed to optimize cost', { error });
    const totalCost = ingredients.reduce((sum, ing) => sum + estimateIngredientCost(ing), 0);
    return {
      totalCost,
      savingsOpportunities: [],
      budgetTier: totalCost < 15 ? 'budget' : totalCost < 40 ? 'standard' : 'premium',
      recommendations: []
    };
  }
};

/**
 * Generate smart shopping list
 */
export const generateShoppingList = async (
  ingredients: Ingredient[],
  preferences: { store?: string; sortBy?: 'category' | 'aisle' | 'cost' }
): Promise<ShoppingList> => {
  try {
    const ai = getAI();
    
    const items = ingredients.map(ing => ({
      name: ing.name,
      quantity: `${ing.mass_grams}g`,
      category: ing.category,
      store: preferences.store || 'Supermarket',
      aisle: getCategoryAisle(ing.category),
      estimatedCost: estimateIngredientCost(ing)
    }));

    if (preferences.sortBy === 'aisle') {
      items.sort((a, b) => a.aisle.localeCompare(b.aisle));
    } else if (preferences.sortBy === 'cost') {
      items.sort((a, b) => b.estimatedCost - a.estimatedCost);
    }

    const totalEstimatedCost = items.reduce((sum, item) => sum + item.estimatedCost, 0);

    const shoppingList: ShoppingList = {
      items,
      totalEstimatedCost,
      optimizationTips: [
        'Buy seasonal produce for better prices',
        'Check for store brand alternatives',
        'Consider buying in bulk for non-perishables'
      ]
    };

    logger.info('[Substitution] Generated shopping list', { itemCount: items.length, total: totalEstimatedCost });
    return shoppingList;
  } catch (error) {
    logger.error('[Substitution] Failed to generate shopping list', { error });
    throw error;
  }
};

/**
 * Estimate ingredient cost based on category and freshness
 */
function estimateIngredientCost(ingredient: Ingredient): number {
  const basePrices: Record<string, number> = {
    'Protein': 8.0,
    'Vegetable': 3.0,
    'Fruit': 4.0,
    'Grain': 2.5,
    'Dairy': 5.0,
    'Spice': 6.0,
    'Oil': 7.0,
    'Condiment': 4.5,
  };

  const basePrice = basePrices[ingredient.category] || 3.0;
  const weightFactor = ingredient.mass_grams / 100; // Per 100g
  const freshnessFactor = ingredient.vitality_score > 80 ? 1.2 : 1.0;

  return basePrice * weightFactor * freshnessFactor;
}

/**
 * Get aisle location for category
 */
function getCategoryAisle(category: string): string {
  const aisleMap: Record<string, string> = {
    'Protein': 'Meat & Seafood',
    'Vegetable': 'Produce',
    'Fruit': 'Produce',
    'Grain': 'Bakery & Grains',
    'Dairy': 'Dairy',
    'Spice': 'Spices & Seasonings',
    'Oil': 'Cooking Oils',
    'Condiment': 'Condiments',
  };

  return aisleMap[category] || 'General';
}

/**
 * Fallback substitutions when AI unavailable
 */
function getFallbackSubstitutions(
  ingredient: Ingredient,
  constraints: SubstitutionConstraints
): SubstitutionOption[] {
  const commonSubs: Record<string, SubstitutionOption> = {
    'butter': {
      original: 'butter',
      substitute: constraints.dietary === 'Vegan' ? 'coconut oil' : 'olive oil',
      reason: constraints.dietary === 'Vegan' ? 'Plant-based alternative' : 'Healthier fat profile',
      nutritionalImpact: 'similar',
      costImpact: 'similar',
      availability: 'common',
      flavorMatch: 75,
      textureMatch: 70,
      cookingAdjustments: 'Use 3/4 the amount of oil'
    },
    'milk': {
      original: 'milk',
      substitute: 'oat milk',
      reason: 'Plant-based, widely available',
      nutritionalImpact: 'similar',
      costImpact: 'similar',
      availability: 'common',
      flavorMatch: 80,
      textureMatch: 90,
    },
    'egg': {
      original: 'egg',
      substitute: 'flax egg',
      reason: 'Vegan binding agent',
      nutritionalImpact: 'different',
      costImpact: 'cheaper',
      availability: 'moderate',
      flavorMatch: 60,
      textureMatch: 75,
      cookingAdjustments: '1 tbsp ground flax + 3 tbsp water per egg'
    }
  };

  const lowerName = ingredient.name.toLowerCase();
  const match = Object.keys(commonSubs).find(key => lowerName.includes(key));
  
  if (match) {
    return [commonSubs[match]];
  }

  return [];
}
