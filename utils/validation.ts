/**
 * Data validation schemas and runtime type checking
 * Ensures data integrity across API boundaries
 */

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public value?: any
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

type Validator<T> = (value: any) => value is T;

export const validators = {
  string: (value: any): value is string => typeof value === 'string',
  
  number: (value: any): value is number => typeof value === 'number' && !isNaN(value),
  
  boolean: (value: any): value is boolean => typeof value === 'boolean',
  
  array: <T>(itemValidator: Validator<T>) => (value: any): value is T[] => {
    return Array.isArray(value) && value.every(itemValidator);
  },
  
  object: <T>(schema: Record<keyof T, Validator<any>>) => (value: any): value is T => {
    if (typeof value !== 'object' || value === null) return false;
    
    return Object.entries(schema).every(([key, validatorFn]) => {
      const validator = validatorFn as Validator<any>;
      return validator((value as any)[key]);
    });
  },

  optional: <T>(validator: Validator<T>) => (value: any): value is T | undefined => {
    return value === undefined || validator(value);
  },

  range: (min: number, max: number) => (value: any): value is number => {
    return validators.number(value) && value >= min && value <= max;
  },

  enum: <T extends string>(...values: T[]) => (value: any): value is T => {
    return validators.string(value) && values.includes(value as T);
  },

  email: (value: any): value is string => {
    return validators.string(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },

  url: (value: any): value is string => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }
};

export function validate<T>(
  data: any,
  validator: Validator<T>,
  fieldName?: string
): T {
  if (!validator(data)) {
    throw new ValidationError(
      `Validation failed for ${fieldName || 'data'}`,
      fieldName,
      data
    );
  }
  return data;
}

// Ingredient validation schema
export const ingredientSchema = validators.object({
  id: validators.string,
  name: validators.string,
  scientificName: validators.string,
  category: validators.string,
  mass_grams: validators.range(0, 100000),
  vitality_score: validators.range(0, 100),
  expires_in_days: validators.number,
  confidence: validators.range(0, 1),
  molecularProfile: validators.optional(validators.array(validators.string)),
  flavorNodes: validators.optional(validators.array(validators.string)),
  verificationStatus: validators.optional(validators.enum('unverified', 'confirmed', 'dismissed'))
});

// Recipe protocol validation schema
export const protocolSchema = validators.object({
  id: validators.string,
  title: validators.string,
  description: validators.string,
  complexity: validators.enum('Low', 'Medium', 'High'),
  duration_minutes: validators.number,
  ingredients_used: validators.array(validators.string),
  molecularAffinity: validators.range(0, 100),
  instructions: validators.array(validators.object({
    order: validators.number,
    instruction: validators.string,
    technique: validators.string,
    target_temp: validators.optional(validators.string),
    timer_seconds: validators.optional(validators.number),
    arHint: validators.optional(validators.string)
  })),
  platingTips: validators.array(validators.string),
  drinkPairing: validators.object({
    name: validators.string,
    description: validators.string,
    visualUrl: validators.optional(validators.string)
  }),
  nutrition: validators.object({
    calories: validators.number,
    protein: validators.number,
    carbs: validators.number,
    fat: validators.number
  }),
  groundingSources: validators.array(validators.string)
});

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
}

export function validateApiResponse<T>(
  response: any,
  validator: Validator<T>,
  endpoint: string
): T {
  try {
    return validate(response, validator, endpoint);
  } catch (error) {
    console.error(`[Validation] API response validation failed for ${endpoint}:`, error);
    throw new ValidationError(
      `Invalid response from ${endpoint}`,
      endpoint,
      response
    );
  }
}
