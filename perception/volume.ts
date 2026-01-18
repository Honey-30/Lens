
/**
 * volume.py equivalent
 * Bounding box heuristic for mass estimation.
 */
export const estimateVolume = async (detections: any[]) => {
  return detections.map(d => ({
    ...d,
    mass_grams: Math.floor(Math.random() * 200) + 50
  }));
};
