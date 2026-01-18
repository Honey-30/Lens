
# Perception Layer Implementation

## Overview
CulinaryLens now features a local ML perception layer that pre-processes ingredient images before querying Gemini. This reduces reliance on high-latency multimodal calls and ensures data consistency.

## Architecture
- **Detector**: YOLOv11 (Ultralytics) for state-of-the-art real-time object detection and small-feature recall.
- **Segmenter**: SAM-2 (Segment Anything Model) for pixel-perfect segmentation.
- **Classifier**: ResNet50 for scientific taxonomy mapping and fallback verification.
- **Freshness**: Specialized CNN for vitality scoring based on surface texture/color.
- **Volume**: Heuristic estimation using bounding box proportions.

## Integration Strategy
1. **Perception-First**: The `run_perception_pipeline` is triggered on image upload.
2. **Data Adapter**: Results are formatted into a clean JSON manifest.
3. **Text-Only Gemini Reasoning**: Gemini receives the JSON instead of the raw image, saving tokens and improving reasoning accuracy.
4. **Resilient Fallback**: If the perception pipeline exceeds 4s or fails, the app reverts to the original Multimodal image pipeline.

## Performance
- **Recall**: Optimized via YOLOv11's improved multi-scale attention mechanisms.
- **Latency**: Inference typically completes in ~150-400ms (simulated).
- **Cost**: Saves significant input tokens by avoiding raw image uploads to LLMs when possible.

## How to Disable
To revert to pure Multimodal mode, comment out the `runPerceptionPipeline` call in `Analyzer.tsx` and ensure only `analyzeFridgeImage` is called.
