/**
 * AI-Powered Image Generation Service
 * Generates high-quality visual descriptions for dishes, ingredients, and cooking steps
 */

import { logger } from '../utils/logger';
import { apiCache } from '../utils/cache';
import type { NeuralProtocol } from '../types';
import { GoogleGenAI } from "@google/genai";

// Runtime API key for image generation
let runtimeApiKey: string | null = null;

export const setImageGenApiKey = (key: string | null) => {
  runtimeApiKey = key;
  logger.info('[ImageGen] API key updated', { hasKey: !!key });
};

const getAI = () => {
  const apiKey = runtimeApiKey || process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

/**
 * Generate photorealistic dish image description
 */
export const generateDishImage = async (
  protocol: NeuralProtocol,
  style: 'realistic' | 'artistic' | 'minimalist' | 'rustic' = 'realistic'
): Promise<string> => {
  const cacheKey = `dish_image_${protocol.id}_${style}`;
  
  // Check cache first
  const cached = apiCache.get<string>('imageGen', cacheKey);
  if (cached) {
    logger.info('[ImageGen] Cache hit for dish image', { dish: protocol.title });
    return cached;
  }

  try {
    const ai = getAI();
    if (!ai) {
      logger.warn('[ImageGen] Google AI not initialized');
      return `A beautifully plated ${protocol.title}`;
    }

    // Build sophisticated prompt for photorealistic generation
    const stylePrompts = {
      realistic: 'professional food photography, studio lighting, shallow depth of field, appetizing presentation',
      artistic: 'artistic plating, creative composition, vibrant colors, chef presentation',
      minimalist: 'minimalist plating, white plate, clean background, japanese aesthetic',
      rustic: 'rustic wooden table, natural lighting, artisanal presentation, farm-to-table',
    };

    const prompt = `Professional food photography of ${protocol.title}. 
    
Dish description: ${protocol.description}
Key ingredients: ${protocol.ingredients_used.join(', ')}

Style: ${stylePrompts[style]}

Requirements:
- Ultra-high quality, 8K resolution
- Photorealistic rendering
- Perfect lighting and shadows
- Professional plating on ${style === 'minimalist' ? 'white ceramic' : 'elegant'} plate
- Garnished appropriately
- Appetizing and magazine-quality
- No text, watermarks, or logos
- Clean background
- Shot from 45-degree angle

Describe the visual in vivid detail for image generation.`;

    // Use Gemini for visual description generation
    const model = (ai as any).getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        topP: 0.8,
        topK: 40,
      }
    });

    const response = result.response;
    const text = response.text();
    
    const imageDescription = text || `A beautifully plated ${protocol.title}`;
    
    // Cache the result (1 hour)
    apiCache.set('imageGen', cacheKey, imageDescription, 3600000);
    
    logger.info('[ImageGen] Generated dish image description', { 
      dish: protocol.title, 
      style,
      length: imageDescription.length 
    });

    return imageDescription;
  } catch (error) {
    logger.error('[ImageGen] Failed to generate dish image', { error, dish: protocol.title });
    return `A beautifully plated ${protocol.title}`;
  }
};

/**
 * Generate ingredient visualization description
 */
export const generateIngredientVisualization = async (
  ingredientName: string,
  context: string = ''
): Promise<string> => {
  const cacheKey = `ingredient_viz_${ingredientName}`;
  
  const cached = apiCache.get<string>('imageGen', cacheKey);
  if (cached) return cached;

  try {
    const ai = getAI();
    if (!ai) return `${ingredientName} in its fresh, natural state`;

    const prompt = `Ultra-detailed macro photography of ${ingredientName}.

Context: ${context}

Requirements:
- Extreme close-up, macro lens (100mm f/2.8)
- Shallow depth of field showing texture details
- Natural lighting with soft shadows
- Fresh, high-quality ingredient
- Vibrant, natural colors
- Professional food styling
- Clean, simple background (wooden board or white marble)
- Capture the essence and freshness
- 8K resolution details

Describe the visual in vivid photographic detail.`;

    const model = (ai as any).getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const text = result.response.text() || `${ingredientName} in its fresh, natural state`;

    apiCache.set('imageGen', cacheKey, text, 3600000);
    return text;
  } catch (error) {
    logger.error('[ImageGen] Failed to generate ingredient visualization', { error, ingredient: ingredientName });
    return `${ingredientName} in its fresh, natural state`;
  }
};

/**
 * Generate cooking step visualization description
 */
export const generateStepVisualization = async (
  step: string,
  technique: string,
  dishName: string
): Promise<string> => {
  const cacheKey = `step_viz_${dishName}_${technique}`;
  
  const cached = apiCache.get<string>('imageGen', cacheKey);
  if (cached) return cached;

  try {
    const ai = getAI();
    if (!ai) return `Professional demonstration of ${technique} for ${dishName}`;

    const prompt = `Professional cooking instruction photography showing: "${step}"

Technique: ${technique}
Dish: ${dishName}

Requirements:
- Clear step-by-step instructional photo
- Hands of professional chef in action
- Well-lit kitchen workspace
- Focus on the specific technique being performed
- All ingredients and tools visible and labeled naturally
- Professional food photography lighting
- Educational and clear composition
- Shot from overhead or 45-degree angle for clarity
- 4K resolution

Describe the instructional visual scene in precise detail.`;

    const model = (ai as any).getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const text = result.response.text() || `Professional demonstration of ${technique}`;

    apiCache.set('imageGen', cacheKey, text, 3600000);
    return text;
  } catch (error) {
    logger.error('[ImageGen] Failed to generate step visualization', { error, step, technique });
    return `Professional demonstration of ${technique}`;
  }
};

/**
 * Generate plating guide visualization description
 */
export const generatePlatingGuide = async (
  dishName: string,
  components: string[]
): Promise<string> => {
  const cacheKey = `plating_guide_${dishName}`;
  
  const cached = apiCache.get<string>('imageGen', cacheKey);
  if (cached) return cached;

  try {
    const ai = getAI();
    if (!ai) return `Professional plating diagram for ${dishName}`;

    const prompt = `Professional plating guide for ${dishName}.

Components to plate: ${components.join(', ')}

Requirements:
- Clean, overhead view of the plate
- Elegant plate (white or neutral)
- Each component positioned precisely
- Professional garnishing
- Sauce drizzles or dots placed artistically
- Micro-greens or edible flowers as finishing touches
- Restaurant-quality presentation
- Balanced composition following rule of thirds
- Clean rim, no spills
- Perfect for Instagram or menu photography
- 8K resolution detail

Describe the final plated dish in precise visual detail, including exact positioning of each element.`;

    const model = (ai as any).getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const text = result.response.text() || `Professional plating guide for ${dishName}`;

    apiCache.set('imageGen', cacheKey, text, 3600000);
    return text;
  } catch (error) {
    logger.error('[ImageGen] Failed to generate plating guide', { error, dish: dishName });
    return `Professional plating guide for ${dishName}`;
  }
};
