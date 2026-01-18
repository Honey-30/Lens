/**
 * Premium Design System - Apple/Google Inspired
 * Best-in-class design tokens for production applications
 */

export const DesignSystem = {
  // Color Palette - Sophisticated & Premium
  colors: {
    // Primary - Gold Accent (Luxury)
    primary: {
      50: '#FFFEF7',
      100: '#FFFAEB',
      200: '#FFF4D1',
      300: '#FFE7A3',
      400: '#FFD666',
      500: '#D4AF37',  // Main Gold
      600: '#C5A028',
      700: '#B38B1A',
      800: '#8B6914',
      900: '#6B510F',
    },
    
    // Neutral - Premium Grays
    neutral: {
      0: '#FFFFFF',
      50: '#FAFAFA',
      100: '#F5F5F7',
      200: '#E8E8ED',
      300: '#D2D2D7',
      400: '#AEAEB2',
      500: '#8E8E93',
      600: '#636366',
      700: '#48484A',
      800: '#3A3A3C',
      900: '#1C1C1E',
      950: '#0A0A0B',
    },
    
    // Semantic Colors
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#007AFF',
    
    // Glassmorphism
    glass: {
      light: 'rgba(255, 255, 255, 0.7)',
      dark: 'rgba(0, 0, 0, 0.5)',
      border: 'rgba(255, 255, 255, 0.18)',
    }
  },
  
  // Typography - SF Pro Display/Inter inspired
  typography: {
    fontFamily: {
      display: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      text: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
    },
    
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
      '6xl': '3.75rem',   // 60px
      '7xl': '4.5rem',    // 72px
      '8xl': '6rem',      // 96px
    },
    
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      heavy: 800,
    },
    
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
    
    letterSpacing: {
      tight: '-0.02em',
      normal: '0',
      wide: '0.02em',
      wider: '0.05em',
    }
  },
  
  // Spacing - 8px base grid (Apple standard)
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
  },
  
  // Border Radius - Smooth, premium corners
  borderRadius: {
    none: '0',
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    '3xl': '2rem',    // 32px
    full: '9999px',
  },
  
  // Shadows - Subtle, elegant depth
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 2px 4px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
    md: '0 4px 8px 0 rgba(0, 0, 0, 0.07), 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
    lg: '0 8px 16px 0 rgba(0, 0, 0, 0.08), 0 4px 8px 0 rgba(0, 0, 0, 0.06)',
    xl: '0 16px 32px 0 rgba(0, 0, 0, 0.1), 0 8px 16px 0 rgba(0, 0, 0, 0.08)',
    '2xl': '0 24px 48px 0 rgba(0, 0, 0, 0.12), 0 12px 24px 0 rgba(0, 0, 0, 0.1)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    glow: '0 0 20px rgba(212, 175, 55, 0.3)',
  },
  
  // Transitions - Smooth, natural animations
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
    spring: '500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Easing Functions
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    apple: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
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
