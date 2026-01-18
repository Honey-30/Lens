
import { SCIENTIFIC_MAP } from './class_map';

/**
 * classifier.ts
 * Food-specific ResNet50 classification simulation.
 */
export const classifyObjects = async (detections: any[]) => {
  return detections.map(d => ({
    ...d,
    scientificName: SCIENTIFIC_MAP[d.label] || 'Unknown Species'
  }));
};
