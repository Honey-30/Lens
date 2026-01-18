
import { Ingredient, ImpactMetrics } from '../types';

/**
 * Approximate impact constants per kg of food category
 * Based on global averages for sustainability metrics.
 */
const IMPACT_COEFFICIENTS: Record<string, { co2: number; water: number }> = {
  'fruit': { co2: 0.4, water: 960 },
  'vegetable': { co2: 0.5, water: 320 },
  'protein': { co2: 12.0, water: 4300 }, // High-end average
  'dairy': { co2: 3.2, water: 1000 },
  'default': { co2: 1.0, water: 500 }
};

export const calculateEnvironmentalImpact = (ingredients: Ingredient[]): ImpactMetrics => {
  let co2 = 0;
  let water = 0;
  let totalMass = 0;

  ingredients.forEach(ing => {
    const category = ing.category?.toLowerCase() || 'default';
    const coefficients = IMPACT_COEFFICIENTS[category] || IMPACT_COEFFICIENTS['default'];
    const massKg = ing.mass_grams / 1000;
    
    co2 += coefficients.co2 * massKg;
    water += coefficients.water * massKg;
    totalMass += ing.mass_grams;
  });

  return {
    co2SavedKg: Number(co2.toFixed(2)),
    waterSavedLitres: Math.round(water),
    wasteAvoidedGrams: totalMass
  };
};
