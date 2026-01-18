/**
 * Advanced Offline Recipe Generation Engine
 * Elite neural network-inspired recipe synthesis without API dependency
 */

import { Ingredient, NeuralProtocol, UserPreferences } from '../types';
import { NUTRIENT_DENSITY, MOLECULAR_AFFINITY_MAP, SUBSTITUTION_TABLE, RECIPE_BLUEPRINTS } from './offlineService';

interface RecipeInstruction {
  technique: string;
  instruction: string;
  timer_seconds: number;
}

interface RecipeTemplate {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  cuisineStyles: string[];
  instructions: RecipeInstruction[];
}

// ==================== ADVANCED RECIPE TEMPLATES ====================
const ELITE_RECIPE_TEMPLATES: RecipeTemplate[] = [
  {
    id: 'michelin_molecular',
    name: 'Molecular {primary} with {secondary} Essence',
    description: 'A deconstructed exploration of {primary}, paired with spherified {secondary} through advanced gastronomy techniques.',
    difficulty: 'expert',
    cuisineStyles: ['French Modern', 'Molecular Gastronomy'],
    instructions: [
      { technique: 'Precision Slicing', instruction: 'Deconstruct the {primary} into geometric primitives using mandoline at 2mm thickness for maximum surface area exposure.', timer_seconds: 300 },
      { technique: 'Spherification', instruction: 'Create {secondary} pearls using sodium alginate bath at precisely 35°C, maintaining perfect spheres of 8mm diameter.', timer_seconds: 600 },
      { technique: 'Thermal Gelation', instruction: 'Synthesize a {primary} emulsion with agar-agar at 85°C, cooling gradually to achieve ideal viscosity.', timer_seconds: 480 },
      { technique: 'Sous Vide Tempering', instruction: 'Vacuum-seal and immerse at 62°C for precisely 45 minutes to achieve perfect protein denaturation.', timer_seconds: 2700 },
      { technique: 'Architectural Plating', instruction: 'Plate using radial symmetry with 40% negative space, placing spheres at golden ratio intervals.', timer_seconds: 420 }
    ]
  },
  {
    id: 'japanese_kaiseki',
    name: 'Kaiseki-Inspired {primary} & {secondary}',
    description: 'A seasonal composition celebrating {primary} in the traditional Japanese multi-course style with umami depth.',
    difficulty: 'hard',
    cuisineStyles: ['Japanese Purity', 'Neo-Traditional'],
    instructions: [
      { technique: 'Precision Cutting', instruction: 'Execute katsuramuki technique on {primary}, creating paper-thin sheets for textural contrast.', timer_seconds: 480 },
      { technique: 'Dashi Infusion', instruction: 'Prepare kombu dashi at exactly 80°C, steeping for 10 minutes to extract glutamate compounds without bitterness.', timer_seconds: 600 },
      { technique: 'Umami Layering', instruction: 'Combine {secondary} with mirin and sake, reducing to 30% original volume for concentrated flavor.', timer_seconds: 540 },
      { technique: 'Minimal Assembly', instruction: 'Arrange with wa no kokoro (harmony of spirit), ensuring visual balance and seasonal representation.', timer_seconds: 360 }
    ]
  },
  {
    id: 'indian_masala',
    name: 'Deconstructed {primary} Masala with {secondary}',
    description: 'A modern interpretation of traditional Indian spice matrices, featuring {primary} in aromatic layers.',
    difficulty: 'medium',
    cuisineStyles: ['Indian Molecular', 'Spice Forward'],
    instructions: [
      { technique: 'Spice Blooming', instruction: 'Toast cumin, coriander, and garam masala in ghee at medium heat until aromatic (30 seconds exactly).', timer_seconds: 30 },
      { technique: 'Tadka Technique', instruction: 'Temper mustard seeds and curry leaves in high-heat oil until they crackle and release essential oils.', timer_seconds: 45 },
      { technique: 'Layered Cooking', instruction: 'Add {primary} in stages, building flavor complexity through the Maillard reaction at 170°C.', timer_seconds: 720 },
      { technique: 'Slow Reduction', instruction: 'Simmer {secondary} with tomatoes and spices, reducing to ideal consistency while preserving volatile compounds.', timer_seconds: 1800 },
      { technique: 'Finishing Touch', instruction: 'Garnish with fresh cilantro and lime zest, adding brightness to balance the deep spice notes.', timer_seconds: 120 }
    ]
  },
  {
    id: 'nordic_fermentation',
    name: 'Fermented {primary} with {secondary} Preservation',
    description: 'Neo-Nordic technique showcasing {primary} through lacto-fermentation and seasonal botanical integration.',
    difficulty: 'expert',
    cuisineStyles: ['Neo-Nordic', 'Fermentation Forward'],
    instructions: [
      { technique: 'Salt Brine Preparation', instruction: 'Create 3% salt solution using filtered water, ensuring perfect osmotic environment for lactobacillus.', timer_seconds: 300 },
      { technique: 'Fermentation', instruction: 'Submerge {primary} in brine, weighting down and storing at 18-22°C for 5-7 days until pH reaches 3.5.', timer_seconds: 604800 },
      { technique: 'Botanical Infusion', instruction: 'Prepare {secondary} reduction with Nordic botanicals (juniper, birch), concentrating forest notes.', timer_seconds: 900 },
      { technique: 'Cold Smoking', instruction: 'Apply gentle beechwood smoke at 15°C for 2 hours, adding complexity without cooking.', timer_seconds: 7200 },
      { technique: 'Minimalist Plating', instruction: 'Present with stark simplicity, allowing fermentation character to dominate the palate.', timer_seconds: 240 }
    ]
  },
  {
    id: 'italian_rustic',
    name: 'Rustic {primary} alla {secondary}',
    description: 'Product-focused Italian tradition celebrating {primary} with minimal intervention and maximum flavor.',
    difficulty: 'easy',
    cuisineStyles: ['Neo-Italian', 'Rustic Modern'],
    instructions: [
      { technique: 'Mis en Place', instruction: 'Prepare {primary} by cleaning and rough-cutting into bite-sized pieces, preserving natural shape.', timer_seconds: 300 },
      { technique: 'Olive Oil Emulsion', instruction: 'Heat extra virgin olive oil with garlic until fragrant, creating flavor base without browning.', timer_seconds: 180 },
      { technique: 'High-Heat Sauté', instruction: 'Cook {primary} over high flame, achieving caramelization while maintaining al dente texture.', timer_seconds: 420 },
      { technique: 'Pasta Integration', instruction: 'Toss with al dente pasta and reserved pasta water, creating silky emulsified sauce.', timer_seconds: 240 },
      { technique: 'Finishing', instruction: 'Grate Parmigiano-Reggiano and add fresh {secondary}, serving immediately at optimal temperature.', timer_seconds: 120 }
    ]
  },
  {
    id: 'mexican_mole',
    name: '{primary} Mole with {secondary} Complexity',
    description: 'Modern Mexican technique featuring {primary} in a complex mole negro with 30+ ingredient layers.',
    difficulty: 'hard',
    cuisineStyles: ['Modern Mexican', 'Mole Tradition'],
    instructions: [
      { technique: 'Chile Preparation', instruction: 'Toast dried chiles (ancho, mulato, pasilla) until fragrant, then rehydrate in hot water for 20 minutes.', timer_seconds: 1200 },
      { technique: 'Spice Roasting', instruction: 'Dry-roast cumin, coriander, cinnamon, and cloves until aromatic, grinding to fine powder.', timer_seconds: 300 },
      { technique: 'Sauce Building', instruction: 'Blend rehydrated chiles with chocolate, nuts, raisins, and spices to create complex mole base.', timer_seconds: 600 },
      { technique: 'Slow Simmer', instruction: 'Cook {primary} in mole sauce at gentle simmer for 2 hours, developing deep integration of flavors.', timer_seconds: 7200 },
      { technique: 'Plating', instruction: 'Serve with toasted sesame and fresh {secondary}, balancing richness with acid and texture.', timer_seconds: 180 }
    ]
  }
];

