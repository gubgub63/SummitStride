import { Feather } from '@expo/vector-icons'
import { StyleSheet, Text, View } from 'react-native'

import { Card } from '../components/Card'
import { ProgressBar } from '../components/ProgressBar'
import { Screen } from '../components/Screen'
import { SectionHeader } from '../components/SectionHeader'
import { nutritionSnapshot } from '../data/mockData'
import { palette, radii, spacing, typography } from '../theme'

const NutritionScreen = () => (
  <Screen>
    <View style={styles.header}>
      <Text style={styles.title}>{nutritionSnapshot.planName}</Text>
      <Text style={styles.subtitle}>Macros adaptatifs selon ta charge d’entraînement.</Text>
    </View>

    <Card style={styles.macroCard}>
      <SectionHeader title='Macros journaliers' subtitle='Répartition actuelle' />
      <View style={styles.macroList}>
        {Object.entries(nutritionSnapshot.macroTargets).map(([macro, values]) => (
          <View key={macro} style={styles.macroItem}>
            <Text style={styles.macroLabel}>{macro}</Text>
            <ProgressBar progress={values.current / values.target} valueLabel={`${values.current}% / ${values.target}%`} />
          </View>
        ))}
      </View>
      <View style={styles.macroFooter}>
        <Feather name='refresh-cw' size={14} color={palette.secondary} />
        <Text style={styles.macroFootnote}>Recalcul automatique après chaque séance clé.</Text>
      </View>
    </Card>

    <SectionHeader title='Hydratation' />
    <Card>
      <View style={styles.hydrationRow}>
        <View style={styles.hydrationBadge}>
          <Feather name='droplet' size={18} color={palette.background} />
        </View>
        <View style={styles.hydrationContent}>
          <Text style={styles.hydrationValue}>{nutritionSnapshot.hydration.dailyTargetLiters} L</Text>
          <Text style={styles.hydrationLabel}>Cible quotidienne</Text>
          <Text style={styles.hydrationStreak}>{nutritionSnapshot.hydration.streakDays} jours consécutifs validés</Text>
        </View>
      </View>
    </Card>

    <SectionHeader title='Stratégie course' subtitle='Fenêtre énergétique' />
    <Card style={styles.strategyCard}>
      <View style={styles.strategyRow}>
        <Text style={styles.strategyTitle}>Apport glucidique</Text>
        <Text style={styles.strategyValue}>
          {nutritionSnapshot.raceStrategy.carbsPerHour.min} - {nutritionSnapshot.raceStrategy.carbsPerHour.max} g/heure
        </Text>
      </View>
      <View style={styles.gelList}>
        {nutritionSnapshot.raceStrategy.gels.map((gel) => (
          <View key={gel.time} style={styles.gelRow}>
            <Text style={styles.gelTime}>{gel.time}</Text>
            <Text style={styles.gelValue}>{gel.carbs} g</Text>
            {gel.caffeinated ? (
              <View style={styles.caffeinePill}>
                <Text style={styles.caffeineText}>CAF</Text>
              </View>
            ) : null}
          </View>
        ))}
      </View>
    </Card>

    <SectionHeader title='Recommandations IA' />
    <Card style={styles.recoCard}>
      {nutritionSnapshot.recommendations.map((item) => (
        <View key={item} style={styles.recoRow}>
          <Feather name='check' size={14} color={palette.primary} />
          <Text style={styles.recoText}>{item}</Text>
        </View>
      ))}
    </Card>
  </Screen>
)

const styles = StyleSheet.create({
  header: {
    gap: spacing(0.5),
  },
  title: {
    color: palette.primary,
    fontSize: typography.subtitle,
    fontWeight: '600',
  },
  subtitle: {
    color: palette.muted,
    fontSize: typography.caption,
  },
  macroCard: {
    gap: spacing(1.5),
  },
  macroList: {
    gap: spacing(1.5),
  },
  macroItem: {
    gap: spacing(0.5),
  },
  macroLabel: {
    color: palette.secondary,
    fontSize: typography.caption,
    textTransform: 'uppercase',
  },
  macroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
    backgroundColor: palette.surfaceMuted,
    borderRadius: radii.sm,
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(1),
  },
  macroFootnote: {
    color: palette.secondary,
    fontSize: typography.caption,
  },
  hydrationRow: {
    flexDirection: 'row',
    gap: spacing(1.5),
    alignItems: 'center',
  },
  hydrationBadge: {
    width: spacing(5),
    height: spacing(5),
    borderRadius: spacing(5) / 2,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hydrationContent: {
    gap: spacing(0.5),
  },
  hydrationValue: {
    color: palette.primary,
    fontSize: typography.section,
    fontWeight: '600',
  },
  hydrationLabel: {
    color: palette.muted,
    fontSize: typography.caption,
    textTransform: 'uppercase',
  },
  hydrationStreak: {
    color: palette.secondary,
    fontSize: typography.caption,
  },
  strategyCard: {
    gap: spacing(1.5),
  },
  strategyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  strategyTitle: {
    color: palette.primary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  strategyValue: {
    color: palette.secondary,
    fontSize: typography.caption,
  },
  gelList: {
    gap: spacing(1),
  },
  gelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing(0.75),
    borderBottomColor: palette.border,
    borderBottomWidth: 1,
  },
  gelTime: {
    color: palette.muted,
    fontSize: typography.caption,
  },
  gelValue: {
    color: palette.primary,
    fontSize: typography.body,
  },
  caffeinePill: {
    borderRadius: radii.xs,
    borderWidth: 1,
    borderColor: palette.primary,
    paddingHorizontal: spacing(1),
    paddingVertical: spacing(0.25),
  },
  caffeineText: {
    color: palette.primary,
    fontSize: typography.micro,
    fontWeight: '600',
    letterSpacing: 1,
  },
  recoCard: {
    gap: spacing(1),
  },
  recoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
  },
  recoText: {
    flex: 1,
    color: palette.secondary,
    fontSize: typography.caption,
    lineHeight: 18,
  },
})

export default NutritionScreen
