import { useMemo, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { useQuery } from '@tanstack/react-query'
import * as WebBrowser from 'expo-web-browser'

import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { ProgressBar } from '../components/ProgressBar'
import { Screen } from '../components/Screen'
import { SectionHeader } from '../components/SectionHeader'
import { useAuth } from '../context/AuthContext'
import { getStravaActivities, getStravaAuthorizationUrl, getStravaStatus, triggerStravaSync } from '../services/strava'
import { getTrainingPlanById, getTrainingPlans } from '../services/training'
import type { RootTabParamList } from '../navigation/RootNavigator'
import { palette, radii, spacing, typography } from '../theme'

const formatDate = (value: string | Date | null | undefined) => {
  if (!value) return '—'
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(date)
}

const formatDistance = (value: number | null | undefined) => {
  if (!value || Number.isNaN(value)) return '—'
  return `${value.toFixed(1)} km`
}

const formatDurationHours = (minutes: number) => {
  if (!Number.isFinite(minutes)) return '—'
  return `${(minutes / 60).toFixed(1)} h`
}

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))

const DashboardScreen = () => {
  const { token, profile } = useAuth()
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>()
  const [stravaMessage, setStravaMessage] = useState<string | null>(null)

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

  const stravaQuery = useQuery({
    queryKey: ['strava-status'],
    queryFn: () => getStravaStatus(token!),
    enabled: Boolean(token),
    refetchInterval: 1000 * 60 * 5, // toutes les 5 min
  })

  const sessions = planDetailsQuery.data?.data.trainingSessions ?? []
  const stravaActivitiesQuery = useQuery({
    queryKey: ['strava-activities'],
    queryFn: () => getStravaActivities(token!, { perPage: 60, afterDays: 35 }),
    enabled: Boolean(token && stravaQuery.data?.data.connected),
    staleTime: 1000 * 60 * 5,
  })
  const stravaActivities = stravaActivitiesQuery.data?.data.activities ?? []

  const nextSession = useMemo(() => {
    const now = new Date()
    return [...sessions]
      .filter(session => new Date(session.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
  }, [sessions])

  const trainingMetrics = useMemo(() => {
    if (!activePlan) {
      return {
        completion: 0,
        totalDistance: 0,
        totalDurationMinutes: 0,
        completedSessions: 0,
      }
    }

    const start = new Date(activePlan.startDate)
    const end = new Date(activePlan.endDate)
    const totalPeriod = end.getTime() - start.getTime()
    const elapsed = Date.now() - start.getTime()
    const completion = totalPeriod > 0 ? clamp(elapsed / totalPeriod) : 0

    const totals = sessions.reduce(
      (acc, session) => {
        if (session.distance) acc.totalDistance += session.distance
        if (session.duration) acc.totalDurationMinutes += session.duration
        if (session.completed) acc.completedSessions += 1
        return acc
      },
      { totalDistance: 0, totalDurationMinutes: 0, completedSessions: 0 }
    )

    return {
      completion,
      totalDistance: totals.totalDistance,
      totalDurationMinutes: totals.totalDurationMinutes,
      completedSessions: totals.completedSessions,
    }
  }, [activePlan, sessions])

  const planProgress = useMemo(() => {
    if (!activePlan) {
      return null
    }
    const start = new Date(activePlan.startDate)
    const end = new Date(activePlan.endDate)
    const totalWeeks = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)))
    const elapsedWeeks = Math.min(
      totalWeeks,
      Math.max(1, Math.floor((Date.now() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1)
    )
    return {
      totalWeeks,
      currentWeek: elapsedWeeks,
      remainingWeeks: Math.max(totalWeeks - elapsedWeeks, 0),
    }
  }, [activePlan])

  const weeklyLoad = useMemo(() => {
    if (stravaActivities.length) {
      const byWeek = new Map<string, { distanceKm: number; durationMin: number; start: Date }>()
      stravaActivities.forEach(activity => {
        const start = new Date(activity.start_date)
        const key = getWeekKey(start)
        const current = byWeek.get(key) ?? { distanceKm: 0, durationMin: 0, start }
        current.distanceKm += activity.distance / 1000
        current.durationMin += activity.moving_time / 60
        current.start = current.start < start ? current.start : start
        byWeek.set(key, current)
      })

      return Array.from(byWeek.values())
        .sort((a, b) => a.start.getTime() - b.start.getTime())
        .slice(-4)
        .map(entry => ({
          label: formatWeekLabel(entry.start),
          distance: entry.distanceKm,
          sessions: Math.round(entry.durationMin / 45) || 1,
        }))
    }

    const byWeek = new Map<number, { distance: number; count: number }>()
    sessions.forEach(session => {
      const week = session.weekNumber ?? getWeekIndex(new Date(session.date))
      if (!byWeek.has(week)) {
        byWeek.set(week, { distance: 0, count: 0 })
      }
      const entry = byWeek.get(week)!
      entry.distance += session.distance ?? 0
      entry.count += 1
    })
    return Array.from(byWeek.entries())
      .sort((a, b) => a[0] - b[0])
      .slice(-4)
      .map(([week, values]) => ({
        label: `S${week}`,
        distance: values.distance,
        sessions: values.count,
      }))
  }, [sessions, stravaActivities])

  const stravaStatus = stravaQuery.data?.data
  const isStravaConnected = stravaStatus?.connected ?? false

  const handleCreatePlan = () => {
    navigation.navigate('Planner')
  }

  const handleStravaConnect = async () => {
    if (!token) return
    setStravaMessage(null)
    try {
      const { data } = await getStravaAuthorizationUrl(token)
      await WebBrowser.openBrowserAsync(data.authorizationUrl, {
        controlsColor: palette.primary,
      })
      await stravaQuery.refetch()
      await stravaActivitiesQuery.refetch()
      setStravaMessage("Vérifie le statut ci-dessous. Ferme le navigateur si l'autorisation est terminée.")
    } catch (error) {
      console.error(error)
      setStravaMessage("Impossible d'ouvrir la connexion Strava.")
    }
  }

  const handleStravaSync = async () => {
    if (!token) return
    setStravaMessage(null)
    try {
      await triggerStravaSync(token)
      await stravaQuery.refetch()
      await stravaActivitiesQuery.refetch()
      setStravaMessage('Synchronisation Strava déclenchée.')
    } catch (error) {
      console.error(error)
      setStravaMessage('Synchronisation Strava impossible.')
    }
  }

  const isLoading = plansQuery.isLoading || planDetailsQuery.isLoading
  const showEmptyState = !isLoading && !activePlan

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.greeting}>Salut {profile?.name?.split(' ')[0] ?? 'athlète'}</Text>
        <Text style={styles.subtitle}>
          {activePlan ? 'Continue sur ta lancée.' : 'Commence ton prochain bloc personnalisé.'}
        </Text>
      </View>

      {isLoading ? (
        <Card style={styles.loadingCard}>
          <ActivityIndicator color={palette.primary} />
          <Text style={styles.loadingText}>Chargement de tes données</Text>
        </Card>
      ) : null}

      {showEmptyState ? (
        <Card style={styles.emptyCard}>
          <Feather name="flag" size={24} color={palette.primary} />
          <Text style={styles.emptyTitle}>Aucun plan en cours</Text>
          <Text style={styles.emptySubtitle}>
            Lance un nouveau plan d&apos;entraînement en définissant ton objectif et ta charge préférée.
          </Text>
          <Button onPress={handleCreatePlan} style={styles.fullWidthButton}>
            Créer mon plan
          </Button>
        </Card>
      ) : null}

      {activePlan ? (
        <>
          <SectionHeader title="Plan actif" subtitle={activePlan.status.toLowerCase()} />
          <Card>
            <View style={styles.planHeader}>
              <View style={styles.planSummary}>
                <Text style={styles.planName}>{activePlan.name}</Text>
                <Text style={styles.planDates}>
                  {formatDate(activePlan.startDate)} → {formatDate(activePlan.endDate)}
                </Text>
              </View>
              <View style={styles.planCompletion}>
                <Text style={styles.progressValue}>{Math.round(trainingMetrics.completion * 100)}%</Text>
                <Text style={styles.progressLabel}>avancement</Text>
              </View>
            </View>
            <ProgressBar
              progress={trainingMetrics.completion}
              valueLabel={
                planProgress ? `Sem. ${planProgress.currentWeek}/${planProgress.totalWeeks}` : `${sessions.length} séances`
              }
            />
            {planProgress ? (
              <View style={styles.planProgressRow}>
                <Text style={styles.planProgressText}>
                  Semaine {planProgress.currentWeek}/{planProgress.totalWeeks}
                </Text>
                <Text style={styles.planProgressRemaining}>
                  {planProgress.remainingWeeks === 0
                    ? 'Dernière ligne droite'
                    : `${planProgress.remainingWeeks} sem restantes`}
                </Text>
              </View>
            ) : null}
            <View style={styles.planStats}>
              <View>
                <Text style={styles.statValue}>{formatDistance(trainingMetrics.totalDistance)}</Text>
                <Text style={styles.statLabel}>Distance planifiée</Text>
              </View>
              <View>
                <Text style={styles.statValue}>{formatDurationHours(trainingMetrics.totalDurationMinutes)}</Text>
                <Text style={styles.statLabel}>Volume estimé</Text>
              </View>
              <View>
                <Text style={styles.statValue}>{trainingMetrics.completedSessions}</Text>
                <Text style={styles.statLabel}>Séances validées</Text>
              </View>
            </View>
            {nextSession ? (
              <View style={styles.nextSession}>
                <Feather name="trending-up" size={18} color={palette.primary} />
                <View style={styles.nextSessionText}>
                  <Text style={styles.nextSessionTitle}>Prochaine séance</Text>
                  <Text style={styles.nextSessionSubtitle}>
                    {formatDate(nextSession.date)} · {nextSession.name} · {nextSession.type.toLowerCase()}
                  </Text>
                </View>
              </View>
            ) : null}
          </Card>
        </>
      ) : null}

      {weeklyLoad.length ? (
        <>
          <SectionHeader title="Progression récente" />
          <Card>
            <View style={styles.weeklyWrap}>
              {weeklyLoad.map(entry => (
                <View key={entry.label} style={styles.weekRow}>
                  <View style={styles.weekMeta}>
                    <Text style={styles.weekLabel}>{entry.label}</Text>
                    <Text style={styles.weekSessions}>{entry.sessions} séances</Text>
                  </View>
                  <ProgressBar progress={clamp(entry.distance / 100)} valueLabel={formatDistance(entry.distance)} />
                </View>
              ))}
            </View>
          </Card>
        </>
      ) : null}

      <SectionHeader title="Intégration Strava" subtitle={isStravaConnected ? 'Connectée' : 'Non connectée'} />
      <Card>
        <View style={styles.stravaHeader}>
          <View>
            <Text style={styles.stravaTitle}>
              {isStravaConnected ? 'Strava synchronisé' : 'Connecte ton compte Strava'}
            </Text>
            <Text style={styles.stravaSubtitle}>
              {isStravaConnected
                ? `Dernière sync: ${stravaStatus?.lastSyncAt ? formatDate(stravaStatus.lastSyncAt) : 'jamais'}`
                : 'Importe automatiquement tes activités pour ajuster la charge.'}
            </Text>
          </View>
          <Feather name="activity" size={20} color={palette.primary} />
        </View>
        {stravaMessage ? <Text style={styles.stravaMessage}>{stravaMessage}</Text> : null}
        <View style={styles.stravaActions}>
          <Button onPress={handleStravaConnect} variant={isStravaConnected ? 'ghost' : 'primary'} style={styles.stravaButton}>
            {isStravaConnected ? 'Réautoriser' : 'Connecter Strava'}
          </Button>
          {isStravaConnected ? (
            <Button onPress={handleStravaSync} variant="ghost" style={styles.stravaButton}>
              Forcer une sync
            </Button>
          ) : null}
        </View>
      </Card>
    </Screen>
  )
}