// ==================== WINE/DRINK PAIRING DATABASE ====================
const DRINK_PAIRINGS: Record<string, any> = {
  'French Modern': { name: 'Champagne Brut Nature', description: 'Crisp acidity to cut through rich molecular preparations' },
  'Japanese Purity': { name: 'Junmai Ginjo Sake', description: 'Clean umami profile complementing delicate flavors' },
  'Indian Molecular': { name: 'Riesling Off-Dry', description: 'Sweetness balancing heat with aromatic complexity' },
  'Neo-Nordic': { name: 'Aquavit', description: 'Botanical notes echoing Scandinavian terroir' },
  'Neo-Italian': { name: 'Chianti Classico', description: 'High acidity matching tomato-based preparations' },
  'Modern Mexican': { name: 'Mezcal Artisanal', description: 'Smoky depth harmonizing with complex mole' },
  'default': { name: 'Natural Wine', description: 'Minimal intervention, maximum expression' }
};

// ==================== ADVANCED RECIPE GENERATION ====================
export const generateAdvancedOfflineRecipe = (
  ingredients: Ingredient[],
  preferences: UserPreferences
): NeuralProtocol => {
  // Select template based on cuisine preference and difficulty
  const templates = ELITE_RECIPE_TEMPLATES.filter(t => 
    !preferences.cuisinePreference || 
    t.cuisineStyles.some(s => s.toLowerCase().includes(preferences.cuisinePreference?.toLowerCase() || ''))
  );
  
  const template = templates[Math.floor(Math.random() * templates.length)] || ELITE_RECIPE_TEMPLATES[0];
  
  // Select primary and secondary ingredients
  const primary = ingredients[0] || { name: 'Seasonal Vegetable', category: 'vegetable' };
  const secondary = ingredients[1] || { name: 'Aromatic Herb', category: 'herb' };
  
  // Generate recipe name
  const name = template.name
    .replace('{primary}', primary.name)
    .replace('{secondary}', secondary.name);
  
  // Generate description
  const description = template.description
    .replace(/{primary}/g, primary.name)
    .replace(/{secondary}/g, secondary.name);
  
  // Process instructions
  const instructions = template.instructions.map((inst, index) => ({
    order: index + 1,
    instruction: inst.instruction
      .replace(/{primary}/g, primary.name)
      .replace(/{secondary}/g, secondary.name),
    technique: inst.technique,
    timer_seconds: inst.timer_seconds
  }));
  
  // Calculate nutrition
  const nutrition = calculateNutrition(ingredients);
  
  // Select cuisine style
  const cuisineStyle = template.cuisineStyles[0];
  
  // Get drink pairing
  const drinkPairing = DRINK_PAIRINGS[cuisineStyle] || DRINK_PAIRINGS.default;
  
  // Apply dietary restrictions
  const adjustedInstructions = applyDietaryRestrictions(instructions, preferences.dietary);
  
  const protocol: NeuralProtocol = {
    title: name,
    name,
    description,
    instructions: adjustedInstructions,
    ingredients: ingredients.slice(0, 8), // Use up to 8 ingredients
    nutritionalProfile: nutrition,
    nutrition,
    difficulty: template.difficulty,
    cuisineStyle,
    drinkPairing,
    isOffline: true,
    complexity: template.difficulty === 'easy' ? 'Low' : template.difficulty === 'medium' ? 'Medium' : 'High',
    duration_minutes: Math.round(template.instructions.reduce((sum, inst) => sum + inst.timer_seconds, 0) / 60),
    timing: {
      total: Math.round(template.instructions.reduce((sum, inst) => sum + inst.timer_seconds, 0) / 60)
    }
  };
  
  return protocol;
};

