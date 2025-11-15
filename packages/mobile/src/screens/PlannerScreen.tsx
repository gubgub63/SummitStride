import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableWithoutFeedback,
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
import {
  deleteTrainingPlan,
  generateTrainingPlan,
  getTrainingPlanById,
  getTrainingPlans,
  type TrainingSession,
} from '../services/training'
import { getRegistrations, type RaceRegistration } from '../services/registrations'
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

const REGISTRATION_STATUS_LABELS: Record<string, string> = {
  REGISTERED: 'Inscrit',
  PREPARATION: 'Préparation',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
}

const REGISTRATION_STATUS_TONE: Record<string, string> = {
  REGISTERED: '#23C076',
  PREPARATION: '#FFB020',
  COMPLETED: '#8E8EA0',
  CANCELLED: '#C94C4C',
}

const PlannerScreen = () => {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [createModalVisible, setCreateModalVisible] = useState(false)

  const [startDate, setStartDate] = useState(() => new Date())
  const [endDate, setEndDate] = useState(() => addWeeks(new Date(), 12))
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)
  const [targetRaceId, setTargetRaceId] = useState<string | null>(null)
  const [sessionsPerWeek, setSessionsPerWeek] = useState('')
  const [maxSessionDuration, setMaxSessionDuration] = useState('')
  const [includeStrength, setIncludeStrength] = useState(true)
  const [includeCrossTraining, setIncludeCrossTraining] = useState(false)
  const [selectedWeekKey, setSelectedWeekKey] = useState<string | null>(null)
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const plansQuery = useQuery({
    queryKey: ['training-plans'],
    queryFn: () => getTrainingPlans(token!),
    enabled: Boolean(token),
  })

  const registrationsQuery = useQuery({
    queryKey: ['registrations'],
    queryFn: () => getRegistrations(token!),
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 5,
  })

  const registrations = registrationsQuery.data?.registrations ?? []
  const handleSelectRace = (raceId: string) => {
    const registration = registrations.find(reg => reg.id === raceId)
    if (!registration) return

    setTargetRaceId(registration.course.id)
    setFormError(null)
    if (registration?.targetDate) {
      const targetDate = new Date(registration.targetDate)
      setEndDate(targetDate)
      const suggestedStart = addWeeks(targetDate, -12)
      if (suggestedStart < targetDate) {
        setStartDate(suggestedStart)
      }
    }
  }

  useEffect(() => {
    if (!plansQuery.data?.data?.length) return
    if (selectedPlanId) return
    const active = plansQuery.data.data.find(plan => plan.status === 'ACTIVE') ?? plansQuery.data.data[0]
    setSelectedPlanId(active.id)
  }, [plansQuery.data, selectedPlanId])

useEffect(() => {
  setSelectedSession(null)
}, [selectedPlanId])

