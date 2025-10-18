import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { palette, spacing, typography } from '../theme'

interface SectionHeaderProps {
  title: string
  action?: ReactNode
  subtitle?: string
}

export const SectionHeader = ({ title, action, subtitle }: SectionHeaderProps) => (
  <View style={styles.container}>
    <View style={styles.textGroup}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
    {action ? <View>{action}</View> : null}
  </View>
)

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textGroup: {
    gap: spacing(0.5),
  },
  title: {
    color: palette.primary,
    fontSize: typography.section,
    fontWeight: '600',
  },
  subtitle: {
    color: palette.muted,
    fontSize: typography.caption,
  },
})
