import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Input } from '../components/Input'
import { Screen } from '../components/Screen'
import { SectionHeader } from '../components/SectionHeader'
import { useAuth } from '../context/AuthContext'
import { createTrainingPlan, getTrainingPlanById, getTrainingPlans, type TrainingSession } from '../services/training'
import { palette, radii, spacing, typography } from '../theme'

const weekDays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

const iconByType: Record<string, keyof typeof Feather.glyphMap> = {
  ENDURANCE: 'trending-up',
  THRESHOLD: 'zap',
  INTERVAL: 'activity',
  RECOVERY: 'sunrise',
  STRENGTH: 'anchor',
  CROSS_TRAINING: 'wind',
}

const formatDate = (value: string | Date) => {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' }).format(date)
}

const PlannerScreen = () => {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [createModalVisible, setCreateModalVisible] = useState(false)

  const [planName, setPlanName] = useState('')
  const [planDescription, setPlanDescription] = useState('')
  const [startDate, setStartDate] = useState(() => new Date())
  const [endDate, setEndDate] = useState(() => addWeeks(new Date(), 12))
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)
  const [distanceKm, setDistanceKm] = useState('')
  const [elevationGain, setElevationGain] = useState('')
  const [raceDate, setRaceDate] = useState<Date | null>(null)
  const [showRacePicker, setShowRacePicker] = useState(false)
  const [selectedWeekKey, setSelectedWeekKey] = useState<string | null>(null)
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const plansQuery = useQuery({
    queryKey: ['training-plans'],
    queryFn: () => getTrainingPlans(token!),
    enabled: Boolean(token),
  })

  useEffect(() => {
    if (!plansQuery.data?.data?.length) return
    if (selectedPlanId) return
    const active = plansQuery.data.data.find(plan => plan.status === 'ACTIVE') ?? plansQuery.data.data[0]
    setSelectedPlanId(active.id)
  }, [plansQuery.data, selectedPlanId])

  const selectedPlan = useMemo(() => {
    return plansQuery.data?.data.find(plan => plan.id === selectedPlanId)
  }, [plansQuery.data, selectedPlanId])

  const planDetailsQuery = useQuery({
    queryKey: ['training-plan', selectedPlanId],
    queryFn: () => getTrainingPlanById(token!, selectedPlanId!),
    enabled: Boolean(token && selectedPlanId),
  })

  const createPlanMutation = useMutation({
    mutationFn: () => {
      const descriptionLines: string[] = []
      const distanceValue = Number.parseFloat(distanceKm)
      const elevationValue = Number.parseInt(elevationGain, 10)

      if (planDescription.trim()) {
        descriptionLines.push(planDescription.trim())
      }
      if (!Number.isNaN(distanceValue)) {
        descriptionLines.push(`Distance cible: ${distanceValue.toFixed(1)} km`)
      }
      if (!Number.isNaN(elevationValue)) {
        descriptionLines.push(`D+ cible: ${elevationValue} m`)
      }
      if (raceDate) {
        descriptionLines.push(`Course: ${raceDate.toISOString().split('T')[0]}`)
      }

      return createTrainingPlan(token!, {
        name: planName.trim(),
        description: descriptionLines.length ? descriptionLines.join('\n') : undefined,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      })
    },
    onSuccess: async response => {
      await queryClient.invalidateQueries({ queryKey: ['training-plans'] })
      await queryClient.invalidateQueries({ queryKey: ['training-plan', response.data.id] })
      setSelectedPlanId(response.data.id)
      setCreateModalVisible(false)
      setPlanName('')
      setPlanDescription('')
      setDistanceKm('')
      setElevationGain('')
      setRaceDate(null)
      setStartDate(new Date())
      setEndDate(addWeeks(new Date(), 12))
      setShowStartPicker(false)
      setShowEndPicker(false)
      setShowRacePicker(false)
      setSelectedWeekKey(null)
      setFormError(null)
    },
    onError: error => {
      console.error(error)
      setFormError(error instanceof Error ? error.message : 'Création impossible.')
    },
  })

  const sessions = planDetailsQuery.data?.data.trainingSessions ?? []

  const weeks = useMemo(() => {
    if (!sessions.length) return []
    const groups = new Map<
      string,
      {
        key: string
        label: string
        start: Date
        sessions: TrainingSession[]
      }
    >()

    sessions.forEach(session => {
      const date = new Date(session.date)
      const start = startOfWeek(date)
      const key = getWeekKey(date)
      const existing = groups.get(key) ?? {
        key,
        label: formatWeekChip(start),
        start,
        sessions: [] as TrainingSession[],
      }
      existing.sessions.push(session)
      groups.set(key, existing)
    })

    return Array.from(groups.values()).sort((a, b) => a.start.getTime() - b.start.getTime())
  }, [sessions])

  useEffect(() => {
    if (!weeks.length) {
      setSelectedWeekKey(null)
      return
    }

    if (selectedWeekKey && weeks.some(week => week.key === selectedWeekKey)) {
      return
    }

    const todayKey = getWeekKey(new Date())
    const fallback = weeks.find(week => week.key === todayKey) ?? weeks[0]
    setSelectedWeekKey(fallback.key)
  }, [weeks, selectedWeekKey])

  const selectedWeek = useMemo(
    () => weeks.find(week => week.key === selectedWeekKey) ?? weeks[0] ?? null,
    [selectedWeekKey, weeks]
  )

  const displayedSessions = useMemo(() => selectedWeek?.sessions ?? [], [selectedWeek])

  const schedule = useMemo(() => {
    const byDay = weekDays.map((day, index) => ({
      day,
      index,
      sessions: [] as TrainingSession[],
    }))

    displayedSessions.forEach(session => {
      const dayIndex = new Date(session.date).getDay()
      byDay[dayIndex]?.sessions.push(session)
    })

    return byDay
  }, [displayedSessions])

  const prioritySessions = useMemo(() => {
    return displayedSessions
      .filter(session => session.intensity === 'HIGH' || session.intensity === 'VERY_HIGH')
      .slice(0, 3)
  }, [displayedSessions])

  const weeklyCompletedCount = useMemo(
    () => displayedSessions.filter(session => session.completed).length,
    [displayedSessions]
  )
  const weeklyTotalCount = displayedSessions.length

  const planProgress = useMemo(() => {
    if (!selectedPlan) return null
    const start = new Date(selectedPlan.startDate)
    const end = new Date(selectedPlan.endDate)
    const totalWeeks = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)))
    const currentWeek = Math.min(
      totalWeeks,
      Math.max(1, Math.floor((Date.now() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1)
    )
    return {
      totalWeeks,
      currentWeek,
    }
  }, [selectedPlan])

  const handleCreatePlan = () => {
    setCreateModalVisible(true)
  }

  const handleDateChange =
    (type: 'start' | 'end') =>
    (_event: DateTimePickerEvent, date?: Date) => {
      if (!date) {
        if (Platform.OS !== 'ios') {
          if (type === 'start') setShowStartPicker(false)
          else setShowEndPicker(false)
        }
        return
      }
      if (type === 'start') {
        setStartDate(date)
        if (date > endDate) {
          setEndDate(addWeeks(date, 12))
        }
        if (Platform.OS !== 'ios') setShowStartPicker(false)
      } else {
        setEndDate(date)
        if (Platform.OS !== 'ios') setShowEndPicker(false)
      }
    }

  const submitCreatePlan = () => {
    if (!planName.trim()) {
      setFormError('Un nom est requis.')
      return
    }
    if (endDate <= startDate) {
      setFormError('La date de fin doit être postérieure au début.')
      return
    }
    const parsedDistance = Number.parseFloat(distanceKm)
    if (!distanceKm.trim() || Number.isNaN(parsedDistance) || parsedDistance <= 0) {
      setFormError('Indique une distance cible (en km).')
      return
    }
    const parsedElevation = Number.parseInt(elevationGain, 10)
    if (!elevationGain.trim() || Number.isNaN(parsedElevation) || parsedElevation < 0) {
      setFormError('Indique un dénivelé positif cible (en mètres).')
      return
    }
    if (!raceDate) {
      setFormError('Sélectionne la date de course.')
      return
    }
    if (raceDate.getTime() <= endDate.getTime()) {
      setFormError('La date de course doit être postérieure à la fin du plan.')
      return
    }
    setFormError(null)
    createPlanMutation.mutate()
  }

  const isLoading = plansQuery.isLoading || planDetailsQuery.isLoading
  const hasPlans = Boolean(plansQuery.data?.data.length)

  return (
    <Screen>
      <Card style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <Text style={styles.heroTitle}>{selectedPlan ? selectedPlan.name : 'Planificateur SummitStride'}</Text>
          {hasPlans ? (
            <Text style={styles.heroMeta}>
              {planProgress ? `Sem. ${planProgress.currentWeek}/${planProgress.totalWeeks}` : 'Plan sélectionné'}
              {weeklyTotalCount
                ? ` · ${weeklyCompletedCount}/${weeklyTotalCount} séances validées`
                : ' · Aucune séance planifiée cette semaine'}
            </Text>
          ) : null}
        </View>
        <Text style={styles.heroSubtitle}>
          Structure tes semaines et ajuste la charge en fonction des objectifs terrain. Lance un nouveau bloc en un
          geste.
        </Text>
        <Button onPress={handleCreatePlan} style={styles.heroButton}>
          Nouveau plan
        </Button>
      </Card>

      {plansQuery.isLoading ? (
        <Card style={styles.loadingCard}>
          <ActivityIndicator color={palette.primary} />
          <Text style={styles.loadingText}>Chargement des plans</Text>
        </Card>
      ) : null}

      {hasPlans ? (
        <>
          <SectionHeader title="Plans enregistrés" />
          <View style={styles.planSelector}>
            {plansQuery.data!.data.map(plan => {
              const active = plan.id === selectedPlanId
              return (
                <Pressable
                  key={plan.id}
                  onPress={() => setSelectedPlanId(plan.id)}
                  style={[styles.planChip, active && styles.planChipActive]}
                >
                  <Text style={[styles.planChipLabel, active && styles.planChipLabelActive]}>{plan.name}</Text>
                </Pressable>
              )
            })}
          </View>
        </>
      ) : null}

      {selectedPlan ? (
        <>
          <SectionHeader title="Semaine en un coup d’œil" />
          {weeks.length ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.weekSelectorContent}
              style={styles.weekSelector}
            >
              {weeks.map(week => {
                const isActive = week.key === selectedWeekKey
                return (
                  <Pressable
                    key={week.key}
                    onPress={() => setSelectedWeekKey(week.key)}
                    style={[styles.weekChip, isActive && styles.weekChipActive]}
                  >
                    <Text style={[styles.weekChipLabel, isActive && styles.weekChipLabelActive]}>{week.label}</Text>
                  </Pressable>
                )
              })}
            </ScrollView>
          ) : null}
          <Card style={styles.sessionCard}>
            {isLoading ? (
              <View style={styles.loadingInline}>
                <ActivityIndicator color={palette.primary} />
                <Text style={styles.loadingText}>Mise à jour des séances</Text>
              </View>
            ) : null}
            {displayedSessions.length ? (
              schedule.map(day =>
                day.sessions.length ? (
                  <View key={day.day} style={styles.sessionBlock}>
                    <Text style={styles.dayLabel}>{day.day}</Text>
                    {day.sessions.map(session => {
                      const iconName = iconByType[session.type] ?? 'activity'
                      return (
                        <Pressable
                          key={session.id}
                          style={[styles.sessionRow, session.completed && styles.sessionCompleted]}
                          onPress={() => setSelectedSession(session)}
                        >
                          <View style={styles.sessionIcon}>
                            <Feather name={iconName} size={18} color={palette.primary} />
                          </View>
                          <View style={styles.sessionContent}>
                            <View style={styles.sessionHeader}>
                              <Text style={styles.sessionName}>{session.name}</Text>
                              <Text style={[styles.sessionStatus, session.completed ? styles.statusCompleted : styles.statusPlanned]}>
                                {session.completed ? 'effectuée' : 'prévue'}
                              </Text>
                            </View>
                            <Text style={styles.sessionMeta}>
                              {formatSessionMeta(session.duration, session.distance, session.intensity)}
                            </Text>
                          </View>
                        </Pressable>
                      )
                    })}
                  </View>
                ) : null
              )
            ) : (
              <Text style={styles.noSessionText}>Aucune séance planifiée cette semaine.</Text>
            )}
          </Card>

          {prioritySessions.length ? (
            <>
              <SectionHeader title="Clés de la semaine" />
              <Card>
                {prioritySessions.map(session => (
                  <Pressable
                    key={session.id}
                    style={styles.priorityRow}
                    onPress={() => setSelectedSession(session)}
                  >
                    <Feather name="target" size={16} color={palette.primary} />
                    <View style={styles.priorityText}>
                      <Text style={styles.priorityTitle}>{session.name}</Text>
                      <Text style={styles.prioritySubtitle}>
                        {formatDate(session.date)} · Intensité {session.intensity.toLowerCase()}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </Card>
            </>
          ) : null}
        </>
      ) : null}

      {!hasPlans && !plansQuery.isLoading ? (
        <Card style={styles.emptyCard}>
          <Feather name="calendar" size={20} color={palette.primary} />
          <Text style={styles.emptyTitle}>Aucun plan actif</Text>
          <Text style={styles.emptySubtitle}>
            Commence par générer un plan pour voir la répartition hebdomadaire et les priorités.
          </Text>
          <Button onPress={handleCreatePlan} style={styles.heroButton}>
            Créer un plan
          </Button>
        </Card>
      ) : null}

      <CreatePlanModal
        visible={createModalVisible}
        onClose={() => {
          setCreateModalVisible(false)
          setFormError(null)
          setShowStartPicker(false)
          setShowEndPicker(false)
          setShowRacePicker(false)
        }}
        onSubmit={submitCreatePlan}
        loading={createPlanMutation.isPending}
        planName={planName}
        onPlanNameChange={setPlanName}
        planDescription={planDescription}
        onPlanDescriptionChange={setPlanDescription}
        startDate={startDate}
        endDate={endDate}
        showStartPicker={showStartPicker}
        showEndPicker={showEndPicker}
      setShowStartPicker={setShowStartPicker}
      setShowEndPicker={setShowEndPicker}
      onDateChange={handleDateChange}
      distanceKm={distanceKm}
      onDistanceChange={setDistanceKm}
      elevationGain={elevationGain}
      onElevationChange={setElevationGain}
      raceDate={raceDate}
      showRacePicker={showRacePicker}
      setShowRacePicker={setShowRacePicker}
      onRaceDateChange={(event, date) => {
        if (!date) {
          if (Platform.OS !== 'ios') {
            setShowRacePicker(false)
          }
          return
        }
        setRaceDate(date)
        if (Platform.OS !== 'ios') {
          setShowRacePicker(false)
        }
      }}
      formError={formError}
    />
    <SessionDetailModal session={selectedSession} onClose={() => setSelectedSession(null)} />
  </Screen>
)
}

