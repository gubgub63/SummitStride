/**
 * useResponsive - Hook pour gérer la responsivité
 * Détecte les breakpoints et fournit des utilitaires responsive
 */

'use client'

import { useState, useEffect } from 'react'

type BreakpointKey = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

interface ResponsiveState {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  currentBreakpoint: BreakpointKey
  windowWidth: number
  windowHeight: number
}

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

function calculateResponsiveState(width: number, height: number): ResponsiveState {
  let currentBreakpoint: BreakpointKey = 'sm'
  if (width >= BREAKPOINTS['2xl']) currentBreakpoint = '2xl'
  else if (width >= BREAKPOINTS.xl) currentBreakpoint = 'xl'
  else if (width >= BREAKPOINTS.lg) currentBreakpoint = 'lg'
  else if (width >= BREAKPOINTS.md) currentBreakpoint = 'md'

  return {
    isMobile: width < BREAKPOINTS.md,
    isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
    isDesktop: width >= BREAKPOINTS.lg,
    currentBreakpoint,
    windowWidth: width,
    windowHeight: height,
  }
}

function getInitialState(): ResponsiveState {
  if (typeof window === 'undefined') {
    return calculateResponsiveState(BREAKPOINTS.lg, 0)
  }

  return calculateResponsiveState(window.innerWidth, window.innerHeight)
}

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(getInitialState)

  useEffect(() => {
    const handleResize = () => {
      setState(calculateResponsiveState(window.innerWidth, window.innerHeight))
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return state
}

export function useBreakpoint(breakpoint: BreakpointKey): boolean {
  const { windowWidth } = useResponsive()
  return windowWidth >= BREAKPOINTS[breakpoint]
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    const updateMatch = () => setMatches(media.matches)

    updateMatch()
    media.addEventListener('change', updateMatch)

    return () => media.removeEventListener('change', updateMatch)
  }, [query])

  return matches
}
