import { StyleSheet, Text, View } from 'react-native'

import { palette, radii, spacing, typography } from '../theme'

interface ProgressBarProps {
  progress: number
  label?: string
  valueLabel?: string
}

export const ProgressBar = ({ progress, label, valueLabel }: ProgressBarProps) => {
  const clamped = Math.min(1, Math.max(0, progress))
  return (
    <View style={styles.container}>
      {(label || valueLabel) && (
        <View style={styles.header}>
          {label ? <Text style={styles.label}>{label}</Text> : <View />}
          {valueLabel ? <Text style={styles.value}>{valueLabel}</Text> : null}
        </View>
      )}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clamped * 100}%` }]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing(0.5),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: palette.secondary,
    fontSize: typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  value: {
    color: palette.primary,
    fontSize: typography.caption,
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 10,
    borderRadius: radii.xs,
    backgroundColor: palette.surfaceMuted,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: palette.primary,
    borderRadius: radii.xs,
  },
})
