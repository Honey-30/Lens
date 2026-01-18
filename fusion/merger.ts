
import { Ingredient, NeuralProtocol, ProtocolStep } from '../types';
import { normalizeName } from './validator';

/**
 * Injects ML truth (mass, freshness) into the Gemini narrative steps.
 */
export const mergeMetadata = (
  mlInventory: Ingredient[],
  protocol: NeuralProtocol
): NeuralProtocol => {
  const mlMap = new Map(mlInventory.map(i => [normalizeName(i.name), i]));

  const mergedInstructions = protocol.instructions.map((step: ProtocolStep) => {
    let enrichedInstruction = step.instruction;
    let technicalNote = '';

    // Search for ingredient mentions in the instruction to inject ML data
    mlInventory.forEach(ing => {
      if (step.instruction.toLowerCase().includes(ing.name.toLowerCase())) {
        technicalNote += ` [Utilize ${ing.mass_grams}g]`;
        
        // Adjust technique if vitality is low (Freshness < 50%)
        if (ing.vitality_score < 50) {
          technicalNote += ` (Bio-Vitality Alert: Increase heat intensity for safety)`;
        }
      }
    });

    return {
      ...step,
      instruction: `${enrichedInstruction}${technicalNote}`.trim()
    };
  });

  return {
    ...protocol,
    instructions: mergedInstructions
  };
};