interface CreatePlanModalProps {
  visible: boolean
  onClose: () => void
  onSubmit: () => void
  loading: boolean
  planName: string
  onPlanNameChange: (value: string) => void
  planDescription: string
  onPlanDescriptionChange: (value: string) => void
  startDate: Date
  endDate: Date
  showStartPicker: boolean
  showEndPicker: boolean
  setShowStartPicker: (value: boolean) => void
  setShowEndPicker: (value: boolean) => void
  onDateChange: (type: 'start' | 'end') => (event: DateTimePickerEvent, date?: Date) => void
  distanceKm: string
  onDistanceChange: (value: string) => void
  elevationGain: string
  onElevationChange: (value: string) => void
  raceDate: Date | null
  showRacePicker: boolean
  setShowRacePicker: (value: boolean) => void
  onRaceDateChange: (event: DateTimePickerEvent, date?: Date) => void
  formError: string | null
}

const CreatePlanModal = ({
  visible,
  onClose,
  onSubmit,
  loading,
  planName,
  onPlanNameChange,
  planDescription,
  onPlanDescriptionChange,
  startDate,
  endDate,
  showStartPicker,
  showEndPicker,
  setShowStartPicker,
  setShowEndPicker,
  onDateChange,
  distanceKm,
  onDistanceChange,
  elevationGain,
  onElevationChange,
  raceDate,
  showRacePicker,
  setShowRacePicker,
  onRaceDateChange,
  formError,
}: CreatePlanModalProps) => (
  <Modal visible={visible} animationType="slide" transparent>
    <View style={styles.modalBackdrop}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Nouveau plan</Text>
        <Input label="Nom du plan" value={planName} onChangeText={onPlanNameChange} placeholder="Bloc OCC spécifique" />
        <Input
          label="Description"
          value={planDescription}
          onChangeText={onPlanDescriptionChange}
          placeholder="Objectifs, contraintes..."
        />
        <View style={styles.dateRow}>
          <Pressable style={styles.datePicker} onPress={() => setShowStartPicker(true)}>
            <Text style={styles.dateLabel}>Début</Text>
            <Text style={styles.dateValue}>{formatDate(startDate.toISOString())}</Text>
          </Pressable>
          <Pressable style={styles.datePicker} onPress={() => setShowEndPicker(true)}>
            <Text style={styles.dateLabel}>Fin</Text>
            <Text style={styles.dateValue}>{formatDate(endDate.toISOString())}</Text>
          </Pressable>
        </View>
        <View style={styles.metricRow}>
          <View style={styles.metricColumn}>
            <Input
              label="Distance cible (km)"
              value={distanceKm}
              onChangeText={onDistanceChange}
              placeholder="50"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.metricColumn}>
            <Input
              label="D+ cible (m)"
              value={elevationGain}
              onChangeText={onElevationChange}
              placeholder="2500"
              keyboardType="number-pad"
            />
          </View>
        </View>
        <Pressable style={[styles.datePicker, styles.datePickerFull]} onPress={() => setShowRacePicker(true)}>
          <Text style={styles.dateLabel}>Course</Text>
          <Text style={styles.dateValue}>{raceDate ? formatDate(raceDate.toISOString()) : 'Sélectionner'}</Text>
        </Pressable>
        {formError ? <Text style={styles.error}>{formError}</Text> : null}
        <View style={styles.modalActions}>
          <Button onPress={onClose} variant="ghost" style={styles.modalButton}>
            Annuler
          </Button>
          <Button onPress={onSubmit} loading={loading} style={styles.modalButton}>
            Créer
          </Button>
        </View>

        {(showStartPicker || showEndPicker || showRacePicker) && Platform.OS !== 'android' ? (
          <View style={styles.inlinePicker}>
            {showStartPicker ? (
              <DateTimePicker value={startDate} mode="date" onChange={onDateChange('start')} />
            ) : null}
            {showEndPicker ? <DateTimePicker value={endDate} mode="date" onChange={onDateChange('end')} /> : null}
            {showRacePicker ? (
              <DateTimePicker value={raceDate ?? endDate} mode="date" onChange={onRaceDateChange} />
            ) : null}
          </View>
        ) : null}

        {showStartPicker && Platform.OS === 'android' ? (
          <DateTimePicker value={startDate} mode="date" onChange={onDateChange('start')} />
        ) : null}
        {showEndPicker && Platform.OS === 'android' ? (
          <DateTimePicker value={endDate} mode="date" onChange={onDateChange('end')} />
        ) : null}
        {showRacePicker && Platform.OS === 'android' ? (
          <DateTimePicker value={raceDate ?? endDate} mode="date" onChange={onRaceDateChange} />
        ) : null}
      </View>
    </View>
  </Modal>
)