useEffect(() => {
  if (createModalVisible && registrations.length > 0 && !targetRaceId) {
    handleSelectRace(registrations[0].id)
  }
}, [createModalVisible, registrations, targetRaceId])

  const selectedPlan = useMemo(() => {
    return plansQuery.data?.data.find(plan => plan.id === selectedPlanId)
  }, [plansQuery.data, selectedPlanId])

  const planDetailsQuery = useQuery({
    queryKey: ['training-plan', selectedPlanId],
    queryFn: () => getTrainingPlanById(token!, selectedPlanId!),
    enabled: Boolean(token && selectedPlanId),
  })

  const generatePlanMutation = useMutation({
    mutationFn: () => {
      const preferences: {
        sessionsPerWeek?: number
        maxSessionDuration?: number
        includeStrength: boolean
        includeCrossTraining: boolean
      } = {
        includeStrength,
        includeCrossTraining,
      }

      const sessionsValue = Number.parseInt(sessionsPerWeek, 10)
      if (!Number.isNaN(sessionsValue) && sessionsValue > 0) {
        preferences.sessionsPerWeek = sessionsValue
      }

      const durationValue = Number.parseInt(maxSessionDuration, 10)
      if (!Number.isNaN(durationValue) && durationValue > 0) {
        preferences.maxSessionDuration = durationValue
      }

      return generateTrainingPlan(token!, {
        targetRaceId: targetRaceId!,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        preferences,
      })
    },
    onSuccess: async response => {
      const newPlanId = response.data.plan.id
      const firstSession = response.data.sessions[0]

      setCreateModalVisible(false)
      setTargetRaceId(null)
      setSessionsPerWeek('')
      setMaxSessionDuration('')
      setIncludeStrength(true)
      setIncludeCrossTraining(false)
      setStartDate(new Date())
      setEndDate(addWeeks(new Date(), 12))
      setShowStartPicker(false)
      setShowEndPicker(false)
      setSelectedWeekKey(firstSession ? getWeekKey(new Date(firstSession.date)) : null)
      setSelectedSession(null)
      setFormError(null)

      await queryClient.invalidateQueries({ queryKey: ['training-plans'] })
      await queryClient.invalidateQueries({ queryKey: ['training-plan', newPlanId] })

      setSelectedPlanId(newPlanId)
    },
    onError: error => {
      console.error(error)
      setFormError(error instanceof Error ? error.message : 'Création impossible.')
    },
  })

  const deletePlanMutation = useMutation({
    mutationFn: (planId: string) => deleteTrainingPlan(token!, planId),
    onSuccess: async () => {
      setSelectedSession(null)
      setSelectedWeekKey(null)
      setSelectedPlanId(null)
      await queryClient.invalidateQueries({ queryKey: ['training-plans'] })
      await queryClient.invalidateQueries({ queryKey: ['training-plan'] })
    },
    onError: error => {
      console.error(error)
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

  const handleDeletePlan = () => {
    if (!selectedPlanId || deletePlanMutation.isPending) return
    Alert.alert(
      'Supprimer le plan',
      'Cette action supprimera toutes les séances générées pour ce plan.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => deletePlanMutation.mutate(selectedPlanId),
        },
      ]
    )
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
    if (generatePlanMutation.isPending) {
      return
    }
    if (!registrations.length) {
      setFormError('Ajoute une inscription à une course avant de générer un plan.')
      return
    }
    if (!targetRaceId) {
      setFormError('Sélectionne une course cible.')
      return
    }
    if (endDate <= startDate) {
      setFormError('La date de fin doit être postérieure au début.')
      return
    }
    setFormError(null)
    generatePlanMutation.mutate()
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
        {selectedPlan ? (
          <Button
            onPress={handleDeletePlan}
            variant="ghost"
            style={styles.heroSecondaryButton}
            loading={deletePlanMutation.isPending}
          >
            Supprimer le plan
          </Button>
        ) : null}
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
        }}
        onSubmit={submitCreatePlan}
        loading={generatePlanMutation.isPending}
        startDate={startDate}
        endDate={endDate}
        showStartPicker={showStartPicker}
        showEndPicker={showEndPicker}
        setShowStartPicker={setShowStartPicker}
        setShowEndPicker={setShowEndPicker}
        onDateChange={handleDateChange}
        registrations={registrations}
        registrationsLoading={registrationsQuery.isLoading}
        selectedRaceId={targetRaceId}
        onSelectRace={handleSelectRace}
        sessionsPerWeek={sessionsPerWeek}
        onSessionsPerWeekChange={setSessionsPerWeek}
        maxSessionDuration={maxSessionDuration}
        onMaxSessionDurationChange={setMaxSessionDuration}
        includeStrength={includeStrength}
        onToggleIncludeStrength={setIncludeStrength}
        includeCrossTraining={includeCrossTraining}
        onToggleIncludeCrossTraining={setIncludeCrossTraining}
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
  startDate: Date
  endDate: Date
  showStartPicker: boolean
  showEndPicker: boolean
  setShowStartPicker: (value: boolean) => void
  setShowEndPicker: (value: boolean) => void
  onDateChange: (type: 'start' | 'end') => (event: DateTimePickerEvent, date?: Date) => void
  registrations: RaceRegistration[]
  registrationsLoading: boolean
  selectedRaceId: string | null
  onSelectRace: (raceId: string) => void
  sessionsPerWeek: string
  onSessionsPerWeekChange: (value: string) => void
  maxSessionDuration: string
  onMaxSessionDurationChange: (value: string) => void
  includeStrength: boolean
  onToggleIncludeStrength: (value: boolean) => void
  includeCrossTraining: boolean
  onToggleIncludeCrossTraining: (value: boolean) => void
  formError: string | null
}

