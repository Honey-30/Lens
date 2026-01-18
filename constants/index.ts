/**
 * Application-wide constants and configuration
 * Centralized configuration management for production-grade deployment
 */

export const APP_CONFIG = {
  name: 'CulinaryLens',
  version: '1.2.0',
  build: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  apiVersion: 'v1',
} as const;

export const API_CONFIG = {
  geminiModels: {
    pro: 'gemini-3-pro-preview',
    flash: 'gemini-3-flash-preview',
    vision: 'gemini-2.5-flash-image',
  },
  timeout: 30000, // 30 seconds
  maxRetries: 3,
  retryDelay: 2000,
} as const;

export const CACHE_CONFIG = {
  maxSize: {
    api: 200,
    ingredients: 500,
    recipes: 100,
  },
  ttl: {
    short: 300000, // 5 minutes
    medium: 1800000, // 30 minutes
    long: 3600000, // 1 hour
    day: 86400000, // 24 hours
  },
} as const;

export const DB_CONFIG = {
  name: 'CulinaryLensDB',
  version: 2,
  stores: ['ingredients', 'recipes', 'analytics', 'sessions'],
  dataRetentionDays: 30,
} as const;

export const PERFORMANCE_CONFIG = {
  metrics: {
    lcp: { good: 2500, poor: 4000 }, // Largest Contentful Paint
    fid: { good: 100, poor: 300 }, // First Input Delay
    cls: { good: 0.1, poor: 0.25 }, // Cumulative Layout Shift
    ttfb: { good: 800, poor: 1800 }, // Time to First Byte
  },
  monitoring: {
    sampleRate: 1.0, // 100% in development, reduce in production
    enableRUM: true, // Real User Monitoring
  },
} as const;

export const ML_CONFIG = {
  perception: {
    confidenceThreshold: 0.20,
    freshnessThreshold: 50,
    maxDetections: 50,
  },
  fusion: {
    weights: {
      ml: 0.5,
      gemini: 0.3,
      constraints: 0.2,
    },
  },
} as const;

export const UI_CONFIG = {
  animations: {
    durationFast: 300,
    durationMedium: 500,
    durationSlow: 1000,
    easingDefault: [0.16, 1, 0.3, 1] as [number, number, number, number],
  },
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
  colors: {
    obsidian: '#0A0A0B',
    gold: '#C5A028',
    titanium: '#E2E4EB',
    white: '#FFFFFF',
  },
} as const;

export const CUISINE_TYPES = [
  { id: 'french', name: 'French Modern', desc: 'Precision architecture and technical emulsions.' },
  { id: 'japanese', name: 'Japanese Purity', desc: 'Minimalist aesthetic with high umami density.' },
  { id: 'indian', name: 'Indian Molecular', desc: 'Complex spice matrices and aromatic layering.' },
  { id: 'italian', name: 'Neo-Italian', desc: 'Product-focused rusticity and textures.' },
  { id: 'nordic', name: 'Neo-Nordic', desc: 'Technical fermentation and botanical profiles.' },
  { id: 'mexican', name: 'Modern Mexican', desc: 'Structural acid balance and scorched earth notes.' },
  { id: 'chinese', name: 'Contemporary Chinese', desc: 'Wok dynamics and umami layering.' },
  { id: 'mediterranean', name: 'Mediterranean Fusion', desc: 'Olive oil architecture and citrus brightness.' },
] as const;

export const DIETARY_OPTIONS = ['None', 'Vegan', 'Vegetarian', 'Keto', 'Paleo', 'Gluten-Free'] as const;

export const COMPLEXITY_LEVELS = ['Low', 'Medium', 'High'] as const;

export const ERROR_MESSAGES = {
  network: 'Network connection failed. Please check your internet connection.',
  apiKey: 'API key is invalid or missing. Please check your settings.',
  quota: 'API quota exceeded. Please try again later or upgrade your plan.',
  timeout: 'Request timed out. Please try again.',
  validation: 'Data validation failed. Please check your input.',
  unknown: 'An unexpected error occurred. Please try again.',
  offline: 'You are currently offline. Some features may be limited.',
} as const;

export const SUCCESS_MESSAGES = {
  saved: 'Successfully saved',
  updated: 'Successfully updated',
  deleted: 'Successfully deleted',
  synced: 'Successfully synced',
} as const;

export const ROUTES = {
  landing: '/',
  upload: '/upload',
  analysis: '/analysis',
  dashboard: '/dashboard',
  synthesis: '/synthesis',
  execution: '/execution',
  settings: '/settings',
} as const;

export const STORAGE_KEYS = {
  preferences: 'culinary_lens_prefs',
  cache: 'culinary_cache',
  session: 'culinary_session',
  theme: 'culinary_theme',
} as const;

export const ANALYTICS_EVENTS = {
  pageView: 'page_view',
  ingredientAnalyzed: 'ingredient_analyzed',
  recipeGenerated: 'recipe_generated',
  executionStarted: 'execution_started',
  executionCompleted: 'execution_completed',
  error: 'error_occurred',
  cacheHit: 'cache_hit',
  cacheMiss: 'cache_miss',
} as const;

export const FEATURE_FLAGS = {
  enablePWA: true,
  enableServiceWorker: true,
  enableAnalytics: true,
  enablePerformanceMonitoring: true,
  enableOfflineMode: true,
  enableStreamingResponses: false, // Future feature
  enableVoiceSynthesis: true,
  enableCameraVerification: true,
} as const;

// Type exports for better TypeScript support
export type CuisineType = typeof CUISINE_TYPES[number];
export type DietaryOption = typeof DIETARY_OPTIONS[number];
export type ComplexityLevel = typeof COMPLEXITY_LEVELS[number];
export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;
export type AnalyticsEvent = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];
