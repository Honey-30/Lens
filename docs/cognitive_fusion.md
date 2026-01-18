
# Cognitive Fusion Layer

## Purpose
The Cognitive Fusion Layer (CFL) serves as a thin, deterministic synchronization bridge between the **ML Perception Pipeline** (Local Intelligence) and the **Gemini Reasoning Engine** (Cloud Intelligence).

## Authority Rules
| Component | Primary Authority | Secondary Authority |
|-----------|-------------------|---------------------|
| Ingredient Presence | **ML Pipeline** | N/A |
| Scientific Taxonomy | **ML Pipeline** | Gemini (Refinement) |
| Quantities/Mass | **ML Pipeline** | N/A |
| Biological Freshness | **ML Pipeline** | N/A |
| Recipe Synthesis | **Gemini** | ML (Constraint Filter) |
| Culinary Technique | **Gemini** | ML (Validation) |

## Conflict Resolution Logic
1. **Hallucination Striping**: If Gemini suggests using an item not found in the ML Manifest (e.g., "Add 1 cup of heavy cream" when no cream was detected), the CFL moves that item to the `missing_ingredients` list to ensure the user knows they need to procure it via Instamart.
2. **Metadata Injection**: ML mass metrics (grams) are automatically appended to Gemini's natural language instructions to ensure precision.
3. **Freshness Adaptation**: If an ingredient has a "Vitality Score" < 50%, the CFL appends a safety directive to the instructions (e.g., "Increase heat intensity").

## Confidence Scoring (CCS)
Final confidence is calculated as:
`CCS = (0.5 * ML_Conf) + (0.3 * Gemini_Coherence) + (0.2 * Constraint_Compliance)`

## Debugging
- All hallucinations are logged to the console with the prefix `[Fusion]`.
- All sanity check failures trigger a complete fallback to raw Gemini output.