const CreatePlanModal = ({
  visible,
  onClose,
  onSubmit,
  loading,
  startDate,
  endDate,
  showStartPicker,
  showEndPicker,
  setShowStartPicker,
  setShowEndPicker,
  onDateChange,
  registrations,
  registrationsLoading,
  selectedRaceId,
  onSelectRace,
  sessionsPerWeek,
  onSessionsPerWeekChange,
  maxSessionDuration,
  onMaxSessionDurationChange,
  includeStrength,
  onToggleIncludeStrength,
  includeCrossTraining,
  onToggleIncludeCrossTraining,
  formError,
}: CreatePlanModalProps) => {
  const canSubmit = !!selectedRaceId && registrations.length > 0 && !loading
  const isIOS = Platform.OS === 'ios'
  const pickerDisplay: 'default' | 'spinner' | 'compact' | 'inline' = isIOS ? 'spinner' : 'default'
  const pickerThemeVariant = isIOS ? 'light' : undefined
  const shouldStackPickers = isIOS && (showStartPicker || showEndPicker)

  const handleToggleStartPicker = () => {
    if (Platform.OS === 'android') {
      setShowStartPicker(true)
      setShowEndPicker(false)
      return
    }
    setShowStartPicker(prev => {
      const next = !prev
      if (next) setShowEndPicker(false)
      return next
    })
  }

  const handleToggleEndPicker = () => {
    if (Platform.OS === 'android') {
      setShowEndPicker(true)
      setShowStartPicker(false)
      return
    }
    setShowEndPicker(prev => {
      const next = !prev
      if (next) setShowStartPicker(false)
      return next
    })
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Générer un plan automatique</Text>
          <Text style={styles.modalSubtitle}>
            Sélectionne une course enregistrée et ajuste la fenêtre d'entraînement.
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Course cible</Text>
            {registrationsLoading ? (
              <ActivityIndicator color={palette.primary} />
            ) : registrations.length ? (
              <ScrollView style={styles.registrationList}>
                {registrations.map(registration => {
                  const isActive = registration.id === selectedRaceId
                  const targetDate = registration.targetDate
                    ? new Date(registration.targetDate)
                    : null
                  const targetDateLabel = targetDate
                    ? new Intl.DateTimeFormat('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      }).format(targetDate)
                    : 'Date à confirmer'
                  const statusLabel = REGISTRATION_STATUS_LABELS[registration.status] ?? registration.status
                  const statusTone = REGISTRATION_STATUS_TONE[registration.status] ?? palette.muted

                  return (
                    <Pressable
                      key={registration.id}
                      style={[
                        styles.registrationItem,
                        isActive && styles.registrationItemActive,
                      ]}
                      onPress={() => onSelectRace(registration.id)}
                    >
                      <View style={styles.registrationRow}>
                        <View style={styles.registrationInfo}>
                          <Text style={styles.registrationTitle}>{registration.course.name}</Text>
                          <Text style={styles.registrationSubtitle}>
                            {registration.course.distance} km · {targetDateLabel}
                          </Text>
                          <Text style={styles.registrationMeta}>
                            D+ {registration.course.elevationGain ?? 0} m · {registration.course.difficulty}
                          </Text>
                        </View>
                        <View
                          style={[styles.registrationStatus, { backgroundColor: `${statusTone}22`, borderColor: statusTone }]}
                        >
                          <Text style={[styles.registrationStatusLabel, { color: statusTone }]}>{statusLabel}</Text>
                        </View>
                      </View>
                    </Pressable>
                  )
                })}
              </ScrollView>
            ) : (
              <Text style={styles.emptyRegistrations}>
                Aucun dossard enregistré. Ajoute une course depuis la web app (onglet Courses).
              </Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Fenêtre d'entraînement</Text>
            <View style={[styles.dateRow, shouldStackPickers && styles.dateRowStacked]}>
              <View style={[styles.datePickerColumn, shouldStackPickers && styles.datePickerColumnFull]}>
                <Pressable style={styles.datePicker} onPress={handleToggleStartPicker}>
                  <Text style={styles.dateLabel}>Début</Text>
                  <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
                </Pressable>
                {Platform.OS !== 'android' && showStartPicker ? (
                  <View style={styles.inlinePicker}>
                    <DateTimePicker
                      value={startDate}
                      mode="date"
                      display={pickerDisplay}
                      themeVariant={pickerThemeVariant}
                      textColor={isIOS ? '#000000' : undefined}
                      onChange={onDateChange('start')}
                    />
                  </View>
                ) : null}
              </View>
              <View style={[styles.datePickerColumn, shouldStackPickers && styles.datePickerColumnFull]}>
                <Pressable style={styles.datePicker} onPress={handleToggleEndPicker}>
                  <Text style={styles.dateLabel}>Fin</Text>
                  <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
                </Pressable>
                {Platform.OS !== 'android' && showEndPicker ? (
                  <View style={styles.inlinePicker}>
                    <DateTimePicker
                      value={endDate}
                      mode="date"
                      display={pickerDisplay}
                      themeVariant={pickerThemeVariant}
                      textColor={isIOS ? '#000000' : undefined}
                      onChange={onDateChange('end')}
                    />
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Paramètres</Text>
            <Input
              label="Séances / semaine"
              value={sessionsPerWeek}
              onChangeText={onSessionsPerWeekChange}
              placeholder="4"
              keyboardType="number-pad"
            />
            <Input
              label="Durée max d'une séance (min)"
              value={maxSessionDuration}
              onChangeText={onMaxSessionDurationChange}
              placeholder="120"
              keyboardType="number-pad"
            />
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Inclure renforcement</Text>
              <Switch
                value={includeStrength}
                onValueChange={onToggleIncludeStrength}
                trackColor={{ true: palette.primary, false: palette.surfaceMuted }}
                thumbColor={includeStrength ? palette.background : palette.surface}
              />
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Inclure cross-training</Text>
              <Switch
                value={includeCrossTraining}
                onValueChange={onToggleIncludeCrossTraining}
                trackColor={{ true: palette.primary, false: palette.surfaceMuted }}
                thumbColor={includeCrossTraining ? palette.background : palette.surface}
              />
            </View>
          </View>

          {formError ? <Text style={styles.error}>{formError}</Text> : null}

          <View style={styles.modalActions}>
            <Button onPress={onClose} variant="ghost" style={styles.modalButton}>
              Annuler
            </Button>
            <Button
              onPress={() => {
                if (canSubmit) onSubmit()
              }}
              loading={loading}
              style={[styles.modalButton, !canSubmit && styles.disabledButton]}
            >
              Générer le plan
            </Button>
          </View>

          {showStartPicker && Platform.OS === 'android' ? (
            <DateTimePicker value={startDate} mode="date" onChange={onDateChange('start')} />
          ) : null}
          {showEndPicker && Platform.OS === 'android' ? (
            <DateTimePicker value={endDate} mode="date" onChange={onDateChange('end')} />
          ) : null}
        </View>
      </View>
    </Modal>
  )
}

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
      <Pressable style={styles.sessionDetailBackdrop} onPress={onClose}>
        <TouchableWithoutFeedback>
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
        </TouchableWithoutFeedback>
      </Pressable>
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
  heroSecondaryButton: {
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
  modalSubtitle: {
    color: palette.muted,
    fontSize: typography.caption,
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
  modalTitle: {
    color: palette.primary,
    fontSize: typography.section,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing(1),
  },
  dateRowStacked: {
    flexDirection: 'column',
  },
  datePickerColumn: {
    flex: 1,
    gap: spacing(0.5),
  },
  datePickerColumnFull: {
    width: '100%',
  },
  datePicker: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing(1),
    backgroundColor: palette.surfaceMuted,
    width: '100%',
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
  modalActions: {
    flexDirection: 'row',
    gap: spacing(1),
  },
  modalButton: {
    flex: 1,
  },
  disabledButton: {
    opacity: 0.5,
  },
  inlinePicker: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  error: {
    color: '#D96C6C',
    fontSize: typography.caption,
  },
  registrationList: {
    maxHeight: spacing(20),
  },
  registrationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing(1),
  },
  registrationInfo: {
    flex: 1,
    gap: spacing(0.25),
  },
  registrationItem: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: palette.border,
    paddingVertical: spacing(1.25),
    paddingHorizontal: spacing(1.5),
    marginBottom: spacing(1),
    gap: spacing(0.25),
  },
  registrationItemActive: {
    borderColor: palette.primary,
    backgroundColor: palette.surfaceMuted,
  },
  registrationTitle: {
    color: palette.primary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  registrationSubtitle: {
    color: palette.muted,
    fontSize: typography.caption,
  },
  registrationMeta: {
    color: palette.subtle,
    fontSize: typography.micro,
    textTransform: 'uppercase',
  },
  registrationStatus: {
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing(1),
    paddingVertical: spacing(0.25),
  },
  registrationStatusLabel: {
    fontSize: typography.micro,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  emptyRegistrations: {
    color: palette.muted,
    fontSize: typography.caption,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    color: palette.secondary,
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
