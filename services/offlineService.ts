
import { Ingredient, NeuralProtocol, UserPreferences, ImpactMetrics, ModelType } from '../types';
import { registry } from './modelRegistry';

/**
 * High-Density Nutritional Constants
 */
const NUTRIENT_DENSITY: Record<string, { cal: number; protein: number; carbs: number; fat: number }> = {
  'fruit': { cal: 50, protein: 0.5, carbs: 12, fat: 0.2 },
  'vegetable': { cal: 25, protein: 1.5, carbs: 5, fat: 0.1 },
  'protein': { cal: 220, protein: 22, carbs: 0, fat: 14 },
  'dairy': { cal: 160, protein: 9, carbs: 4, fat: 12 },
  'herb': { cal: 5, protein: 0.1, carbs: 1, fat: 0.1 },
  'condiment': { cal: 300, protein: 0.5, carbs: 5, fat: 32 },
  'default': { cal: 100, protein: 5, carbs: 10, fat: 5 }
};

/**
 * Molecular Affinity Matrix (Simulated Knowledge Graph)
 */
const MOLECULAR_AFFINITY_MAP: Record<string, string[]> = {
  'apple': ['cinnamon', 'pork', 'cheese', 'walnut', 'maple', 'vanilla'],
  'pear': ['blue cheese', 'chocolate', 'red wine', 'honey', 'rosemary'],
  'spinach': ['nutmeg', 'garlic', 'lemon', 'egg', 'heavy cream', 'pine nut'],
  'cheese': ['truffle', 'honey', 'fig', 'pear', 'white wine', 'hazelnut'],
  'tomato': ['basil', 'olive oil', 'garlic', 'mozzarella', 'balsamic', 'anchovy'],
  'garlic': ['onion', 'olive oil', 'thyme', 'chicken', 'parsley', 'ginger'],
  'chicken': ['lemon', 'rosemary', 'garlic', 'thyme', 'white wine', 'tarragon'],
  'mushroom': ['thyme', 'garlic', 'butter', 'parsley', 'soy sauce', 'beef'],
  'lemon': ['honey', 'mint', 'garlic', 'chicken', 'fish', 'ginger'],
  'thyme': ['garlic', 'lemon', 'chicken', 'mushroom', 'beef', 'potato']
};

/**
 * Intelligent Substitution Engine (Offline)
 */
const SUBSTITUTION_TABLE: Record<string, string[]> = {
  'butter': ['olive oil', 'ghee', 'coconut oil'],
  'milk': ['soy milk', 'oat milk', 'cream'],
  'lemon': ['lime', 'vinegar', 'verjuice'],
  'onion': ['shallot', 'leek', 'chives'],
  'chicken': ['tofu', 'pork', 'turkey'],
  'egg': ['flax egg', 'aquafaba', 'yogurt'],
  'heavy cream': ['coconut cream', 'cashew cream', 'yogurt']
};

/**
 * Procedural Recipe Blueprints
 */
const RECIPE_BLUEPRINTS = [
  {
    title: "Sovereign {primary} Composition",
    description: "An architectural exploration of {primary} textures, harmonized with {secondary} using local Edge Model {modelVersion}.",
    steps: [
      { instruction: "Deconstruct {primary} into geometric primitives to maximize surface interaction.", technique: "Structural Slicing" },
      { instruction: "Synthesize an emulsion of {secondary} and base lipids to create a high-viscosity foundation.", technique: "Thermal Gelation" },
      { instruction: "Plate using a radial symmetry grid, ensuring 35% negative space.", technique: "Minimalist Assembly" }
    ]
  },
  {
    title: "Deconstructed {primary} & {secondary} Study",
    description: "Isolating essential flavor profiles of {primary} via Edge Engine {modelVersion} and pairing with high-acidity nodes of {secondary}.",
    steps: [
      { instruction: "Stabilize the {primary} structure using a precision chill cycle.", technique: "Cryogenic Tempering" },
      { instruction: "Perform a rapid atmospheric reduction of {secondary} to concentrate the ester profile.", technique: "Atmospheric Reduction" },
      { instruction: "Assemble with vertical architecture to create a multisensory topographical map.", technique: "Technical Plating" }
    ]
  }
];

export const findOfflineSubstitutions = (ingredient: string): string[] => {
  return SUBSTITUTION_TABLE[ingredient.toLowerCase()] || [];
};

export const synthesizeOfflineProtocol = (ingredients: Ingredient[], preferences: UserPreferences): NeuralProtocol => {
  const primary = ingredients[0]?.name || 'Botanical';
  const secondary = ingredients[1]?.name || 'Secondary Element';
  const blueprint = RECIPE_BLUEPRINTS[Math.floor(Math.random() * RECIPE_BLUEPRINTS.length)];
  const reasoningModel = registry.getModelsByType(ModelType.REASONING)[0];

  const protocol: NeuralProtocol = {
    id: `edge_${Math.random().toString(36).substr(2, 9)}`,
    title: blueprint.title.replace('{primary}', primary),
    description: blueprint.description
      .replace('{primary}', primary)
      .replace('{secondary}', secondary)
      .replace('{modelVersion}', reasoningModel.version),
    complexity: 'Medium',
    duration_minutes: 30,
    ingredients_used: ingredients.map(i => i.name),
    molecularAffinity: calculateLocalAffinity(ingredients),
    platingTips: [
      "Utilize matte textures for visual depth",
      "Ensure color temperature balance between components",
      "Inference generated via sovereign edge compute"
    ],
    drinkPairing: {
      name: "Ambient Palate Cleanser",
      description: "Non-carbonated, room-temperature mineral infusion to preserve delicate molecular nodes."
    },
    nutrition: calculateOfflineNutrition(ingredients),
    instructions: blueprint.steps.map((s, i) => ({
      order: i + 1,
      instruction: s.instruction.replace('{primary}', primary).replace('{secondary}', secondary),
      technique: s.technique,
      timer_seconds: 240
    })),
    groundingSources: [],
    substitutionRisk: 'SAFE',
    isOffline: true
  };

  return protocol;
};

const calculateLocalAffinity = (ingredients: Ingredient[]): number => {
  if (ingredients.length < 2) return 60;
  const primaryName = ingredients[0].name.toLowerCase();
  const secondaryName = ingredients[1].name.toLowerCase();
  
  const affinities = MOLECULAR_AFFINITY_MAP[primaryName] || [];
  return affinities.includes(secondaryName) ? 92 : 68;
};

const calculateOfflineNutrition = (ingredients: Ingredient[]) => {
  const total = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  ingredients.forEach(ing => {
    const cat = ing.category?.toLowerCase() || 'default';
    const density = NUTRIENT_DENSITY[cat] || NUTRIENT_DENSITY.default;
    const factor = ing.mass_grams / 100;
    total.calories += density.cal * factor;
    total.protein += density.protein * factor;
    total.carbs += density.carbs * factor;
    total.fat += density.fat * factor;
  });
  return {
    calories: Math.round(total.calories),
    protein: Math.round(total.protein),
    carbs: Math.round(total.carbs),
    fat: Math.round(total.fat)
  };
};

export const getOfflineImpact = (ingredients: Ingredient[]): ImpactMetrics => {
  const mass = ingredients.reduce((acc, i) => acc + i.mass_grams, 0);
  return {
    co2SavedKg: Number((mass * 0.0015).toFixed(2)),
    waterSavedLitres: Math.round(mass * 0.55),
    wasteAvoidedGrams: mass
  };
};
