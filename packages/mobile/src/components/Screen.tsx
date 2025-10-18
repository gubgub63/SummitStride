import type { ReactNode } from 'react'
import { ScrollView, StyleSheet, View, type ViewProps, type ViewStyle, type StyleProp } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { palette, spacing } from '../theme'

interface ScreenProps {
  children: ReactNode
  scrollable?: boolean
  style?: StyleProp<ViewStyle>
  contentContainerStyle?: StyleProp<ViewStyle>
}

export const Screen = ({
  children,
  scrollable = true,
  style,
  contentContainerStyle,
}: ScreenProps) => {
  const content = scrollable ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.fill, contentContainerStyle]}>
      {children}
    </View>
  )

  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      {content}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  scrollContent: {
    paddingHorizontal: spacing(2),
    paddingBottom: spacing(4),
    gap: spacing(2),
  },
  fill: {
    flex: 1,
    paddingHorizontal: spacing(2),
    paddingBottom: spacing(4),
    gap: spacing(2),
  },
})
