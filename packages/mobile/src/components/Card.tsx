import type { ReactNode } from 'react'
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'

import { palette, radii, spacing } from '../theme'

interface CardProps {
  children: ReactNode
  style?: StyleProp<ViewStyle>
  onPress?: () => void
  elevated?: boolean
  border?: boolean
}

export const Card = ({ children, style, onPress, elevated = true, border = false }: CardProps) => {
  const Component = onPress ? Pressable : View
  return (
    <Component style={[styles.card, elevated && styles.elevated, border && styles.bordered, style]} onPress={onPress}>
      {children}
    </Component>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    padding: spacing(2),
    gap: spacing(1.5),
  },
  elevated: {
    borderColor: palette.border,
    borderWidth: 1,
  },
  bordered: {
    borderColor: palette.muted,
  },
})
