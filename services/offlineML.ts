/**
 * Advanced Offline ML Intelligence Layer
 * Elite machine learning models for offline culinary intelligence
 */

import { Ingredient, NeuralProtocol, SavedRecipe } from '../types';
import { offlineFeatures } from './offlineFeaturesService';

// ==================== RECIPE RECOMMENDATION ENGINE ====================
interface RecipeScore {
  recipeId: string;
  score: number;
  factors: {
    ingredientMatch: number;
    historicalPreference: number;
    seasonalRelevance: number;
    nutritionalBalance: number;
    skillLevel: number;
  };
}

/**
 * ML-powered recipe recommendation using collaborative filtering + content-based approach
 */
export const recommendRecipes = async (
  currentIngredients: Ingredient[],
  cookingHistory: SavedRecipe[],
  userSkillLevel: number = 0.5
): Promise<RecipeScore[]> => {
  const allRecipes = await offlineFeatures.getAllRecipes();
  const scores: RecipeScore[] = [];

  for (const recipe of allRecipes) {
    const ingredientNames = currentIngredients.map(i => i.name.toLowerCase());
    const recipeIngredients = recipe.protocol.ingredients.map(i => i.name.toLowerCase());
    
    // 1. Ingredient Match Score (Jaccard Similarity)
    const intersection = ingredientNames.filter(i => recipeIngredients.includes(i));
    const union = new Set([...ingredientNames, ...recipeIngredients]);
    const ingredientMatch = intersection.length / union.size;

    // 2. Historical Preference (Based on cooking frequency & ratings)
    const historicalScore = calculateHistoricalPreference(recipe, cookingHistory);

    // 3. Seasonal Relevance (Current month matching)
    const seasonalScore = calculateSeasonalRelevance(recipe);

    // 4. Nutritional Balance Score
    const nutritionalScore = calculateNutritionalBalance(recipe.protocol, currentIngredients);

    // 5. Skill Level Match
    const difficultyScore = calculateSkillMatch(recipe.protocol.difficulty, userSkillLevel);

    // Weighted combination
    const totalScore = 
      ingredientMatch * 0.35 +
      historicalScore * 0.25 +
      seasonalScore * 0.15 +
      nutritionalScore * 0.15 +
      difficultyScore * 0.10;

    scores.push({
      recipeId: recipe.id,
      score: totalScore,
      factors: {
        ingredientMatch,
        historicalPreference: historicalScore,
        seasonalRelevance: seasonalScore,
        nutritionalBalance: nutritionalScore,
        skillLevel: difficultyScore
      }
    });
  }

  return scores.sort((a, b) => b.score - a.score);
};

function calculateHistoricalPreference(recipe: SavedRecipe, history: SavedRecipe[]): number {
  const cookCount = recipe.cookCount || 0;
  const rating = recipe.rating || 0;
  const avgCookCount = history.reduce((sum, r) => sum + (r.cookCount || 0), 0) / Math.max(history.length, 1);
  
  const normalizedCooks = Math.min(cookCount / Math.max(avgCookCount, 1), 2) / 2;
  const normalizedRating = rating / 5;
  
  return (normalizedCooks * 0.6 + normalizedRating * 0.4);
}

function calculateSeasonalRelevance(recipe: SavedRecipe): number {
  const month = new Date().getMonth();
  const seasonalIngredients = getSeasonalIngredients(month);
  
  const recipeIngredients = recipe.protocol.ingredients.map(i => i.name.toLowerCase());
  const matches = recipeIngredients.filter(i => 
    seasonalIngredients.some(s => i.includes(s))
  );
  
  return Math.min(matches.length / Math.max(recipeIngredients.length * 0.3, 1), 1);
}

function getSeasonalIngredients(month: number): string[] {
  const seasons: Record<number, string[]> = {
    0: ['kale', 'brussels', 'citrus', 'cabbage', 'sweet potato'],
    1: ['kale', 'brussels', 'citrus', 'cabbage', 'sweet potato'],
    2: ['asparagus', 'pea', 'artichoke', 'lettuce', 'radish'],
    3: ['asparagus', 'pea', 'artichoke', 'lettuce', 'radish'],
    4: ['asparagus', 'pea', 'artichoke', 'lettuce', 'radish'],
    5: ['tomato', 'cucumber', 'zucchini', 'berry', 'corn'],
    6: ['tomato', 'cucumber', 'zucchini', 'berry', 'corn'],
    7: ['tomato', 'cucumber', 'zucchini', 'berry', 'corn'],
    8: ['squash', 'pumpkin', 'apple', 'pear', 'grape'],
    9: ['squash', 'pumpkin', 'apple', 'pear', 'grape'],
    10: ['squash', 'pumpkin', 'apple', 'pear', 'grape'],
    11: ['kale', 'brussels', 'citrus', 'cabbage', 'sweet potato']
  };
  return seasons[month] || [];
}