function calculateNutrition(ingredients: Ingredient[]) {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;
  
  for (const ingredient of ingredients) {
    const density = NUTRIENT_DENSITY[ingredient.category.toLowerCase()] || NUTRIENT_DENSITY.default;
    const massFactor = (ingredient.mass_grams || 100) / 100;
    
    totalCalories += density.cal * massFactor;
    totalProtein += density.protein * massFactor;
    totalCarbs += density.carbs * massFactor;
    totalFat += density.fat * massFactor;
    totalFiber += Math.random() * 5 * massFactor; // Simplified
  }
  
  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein),
    carbs: Math.round(totalCarbs),
    fat: Math.round(totalFat),
    fats: Math.round(totalFat),
    fiber: Math.round(totalFiber)
  };
}

function applyDietaryRestrictions(instructions: any[], dietary: string): any[] {
  if (dietary === 'Vegan' || dietary === 'Vegetarian') {
    return instructions.map(inst => ({
      ...inst,
      instruction: inst.instruction
        .replace(/butter/gi, 'olive oil')
        .replace(/cream/gi, 'coconut cream')
        .replace(/cheese/gi, 'nutritional yeast')
        .replace(/meat/gi, 'tofu')
        .replace(/chicken/gi, 'tempeh')
    }));
  }
  
  if (dietary === 'Keto') {
    return instructions.map(inst => ({
      ...inst,
      instruction: inst.instruction
        .replace(/pasta/gi, 'zucchini noodles')
        .replace(/rice/gi, 'cauliflower rice')
        .replace(/bread/gi, 'almond flour bread')
    }));
  }
  
  return instructions;
}

// Export nutrient density for ML service
export { NUTRIENT_DENSITY, MOLECULAR_AFFINITY_MAP, SUBSTITUTION_TABLE, RECIPE_BLUEPRINTS };

export default {
  generateAdvancedOfflineRecipe
};
