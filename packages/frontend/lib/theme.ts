'use client'

import * as React from 'react'
const h = React.createElement
/**
 * Theme Management - Alpine Tech Design System
 * Coach IA Hugo - Theme Provider and Hook for Light/Dark Mode
 */

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'coach-ia-hugo-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = React.useState<'light' | 'dark'>('light')

  // Initialize theme from localStorage or system preference
  React.useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey) as Theme
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setThemeState(savedTheme)
    } else {
      setThemeState(defaultTheme)
    }
  }, [defaultTheme, storageKey])

  // Update resolved theme based on theme and system preference
  React.useEffect(() => {
    const updateResolvedTheme = () => {
      if (theme === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setResolvedTheme(systemPrefersDark ? 'dark' : 'light')
      } else {
        setResolvedTheme(theme)
      }
    }

    updateResolvedTheme()

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', updateResolvedTheme)
      return () => mediaQuery.removeEventListener('change', updateResolvedTheme)
    }
  }, [theme])

  // Apply theme to document
  React.useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolvedTheme)
  }, [resolvedTheme])

  const setTheme = React.useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme)
      localStorage.setItem(storageKey, newTheme)
    },
    [storageKey]
  )

  const contextValue = React.useMemo(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
    }),
    [theme, setTheme, resolvedTheme]
  )

  return React.createElement(ThemeContext.Provider, { value: contextValue }, children)
}

// Theme Toggle Component
interface ThemeToggleProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function ThemeToggle({ className, size = 'md' }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getIcon = () => {
    if (theme === 'system') {
      return h(
        'svg',
        {
          className: iconSize[size],
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24',
          'aria-hidden': 'true',
        },
        h('path', {
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: 2,
          d: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
        })
      )
    }

    if (resolvedTheme === 'dark') {
      return h(
        'svg',
        {
          className: iconSize[size],
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24',
          'aria-hidden': 'true',
        },
        h('path', {
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: 2,
          d: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
        })
      )
    }

    // light
    return h(
      'svg',
      {
        className: iconSize[size],
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24',
        'aria-hidden': 'true',
      },
      h('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: 2,
        d: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
      })
    )
  }

  const getLabel = () =>
    theme === 'system' ? 'Système' : resolvedTheme === 'dark' ? 'Sombre' : 'Clair'

  return h(
    'button',
    {
      type: 'button',
      className: [
        'inline-flex items-center justify-center rounded-md border border-border',
        'bg-transparent hover:bg-accent hover:text-accent-foreground',
        'transition-colors focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-ring',
        sizeClasses[size],
        className || '',
      ].join(' '),
      onClick: cycleTheme,
      title: `Thème: ${getLabel()}`,
      'aria-label': `Changer le thème. Thème actuel: ${getLabel()}`,
    },
    getIcon()
  )
}

// Hook to detect system theme preference
export function useSystemTheme() {
  const [systemTheme, setSystemTheme] = React.useState<'light' | 'dark'>('light')

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const updateSystemTheme = () => {
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light')
    }

    updateSystemTheme()
    mediaQuery.addEventListener('change', updateSystemTheme)

    return () => mediaQuery.removeEventListener('change', updateSystemTheme)
  }, [])

  return systemTheme
}

// Hook to get theme-aware colors
export function useThemeColors() {
  const { resolvedTheme } = useTheme()

  return React.useMemo(() => {
    if (resolvedTheme === 'dark') {
      return {
        primary: '#3b82f6',
        secondary: '#ff6b35',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        background: '#020617',
        foreground: '#f8fafc',
        muted: '#1e293b',
        border: '#1e293b',
      }
    }

    return {
      primary: '#2563eb',
      secondary: '#ff6b35',
      success: '#10b981',
      error: '#dc2626',
      warning: '#d97706',
      background: '#ffffff',
      foreground: '#0f172a',
      muted: '#f1f5f9',
      border: '#e2e8f0',
    }
  }, [resolvedTheme])
}
