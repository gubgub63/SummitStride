import { useMemo } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { useQuery } from '@tanstack/react-query'

import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { ProgressBar } from '../components/ProgressBar'
import { Screen } from '../components/Screen'
import { SectionHeader } from '../components/SectionHeader'
import { useAuth } from '../context/AuthContext'
import { getStravaActivities, getStravaStatus } from '../services/strava'
import { getTrainingPlanById, getTrainingPlans } from '../services/training'
import type { RootTabParamList } from '../navigation/RootNavigator'
import { palette, radii, spacing, typography } from '../theme'

const addDays = (date: Date, days: number) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

const formatDate = (value: string | Date) => {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' }).format(date)
}

const formatDuration = (minutes: number) => `${(minutes / 60).toFixed(1)} h`

const formatDistance = (km: number) => `${km.toFixed(1)} km`

const NutritionScreen = () => {
  const { token, profile } = useAuth()
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>()

  const plansQuery = useQuery({
    queryKey: ['training-plans'],
    queryFn: () => getTrainingPlans(token!),
    enabled: Boolean(token),
  })

  const activePlan = useMemo(() => {
    const plans = plansQuery.data?.data ?? []
    return plans.find(plan => plan.status === 'ACTIVE') ?? plans[0]
  }, [plansQuery.data])

  const planDetailsQuery = useQuery({
    queryKey: ['training-plan', activePlan?.id],
    queryFn: () => getTrainingPlanById(token!, activePlan!.id),
    enabled: Boolean(token && activePlan?.id),
  })

  const stravaStatusQuery = useQuery({
    queryKey: ['strava-status'],
    queryFn: () => getStravaStatus(token!),
    enabled: Boolean(token),
  })

  const stravaActivitiesQuery = useQuery({
    queryKey: ['strava-activities'],
    queryFn: () => getStravaActivities(token!, { perPage: 3, afterDays: 30 }),
    enabled: Boolean(token && stravaStatusQuery.data?.data.connected),
  })

  const sessions = planDetailsQuery.data?.data.trainingSessions ?? []
  const now = new Date()
  const nextWeek = addDays(now, 7)

  const upcomingWeekSessions = useMemo(
    () =>
      sessions
        .filter(session => {
          const date = new Date(session.date)
          return date >= now && date <= nextWeek
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [nextWeek, now, sessions]
  )

  const loadStats = useMemo(() => {
    const totalMinutes = upcomingWeekSessions.reduce((acc, session) => acc + (session.duration ?? 0), 0)
    const totalDistance = upcomingWeekSessions.reduce((acc, session) => acc + (session.distance ?? 0), 0)
    const maxHours = (profile?.profile?.maxTrainingHoursPerWeek ?? 8) * 60
    const loadIndex = maxHours ? Math.min(totalMinutes / maxHours, 1) : 0.6

    const carbs = Math.round(50 + loadIndex * 20)
    const protein = 20
    const fat = Math.max(0, 100 - carbs - protein)

    return {
      totalMinutes,
      totalDistance,
      loadIndex,
      macroTargets: {
        carbs,
        protein,
        fat,
      },
    }
  }, [profile?.profile?.maxTrainingHoursPerWeek, upcomingWeekSessions])

  const hydrationTarget = useMemo(() => {
    const weight = profile?.profile?.weight ?? 0
    const base = weight > 0 ? Math.max(2.5, weight * 0.035) : 3
    const adjustment = loadStats.loadIndex > 0.7 ? 0.4 : loadStats.loadIndex > 0.4 ? 0.2 : 0
    return Number((base + adjustment).toFixed(1))
  }, [loadStats.loadIndex, profile?.profile?.weight])

  const keySession = useMemo(() => {
    return [...upcomingWeekSessions].sort((a, b) => (b.duration ?? 0) - (a.duration ?? 0))[0]
  }, [upcomingWeekSessions])

  const fuelingStrategy = useMemo(() => {
    if (!keySession || !keySession.duration) {
      return null
    }
    const durationHours = keySession.duration / 60
    const carbsPerHour = Math.min(90, Math.round(60 + durationHours * 12))
    const gelsCount = Math.max(2, Math.round((carbsPerHour * durationHours) / 25))
    return {
      carbsPerHour,
      gelsCount,
      session: keySession,
    }
  }, [keySession])

  const stravaActivities = stravaActivitiesQuery.data?.data.activities ?? []

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Nutrition & récupération</Text>
        <Text style={styles.subtitle}>
          Ajustées automatiquement à ta charge. {activePlan ? activePlan.name : 'Crée un plan pour recommandations dédiées.'}
        </Text>
      </View>

      <Card style={styles.macroCard}>
      <SectionHeader title="Macros recommandées" subtitle="Adaptées à la semaine à venir" />
      <View style={styles.macroList}>
        <MacroRow label="Glucides" value={loadStats.macroTargets.carbs} progress={loadStats.macroTargets.carbs / 100} />
        <MacroRow label="Protéines" value={loadStats.macroTargets.protein} progress={loadStats.macroTargets.protein / 100} />
        <MacroRow label="Lipides" value={loadStats.macroTargets.fat} progress={loadStats.macroTargets.fat / 100} />
      </View>
      <Text style={styles.dataSource}>
        {stravaStatusQuery.data?.data.connected
          ? 'Basé sur tes activités Strava récentes.'
          : 'Calculé à partir de ton plan actif.'}
      </Text>
      <View style={styles.macroFooter}>
        <Feather name="refresh-cw" size={14} color={palette.secondary} />
        <Text style={styles.macroFootnote}>
          Mise à jour dès que tu modifies une séance ou synchronises Strava.
        </Text>
        </View>
      </Card>

      <SectionHeader title="Hydratation" />
      <Card>
        <View style={styles.hydrationRow}>
          <View style={styles.hydrationBadge}>
            <Feather name="droplet" size={18} color={palette.background} />
          </View>
          <View style={styles.hydrationContent}>
            <Text style={styles.hydrationValue}>{hydrationTarget} L</Text>
            <Text style={styles.hydrationLabel}>Cible quotidienne</Text>
            <Text style={styles.hydrationDetails}>
              Basé sur {profile?.profile?.weight ? `${profile.profile.weight} kg` : 'ton poids estimé'} + charge
              hebdomadaire.
            </Text>
          </View>
        </View>
      </Card>

      <SectionHeader title="Séance clé" subtitle="Focus énergétique" />
      <Card style={styles.strategyCard}>
        {planDetailsQuery.isLoading ? (
          <View style={styles.loadingInline}>
            <ActivityIndicator color={palette.primary} />
            <Text style={styles.loadingText}>Analyse de tes séances</Text>
          </View>
        ) : null}
        {fuelingStrategy ? (
          <>
            <View style={styles.strategyHeader}>
              <Text style={styles.strategyTitle}>{fuelingStrategy.session.name}</Text>
              <Text style={styles.strategyMeta}>
                {formatDate(fuelingStrategy.session.date)} · {fuelingStrategy.session.duration} min ·{' '}
                {fuelingStrategy.session.intensity.toLowerCase()}
              </Text>
            </View>
            <View style={styles.strategyRow}>
              <View>
                <Text style={styles.strategyValue}>{fuelingStrategy.carbsPerHour} g/h</Text>
                <Text style={styles.strategyLabel}>Glucides recommandés</Text>
              </View>
              <View>
                <Text style={styles.strategyValue}>{fuelingStrategy.gelsCount}</Text>
                <Text style={styles.strategyLabel}>Gels ou portions</Text>
              </View>
            </View>
            <View style={styles.gelList}>
              <Feather name="zap" size={16} color={palette.primary} />
              <Text style={styles.gelText}>
                Fractionne ton apport toutes les 30-35 minutes. Pense à alterner avec boisson isotonique si météo chaude.
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.placeholderText}>
            Aucune séance longue cette semaine. Ajoute-en une depuis le planner pour obtenir une stratégie détaillée.
          </Text>
        )}
      </Card>

      <SectionHeader title="Charge hebdo estimée" />
      <Card style={styles.loadCard}>
        <View style={styles.loadSummary}>
          <View>
            <Text style={styles.loadValue}>{formatDuration(loadStats.totalMinutes)}</Text>
            <Text style={styles.loadLabel}>Volume prévu</Text>
          </View>
          <View>
            <Text style={styles.loadValue}>{formatDistance(loadStats.totalDistance)}</Text>
            <Text style={styles.loadLabel}>Distance totale</Text>
          </View>
        </View>
        <ProgressBar progress={loadStats.loadIndex} valueLabel={`${Math.round(loadStats.loadIndex * 100)} % charge`} />
      </Card>

      <SectionHeader title="Dernières activités Strava" subtitle="Ajustement automatique du plan" />
      <Card>
        {stravaStatusQuery.isLoading ? (
          <View style={styles.loadingInline}>
            <ActivityIndicator color={palette.primary} />
            <Text style={styles.loadingText}>Lecture des activités</Text>
          </View>
        ) : null}
        {stravaStatusQuery.data?.data.connected ? (
          stravaActivities.length ? (
            stravaActivities.map(activity => (
              <View key={activity.id} style={styles.activityRow}>
                <View style={styles.activityIcon}>
                  <Feather name="activity" size={16} color={palette.primary} />
                </View>
                <View style={styles.activityText}>
                  <Text style={styles.activityTitle}>{activity.name}</Text>
                  <Text style={styles.activityMeta}>
                    {formatDate(activity.start_date)} · {formatDistance(activity.distance / 1000)} ·{' '}
                    {(activity.moving_time / 60).toFixed(0)} min
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.placeholderText}>
              Aucune activité récente. Lance une synchro depuis le dashboard après ta prochaine sortie.
            </Text>
          )
        ) : (
          <View style={styles.stravaDisconnected}>
            <Text style={styles.placeholderText}>
              Connecte Strava depuis le dashboard pour intégrer tes données réelles et recalibrer nutrition et charge.
            </Text>
            <Button onPress={() => navigation.navigate('Dashboard')} variant="ghost" style={styles.stravaButton}>
              Gérer Strava
            </Button>
          </View>
        )}
      </Card>
    </Screen>
  )
}

const MacroRow = ({ label, value, progress }: { label: string; value: number; progress: number }) => (
  <View style={styles.macroItem}>
    <Text style={styles.macroLabel}>{label}</Text>
    <ProgressBar progress={progress} valueLabel={`${value}%`} />
  </View>
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
  dataSource: {
    color: palette.muted,
    fontSize: typography.caption,
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
  hydrationDetails: {
    color: palette.secondary,
    fontSize: typography.caption,
  },
  strategyCard: {
    gap: spacing(1.5),
  },
  loadingInline: {
    alignItems: 'center',
    gap: spacing(1),
    marginVertical: spacing(1),
  },
  loadingText: {
    color: palette.secondary,
    fontSize: typography.caption,
  },
  strategyHeader: {
    gap: spacing(0.5),
  },
  strategyTitle: {
    color: palette.primary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  strategyMeta: {
    color: palette.muted,
    fontSize: typography.caption,
  },
  strategyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing(1),
  },
  strategyValue: {
    color: palette.primary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  strategyLabel: {
    color: palette.secondary,
    fontSize: typography.caption,
  },
  gelList: {
    flexDirection: 'row',
    gap: spacing(1),
    alignItems: 'center',
    marginTop: spacing(1.5),
  },
  gelText: {
    flex: 1,
    color: palette.secondary,
    fontSize: typography.caption,
    lineHeight: 18,
  },
  placeholderText: {
    color: palette.muted,
    fontSize: typography.caption,
    lineHeight: 18,
  },
  loadCard: {
    gap: spacing(1.5),
  },
  loadSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loadValue: {
    color: palette.primary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  loadLabel: {
    color: palette.muted,
    fontSize: typography.caption,
  },
  activityRow: {
    flexDirection: 'row',
    gap: spacing(1),
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    paddingVertical: spacing(1),
  },
  activityIcon: {
    width: spacing(3.5),
    height: spacing(3.5),
    borderRadius: radii.sm,
    backgroundColor: palette.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityText: {
    flex: 1,
    gap: spacing(0.25),
  },
  activityTitle: {
    color: palette.primary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  activityMeta: {
    color: palette.secondary,
    fontSize: typography.caption,
  },
  stravaDisconnected: {
    gap: spacing(1.5),
    alignItems: 'flex-start',
  },
  stravaButton: {
    borderColor: palette.border,
  },
})

export default NutritionScreen