const getWeekNumber = (date: Date) => {
  const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = temp.getUTCDay() || 7
  temp.setUTCDate(temp.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1))
  return Math.ceil(((temp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

const getWeekKey = (date: Date) => `${date.getFullYear()}-W${getWeekNumber(date)}`

const formatWeekLabel = (date: Date) => `S${getWeekNumber(date)}`

const getWeekIndex = (date: Date) => getWeekNumber(date)

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
  loadingCard: {
    alignItems: 'center',
    gap: spacing(1),
  },
  loadingText: {
    color: palette.secondary,
    fontSize: typography.caption,
  },
  emptyCard: {
    alignItems: 'center',
    gap: spacing(1.5),
    textAlign: 'center',
  },
  emptyTitle: {
    color: palette.primary,
    fontSize: typography.section,
    fontWeight: '600',
  },
  emptySubtitle: {
    color: palette.secondary,
    fontSize: typography.body,
    textAlign: 'center',
    lineHeight: 20,
  },
  fullWidthButton: {
    alignSelf: 'stretch',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  planSummary: {
    gap: spacing(0.5),
  },
  planName: {
    color: palette.primary,
    fontSize: typography.section,
    fontWeight: '600',
  },
  planDates: {
    color: palette.muted,
    fontSize: typography.caption,
    textTransform: 'uppercase',
  },
  planCompletion: {
    alignItems: 'flex-end',
    gap: spacing(0.25),
  },
  progressValue: {
    color: palette.primary,
    fontSize: typography.subtitle,
    fontWeight: '600',
  },
  progressLabel: {
    color: palette.muted,
    fontSize: typography.micro,
    textTransform: 'uppercase',
  },
  planProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing(1.5),
  },
  planProgressText: {
    color: palette.secondary,
    fontSize: typography.caption,
  },
  planProgressRemaining: {
    color: palette.muted,
    fontSize: typography.caption,
  },
  planStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing(2),
  },
  statValue: {
    color: palette.primary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  statLabel: {
    color: palette.muted,
    fontSize: typography.caption,
  },
  nextSession: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
    marginTop: spacing(2),
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(1),
  },
  nextSessionText: {
    gap: spacing(0.5),
  },
  nextSessionTitle: {
    color: palette.secondary,
    fontSize: typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  nextSessionSubtitle: {
    color: palette.primary,
    fontSize: typography.body,
  },
  weeklyWrap: {
    gap: spacing(1.5),
  },
  weekRow: {
    gap: spacing(0.5),
  },
  weekMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekLabel: {
    color: palette.secondary,
    fontSize: typography.caption,
    textTransform: 'uppercase',
  },
  weekSessions: {
    color: palette.muted,
    fontSize: typography.caption,
  },
  stravaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing(1),
  },
  stravaTitle: {
    color: palette.primary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  stravaSubtitle: {
    color: palette.secondary,
    fontSize: typography.caption,
    lineHeight: 18,
  },
  stravaActions: {
    flexDirection: 'row',
    gap: spacing(1),
    marginTop: spacing(1.5),
  },
  stravaButton: {
    flex: 1,
  },
  stravaMessage: {
    color: palette.muted,
    fontSize: typography.caption,
    marginTop: spacing(1),
  },
})

export default DashboardScreen
