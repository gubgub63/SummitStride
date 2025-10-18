import { Feather } from '@expo/vector-icons'
import { StyleSheet, Text, View } from 'react-native'

import { Card } from '../components/Card'
import { ProgressBar } from '../components/ProgressBar'
import { Screen } from '../components/Screen'
import { SectionHeader } from '../components/SectionHeader'
import { activePlanOverview, trainingProgress, upcomingRace, userProfileSummary } from '../data/mockData'
import { palette, radii, spacing, typography } from '../theme'

const DashboardScreen = () => {
  const completion = activePlanOverview.weeksCompleted / activePlanOverview.totalWeeks
  const loadGap =
    activePlanOverview.targetLoadScore > 0
      ? (activePlanOverview.weeklyLoadScore - activePlanOverview.targetLoadScore) / activePlanOverview.targetLoadScore
      : 0

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.greeting}>Salut {userProfileSummary.name.split(' ')[0]}</Text>
        <Text style={styles.subtitle}>Prête pour {userProfileSummary.targetRace}</Text>
      </View>

      <Card style={styles.raceCard}>
        <View style={styles.raceHeader}>
          <Feather name="map-pin" size={18} color={palette.muted} />
          <Text style={styles.raceLabel}>{upcomingRace.location}</Text>
        </View>
        <Text style={styles.raceTitle}>{upcomingRace.name}</Text>
        <View style={styles.raceMeta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaValue}>{upcomingRace.distanceKm} km</Text>
            <Text style={styles.metaLabel}>Distance</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaValue}>{upcomingRace.elevationGain} m</Text>
            <Text style={styles.metaLabel}>D+</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaValue}>{upcomingRace.date}</Text>
            <Text style={styles.metaLabel}>Jour J</Text>
          </View>
        </View>
      </Card>

      <SectionHeader title="Plan actif" subtitle={`Phase ${activePlanOverview.phase.toLowerCase()}`} />

      <Card>
        <View style={styles.planRow}>
          <View style={styles.planSummary}>
            <Text style={styles.planName}>{activePlanOverview.name}</Text>
            <Text style={styles.planPhase}>{activePlanOverview.status}</Text>
          </View>
          <View style={styles.planCompletion}>
            <Text style={styles.completionValue}>{Math.round(completion * 100)}%</Text>
            <Text style={styles.metaLabel}>Parcours</Text>
          </View>
        </View>
        <ProgressBar label="Charge hebdo" valueLabel={`${activePlanOverview.weeklyLoadScore} pts`} progress={activePlanOverview.weeklyLoadScore / activePlanOverview.targetLoadScore} />
        <View style={styles.focusGroup}>
          {activePlanOverview.focusAreas.map((focus) => (
            <View key={focus} style={styles.focusPill}>
              <Text style={styles.pillLabel}>{focus}</Text>
            </View>
          ))}
        </View>
        <View style={styles.insightRow}>
          <Feather name={loadGap >= 0 ? 'trending-up' : 'trending-down'} size={16} color={palette.primary} />
          <Text style={styles.insightText}>
            {loadGap >= 0 ? 'Charge au-dessus de la cible, surveille la récupération.' : 'Charge en dessous de la cible, possible rappel intensité.'}
          </Text>
        </View>
      </Card>

      <SectionHeader title="Progression récente" />
      <Card>
        <View style={styles.progressGrid}>
          <View style={styles.progressCell}>
            <Text style={styles.progressValue}>{trainingProgress.totalDistanceKm} km</Text>
            <Text style={styles.progressLabel}>Depuis début bloc</Text>
          </View>
          <View style={styles.progressCell}>
            <Text style={styles.progressValue}>{trainingProgress.totalDurationHours} h</Text>
            <Text style={styles.progressLabel}>Volume cumulé</Text>
          </View>
          <View style={styles.progressCell}>
            <Text style={styles.progressValue}>{trainingProgress.loadScore}</Text>
            <Text style={styles.progressLabel}>Score charge</Text>
          </View>
        </View>
        <View style={styles.weeklyWrap}>
          {trainingProgress.weekly.map((week) => (
            <View key={week.week} style={styles.weeklyItem}>
              <Text style={styles.weekLabel}>{week.week}</Text>
              <ProgressBar progress={week.load / 100} valueLabel={`${week.distance} km`} />
            </View>
          ))}
        </View>
      </Card>

      <SectionHeader title="Focus du moment" />
      <Card>
        <View style={styles.focusTile}>
          <Feather name="activity" size={20} color={palette.primary} />
          <View style={styles.tileText}>
            <Text style={styles.tileTitle}>Fenêtre d’or</Text>
            <Text style={styles.tileSubtitle}>Phase pic - renforce les intensités spécifiques, garde 2 nuits complètes.</Text>
          </View>
        </View>
        <View style={styles.focusTile}>
          <Feather name="zap" size={20} color={palette.primary} />
          <View style={styles.tileText}>
            <Text style={styles.tileTitle}>Readiness</Text>
            <Text style={styles.tileSubtitle}>
              Prêt à 82% ({Math.round(userProfileSummary.readinessScore * 100)}). Contrôle la fatigue résiduelle ({Math.round(userProfileSummary.fatigueScore * 100)}).
            </Text>
          </View>
        </View>
      </Card>
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: {
    gap: spacing(0.5),
  },
  greeting: {
    color: palette.primary,
    fontSize: typography.title,
    fontWeight: '600',
  },
  subtitle: {
    color: palette.muted,
    fontSize: typography.body,
  },
  raceCard: {
    gap: spacing(1.5),
  },
  raceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
  },
  raceLabel: {
    color: palette.muted,
    fontSize: typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  raceTitle: {
    color: palette.primary,
    fontSize: typography.subtitle,
    fontWeight: '600',
  },
  raceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    gap: spacing(0.5),
  },
  metaValue: {
    color: palette.primary,
    fontSize: typography.section,
    fontWeight: '600',
  },
  metaLabel: {
    color: palette.muted,
    fontSize: typography.micro,
    textTransform: 'uppercase',
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planSummary: {
    flex: 1,
    gap: spacing(0.5),
  },
  planName: {
    color: palette.primary,
    fontSize: typography.section,
    fontWeight: '600',
  },
  planPhase: {
    color: palette.muted,
    fontSize: typography.caption,
    textTransform: 'uppercase',
  },
  planCompletion: {
    alignItems: 'flex-end',
    gap: spacing(0.25),
  },
  completionValue: {
    color: palette.primary,
    fontSize: typography.subtitle,
    fontWeight: '600',
  },
  focusGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(1),
  },
  focusPill: {
    borderColor: palette.secondary,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(0.75),
  },
  pillLabel: {
    color: palette.secondary,
    fontSize: typography.caption,
  },
  insightRow: {
    flexDirection: 'row',
    gap: spacing(1),
    alignItems: 'center',
    backgroundColor: palette.surfaceMuted,
    borderRadius: radii.sm,
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(1),
  },
  insightText: {
    flex: 1,
    color: palette.secondary,
    fontSize: typography.caption,
    lineHeight: 18,
  },
  progressGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressCell: {
    flex: 1,
    gap: spacing(0.5),
  },
  progressValue: {
    color: palette.primary,
    fontSize: typography.section,
    fontWeight: '600',
  },
  progressLabel: {
    color: palette.muted,
    fontSize: typography.caption,
  },
  weeklyWrap: {
    gap: spacing(1),
    marginTop: spacing(1),
  },
  weeklyItem: {
    gap: spacing(0.5),
  },
  weekLabel: {
    color: palette.muted,
    fontSize: typography.caption,
  },
  focusTile: {
    flexDirection: 'row',
    gap: spacing(1.5),
    alignItems: 'flex-start',
  },
  tileText: {
    flex: 1,
    gap: spacing(0.5),
  },
  tileTitle: {
    color: palette.primary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  tileSubtitle: {
    color: palette.secondary,
    fontSize: typography.caption,
    lineHeight: 18,
  },
})

export default DashboardScreen
