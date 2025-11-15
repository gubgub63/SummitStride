import { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { Feather } from '@expo/vector-icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Input } from '../components/Input'
import { Screen } from '../components/Screen'
import { SectionHeader } from '../components/SectionHeader'
import { useAuth } from '../context/AuthContext'
import {
  createRegistration,
  deleteRegistration,
  getRegistrations,
  type RaceRegistration,
} from '../services/registrations'
import { createCourse, getCourses, type CourseListItem } from '../services/courses'
import { palette, radii, spacing, typography } from '../theme'

const STATUS_LABELS: Record<string, string> = {
  REGISTERED: 'Inscrit',
  PREPARATION: 'Préparation',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
  DNS: 'DNS',
  DNF: 'DNF',
}

const STATUS_TONE: Record<string, string> = {
  REGISTERED: '#23C076',
  PREPARATION: '#FFB020',
  COMPLETED: '#8E8EA0',
  CANCELLED: '#C94C4C',
  DNS: '#8E8EA0',
  DNF: '#C94C4C',
}

const RaceManagerScreen = () => {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  const [courseSearch, setCourseSearch] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<CourseListItem | null>(null)
  const [registrationModalVisible, setRegistrationModalVisible] = useState(false)
  const [courseModalVisible, setCourseModalVisible] = useState(false)
  const [targetDate, setTargetDate] = useState<Date | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [goal, setGoal] = useState('')
  const [notes, setNotes] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [courseName, setCourseName] = useState('')
  const [courseLocation, setCourseLocation] = useState('')
  const [courseDistance, setCourseDistance] = useState('')
  const [courseElevationGain, setCourseElevationGain] = useState('')
  const [courseElevationLoss, setCourseElevationLoss] = useState('')
  const [courseDescription, setCourseDescription] = useState('')
  const [courseFormError, setCourseFormError] = useState<string | null>(null)

  const registrationsQuery = useQuery({
    queryKey: ['registrations'],
    queryFn: () => getRegistrations(token!),
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 2,
  })

  const coursesQuery = useQuery({
    queryKey: ['courses', courseSearch],
    queryFn: () => getCourses(token ?? null, { search: courseSearch, limit: 40 }),
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 2,
  })

  const registrations = registrationsQuery.data?.registrations ?? []
  const summary = registrationsQuery.data?.summary
  const courses = coursesQuery.data?.courses ?? []

  const createRegistrationMutation = useMutation({
    mutationFn: () =>
      createRegistration(token!, {
        courseId: selectedCourse!.id,
        targetDate: targetDate ? targetDate.toISOString() : undefined,
        goal: goal.trim() || undefined,
        notes: notes.trim() || undefined,
      }),
    onSuccess: async () => {
      setRegistrationModalVisible(false)
      setSelectedCourse(null)
      setTargetDate(null)
      setGoal('')
      setNotes('')
      setFormError(null)
      await queryClient.invalidateQueries({ queryKey: ['registrations'] })
    },
    onError: error => {
      setFormError(error instanceof Error ? error.message : "Impossible d'enregistrer la course.")
    },
  })

  const deleteRegistrationMutation = useMutation({
    mutationFn: (registrationId: string) => deleteRegistration(token!, registrationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['registrations'] })
    },
  })

  const createCourseMutation = useMutation({
    mutationFn: () =>
      createCourse(token!, {
        name: courseName.trim(),
        location: courseLocation.trim(),
        distance: Number.parseFloat(courseDistance),
        elevationGain: Number.parseFloat(courseElevationGain),
        elevationLoss: Number.parseFloat(
          courseElevationLoss || courseElevationGain || '0'
        ),
        description: courseDescription.trim() || undefined,
      }),
    onSuccess: async response => {
      setCourseModalVisible(false)
      setCourseName('')
      setCourseLocation('')
      setCourseDistance('')
      setCourseElevationGain('')
      setCourseElevationLoss('')
      setCourseDescription('')
      setCourseFormError(null)
      await queryClient.invalidateQueries({ queryKey: ['courses'] })
      await queryClient.invalidateQueries({ queryKey: ['registrations'] })
      if (response.course) {
        setSelectedCourse(response.course)
        setRegistrationModalVisible(true)
      }
    },
    onError: error => {
      setCourseFormError(error instanceof Error ? error.message : 'Création impossible.')
    },
  })

  const isLoading = registrationsQuery.isLoading
  const coursesLoading = coursesQuery.isLoading

  const registrationSubtitle = useMemo(() => {
    if (!summary) return null
    return `${summary.active} actives • ${summary.upcoming} à venir • ${summary.completed} terminées`
  }, [summary])

  const handleOpenRegistration = (course: CourseListItem) => {
    setSelectedCourse(course)
    setRegistrationModalVisible(true)
    setTargetDate(null)
    setGoal('')
    setNotes('')
    setFormError(null)
    setShowDatePicker(false)
  }

  const handleCloseModal = () => {
    setRegistrationModalVisible(false)
    setFormError(null)
    setShowDatePicker(false)
  }

  const submitRegistration = () => {
    if (!selectedCourse || createRegistrationMutation.isPending) return
    setFormError(null)
    createRegistrationMutation.mutate()
  }

  const handleDeleteRegistration = (registration: RaceRegistration) => {
    if (deleteRegistrationMutation.isPending) return
    Alert.alert(
      'Supprimer la course',
      `Retirer ${registration.course.name} de tes objectifs ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => deleteRegistrationMutation.mutate(registration.id),
        },
      ]
    )
  }

  const renderRegistrationCard = (registration: RaceRegistration) => {
    const statusLabel = STATUS_LABELS[registration.status] ?? registration.status
    const tone = STATUS_TONE[registration.status] ?? palette.muted
    const targetDateLabel = registration.targetDate
      ? new Date(registration.targetDate).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : 'Date à confirmer'

    return (
      <Card key={registration.id} style={styles.registrationCard}>
        <View style={styles.registrationHeader}>
          <View style={[styles.registrationStatusPill, { backgroundColor: `${tone}22`, borderColor: tone }]}>
            <Text style={[styles.registrationStatusText, { color: tone }]}>{statusLabel}</Text>
          </View>
          <Pressable
            onPress={() => handleDeleteRegistration(registration)}
            disabled={deleteRegistrationMutation.isPending}
          >
            <Feather name="trash-2" size={16} color={palette.muted} />
          </Pressable>
        </View>
        <View style={styles.registrationBody}>
          <Text style={styles.registrationTitle}>{registration.course.name}</Text>
          <Text style={styles.registrationMeta}>
            {registration.course.location} • {registration.course.distance} km • D+ {registration.course.elevationGain} m
          </Text>
          <Text style={styles.registrationMeta}>Difficulté {registration.course.difficulty}</Text>
          <Text style={styles.registrationDate}>Course prévue : {targetDateLabel}</Text>
          {registration.goal ? (
            <Text style={styles.registrationGoal}>Objectif : {registration.goal}</Text>
          ) : null}
          {registration.notes ? (
            <Text style={styles.registrationNotes}>{registration.notes}</Text>
          ) : null}
        </View>
      </Card>
    )
  }

  return (
    <Screen>
      <SectionHeader title="Mes courses" subtitle={registrationSubtitle ?? undefined} />
      {isLoading ? (
        <Card style={styles.loadingCard}>
          <ActivityIndicator color={palette.primary} />
          <Text style={styles.loadingText}>Chargement de tes inscriptions…</Text>
        </Card>
      ) : registrations.length ? (
        registrations.map(renderRegistrationCard)
      ) : (
        <Card style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Aucune course enregistrée</Text>
          <Text style={styles.emptySubtitle}>
            Inscris-toi à une course dans la section suivante pour générer un plan dédié.
          </Text>
        </Card>
      )}

      <SectionHeader title="Explorer & s'inscrire" />
      <Card style={styles.searchCard}>
        <Input
          label="Recherche"
          value={courseSearch}
          onChangeText={setCourseSearch}
          placeholder="Nom, lieu, difficulté..."
        />
        <Button onPress={() => setCourseModalVisible(true)}>Ajouter une course</Button>
      </Card>

      {coursesLoading ? (
        <Card style={styles.loadingCard}>
          <ActivityIndicator color={palette.primary} />
          <Text style={styles.loadingText}>Recherche des courses…</Text>
        </Card>
      ) : courses.length ? (
        <ScrollView style={styles.courseList}>
          {courses.map(course => (
            <Card key={course.id} style={styles.courseCard}>
              <View style={styles.courseHeader}>
                <Text style={styles.courseTitle}>{course.name}</Text>
                <View style={styles.courseBadge}>
                  <Text style={styles.courseBadgeText}>{course.difficulty}</Text>
                </View>
              </View>
              <Text style={styles.courseMeta}>
                {course.location} • {course.distance} km • D+ {course.elevationGain} m
              </Text>
              <Text style={styles.courseMeta}>Catégorie {course.category}</Text>
              {course.registrationCount ? (
                <Text style={styles.courseMeta}>{course.registrationCount} inscrits</Text>
              ) : null}
              {course.description ? (
                <Text style={styles.courseDescription} numberOfLines={3}>
                  {course.description}
                </Text>
              ) : null}
              <Button onPress={() => handleOpenRegistration(course)} style={styles.courseButton}>
                S'inscrire
              </Button>
            </Card>
          ))}
        </ScrollView>
      ) : (
        <Card style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Aucune course trouvée</Text>
          <Text style={styles.emptySubtitle}>
            Essaye une autre recherche ou ajoute un nouveau parcours depuis la web app.
          </Text>
        </Card>
      )}

      <Modal visible={registrationModalVisible} animationType="slide" transparent onRequestClose={handleCloseModal}>
        <Pressable style={styles.modalBackdrop} onPress={handleCloseModal}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalCourseHeader}>
                <Text style={styles.modalTitle}>Nouvelle inscription</Text>
                {selectedCourse ? (
                  <Text style={styles.modalSubtitle}>
                    {selectedCourse.name} • {selectedCourse.distance} km · {selectedCourse.location}
                  </Text>
                ) : null}
              </View>

              <Pressable style={styles.datePicker} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateLabel}>Date de la course</Text>
                <Text style={styles.dateValue}>
                  {targetDate
                    ? targetDate.toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Sélectionner une date'}
                </Text>
              </Pressable>

              <Input
                label="Objectif"
                value={goal}
                onChangeText={setGoal}
                placeholder="Sous les 10h, finir, top 50…"
              />
              <Input
                label="Notes"
                value={notes}
                onChangeText={setNotes}
                placeholder="Infos logistique, partenaires…"
                multiline
              />

              {formError ? <Text style={styles.error}>{formError}</Text> : null}

              <View style={styles.modalActions}>
                <Button onPress={handleCloseModal} variant="ghost" style={styles.modalButton}>
                  Annuler
                </Button>
                <Button
                  onPress={submitRegistration}
                  loading={createRegistrationMutation.isPending}
                  style={styles.modalButton}
                >
                  Confirmer
                </Button>
              </View>

              {showDatePicker ? (
                <DateTimePicker
                  value={targetDate ?? new Date()}
                  mode="date"
                  onChange={(event: DateTimePickerEvent, date?: Date) => {
                    if (date) {
                      setTargetDate(date)
                    }
                    if (Platform.OS !== 'ios') {
                      setShowDatePicker(false)
                    }
                  }}
                />
              ) : null}
            </View>
          </TouchableWithoutFeedback>
        </Pressable>
      </Modal>

      <Modal
        visible={courseModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCourseModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => {
            if (!createCourseMutation.isPending) {
              setCourseModalVisible(false)
              setCourseFormError(null)
            }
          }}
        >
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Nouvelle course</Text>
              <Input
                label="Nom"
                value={courseName}
                onChangeText={setCourseName}
                placeholder="Trail du Mont" />
              <Input
                label="Localisation"
                value={courseLocation}
                onChangeText={setCourseLocation}
                placeholder="Chamonix, France" />
              <Input
                label="Distance (km)"
                value={courseDistance}
                onChangeText={setCourseDistance}
                keyboardType="decimal-pad"
                placeholder="42"
              />
              <Input
                label="D+ (m)"
                value={courseElevationGain}
                onChangeText={setCourseElevationGain}
                keyboardType="number-pad"
                placeholder="2500"
              />
              <Input
                label="D- (m)"
                value={courseElevationLoss}
                onChangeText={setCourseElevationLoss}
                keyboardType="number-pad"
                placeholder="2500"
              />
              <Input
                label="Description"
                value={courseDescription}
                onChangeText={setCourseDescription}
                placeholder="Infos parcours, surface, points d'eau..."
                multiline
              />
              {courseFormError ? <Text style={styles.error}>{courseFormError}</Text> : null}
              <View style={styles.modalActions}>
                <Button
                  onPress={() => {
                    if (!createCourseMutation.isPending) {
                      setCourseModalVisible(false)
                      setCourseFormError(null)
                    }
                  }}
                  variant="ghost"
                  style={styles.modalButton}
                >
                  Annuler
                </Button>
                <Button
                  onPress={() => {
                    if (createCourseMutation.isPending) return
                    if (!courseName.trim() || !courseLocation.trim()) {
                      setCourseFormError('Nom et localisation sont requis.')
                      return
                    }
                    const distance = Number.parseFloat(courseDistance)
                    const elevationGain = Number.parseFloat(courseElevationGain)
                    if (Number.isNaN(distance) || distance <= 0) {
                      setCourseFormError('Distance invalide.')
                      return
                    }
                    if (Number.isNaN(elevationGain) || elevationGain < 0) {
                      setCourseFormError('D+ invalide.')
                      return
                    }
                    createCourseMutation.mutate()
                  }}
                  loading={createCourseMutation.isPending}
                  style={styles.modalButton}
                >
                  Ajouter
                </Button>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Pressable>
      </Modal>
    </Screen>
  )
}

const styles = StyleSheet.create({
  loadingCard: {
    alignItems: 'center',
    gap: spacing(1),
    paddingVertical: spacing(2),
  },
  loadingText: {
    color: palette.secondary,
    fontSize: typography.caption,
  },
  registrationCard: {
    gap: spacing(1),
  },
  registrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  registrationStatusPill: {
    borderRadius: radii.sm,
    borderWidth: 1,
    paddingHorizontal: spacing(1.25),
    paddingVertical: spacing(0.35),
  },
  registrationStatusText: {
    fontSize: typography.micro,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  registrationBody: {
    gap: spacing(0.5),
  },
  registrationTitle: {
    color: palette.primary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  registrationMeta: {
    color: palette.muted,
    fontSize: typography.caption,
  },
  registrationDate: {
    color: palette.secondary,
    fontSize: typography.caption,
  },
  registrationGoal: {
    color: palette.primary,
    fontSize: typography.caption,
  },
  registrationNotes: {
    color: palette.secondary,
    fontSize: typography.caption,
  },
  emptyState: {
    alignItems: 'center',
    gap: spacing(1),
    paddingVertical: spacing(3),
  },
  emptyTitle: {
    color: palette.primary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  emptySubtitle: {
    color: palette.muted,
    fontSize: typography.caption,
    textAlign: 'center',
  },
  searchCard: {
    marginBottom: spacing(1),
  },
  courseList: {
    maxHeight: spacing(36),
  },
  courseCard: {
    gap: spacing(0.75),
    marginBottom: spacing(1),
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseTitle: {
    color: palette.primary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  courseBadge: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: spacing(1),
    paddingVertical: spacing(0.25),
  },
  courseBadgeText: {
    color: palette.secondary,
    fontSize: typography.micro,
    textTransform: 'uppercase',
  },
  courseMeta: {
    color: palette.muted,
    fontSize: typography.caption,
  },
  courseDescription: {
    color: palette.secondary,
    fontSize: typography.caption,
  },
  courseButton: {
    marginTop: spacing(0.5),
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
  modalCourseHeader: {
    gap: spacing(0.5),
  },
  modalTitle: {
    color: palette.primary,
    fontSize: typography.section,
    fontWeight: '600',
  },
  modalSubtitle: {
    color: palette.muted,
    fontSize: typography.caption,
  },
  datePicker: {
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
  modalActions: {
    flexDirection: 'row',
    gap: spacing(1),
  },
  modalButton: {
    flex: 1,
  },
  error: {
    color: '#D96C6C',
    fontSize: typography.caption,
  },
})

export default RaceManagerScreen
