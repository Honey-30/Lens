/**
 * Premium Luxury Design System - Michelin-Grade Visual Language
 * Ultra-refined design tokens for AAA-tier culinary intelligence
 */

export const DesignSystem = {
  // Color Palette - Luxury & Sophistication
  colors: {
    // Primary - Refined Gold Spectrum (Luxury Accent)
    primary: {
      50: '#FFFEF9',
      100: '#FFFBF0',
      200: '#FFF6DE',
      300: '#FFEEC4',
      400: '#FFE29A',
      500: '#D4AF37',  // Champagne Gold
      600: '#C09F2E',
      700: '#A68B25',
      800: '#8B731C',
      900: '#6B5615',
      950: '#4A3A0F',
    },
    
    // Neutral - Ultra-Premium Grays (Apple-inspired)
    neutral: {
      0: '#FFFFFF',
      25: '#FCFCFD',
      50: '#F9F9FB',
      100: '#F4F4F6',
      200: '#E5E5EA',
      300: '#D1D1D6',
      400: '#A8A8B0',
      500: '#86868B',
      600: '#5E5E62',
      700: '#44444A',
      800: '#2C2C2E',
      900: '#1A1A1C',
      950: '#0A0A0B',
    },
    
    // Semantic Colors - Premium Palette
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
    info: '#0A84FF',
    
    // Luxury Accents
    accent: {
      copper: '#B87333',
      silver: '#C0C0C0',
      platinum: '#E5E4E2',
      rose: '#B76E79',
    },
    
    // Glassmorphism & Depth
    glass: {
      ultraLight: 'rgba(255, 255, 255, 0.85)',
      light: 'rgba(255, 255, 255, 0.70)',
      medium: 'rgba(255, 255, 255, 0.50)',
      dark: 'rgba(0, 0, 0, 0.45)',
      ultraDark: 'rgba(0, 0, 0, 0.60)',
      border: 'rgba(255, 255, 255, 0.20)',
      borderDark: 'rgba(0, 0, 0, 0.08)',
    }
  },
  
  // Typography - Premium Font System
  typography: {
    fontFamily: {
      display: "'SF Pro Display', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      text: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
      serif: "'Playfair Display', 'Georgia', 'Times New Roman', serif",
      mono: "'SF Mono', 'JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
    },
    
    fontSize: {
      xs: '0.6875rem',    // 11px - micro text
      sm: '0.8125rem',    // 13px - small text
      base: '0.9375rem',  // 15px - body
      md: '1rem',         // 16px - body emphasis
      lg: '1.125rem',     // 18px - subtitle
      xl: '1.375rem',     // 22px - section title
      '2xl': '1.75rem',   // 28px - card title
      '3xl': '2.25rem',   // 36px - page title
      '4xl': '3rem',      // 48px - hero
      '5xl': '3.75rem',   // 60px - display
      '6xl': '4.5rem',    // 72px - hero large
      '7xl': '6rem',      // 96px - splash
      '8xl': '8rem',      // 128px - ultra display
    },
    
    fontWeight: {
      thin: 200,
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      heavy: 800,
      black: 900,
    },
    
    lineHeight: {
      none: 1,
      tight: 1.15,
      snug: 1.35,
      normal: 1.5,
      relaxed: 1.65,
      loose: 1.85,
    },
    
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
      luxury: '0.15em',  // Ultra wide for premium feel
    }
  },
  
  // Spacing - 4px base grid (Premium precision)
  spacing: {
    0: '0',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    3.5: '0.875rem',  // 14px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    7: '1.75rem',     // 28px
    8: '2rem',        // 32px
    9: '2.25rem',     // 36px
    10: '2.5rem',     // 40px
    11: '2.75rem',    // 44px
    12: '3rem',       // 48px
    14: '3.5rem',     // 56px
    16: '4rem',       // 64px
    18: '4.5rem',     // 72px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    28: '7rem',       // 112px
    32: '8rem',       // 128px
    36: '9rem',       // 144px
    40: '10rem',      // 160px
    48: '12rem',      // 192px
    56: '14rem',      // 224px
    64: '16rem',      // 256px
  },
  
  // Border Radius - Premium curvature
  borderRadius: {
    none: '0',
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.25rem',    // 20px
    '2xl': '1.75rem', // 28px
    '3xl': '2.5rem',  // 40px
    '4xl': '3rem',    // 48px
    full: '9999px',
  },
  
  // Shadows - Ultra-refined depth system
  shadows: {
    xs: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
    sm: '0 2px 6px 0 rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.03)',
    md: '0 4px 12px 0 rgba(0, 0, 0, 0.06), 0 2px 6px 0 rgba(0, 0, 0, 0.04)',
    lg: '0 8px 20px 0 rgba(0, 0, 0, 0.07), 0 4px 12px 0 rgba(0, 0, 0, 0.05)',
    xl: '0 16px 32px 0 rgba(0, 0, 0, 0.08), 0 8px 20px 0 rgba(0, 0, 0, 0.06)',
    '2xl': '0 24px 48px 0 rgba(0, 0, 0, 0.10), 0 12px 32px 0 rgba(0, 0, 0, 0.08)',
    '3xl': '0 32px 64px 0 rgba(0, 0, 0, 0.12), 0 20px 48px 0 rgba(0, 0, 0, 0.10)',
    inner: 'inset 0 2px 6px 0 rgba(0, 0, 0, 0.04)',
    glow: '0 0 24px rgba(212, 175, 55, 0.25)',
    glowStrong: '0 0 48px rgba(212, 175, 55, 0.35)',
    premium: '0 32px 96px -12px rgba(0, 0, 0, 0.15), 0 16px 48px -8px rgba(0, 0, 0, 0.10)',
  },
  
  // Transitions - Buttery smooth animations
  transitions: {
    instant: '100ms cubic-bezier(0.4, 0, 0.2, 1)',
    fast: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '450ms cubic-bezier(0.4, 0, 0.2, 1)',
    slower: '600ms cubic-bezier(0.4, 0, 0.2, 1)',
    spring: '700ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  
  // Easing Functions - Premium motion
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    apple: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    luxury: 'cubic-bezier(0.16, 1, 0.3, 1)',  // Ultra smooth
  },
  
  // Breakpoints - Responsive design
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Z-Index - Proper layering
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },
  
  // Blur - Glassmorphism effects
  blur: {
    none: '0',
    sm: '4px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '40px',
    '3xl': '64px',
  },
} as const;