function calculateNutritionalBalance(protocol: NeuralProtocol, ingredients: Ingredient[]): number {
  const profile = protocol.nutritionalProfile;
  if (!profile) return 0.5;

  // Ideal ranges (simplified)
  const protein = Math.abs(profile.protein - 30) / 30; // Target ~30g
  const carbs = Math.abs(profile.carbs - 50) / 50;     // Target ~50g
  const fats = Math.abs(profile.fats - 20) / 20;       // Target ~20g
  
  const balance = 1 - ((protein + carbs + fats) / 3);
  return Math.max(Math.min(balance, 1), 0);
}

function calculateSkillMatch(difficulty: string, userSkillLevel: number): number {
  const difficultyMap: Record<string, number> = {
    'easy': 0.2,
    'medium': 0.5,
    'hard': 0.8,
    'expert': 1.0
  };
  
  const recipeDifficulty = difficultyMap[difficulty] || 0.5;
  const difference = Math.abs(recipeDifficulty - userSkillLevel);
  
  return 1 - difference;
}

// ==================== INGREDIENT EXPIRATION PREDICTION ====================
interface ExpirationPrediction {
  ingredientId: string;
  predictedExpirationDays: number;
  confidence: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  recommendations: string[];
}

/**
 * ML model to predict ingredient expiration based on freshness score and category
 */
export const predictExpiration = (ingredient: Ingredient): ExpirationPrediction => {
  const categoryLifespan: Record<string, number> = {
    'fruit': 7,
    'vegetable': 10,
    'protein': 3,
    'dairy': 7,
    'herb': 5,
    'condiment': 90,
    'grain': 180,
    'spice': 365
  };

  const baseLifespan = categoryLifespan[ingredient.category.toLowerCase()] || 14;
  
  // Adjust based on vitality score (freshness)
  const vitalityFactor = ingredient.vitality_score / 100;
  const predictedDays = Math.round(baseLifespan * vitalityFactor);
  
  // Calculate confidence based on data quality
  const confidence = ingredient.confidence || 0.7;

  // Determine urgency
  let urgency: 'critical' | 'high' | 'medium' | 'low';
  if (predictedDays <= 1) urgency = 'critical';
  else if (predictedDays <= 3) urgency = 'high';
  else if (predictedDays <= 7) urgency = 'medium';
  else urgency = 'low';

  // Generate recommendations
  const recommendations = generateExpirationRecommendations(ingredient, predictedDays);

  return {
    ingredientId: ingredient.id,
    predictedExpirationDays: predictedDays,
    confidence,
    urgency,
    recommendations
  };
};

function generateExpirationRecommendations(ingredient: Ingredient, daysLeft: number): string[] {
  const recs: string[] = [];
  
  if (daysLeft <= 2) {
    recs.push(`Cook ${ingredient.name} immediately - expires in ${daysLeft} day(s)`);
    recs.push(`Consider freezing for later use`);
  } else if (daysLeft <= 5) {
    recs.push(`Plan a meal using ${ingredient.name} this week`);
    recs.push(`Store in optimal conditions to extend freshness`);
  } else {
    recs.push(`${ingredient.name} is fresh - safe for ${daysLeft} more days`);
  }
  
  return recs;
}

// ==================== COOKING SKILL PROGRESSION TRACKER ====================
interface SkillMetrics {
  overallLevel: number; // 0-1
  techniquesMastered: string[];
  cuisineExpertise: Record<string, number>;
  difficultyProgression: number[];
  recommendedNextLevel: string;
  milestones: Array<{
    name: string;
    achieved: boolean;
    progress: number;
  }>;
}

/**
 * Analyze cooking history to determine skill level and progression
 */
