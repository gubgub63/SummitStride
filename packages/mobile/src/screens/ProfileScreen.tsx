import { useEffect, useMemo, useState } from 'react'
import { Feather } from '@expo/vector-icons'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { useMutation, useQuery } from '@tanstack/react-query'

import { Card } from '../components/Card'
import { Screen } from '../components/Screen'
import { SectionHeader } from '../components/SectionHeader'
import { useAuth } from '../context/AuthContext'
import { getStravaStatus } from '../services/strava'
import { getTrainingPlanById, getTrainingPlans } from '../services/training'
import {
  getDaysOfWeek,
  getExperienceLevels,
  updateUserProfile,
  type ExperienceLevelOption,
} from '../services/user'
import { Input } from '../components/Input'
import { palette, radii, spacing, typography } from '../theme'

const DEFAULT_EXPERIENCE_LEVELS: ExperienceLevelOption[] = [
  { value: 'BEGINNER', label: 'Débutant' },
  { value: 'INTERMEDIATE', label: 'Intermédiaire' },
  { value: 'ADVANCED', label: 'Avancé' },
  { value: 'EXPERT', label: 'Expert' },
]

const DEFAULT_DAYS_OF_WEEK: Array<{ value: number; label: string }> = [
  { value: 0, label: 'Dimanche' },
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
]

