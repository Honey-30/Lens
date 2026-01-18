
import { OfflineModel, ModelType } from '../types';

/**
 * Universal Model Registry for CulinaryLens.
 * Acts as the authority for what local intelligence capabilities are active.
 */
class ModelRegistry {
  private models: OfflineModel[] = [
    {
      id: 'yolo-v8x-culinary',
      name: 'YOLOv8x Edge',
      version: '4.2.0',
      type: ModelType.DETECTION,
      accuracy: 0.94,
      coverage: ['apple', 'pear', 'spinach', 'cheese', 'tomato', 'onion', 'garlic']
    },
    {
      id: 'efficientnet-b7-food',
      name: 'EfficientNet-B7',
      version: '1.0.5',
      type: ModelType.CLASSIFICATION,
      accuracy: 0.98,
      coverage: ['thyme', 'lemon', 'basil', 'rosemary', 'olive oil', 'mushrooms']
    },
    {
      id: 'culinary-logic-v2',
      name: 'Molecular Reasoning Engine',
      version: '2.1.0',
      type: ModelType.REASONING,
      accuracy: 0.88,
      coverage: ['flavor-pairing', 'recipe-structuring', 'substitution-logic', 'waste-prediction']
    }
  ];

  /**
   * Retrieves all registered models of a specific type.
   */
  getModelsByType(type: ModelType): OfflineModel[] {
    return this.models.filter(m => m.type === type);
  }

  /**
   * Retrieves the aggregate coverage for a specific capability.
   */
  getAggregateCoverage(type: ModelType): string[] {
    const coverage = new Set<string>();
    this.getModelsByType(type).forEach(m => {
      m.coverage.forEach(c => coverage.add(c));
    });
    return Array.from(coverage);
  }

  /**
   * Dynamically adds a new model to the edge environment.
   */
  registerModel(model: OfflineModel) {
    if (!this.models.find(m => m.id === model.id)) {
      this.models.push(model);
      console.info(`[ModelRegistry] Augmented system with ${model.name} (${model.version})`);
    }
  }

  /**
   * Returns a report of current edge intelligence capacity.
   */
  getStats() {
    return {
      totalModels: this.models.length,
      detectionClasses: this.getAggregateCoverage(ModelType.DETECTION).length,
      classificationClasses: this.getAggregateCoverage(ModelType.CLASSIFICATION).length,
      health: 'OPTIMAL'
    };
  }
}

export const registry = new ModelRegistry();
