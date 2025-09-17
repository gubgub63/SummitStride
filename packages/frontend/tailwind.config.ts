import type { Config } from 'tailwindcss';
import { designTokens } from './lib/design-tokens';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', 'media'],
  theme: {
    extend: {
      // Colors from Alpine Tech palette
      colors: {
        primary: designTokens.colors.primary,
        secondary: designTokens.colors.secondary,
        success: designTokens.colors.success,
        neutral: designTokens.colors.neutral,
        error: designTokens.colors.error,
        warning: designTokens.colors.warning,
        white: designTokens.colors.white,
        black: designTokens.colors.black,

        // Semantic color mappings
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        surface: 'var(--surface)',
        'surface-elevated': 'var(--surface-elevated)',
        border: 'var(--border)',
        'border-hover': 'var(--border-hover)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        destructive: 'var(--destructive)',
        'destructive-foreground': 'var(--destructive-foreground)',
      },

      // Typography
      fontFamily: designTokens.typography.fontFamily,
      fontSize: designTokens.typography.fontSize,
      fontWeight: designTokens.typography.fontWeight,
      lineHeight: designTokens.typography.lineHeight,
      letterSpacing: designTokens.typography.letterSpacing,

      // Spacing
      spacing: designTokens.spacing,

      // Shadows
      boxShadow: designTokens.shadows,

      // Border radius
      borderRadius: designTokens.borderRadius,

      // Z-index
      zIndex: designTokens.zIndex,

      // Transitions
      transitionProperty: {
        'colors': designTokens.transitions.colors,
        'opacity': designTokens.transitions.opacity,
        'shadow': designTokens.transitions.shadow,
        'transform': designTokens.transitions.transform,
      },

      // Screens (breakpoints)
      screens: designTokens.breakpoints,

      // Animation
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-out': 'fade-out 0.5s ease-out',
        'slide-in-up': 'slide-in-up 0.3s ease-out',
        'slide-in-down': 'slide-in-down 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'scale-out': 'scale-out 0.2s ease-out',
        'pulse-soft': 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-soft': 'bounce-soft 1s infinite',
      },

      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'slide-in-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-down': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'scale-out': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'bounce-soft': {
          '0%, 100%': {
            transform: 'translateY(-5%)',
            'animation-timing-function': 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(0)',
            'animation-timing-function': 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
      },

      // Backdrop blur
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        base: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '40px',
        '3xl': '64px',
      },

      // Container
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1400px',
        },
      },
    },
  },
  plugins: [
    // Custom plugin for Alpine Tech specific utilities
    function({ addUtilities, addComponents, theme }) {
      // Add custom utilities
      addUtilities({
        // Focus utilities for accessibility
        '.focus-ring': {
          '&:focus-visible': {
            outline: `2px solid ${theme('colors.ring')}`,
            'outline-offset': '2px',
          },
        },
        '.focus-ring-inset': {
          '&:focus-visible': {
            outline: `2px solid ${theme('colors.ring')}`,
            'outline-offset': '-2px',
          },
        },

        // Text utilities
        '.text-balance': {
          'text-wrap': 'balance',
        },
        '.text-pretty': {
          'text-wrap': 'pretty',
        },

        // Gradient utilities
        '.gradient-alpine': {
          background: `linear-gradient(135deg, ${theme('colors.primary.600')} 0%, ${theme('colors.secondary.600')} 100%)`,
        },
        '.gradient-alpine-hover': {
          background: `linear-gradient(135deg, ${theme('colors.primary.700')} 0%, ${theme('colors.secondary.700')} 100%)`,
        },
        '.gradient-mountain': {
          background: `linear-gradient(180deg, ${theme('colors.success.500')} 0%, ${theme('colors.primary.600')} 100%)`,
        },

        // Glass morphism
        '.glass': {
          background: 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          background: 'rgba(0, 0, 0, 0.1)',
          'backdrop-filter': 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      });

      // Add custom components
      addComponents({
        // Button base styles
        '.btn': {
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          'white-space': 'nowrap',
          'border-radius': theme('borderRadius.md'),
          'font-size': theme('fontSize.sm'),
          'font-weight': theme('fontWeight.medium'),
          'transition-property': theme('transitionProperty.colors'),
          'transition-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)',
          'transition-duration': '150ms',
          'focus-visible:outline': 'none',
          'focus-visible:ring-2': `ring-${theme('colors.ring')}`,
          'disabled:pointer-events': 'none',
          'disabled:opacity': '0.5',
        },

        // Card base styles
        '.card': {
          'border-radius': theme('borderRadius.lg'),
          border: `1px solid ${theme('colors.border')}`,
          'background-color': theme('colors.surface'),
          'box-shadow': theme('boxShadow.sm'),
          color: theme('colors.foreground'),
        },

        // Input base styles
        '.input': {
          display: 'flex',
          height: '2.5rem',
          width: '100%',
          'border-radius': theme('borderRadius.md'),
          border: `1px solid ${theme('colors.border')}`,
          'background-color': theme('colors.input'),
          'padding-left': '0.75rem',
          'padding-right': '0.75rem',
          'font-size': theme('fontSize.sm'),
          'transition-property': theme('transitionProperty.colors'),
          'transition-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)',
          'transition-duration': '150ms',
          'focus-visible:outline': 'none',
          'focus-visible:ring-2': `ring-${theme('colors.ring')}`,
          'disabled:cursor': 'not-allowed',
          'disabled:opacity': '0.5',
          '&::placeholder': {
            color: theme('colors.muted-foreground'),
          },
        },
      });
    },
  ],
};

export default config;