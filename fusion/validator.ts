
import { Ingredient, NeuralProtocol } from '../types';

/**
 * Normalizes ingredient names for reliable comparison.
 */
export const normalizeName = (name: string): string => 
  name.toLowerCase().trim().replace(/s$/, ''); // Basic plural normalization

/**
 * Validates Gemini's ingredient usage against ML ground truth.
 * Ensures Gemini does not "hallucinate" items into the inventory.
 */
export const validateIngredients = (
  mlInventory: Ingredient[],
  protocol: NeuralProtocol
): { validatedUsed: string[]; identifiedHallucinations: string[] } => {
  const mlNames = new Set(mlInventory.map(i => normalizeName(i.name)));
  
  const validatedUsed: string[] = [];
  const identifiedHallucinations: string[] = [];

  protocol.ingredients_used.forEach(ing => {
    if (mlNames.has(normalizeName(ing))) {
      validatedUsed.push(ing);
    } else {
      console.warn(`[Fusion] Detected Gemini hallucination: ${ing}. Moving to missing requirements.`);
      identifiedHallucinations.push(ing);
    }
  });

  return { validatedUsed, identifiedHallucinations };
};

/**
 * Ensures quantities and freshness are within biological sanity bounds.
 */
export const performSanityCheck = (mlInventory: Ingredient[]): boolean => {
  return mlInventory.every(i => i.mass_grams > 0 && i.vitality_score >= 0);
};
