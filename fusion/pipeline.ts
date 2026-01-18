
import { Ingredient, NeuralProtocol } from '../types';
import { validateIngredients, performSanityCheck, normalizeName } from './validator';
import { mergeMetadata } from './merger';
import { calculateCompositeConfidence } from './confidence';
import { calculateEnvironmentalImpact } from '../services/impactService';

/**
 * Fusion Layer Entry Point.
 * Intelligently combines raw ML perception with high-level Gemini reasoning.
 */
export const fuseResults = (
  mlInventory: Ingredient[],
  geminiProtocol: NeuralProtocol
): NeuralProtocol => {
  try {
    // 1. Validation Phase
    if (!performSanityCheck(mlInventory)) {
      console.error("[Fusion] Sanity check failed for ML Inventory.");
      return geminiProtocol;
    }

    // Filter dismissed ingredients out before synthesis logic
    const activeInventory = mlInventory.filter(i => i.verificationStatus !== 'dismissed');

    const { validatedUsed, identifiedHallucinations } = validateIngredients(activeInventory, geminiProtocol);

    let fusedProtocol: NeuralProtocol = {
      ...geminiProtocol,
      ingredients_used: validatedUsed,
      missing_ingredients: [
        ...(geminiProtocol.missing_ingredients || []),
        ...identifiedHallucinations
      ]
    };

    fusedProtocol = mergeMetadata(activeInventory, fusedProtocol);

    // 2. Intelligence Metrics
    fusedProtocol.molecularAffinity = calculateCompositeConfidence(activeInventory, fusedProtocol);
    fusedProtocol.impactMetrics = calculateEnvironmentalImpact(activeInventory.filter(i => validatedUsed.map(v => normalizeName(v)).includes(normalizeName(i.name))));

    // 3. Risk Awareness (Heuristic based on hallucination count)
    if (identifiedHallucinations.length === 0) {
      fusedProtocol.substitutionRisk = 'SAFE';
    } else if (identifiedHallucinations.length < 2) {
      fusedProtocol.substitutionRisk = 'EXPERIMENTAL';
    } else {
      fusedProtocol.substitutionRisk = 'RISKY';
    }

    return fusedProtocol;
  } catch (err) {
    console.error("[Fusion] Critical failure in fusion pipeline. Falling back to Gemini result.", err);
    return geminiProtocol;
  }
};
