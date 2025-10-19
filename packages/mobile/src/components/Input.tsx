import { forwardRef, useState } from 'react'
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native'

import { palette, radii, spacing, typography } from '../theme'

interface InputProps extends TextInputProps {
  label: string
  error?: string
}

export const Input = forwardRef<TextInput, InputProps>(({ label, error, style, ...props }, ref) => {
  const [focused, setFocused] = useState(false)
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        ref={ref}
        style={[styles.input, focused && styles.focused, error && styles.errored, style]}
        placeholderTextColor={palette.subtle}
        onFocus={(event) => {
          setFocused(true)
          props.onFocus?.(event)
        }}
        onBlur={(event) => {
          setFocused(false)
          props.onBlur?.(event)
        }}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
})

Input.displayName = 'Input'

const styles = StyleSheet.create({
  container: {
    gap: spacing(0.5),
  },
  label: {
    color: palette.secondary,
    fontSize: typography.caption,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    height: spacing(5),
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: spacing(1.5),
    color: palette.primary,
    fontSize: typography.body,
    backgroundColor: palette.surface,
  },
  focused: {
    borderColor: palette.primary,
  },
  errored: {
    borderColor: '#D96C6C',
  },
  error: {
    color: '#D96C6C',
    fontSize: typography.micro,
  },
})
