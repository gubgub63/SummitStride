/**
 * Coach IA Hugo - Design Tokens
 * Alpine Tech Visual Identity System
 */

export const designTokens = {
  colors: {
    // Alpine Tech Primary Colors
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb', // Bleu glacier - Principal
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },

    secondary: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',
      600: '#ff6b35', // Orange ultra - Secondaire
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
      950: '#431407',
    },

    success: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981', // Vert montagne
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
      950: '#022c22',
    },

    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b', // Gris schiste
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a', // Noir charbon
      950: '#020617',
    },

    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a',
    },

    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03',
    },

    // Semantic colors
    white: '#ffffff',
    black: '#0f172a',
  },

  typography: {
    fontFamily: {
      sans: ['Inter Variable', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      mono: ['JetBrains Mono Variable', 'JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', 'monospace'],
      system: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    },

    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
      '6xl': '3.75rem',   // 60px
      '7xl': '4.5rem',    // 72px
      '8xl': '6rem',      // 96px
      '9xl': '8rem',      // 128px
    },

    fontWeight: {
      thin: 100,
      extralight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },

    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },

    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  spacing: {
    0: '0',
    px: '1px',
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
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    28: '7rem',       // 112px
    32: '8rem',       // 128px
    36: '9rem',       // 144px
    40: '10rem',      // 160px
    44: '11rem',      // 176px
    48: '12rem',      // 192px
    52: '13rem',      // 208px
    56: '14rem',      // 224px
    60: '15rem',      // 240px
    64: '16rem',      // 256px
    72: '18rem',      // 288px
    80: '20rem',      // 320px
    96: '24rem',      // 384px
  },

  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },

  borderRadius: {
    none: '0',
    sm: '0.125rem',    // 2px
    base: '0.25rem',   // 4px
    md: '0.375rem',    // 6px
    lg: '0.5rem',      // 8px
    xl: '0.75rem',     // 12px
    '2xl': '1rem',       // 16px
    '3xl': '1.5rem',     // 24px
    full: '9999px',
  },

  zIndex: {
    auto: 'auto',
    0: 0,
    10: 10,
    20: 20,
    30: 30,
    40: 40,
    50: 50,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    notification: 1080,
  },

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  transitions: {
    none: 'none',
    all: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    default: 'color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    colors: 'color, background-color, border-color, text-decoration-color, fill, stroke 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    shadow: 'box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// Type definitions for better TypeScript support
export type ColorScale = keyof typeof designTokens.colors.primary;
export type ColorName = keyof typeof designTokens.colors;
export type FontSize = keyof typeof designTokens.typography.fontSize;
export type FontWeight = keyof typeof designTokens.typography.fontWeight;
export type Spacing = keyof typeof designTokens.spacing;
export type Shadow = keyof typeof designTokens.shadows;
export type BorderRadius = keyof typeof designTokens.borderRadius;
export type ZIndex = keyof typeof designTokens.zIndex;
export type Breakpoint = keyof typeof designTokens.breakpoints;
export type Transition = keyof typeof designTokens.transitions;

// Utility functions for accessing design tokens
export const getColor = (colorName: ColorName, scale?: ColorScale): string => {
  const color = designTokens.colors[colorName];
  if (typeof color === 'string') {
    return color;
  }
  if (scale && typeof color === 'object' && scale in color) {
    return color[scale];
  }
  return color[500] || color.base || '';
};

export const getFontSize = (size: FontSize): string => {
  return designTokens.typography.fontSize[size];
};

export const getSpacing = (space: Spacing): string => {
  return designTokens.spacing[space];
};

export const getShadow = (shadow: Shadow): string => {
  return designTokens.shadows[shadow];
};

export const getBorderRadius = (radius: BorderRadius): string => {
  return designTokens.borderRadius[radius];
};

export const getBreakpoint = (breakpoint: Breakpoint): string => {
  return designTokens.breakpoints[breakpoint];
};

export const getTransition = (transition: Transition): string => {
  return designTokens.transitions[transition];
};