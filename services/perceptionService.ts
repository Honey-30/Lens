
import { Ingredient } from '../types';
import { run_perception_pipeline } from '../perception/pipeline';

export const runPerceptionPipeline = async (imageData: string): Promise<Ingredient[]> => {
  try {
    return await run_perception_pipeline(imageData);
  } catch (err) {
    console.error("Perception Layer Error:", err);
    throw err; // Allow fallback logic to handle
  }
};

export const prepareGeminiInput = (perceptionOutput: Ingredient[], userConfig: any) => {
  return {
    ingredients: perceptionOutput,
    context: userConfig
  };
};