interface SessionDetailModalProps {
  session: TrainingSession | null
  onClose: () => void
}

const SessionDetailModal = ({ session, onClose }: SessionDetailModalProps) => {
  if (!session) return null

  const iconName = iconByType[session.type] ?? 'activity'
  const distanceLabel = session.distance ? `${session.distance.toFixed(1)} km` : '—'
  const durationLabel = session.duration ? `${session.duration} min` : '—'
  const intensityLabel = session.intensity ? session.intensity.toLowerCase().replace(/_/g, ' ') : '—'

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.sessionDetailBackdrop}>
        <View style={styles.sessionDetailContent}>
          <View style={styles.sessionDetailHeader}>
            <View style={styles.sessionDetailIcon}>
              <Feather name={iconName} size={18} color={palette.background} />
            </View>
            <View style={styles.sessionDetailTitleBlock}>
              <Text style={styles.sessionDetailTitle}>{session.name}</Text>
              <Text style={styles.sessionDetailMeta}>
                {formatDate(session.date)} · {session.type.toLowerCase()}
              </Text>
            </View>
          </View>
          <View style={styles.sessionDetailStats}>
            <View style={styles.sessionDetailStat}>
              <Text style={styles.sessionDetailStatLabel}>Durée</Text>
              <Text style={styles.sessionDetailStatValue}>{durationLabel}</Text>
            </View>
            <View style={styles.sessionDetailStat}>
              <Text style={styles.sessionDetailStatLabel}>Distance</Text>
              <Text style={styles.sessionDetailStatValue}>{distanceLabel}</Text>
            </View>
            <View style={styles.sessionDetailStat}>
              <Text style={styles.sessionDetailStatLabel}>Intensité</Text>
              <Text style={styles.sessionDetailStatValue}>{intensityLabel}</Text>
            </View>
          </View>
          {session.description ? (
            <View style={styles.sessionDetailNotes}>
              <Text style={styles.sessionDetailNotesTitle}>Notes</Text>
              <Text style={styles.sessionDetailNotesText}>{session.description}</Text>
            </View>
          ) : null}
          <Button onPress={onClose} variant="ghost" style={styles.modalButton}>
            Fermer
          </Button>
        </View>
      </View>
    </Modal>
  )
}