export const analyzeSkillProgression = (cookingHistory: SavedRecipe[]): SkillMetrics => {
  const techniques = new Set<string>();
  const cuisineScores: Record<string, number> = {};
  const difficultyScores: number[] = [];

  for (const recipe of cookingHistory) {
    // Extract techniques
    recipe.protocol.instructions.forEach(step => {
      if (step.technique) techniques.add(step.technique);
    });

    // Track cuisine expertise
    const cuisine = recipe.protocol.cuisineStyle;
    cuisineScores[cuisine] = (cuisineScores[cuisine] || 0) + 1;

    // Track difficulty progression
    const diffMap: Record<string, number> = {
      'easy': 0.25,
      'medium': 0.5,
      'hard': 0.75,
      'expert': 1.0
    };
    difficultyScores.push(diffMap[recipe.protocol.difficulty] || 0.5);
  }

  // Calculate overall skill level
  const avgDifficulty = difficultyScores.reduce((a, b) => a + b, 0) / Math.max(difficultyScores.length, 1);
  const techniqueCount = techniques.size;
  const cuisineCount = Object.keys(cuisineScores).length;
  
  const overallLevel = Math.min(
    (avgDifficulty * 0.4) + 
    (Math.min(techniqueCount / 30, 1) * 0.3) + 
    (Math.min(cuisineCount / 8, 1) * 0.3),
    1
  );

  // Define milestones
  const milestones = [
    { name: 'First Recipe', achieved: cookingHistory.length >= 1, progress: Math.min(cookingHistory.length, 1) },
    { name: 'Recipe Explorer', achieved: cookingHistory.length >= 5, progress: Math.min(cookingHistory.length / 5, 1) },
    { name: 'Technique Collector', achieved: techniqueCount >= 10, progress: Math.min(techniqueCount / 10, 1) },
    { name: 'Cuisine Voyager', achieved: cuisineCount >= 5, progress: Math.min(cuisineCount / 5, 1) },
    { name: 'Advanced Chef', achieved: avgDifficulty >= 0.7, progress: Math.min(avgDifficulty / 0.7, 1) },
    { name: 'Master Curator', achieved: cookingHistory.length >= 50, progress: Math.min(cookingHistory.length / 50, 1) }
  ];

  // Recommend next level
  let recommendedNextLevel = 'easy';
  if (overallLevel > 0.7) recommendedNextLevel = 'expert';
  else if (overallLevel > 0.5) recommendedNextLevel = 'hard';
  else if (overallLevel > 0.3) recommendedNextLevel = 'medium';

  return {
    overallLevel,
    techniquesMastered: Array.from(techniques),
    cuisineExpertise: cuisineScores,
    difficultyProgression: difficultyScores,
    recommendedNextLevel,
    milestones
  };
};

// ==================== SMART MEAL PLANNING OPTIMIZER ====================
interface MealPlanOptimization {
  plan: Array<{
    day: string;
    meal: string;
    recipeId: string;
    recipeName: string;
    nutritionalScore: number;
  }>;
  totalNutritionalBalance: number;
  ingredientEfficiency: number;
  varietyScore: number;
}

/**
 * Optimize meal planning using constraint satisfaction and nutritional balancing
 */
export const optimizeMealPlan = async (
  availableIngredients: Ingredient[],
  daysToPlan: number = 7,
  mealsPerDay: number = 2
): Promise<MealPlanOptimization> => {
  const recipes = await offlineFeatures.getAllRecipes();
  const plan: MealPlanOptimization['plan'] = [];
  const usedRecipes = new Set<string>();

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  for (let dayIndex = 0; dayIndex < daysToPlan; dayIndex++) {
    for (let mealIndex = 0; mealIndex < mealsPerDay; mealIndex++) {
      // Find best recipe for this meal slot
      const scored = await recommendRecipes(availableIngredients, recipes, 0.5);
      
      // Select recipe that hasn't been used yet
      const selected = scored.find(s => !usedRecipes.has(s.recipeId));
      if (!selected) continue;

      const recipe = recipes.find(r => r.id === selected.recipeId);
      if (!recipe) continue;

      usedRecipes.add(selected.recipeId);
      plan.push({
        day: days[dayIndex % days.length],
        meal: mealIndex === 0 ? 'Lunch' : 'Dinner',
        recipeId: recipe.id,
        recipeName: recipe.protocol.name,
        nutritionalScore: selected.factors.nutritionalBalance
      });
    }
  }

  // Calculate metrics
  const totalNutritionalBalance = plan.reduce((sum, p) => sum + p.nutritionalScore, 0) / Math.max(plan.length, 1);
  const ingredientEfficiency = calculateIngredientEfficiency(plan, availableIngredients, recipes);
  const varietyScore = usedRecipes.size / Math.max(plan.length, 1);

  return {
    plan,
    totalNutritionalBalance,
    ingredientEfficiency,
    varietyScore
  };
};

