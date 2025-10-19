import { useMemo } from 'react'
import { Feather } from '@expo/vector-icons'
import { StyleSheet, Text, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'

import { Card } from '../components/Card'
import { Screen } from '../components/Screen'
import { SectionHeader } from '../components/SectionHeader'
import { useAuth } from '../context/AuthContext'
import { getStravaStatus } from '../services/strava'
import { getTrainingPlanById, getTrainingPlans } from '../services/training'
import { palette, radii, spacing, typography } from '../theme'

const ProfileScreen = () => {
  const { profile: userProfile, token } = useAuth()

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

  const sessions = planDetailsQuery.data?.data.trainingSessions ?? []
  const totalDistance = sessions.reduce((acc, session) => acc + (session.distance ?? 0), 0)
  const totalMinutes = sessions.reduce((acc, session) => acc + (session.duration ?? 0), 0)
  const completedSessions = sessions.filter(session => session.completed).length

  const strengths = userProfile?.profile?.fitnessGoals?.length
    ? userProfile.profile.fitnessGoals
    : ['Endurance', 'Gestion du dénivelé']

  const focusAreas =
    userProfile?.profile?.medicalConditions?.length && userProfile.profile.medicalConditions[0]
      ? userProfile.profile.medicalConditions
      : ['Optimiser le sommeil', 'Suivi glycogène', 'Renforcer chevilles']

  const badges = useBadges({
    stravaConnected: Boolean(stravaStatusQuery.data?.data.connected),
    completedSessions,
    totalSessions: sessions.length,
    totalDistance,
  })

  return (
    <Screen>
      <Card style={styles.identityCard}>
        <View style={styles.identityHeader}>
          <View>
            <Text style={styles.identityName}>{userProfile?.name ?? 'Athlète SummitStride'}</Text>
            <Text style={styles.identityLocation}>{userProfile?.email}</Text>
          </View>
          <View style={styles.identityBadge}>
            <Text style={styles.identityLevel}>{userProfile?.profile?.experienceLevel ?? 'INTERMEDIATE'}</Text>
          </View>
        </View>
        <View style={styles.identityMeta}>
          <MetricBlock label="VMA" value={userProfile?.profile?.vma ? `${userProfile.profile.vma} km/h` : '—'} />
          <MetricBlock
            label="Disponibilité"
            value={userProfile?.profile?.maxTrainingHoursPerWeek ? `${userProfile.profile.maxTrainingHoursPerWeek} h` : '—'}
          />
          <MetricBlock label="Plans actifs" value={plansQuery.data?.data.length ? plansQuery.data.data.length.toString() : '0'} />
        </View>
      </Card>

      <SectionHeader title="Statistiques plan actuel" />
      <Card style={styles.statsCard}>
        <StatRow icon="trending-up" label="Distance plan" value={`${totalDistance.toFixed(1)} km`} />
        <StatRow icon="clock" label="Volume total" value={`${(totalMinutes / 60).toFixed(1)} h`} />
        <StatRow
          icon="shield"
          label="Adhérence"
          value={
            sessions.length
              ? `${Math.round((completedSessions / sessions.length) * 100)} %`
              : 'Plan en préparation'
          }
        />
      </Card>

      <SectionHeader title="Forces" />
      <Card style={styles.pillCard}>
        <View style={styles.pillGroup}>
          {strengths.map(item => (
            <View key={item} style={styles.pill}>
              <Text style={styles.pillText}>{item}</Text>
            </View>
          ))}
        </View>
      </Card>

      <SectionHeader title="Axes prioritaires" />
      <Card style={styles.focusCard}>
        {focusAreas.map(item => (
          <View key={item} style={styles.focusRow}>
            <Feather name="target" size={16} color={palette.primary} />
            <Text style={styles.focusText}>{item}</Text>
          </View>
        ))}
      </Card>

      <SectionHeader title="Badges" />
      <Card style={styles.badgesCard}>
        {badges.map(badge => (
          <View key={badge.id} style={styles.badge}>
            <Feather name={badge.icon} size={16} color={palette.background} />
            <Text style={styles.badgeText}>{badge.label}</Text>
          </View>
        ))}
      </Card>
    </Screen>
  )
}

const MetricBlock = ({ label, value }: { label: string; value: string }) => (
  <View>
    <Text style={styles.metaLabel}>{label}</Text>
    <Text style={styles.metaValue}>{value}</Text>
  </View>
)

const StatRow = ({ icon, label, value }: { icon: keyof typeof Feather.glyphMap; label: string; value: string }) => (
  <View style={styles.statsRow}>
    <Feather name={icon} size={18} color={palette.primary} />
    <View style={styles.statsText}>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsLabel}>{label}</Text>
    </View>
  </View>
)

const useBadges = ({
  stravaConnected,
  completedSessions,
  totalSessions,
  totalDistance,
}: {
  stravaConnected: boolean
  completedSessions: number
  totalSessions: number
  totalDistance: number
}) => {
  const badges = []

  if (stravaConnected) {
    badges.push({ id: 'strava', label: 'Strava connecté', icon: 'link' as const })
  }

  if (totalSessions > 0) {
    const completion = Math.round((completedSessions / totalSessions) * 100)
    badges.push({ id: 'completion', label: `${completion}% plan complété`, icon: 'award' as const })
  }

  if (totalDistance >= 100) {
    badges.push({ id: 'distance', label: `${totalDistance.toFixed(0)} km cumulés`, icon: 'map' as const })
  }

  if (!badges.length) {
    badges.push({ id: 'starter', label: 'Profil en cours', icon: 'activity' as const })
  }

  return badges
}

const styles = StyleSheet.create({
  identityCard: {
    gap: spacing(1.5),
  },
  identityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  identityName: {
    color: palette.primary,
    fontSize: typography.subtitle,
    fontWeight: '600',
  },
  identityLocation: {
    color: palette.muted,
    fontSize: typography.caption,
  },
  identityBadge: {
    backgroundColor: palette.primary,
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(0.75),
    borderRadius: radii.sm,
  },
  identityLevel: {
    color: palette.background,
    fontSize: typography.caption,
    fontWeight: '600',
  },
  identityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    color: palette.muted,
    fontSize: typography.micro,
    textTransform: 'uppercase',
  },
  metaValue: {
    color: palette.secondary,
    fontSize: typography.caption,
    marginTop: spacing(0.5),
  },
  statsCard: {
    gap: spacing(1),
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing(1.5),
    alignItems: 'center',
  },
  statsText: {
    gap: spacing(0.25),
  },
  statsValue: {
    color: palette.primary,
    fontSize: typography.section,
    fontWeight: '600',
  },
  statsLabel: {
    color: palette.muted,
    fontSize: typography.caption,
  },
  pillCard: {
    paddingVertical: spacing(1.5),
  },
  pillGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(1),
  },
  pill: {
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(0.75),
  },
  pillText: {
   color: palette.secondary,
    fontSize: typography.caption,
  },
  focusCard: {
    gap: spacing(1),
  },
  focusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
  },
  focusText: {
    color: palette.secondary,
    fontSize: typography.caption,
  },
  badgesCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(1),
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(0.5),
    backgroundColor: palette.primary,
    paddingHorizontal: spacing(1),
    paddingVertical: spacing(0.75),
    borderRadius: radii.sm,
  },
  badgeText: {
    color: palette.background,
    fontSize: typography.caption,
    fontWeight: '600',
  },
})

export default ProfileScreen