const ProfileScreen = () => {
  const { profile: userProfile, token, refreshProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [experienceLevel, setExperienceLevel] = useState('INTERMEDIATE')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [vma, setVma] = useState('')
  const [maxHours, setMaxHours] = useState('')
  const [preferredDays, setPreferredDays] = useState<number[]>([])
  const [formError, setFormError] = useState<string | null>(null)

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

  const experienceLevelsQuery = useQuery({
    queryKey: ['experience-levels'],
    queryFn: () => getExperienceLevels(token!),
    enabled: Boolean(token),
  })

  const daysOfWeekQuery = useQuery({
    queryKey: ['days-of-week'],
    queryFn: () => getDaysOfWeek(token!),
    enabled: Boolean(token),
  })

  const experienceOptions = useMemo(() => {
    const options = experienceLevelsQuery.data?.experienceLevels
    if (options?.length) {
      return options.map(option => ({
        value: option.value,
        label: option.label ?? option.value,
        description: option.description ?? null,
      }))
    }
    return DEFAULT_EXPERIENCE_LEVELS
  }, [experienceLevelsQuery.data?.experienceLevels])

  const dayOptions = useMemo(() => {
    const options = daysOfWeekQuery.data?.daysOfWeek
    if (options?.length) {
      return options
    }
    return DEFAULT_DAYS_OF_WEEK
  }, [daysOfWeekQuery.data?.daysOfWeek])

  useEffect(() => {
    if (!userProfile?.profile) return
    const profile = userProfile.profile
    setExperienceLevel(profile.experienceLevel)
    setWeight(profile.weight ? profile.weight.toString() : '')
    setHeight(profile.height ? profile.height.toString() : '')
    setVma(profile.vma ? profile.vma.toString() : '')
    setMaxHours(profile.maxTrainingHoursPerWeek ? profile.maxTrainingHoursPerWeek.toString() : '')
    setPreferredDays((profile.preferredTrainingDays ?? []).slice().sort((a, b) => a - b))
  }, [userProfile?.profile])

  const updateProfileMutation = useMutation({
    mutationFn: () => {
      const payload: Record<string, unknown> = {
        experienceLevel,
        preferredTrainingDays: preferredDays,
      }

      if (weight.trim()) payload.weight = Number.parseFloat(weight)
      else payload.weight = null

      if (height.trim()) payload.height = Number.parseFloat(height)
      else payload.height = null

      if (vma.trim()) payload.vma = Number.parseFloat(vma)
      else payload.vma = null

      if (maxHours.trim()) payload.maxTrainingHoursPerWeek = Number.parseInt(maxHours, 10)
      else payload.maxTrainingHoursPerWeek = null

      return updateUserProfile(token!, payload)
    },
    onSuccess: async () => {
      await refreshProfile()
      setEditing(false)
      setFormError(null)
    },
    onError: error => {
      setFormError(error instanceof Error ? error.message : 'Impossible de mettre à jour le profil.')
    },
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

  const toggleDay = (value: number) => {
    setPreferredDays(prev =>
      prev.includes(value) ? prev.filter(day => day !== value) : [...prev, value].sort((a, b) => a - b)
    )
  }

  const canSave = useMemo(() => {
    if (updateProfileMutation.isPending) return false
    if (!experienceLevel) return false
    return true
  }, [experienceLevel, updateProfileMutation.isPending])

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
        <View style={styles.identityActions}>
          <Pressable style={styles.editButton} onPress={() => setEditing(prev => !prev)}>
            <Feather name={editing ? 'x' : 'edit-3'} size={16} color={palette.primary} />
            <Text style={styles.editButtonText}>{editing ? 'Annuler' : 'Modifier'}</Text>
          </Pressable>
        </View>
      </Card>

      {editing ? (
        <Card style={styles.formCard}>
          <SectionHeader title="Profil d'entraînement" />
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Niveau d'expérience</Text>
            <View style={styles.chipRow}>
              {experienceOptions.map(levelOption => {
                const active = levelOption.value === experienceLevel
                return (
                  <Pressable
                    key={levelOption.value}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setExperienceLevel(levelOption.value)}
                  >
                    <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{levelOption.label}</Text>
                  </Pressable>
                )
              })}
            </View>
          </View>

          <Input label="VMA (km/h)" value={vma} onChangeText={setVma} keyboardType="decimal-pad" placeholder="15" />
          <Input label="Poids (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="70" />
          <Input label="Taille (cm)" value={height} onChangeText={setHeight} keyboardType="number-pad" placeholder="175" />
          <Input
            label="Heures d'entraînement / semaine"
            value={maxHours}
            onChangeText={setMaxHours}
            keyboardType="number-pad"
            placeholder="8"
          />

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Jours préférés</Text>
            <View style={styles.chipRow}>
              {dayOptions.map(day => {
                const active = preferredDays.includes(day.value)
                return (
                  <Pressable
                    key={day.value}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => toggleDay(day.value)}
                  >
                    <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{day.label.slice(0, 3)}</Text>
                  </Pressable>
                )
              })}
            </View>
          </View>

          {formError ? <Text style={styles.error}>{formError}</Text> : null}
          <View style={styles.actionsRow}>
            <Pressable
              style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
              onPress={() => {
                if (!canSave) return
                const parsedWeight = weight.trim() ? Number.parseFloat(weight) : undefined
                const parsedHeight = height.trim() ? Number.parseFloat(height) : undefined
                const parsedVma = vma.trim() ? Number.parseFloat(vma) : undefined
                const parsedHours = maxHours.trim() ? Number.parseInt(maxHours, 10) : undefined

                if (parsedWeight !== undefined && (Number.isNaN(parsedWeight) || parsedWeight <= 0)) {
                  setFormError('Poids invalide')
                  return
                }
                if (parsedHeight !== undefined && (Number.isNaN(parsedHeight) || parsedHeight <= 0)) {
                  setFormError('Taille invalide')
                  return
                }
                if (parsedVma !== undefined && (Number.isNaN(parsedVma) || parsedVma <= 0)) {
                  setFormError('VMA invalide')
                  return
                }
                if (parsedHours !== undefined && (Number.isNaN(parsedHours) || parsedHours <= 0)) {
                  setFormError('Heures par semaine invalides')
                  return
                }

                setFormError(null)
                updateProfileMutation.mutate()
              }}
            >
              {updateProfileMutation.isPending ? (
                <ActivityIndicator color={palette.background} />
              ) : (
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              )}
            </Pressable>
          </View>
        </Card>
      ) : null}

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
  identityActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(0.5),
  },
  editButtonText: {
    color: palette.primary,
    fontSize: typography.caption,
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
  formCard: {
    gap: spacing(1.5),
  },
  section: {
    gap: spacing(1),
  },
  sectionLabel: {
    color: palette.secondary,
    fontSize: typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(1),
  },
  chip: {
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(0.75),
  },
  chipActive: {
    borderColor: palette.primary,
    backgroundColor: palette.surfaceMuted,
  },
  chipLabel: {
    color: palette.secondary,
    fontSize: typography.caption,
  },
  chipLabelActive: {
    color: palette.primary,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  saveButton: {
    backgroundColor: palette.primary,
    borderRadius: radii.sm,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: palette.background,
    fontSize: typography.caption,
    fontWeight: '600',
  },
  error: {
    color: '#D96C6C',
    fontSize: typography.caption,
  },
})

export default ProfileScreen