const formatSessionMeta = (duration?: number | null, distance?: number | null, intensity?: string | null) => {
  const segments: string[] = []
  if (duration) segments.push(`${duration} min`)
  if (distance) segments.push(`${distance.toFixed(1)} km`)
  if (intensity) segments.push(intensity.toLowerCase())
  return segments.join(' • ')
}

const addWeeks = (date: Date, weeks: number) => {
  const result = new Date(date)
  result.setDate(result.getDate() + weeks * 7)
  return result
}

const startOfWeek = (date: Date) => {
  const result = new Date(date)
  const day = result.getDay()
  const diff = (day + 6) % 7
  result.setDate(result.getDate() - diff)
  result.setHours(0, 0, 0, 0)
  return result
}

const getWeekNumber = (date: Date) => {
  const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = temp.getUTCDay() || 7
  temp.setUTCDate(temp.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1))
  return Math.ceil(((temp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

const getWeekKey = (date: Date) => `${date.getFullYear()}-W${getWeekNumber(date)}`

const formatWeekChip = (weekStart: Date) => {
  const formatter = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' })
  return `S${getWeekNumber(weekStart)} · ${formatter.format(weekStart)}`
}

const styles = StyleSheet.create({
  heroCard: {
    gap: spacing(1.5),
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTitle: {
    color: palette.primary,
    fontSize: typography.section,
    fontWeight: '600',
  },
  heroMeta: {
    color: palette.muted,
    fontSize: typography.caption,
  },
  heroSubtitle: {
    color: palette.secondary,
    fontSize: typography.body,
    lineHeight: 20,
  },
  heroButton: {
    marginTop: spacing(0.5),
  },
  loadingCard: {
    marginTop: spacing(2),
    alignItems: 'center',
    gap: spacing(1),
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
  planSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(1),
    marginBottom: spacing(1),
  },
  weekSelector: {
    marginBottom: spacing(1.5),
  },
  weekSelectorContent: {
    gap: spacing(1),
    paddingRight: spacing(1),
  },
  weekChip: {
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(0.75),
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: palette.border,
  },
  weekChipActive: {
    borderColor: palette.primary,
    backgroundColor: palette.surfaceMuted,
  },
  weekChipLabel: {
    color: palette.secondary,
    fontSize: typography.caption,
  },
  weekChipLabelActive: {
    color: palette.primary,
    fontWeight: '600',
  },
  planChip: {
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(0.75),
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: palette.border,
  },
  planChipActive: {
    borderColor: palette.primary,
    backgroundColor: palette.surfaceMuted,
  },
  planChipLabel: {
    color: palette.secondary,
    fontSize: typography.caption,
  },
  planChipLabelActive: {
    color: palette.primary,
    fontWeight: '600',
  },
  sessionCard: {
    gap: spacing(1.5),
  },
  sessionBlock: {
    gap: spacing(1),
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    paddingBottom: spacing(1.5),
  },
  dayLabel: {
    color: palette.secondary,
    fontSize: typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sessionRow: {
    flexDirection: 'row',
    gap: spacing(1),
    alignItems: 'center',
  },
  sessionCompleted: {
    opacity: 0.7,
  },
  sessionIcon: {
    width: spacing(4),
    height: spacing(4),
    borderRadius: radii.sm,
    backgroundColor: palette.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionContent: {
    flex: 1,
    gap: spacing(0.5),
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionName: {
    color: palette.primary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  sessionStatus: {
    fontSize: typography.micro,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statusCompleted: {
    color: '#7AD66C',
  },
  statusPlanned: {
    color: palette.secondary,
  },
  sessionMeta: {
    color: palette.muted,
    fontSize: typography.caption,
  },
  noSessionText: {
    color: palette.muted,
    fontSize: typography.caption,
    textAlign: 'center',
    paddingVertical: spacing(2),
  },
  priorityRow: {
    flexDirection: 'row',
    gap: spacing(1),
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    paddingVertical: spacing(1),
  },
  priorityText: {
    gap: spacing(0.5),
  },
  priorityTitle: {
    color: palette.primary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  prioritySubtitle: {
    color: palette.secondary,
    fontSize: typography.caption,
  },
  emptyCard: {
    marginTop: spacing(2),
    gap: spacing(1),
    alignItems: 'center',
  },
  emptyTitle: {
    color: palette.primary,
    fontSize: typography.section,
    fontWeight: '600',
  },
  emptySubtitle: {
    color: palette.secondary,
    fontSize: typography.caption,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: palette.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: palette.surface,
    padding: spacing(2),
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    gap: spacing(1.5),
  },
  metricRow: {
    flexDirection: 'row',
    gap: spacing(1),
  },
  metricColumn: {
    flex: 1,
    alignSelf: 'stretch',
  },
  modalTitle: {
    color: palette.primary,
    fontSize: typography.section,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing(1),
  },
  datePicker: {
    flex: 1,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing(1),
    backgroundColor: palette.surfaceMuted,
  },
  dateLabel: {
    color: palette.muted,
    fontSize: typography.micro,
    textTransform: 'uppercase',
  },
  dateValue: {
    color: palette.primary,
    fontSize: typography.body,
    fontWeight: '600',
    marginTop: spacing(0.5),
  },
  datePickerFull: {
    marginTop: spacing(1),
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing(1),
  },
  modalButton: {
    flex: 1,
  },
  inlinePicker: {
    gap: spacing(1),
  },
  error: {
    color: '#D96C6C',
    fontSize: typography.caption,
  },
  sessionDetailBackdrop: {
    flex: 1,
    backgroundColor: palette.overlay,
    justifyContent: 'flex-end',
  },
  sessionDetailContent: {
    backgroundColor: palette.surface,
    padding: spacing(2),
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    gap: spacing(1.5),
  },
  sessionDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
  },
  sessionDetailIcon: {
    width: spacing(4),
    height: spacing(4),
    borderRadius: radii.sm,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionDetailTitleBlock: {
    gap: spacing(0.25),
  },
  sessionDetailTitle: {
    color: palette.primary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  sessionDetailMeta: {
    color: palette.muted,
    fontSize: typography.caption,
  },
  sessionDetailStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing(1),
  },
  sessionDetailStat: {
    flex: 1,
    gap: spacing(0.25),
  },
  sessionDetailStatLabel: {
    color: palette.muted,
    fontSize: typography.caption,
    textTransform: 'uppercase',
  },
  sessionDetailStatValue: {
    color: palette.primary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  sessionDetailNotes: {
    gap: spacing(0.5),
  },
  sessionDetailNotesTitle: {
    color: palette.secondary,
    fontSize: typography.caption,
    textTransform: 'uppercase',
  },
  sessionDetailNotesText: {
    color: palette.secondary,
    fontSize: typography.caption,
    lineHeight: 18,
  },
})

export default PlannerScreen