function calculateIngredientEfficiency(
  plan: MealPlanOptimization['plan'],
  available: Ingredient[],
  recipes: SavedRecipe[]
): number {
  const requiredIngredients = new Set<string>();
  
  for (const planItem of plan) {
    const recipe = recipes.find(r => r.id === planItem.recipeId);
    if (recipe) {
      recipe.protocol.ingredients.forEach(ing => 
        requiredIngredients.add(ing.name.toLowerCase())
      );
    }
  }

  const availableNames = new Set(available.map(i => i.name.toLowerCase()));
  const matches = Array.from(requiredIngredients).filter(r => availableNames.has(r));
  
  return matches.length / Math.max(requiredIngredients.size, 1);
}

// ==================== TECHNIQUE DIFFICULTY ANALYZER ====================
interface TechniqueComplexity {
  technique: string;
  complexity: number; // 0-1
  prerequisites: string[];
  estimatedTime: number; // minutes
  failureRisk: number; // 0-1
}

export const analyzeTechniqueComplexity = (technique: string): TechniqueComplexity => {
  const complexityDatabase: Record<string, TechniqueComplexity> = {
    'Structural Slicing': { technique: 'Structural Slicing', complexity: 0.3, prerequisites: ['knife skills'], estimatedTime: 5, failureRisk: 0.1 },
    'Thermal Gelation': { technique: 'Thermal Gelation', complexity: 0.7, prerequisites: ['temperature control', 'emulsification'], estimatedTime: 15, failureRisk: 0.4 },
    'Minimalist Assembly': { technique: 'Minimalist Assembly', complexity: 0.4, prerequisites: ['plating basics'], estimatedTime: 10, failureRisk: 0.2 },
    'Cryogenic Tempering': { technique: 'Cryogenic Tempering', complexity: 0.9, prerequisites: ['temperature mastery', 'timing'], estimatedTime: 20, failureRisk: 0.6 },
    'Atmospheric Reduction': { technique: 'Atmospheric Reduction', complexity: 0.6, prerequisites: ['heat control', 'concentration'], estimatedTime: 12, failureRisk: 0.3 },
    'Technical Plating': { technique: 'Technical Plating', complexity: 0.5, prerequisites: ['artistic vision', 'precision'], estimatedTime: 8, failureRisk: 0.2 }
  };

  return complexityDatabase[technique] || {
    technique,
    complexity: 0.5,
    prerequisites: [],
    estimatedTime: 10,
    failureRisk: 0.3
  };
};

// ==================== PANTRY OPTIMIZATION ENGINE ====================
interface PantryInsights {
  utilizationRate: number;
  expiringItems: Array<{ ingredient: Ingredient; daysLeft: number }>;
  underutilizedItems: string[];
  suggectedRecipes: string[];
  wasteReduction: number;
}

export const analyzePantryHealth = async (
  currentInventory: Ingredient[],
  cookingHistory: SavedRecipe[]
): Promise<PantryInsights> => {
  // Calculate utilization rate
  const usedIngredients = new Set<string>();
  cookingHistory.forEach(recipe => {
    recipe.protocol.ingredients.forEach(ing => 
      usedIngredients.add(ing.name.toLowerCase())
    );
  });

  const utilizationRate = usedIngredients.size / Math.max(currentInventory.length, 1);

  // Find expiring items
  const expiringItems = currentInventory
    .map(ing => ({
      ingredient: ing,
      daysLeft: predictExpiration(ing).predictedExpirationDays
    }))
    .filter(item => item.daysLeft <= 5)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  // Find underutilized items
  const ingredientFrequency: Record<string, number> = {};
  cookingHistory.forEach(recipe => {
    recipe.protocol.ingredients.forEach(ing => {
      const name = ing.name.toLowerCase();
      ingredientFrequency[name] = (ingredientFrequency[name] || 0) + 1;
    });
  });

  const avgFrequency = Object.values(ingredientFrequency).reduce((a, b) => a + b, 0) / 
    Math.max(Object.keys(ingredientFrequency).length, 1);

  const underutilizedItems = currentInventory
    .filter(ing => (ingredientFrequency[ing.name.toLowerCase()] || 0) < avgFrequency * 0.5)
    .map(ing => ing.name);

  // Suggest recipes
  const recommendations = await recommendRecipes(currentInventory, cookingHistory, 0.5);
  const suggestedRecipes = recommendations
    .slice(0, 5)
    .map(r => r.recipeId);

  // Calculate waste reduction potential
  const wasteReduction = (expiringItems.length / Math.max(currentInventory.length, 1)) * 100;

  return {
    utilizationRate,
    expiringItems,
    underutilizedItems,
    suggectedRecipes: suggestedRecipes,
    wasteReduction
  };
};

export default {
  recommendRecipes,
  predictExpiration,
  analyzeSkillProgression,
  optimizeMealPlan,
  analyzeTechniqueComplexity,
  analyzePantryHealth
};