// Component-specific design tokens
export const ComponentTokens = {
  button: {
    primary: {
      bg: DesignSystem.colors.primary[500],
      hover: DesignSystem.colors.primary[600],
      active: DesignSystem.colors.primary[700],
      text: DesignSystem.colors.neutral[0],
      shadow: DesignSystem.shadows.md,
    },
    secondary: {
      bg: DesignSystem.colors.neutral[100],
      hover: DesignSystem.colors.neutral[200],
      active: DesignSystem.colors.neutral[300],
      text: DesignSystem.colors.neutral[900],
      shadow: DesignSystem.shadows.sm,
    },
    ghost: {
      bg: 'transparent',
      hover: DesignSystem.colors.neutral[100],
      active: DesignSystem.colors.neutral[200],
      text: DesignSystem.colors.neutral[700],
      shadow: 'none',
    }
  },
  
  card: {
    bg: DesignSystem.colors.neutral[0],
    border: DesignSystem.colors.neutral[200],
    shadow: DesignSystem.shadows.lg,
    radius: DesignSystem.borderRadius['2xl'],
    padding: DesignSystem.spacing[6],
  },
  
  input: {
    bg: DesignSystem.colors.neutral[50],
    border: DesignSystem.colors.neutral[300],
    focus: DesignSystem.colors.primary[500],
    text: DesignSystem.colors.neutral[900],
    placeholder: DesignSystem.colors.neutral[400],
    radius: DesignSystem.borderRadius.xl,
    padding: `${DesignSystem.spacing[3]} ${DesignSystem.spacing[4]}`,
  },
  
  modal: {
    overlay: 'rgba(0, 0, 0, 0.6)',
    bg: DesignSystem.colors.neutral[0],
    shadow: DesignSystem.shadows['2xl'],
    radius: DesignSystem.borderRadius['3xl'],
    blur: DesignSystem.blur.xl,
  }
};

// Utility functions for theme
export const theme = {
  // Responsive value selector
  responsive: (values: Record<string, any>, breakpoint: string) => {
    return values[breakpoint] || values.base;
  },
  
  // Color with opacity
  withOpacity: (color: string, opacity: number) => {
    const rgb = color.match(/\d+/g);
    if (!rgb) return color;
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`;
  },
  
  // Generate gradient
  gradient: (from: string, to: string, direction = 'to right') => {
    return `linear-gradient(${direction}, ${from}, ${to})`;
  },
  
  // Glassmorphism effect
  glass: (opacity = 0.7, blur = 24) => ({
    background: `rgba(255, 255, 255, ${opacity})`,
    backdropFilter: `blur(${blur}px)`,
    border: `1px solid ${DesignSystem.colors.glass.border}`,
  }),
};

export type Theme = typeof DesignSystem;
export type ComponentTheme = typeof ComponentTokens;
