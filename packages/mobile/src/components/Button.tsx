import type { ReactNode } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native'

import { palette, radii, spacing, typography } from '../theme'

interface ButtonProps {
  onPress: () => void | Promise<void>
  children: ReactNode
  style?: StyleProp<ViewStyle>
  loading?: boolean
  variant?: 'primary' | 'ghost'
}

export const Button = ({ onPress, children, style, loading = false, variant = 'primary' }: ButtonProps) => {
  const handlePress = () => {
    if (loading) return
    void onPress()
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.base,
        variant === 'ghost' ? styles.ghost : styles.primary,
        pressed && styles.pressed,
        style,
      ]}
      disabled={loading}
    >
      {loading ? <ActivityIndicator color={variant === 'ghost' ? palette.primary : palette.background} /> : null}
      {!loading ? <Text style={[styles.label, variant === 'ghost' && styles.labelGhost]}>{children}</Text> : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    height: spacing(5),
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: spacing(2),
    gap: spacing(1),
  },
  primary: {
    backgroundColor: palette.primary,
  },
  ghost: {
    borderWidth: 1,
    borderColor: palette.secondary,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    color: palette.background,
    fontSize: typography.body,
    fontWeight: '600',
  },
  labelGhost: {
    color: palette.primary,
  },
})
