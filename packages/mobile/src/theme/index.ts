import { Platform } from 'react-native'

export const palette = {
  background: '#040404',
  surface: '#0A0A0A',
  surfaceElevated: '#111111',
  surfaceMuted: '#161616',
  border: '#1F1F1F',
  primary: '#FFFFFF',
  secondary: '#EAEAEA',
  muted: '#999999',
  subtle: '#6F6F6F',
  overlay: '#000000CC',
}

export const spacing = (unit: number) => unit * 8

export const radii = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
}

export const typography = {
  title: 28,
  subtitle: 20,
  section: 18,
  body: 15,
  caption: 13,
  micro: 11,
}

export const shadow = {
  card: {
    shadowColor: '#000000',
    shadowOpacity: Platform.select({ ios: 0.25, android: 0.35 }),
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
}

export const theme = {
  palette,
  spacing,
  radii,
  typography,
  shadow,
}

export type AppTheme = typeof theme
