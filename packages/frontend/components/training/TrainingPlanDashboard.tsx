/**
 * TrainingPlanDashboard - Page principale des plans d'entraînement
 * Phase 5.1 - Intégration avec les vraies APIs
 */

'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { WeeklyPlanWidget } from './WeeklyPlanWidget'
import { TrainingPlanCalendar } from './TrainingPlanCalendar'
import {
  useTrainingStats,
  useTrainingPlans,
  useTrainingSessions,
} from '../../lib/hooks/useTraining'
import { getCurrentWeekStart } from '../../lib/data/mockTrainingData'
import { SESSION_TYPE_LABELS, SESSION_TYPE_COLORS } from '../../types/training'
import trainingService from '../../lib/services/trainingService'
import { registrationService, type Registration } from '../../lib/services/registrationService'
import {
  Intensity,
  PlanPhase,
  TrainingPlanStatus,
  TrainingPlanTemplate,
  TrainingType,
  AiPlanInsights,
  ConfidenceLevel,
} from '@summitstride/shared'

interface GeneratePlanFormState {
  targetRaceId: string
  startDate: string
  endDate: string
}

export function TrainingPlanDashboard() {
  const { stats, loading: statsLoading } = useTrainingStats()
  const {
    plans,
    loading: plansLoading,
    refreshPlans,
    generatePlan,
    updatePlanStatus,
    deletePlan,
  } = useTrainingPlans()
  const [generationState, setGenerationState] = useState<{
    form: GeneratePlanFormState
    submitting: boolean
    error: string | null
    successMessage: string | null
  }>({
    form: {
      targetRaceId: '',
      startDate: '',
      endDate: '',
    },
    submitting: false,
    error: null,
    successMessage: null,
  })
  const [templates, setTemplates] = useState<TrainingPlanTemplate[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [templatesError, setTemplatesError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [templateSubmitting, setTemplateSubmitting] = useState(false)
  const [templateSubmitError, setTemplateSubmitError] = useState<string | null>(null)
  const [deleteSubmittingId, setDeleteSubmittingId] = useState<string | null>(null)
  const [planStatusError, setPlanStatusError] = useState<string | null>(null)
  const [planStatusSuccess, setPlanStatusSuccess] = useState<string | null>(null)
  const [calendarExpanded, setCalendarExpanded] = useState(false)
  const [aiInsights, setAiInsights] = useState<AiPlanInsights | null>(null)
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false)
  const [aiInsightsError, setAiInsightsError] = useState<string | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [registrationsLoading, setRegistrationsLoading] = useState(false)
  const [registrationsError, setRegistrationsError] = useState<string | null>(null)
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    targetCategory: 'ULTRA_TRAIL',
    targetExperience: '',
    durationWeeks: 4,
    session: {
      phase: PlanPhase.BASE,
      weekOffset: 0,
      dayOfWeek: 1,
      type: TrainingType.ENDURANCE,
      intensity: Intensity.MODERATE,
      duration: 60,
      distance: 10,
      description: '',
    },
  })
  const planPhaseOptions = useMemo(() => Object.values(PlanPhase), [])
  const trainingTypeOptions = useMemo(() => Object.values(TrainingType), [])
  const intensityOptions = useMemo(() => Object.values(Intensity), [])

  const weekStart = getCurrentWeekStart()
  const activePlan = useMemo(
    () => plans.find(plan => plan.status === TrainingPlanStatus.ACTIVE),
    [plans]
  )
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const displayStats = stats || {
    activePlans: 0,
    weeklySessionsCompleted: 0,
    weeklySessionsTotal: 0,
    monthlyDistance: 0,
    recentActivity: [],
  }
  useEffect(() => {
    setIsAuthenticated(trainingService.isAuthenticated())
  }, [])

  useEffect(() => {
    if (activePlan && (!selectedPlanId || selectedPlanId !== activePlan.id)) {
      setSelectedPlanId(activePlan.id)
      setCalendarExpanded(false)
      return
    }

    if (!selectedPlanId && plans.length > 0) {
      setSelectedPlanId(plans[0].id)
      setCalendarExpanded(false)
    }
  }, [activePlan, plans, selectedPlanId])

  useEffect(() => {
    setPlanStatusError(null)
    setPlanStatusSuccess(null)
    setCalendarExpanded(false)
    setAiInsights(null)
    setAiInsightsError(null)
  }, [selectedPlanId])

  const loadAiInsights = useCallback(async (planId: string) => {
    setAiInsightsLoading(true)
    setAiInsightsError(null)
    try {
      const insights = await trainingService.getTrainingPlanAiInsights(planId)
      setAiInsights(insights)
    } catch (error) {
      setAiInsights(null)
      setAiInsightsError(
        error instanceof Error
          ? error.message
          : 'Impossible de récupérer les insights IA pour ce plan.'
      )
    } finally {
      setAiInsightsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!selectedPlanId) {
      return
    }
    loadAiInsights(selectedPlanId)
  }, [selectedPlanId, loadAiInsights])

  const selectedPlan = useMemo(
    () => plans.find(plan => plan.id === selectedPlanId) || activePlan || plans[0],
    [plans, selectedPlanId, activePlan]
  )
  const selectedPlanFilters = useMemo(
    () => (selectedPlan ? { planId: selectedPlan.id } : undefined),
    [selectedPlan?.id]
  )
  const {
    sessions: selectedPlanSessions,
    loading: sessionsLoading,
    refreshSessions: refreshSelectedSessions,
  } = useTrainingSessions(selectedPlanFilters)

  const refreshTemplates = useCallback(async () => {
    if (!trainingService.isAuthenticated()) {
      setTemplates([])
      setTemplatesError('Connectez-vous pour charger vos templates.')
      return
    }

    try {
      setTemplatesLoading(true)
      setTemplatesError(null)
      const data = await trainingService.listTrainingPlanTemplates()
      setTemplates(data)
    } catch (error) {
      setTemplatesError(
        error instanceof Error
          ? error.message
          : 'Impossible de charger les templates pour le moment'
      )
    } finally {
      setTemplatesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (trainingService.isAuthenticated()) {
      refreshTemplates()
    }
  }, [refreshTemplates])

  useEffect(() => {
    const loadRegistrations = async () => {
      if (!trainingService.isAuthenticated()) {
        setRegistrations([])
        setRegistrationsError('Connectez-vous pour voir vos courses enregistrées.')
        return
      }

      try {
        setRegistrationsLoading(true)
        setRegistrationsError(null)
        const { registrations: regs } = await registrationService.getRegistrations()
        setRegistrations(regs)
        if (regs.length > 0) {
          setGenerationState(prev => ({
            ...prev,
            form: {
              ...prev.form,
              targetRaceId: prev.form.targetRaceId || regs[0].courseId,
            },
          }))
        }
      } catch (error) {
        setRegistrationsError(
          error instanceof Error ? error.message : 'Impossible de charger vos inscriptions.'
        )
      } finally {
        setRegistrationsLoading(false)
      }
    }

    loadRegistrations()
  }, [isAuthenticated])

  const handleGenerateFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setGenerationState(prevState => ({
      ...prevState,
      form: {
        ...prevState.form,
        [name]: value,
      },
      error: null,
      successMessage: null,
    }))
  }

  const handleTemplateFieldChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target
    setTemplateForm(prevState => ({
      ...prevState,
      [name]: name === 'durationWeeks' ? Number(value) : value,
    }))
  }

  const handleTemplateSessionChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target
    setTemplateForm(prevState => ({
      ...prevState,
      session: {
        ...prevState.session,
        [name]: ['weekOffset', 'dayOfWeek', 'duration', 'distance'].includes(name)
          ? Number(value)
          : value,
      },
    }))
  }

  const handleGeneratePlan = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isAuthenticated) {
      setGenerationState(prevState => ({
        ...prevState,
        error: 'Connectez-vous pour générer un plan automatiquement.',
        successMessage: null,
      }))
      return
    }

    if (registrations.length === 0) {
      setGenerationState(prevState => ({
        ...prevState,
        error: 'Inscrivez-vous à une course pour générer un plan personnalisé.',
        successMessage: null,
      }))
      return
    }

    setGenerationState(prevState => ({
      ...prevState,
      submitting: true,
      error: null,
      successMessage: null,
    }))

    try {
      const { form } = generationState
      if (!form.targetRaceId || !form.startDate || !form.endDate) {
        throw new Error('Tous les champs sont requis pour lancer la génération')
      }

      await generatePlan({
        targetRaceId: form.targetRaceId,
        startDate: form.startDate,
        endDate: form.endDate,
      })

      setGenerationState({
        form: {
          targetRaceId: '',
          startDate: '',
          endDate: '',
        },
        submitting: false,
        error: null,
        successMessage: 'Plan généré avec succès. Actualisez pour voir les nouveaux éléments.',
      })

      await refreshPlans()
    } catch (error) {
      setGenerationState(prevState => ({
        ...prevState,
        submitting: false,
        error:
          error instanceof Error
            ? error.message
            : 'Erreur inattendue lors de la génération du plan',
      }))
    }
  }

  const handleTogglePlanStatus = async (planId: string, status: TrainingPlanStatus) => {
    setPlanStatusError(null)
    setPlanStatusSuccess(null)

    try {
      await updatePlanStatus(planId, status)
      await refreshPlans()
      setPlanStatusSuccess('Statut du plan mis à jour avec succès.')
      await loadAiInsights(planId)
    } catch (error) {
      console.error('Impossible de mettre à jour le statut du plan', error)
      setPlanStatusError(
        error instanceof Error
          ? error.message
          : 'Impossible de mettre à jour le statut du plan pour le moment.'
      )
    }
  }

  const handleDeletePlan = async (planId: string) => {
    if (!planId) {
      return
    }

    setPlanStatusError(null)
    setPlanStatusSuccess(null)

    setDeleteSubmittingId(planId)

    try {
      await deletePlan(planId)

      await refreshPlans()

      setSelectedPlanId(prev => (prev === planId ? null : prev))
      setPlanStatusSuccess('Plan supprimé avec succès.')
      setAiInsights(null)
    } catch (error) {
      console.error('Impossible de supprimer le plan', error)
      setPlanStatusError(
        error instanceof Error ? error.message : 'Impossible de supprimer le plan pour le moment.'
      )
    } finally {
      setDeleteSubmittingId(null)
    }
  }

  const handleCreateTemplate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isAuthenticated) {
      setTemplateSubmitError('Connectez-vous pour créer un template.')
      return
    }

    if (!templateForm.name.trim()) {
      setTemplateSubmitError('Le nom du template est requis.')
      return
    }

    setTemplateSubmitting(true)
    setTemplateSubmitError(null)

    try {
      await trainingService.createTrainingPlanTemplate({
        name: templateForm.name,
        description: templateForm.description || undefined,
        targetCategory: templateForm.targetCategory,
        targetExperience: templateForm.targetExperience || undefined,
        durationWeeks: templateForm.durationWeeks,
        sessions: [
          {
            phase: templateForm.session.phase,
            weekOffset: templateForm.session.weekOffset,
            dayOfWeek: templateForm.session.dayOfWeek,
            type: templateForm.session.type,
            intensity: templateForm.session.intensity,
            duration: templateForm.session.duration || undefined,
            distance: templateForm.session.distance || undefined,
            description: templateForm.session.description || undefined,
            focusAreas: [],
          },
        ],
      })

      setTemplateForm({
        name: '',
        description: '',
        targetCategory: 'ULTRA_TRAIL',
        targetExperience: '',
        durationWeeks: 4,
        session: {
          phase: PlanPhase.BASE,
          weekOffset: 0,
          dayOfWeek: 1,
          type: TrainingType.ENDURANCE,
          intensity: Intensity.MODERATE,
          duration: 60,
          distance: 10,
          description: '',
        },
      })

      await refreshTemplates()
    } catch (error) {
      setTemplateSubmitError(
        error instanceof Error ? error.message : 'Impossible de créer le template pour le moment.'
      )
    } finally {
      setTemplateSubmitting(false)
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!isAuthenticated) {
      setTemplatesError('Connectez-vous pour supprimer un template.')
      return
    }

    setDeleteSubmittingId(templateId)
    setTemplatesError(null)

    try {
      await trainingService.deleteTrainingPlanTemplate(templateId)
      await refreshTemplates()
    } catch (error) {
      setTemplatesError(
        error instanceof Error
          ? error.message
          : 'Impossible de supprimer le template pour le moment.'
      )
    } finally {
      setDeleteSubmittingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Plans d'Entraînement</h1>
        <p className="text-muted-foreground">
          Gérez vos plans d'entraînement et suivez vos progrès semaine par semaine
        </p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plans actifs</CardTitle>
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : displayStats.activePlans}
            </div>
            <p className="text-xs text-muted-foreground">Plan en cours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Séances semaine</CardTitle>
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading
                ? '...'
                : `${displayStats.weeklySessionsCompleted}/${displayStats.weeklySessionsTotal}`}
            </div>
            <p className="text-xs text-muted-foreground">Complétées cette semaine</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Distance mois</CardTitle>
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : `${displayStats.monthlyDistance} km`}
            </div>
            <p className="text-xs text-muted-foreground">Ce mois-ci</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prochaine séance</CardTitle>
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading
                ? '...'
                : displayStats.nextSession
                  ? displayStats.nextSession.distance
                  : '--'}{' '}
              km
            </div>
            <p className="text-xs text-muted-foreground">
              {displayStats.nextSession
                ? SESSION_TYPE_LABELS[displayStats.nextSession.type]
                : 'Aucune séance planifiée'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Plan actuel */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Informations du plan sélectionné */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Plan sélectionné</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {plansLoading ? (
                <div className="text-center py-4">
                  <div className="text-sm text-muted-foreground">Chargement...</div>
                </div>
              ) : selectedPlan ? (
                <div className="space-y-2">
                  <h3 className="font-medium text-foreground">{selectedPlan.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedPlan.description || 'Plan sans description'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="font-medium text-foreground">Aucun plan actif</h3>
                  <p className="text-sm text-muted-foreground">
                    Créez ou générez un plan d'entraînement pour commencer
                  </p>
                </div>
              )}

              {selectedPlan && (
                <div className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Durée</span>
                      <span className="font-medium">
                        {Math.ceil(
                          (new Date(selectedPlan.endDate).getTime() -
                            new Date(selectedPlan.startDate).getTime()) /
                            (7 * 24 * 60 * 60 * 1000)
                        )}{' '}
                        semaines
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Statut</span>
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        {selectedPlan.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Début</span>
                      <span className="font-medium">
                        {new Date(selectedPlan.startDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedPlan.status === TrainingPlanStatus.ACTIVE ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          handleTogglePlanStatus(selectedPlan.id, TrainingPlanStatus.PAUSED)
                        }
                      >
                        Mettre en pause
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() =>
                          handleTogglePlanStatus(selectedPlan.id, TrainingPlanStatus.ACTIVE)
                        }
                      >
                        Activer le plan
                      </Button>
                    )}
                    {selectedPlan.status !== TrainingPlanStatus.COMPLETED && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleTogglePlanStatus(selectedPlan.id, TrainingPlanStatus.COMPLETED)
                        }
                      >
                        Marquer terminé
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePlan(selectedPlan.id)}
                      disabled={deleteSubmittingId === selectedPlan.id}
                    >
                      {deleteSubmittingId === selectedPlan.id ? 'Suppression…' : 'Supprimer'}
                    </Button>
                  </div>

                  {(planStatusError || planStatusSuccess) && (
                    <div className="text-sm">
                      {planStatusError && <p className="text-destructive">{planStatusError}</p>}
                      {planStatusSuccess && !planStatusError && (
                        <p className="text-emerald-600">{planStatusSuccess}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!selectedPlan && (
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Utilisez le formulaire « Générer un plan IA » à droite pour démarrer.</p>
                  <p>Vous pourrez ensuite activer le plan depuis cette carte.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Liste des plans */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-lg">Mes plans</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Sélectionnez un plan pour consulter les détails ou l'activer.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={refreshPlans} disabled={plansLoading}>
                {plansLoading ? 'Actualisation...' : 'Actualiser'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {plans.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucun plan enregistré pour le moment. Générez-en un via le formulaire à droite.
                </p>
              ) : (
                <div className="space-y-2">
                  {plans.map(plan => {
                    const isSelected = selectedPlan?.id === plan.id
                    const isActivePlan = plan.status === TrainingPlanStatus.ACTIVE
                    return (
                      <div
                        key={plan.id}
                        className={`rounded-md border p-3 transition-colors ${
                          isSelected ? 'border-primary bg-primary/5' : 'border-border bg-background'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground">{plan.name}</h3>
                              {isActivePlan && (
                                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
                                  Actif
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(plan.startDate).toLocaleDateString('fr-FR')} →{' '}
                              {new Date(plan.endDate).toLocaleDateString('fr-FR')} • Statut :{' '}
                              {plan.status}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant={isSelected ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setSelectedPlanId(plan.id)}
                            >
                              {isSelected ? 'Affiché' : 'Afficher'}
                            </Button>
                            {plan.status !== TrainingPlanStatus.ACTIVE && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleTogglePlanStatus(plan.id, TrainingPlanStatus.ACTIVE)
                                }
                              >
                                Activer
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeletePlan(plan.id)}
                              disabled={deleteSubmittingId === plan.id}
                            >
                              {deleteSubmittingId === plan.id ? 'Suppression…' : 'Supprimer'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Widget semaine courante - TON COMPOSANT ICI */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Semaine Courante</CardTitle>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <p className="text-sm text-muted-foreground">Chargement des séances...</p>
              ) : selectedPlanSessions.length > 0 ? (
                <WeeklyPlanWidget
                  weekStartDate={weekStart}
                  trainingSessions={selectedPlanSessions}
                />
              ) : selectedPlan ? (
                <p className="text-sm text-muted-foreground">
                  Ce plan ne contient pas encore de séances enregistrées.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Sélectionnez un plan pour voir les séances planifiées.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedPlan && (
        <Card>
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-lg">Insights IA</CardTitle>
              <p className="text-sm text-muted-foreground">
                Estimations de performance et recommandations basées sur votre préparation actuelle.
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              {aiInsights?.generatedAt && (
                <span>
                  Généré le{' '}
                  {new Date(aiInsights.generatedAt).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {aiInsightsLoading ? (
              <p className="text-sm text-muted-foreground">Analyse en cours…</p>
            ) : aiInsightsError ? (
              <div className="space-y-3">
                <p className="text-sm text-destructive">{aiInsightsError}</p>
                {aiInsightsError.toLowerCase().includes('crédits insuffisants') && (
                  <Button asChild size="sm" variant="secondary">
                    <Link href="/premium">Recharger mes crédits</Link>
                  </Button>
                )}
              </div>
            ) : aiInsights ? (
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-4">
                  <InsightMetric
                    label="Temps estimé"
                    value={aiInsights.predictedFinishTimeLabel}
                    helper={aiInsights.targetRace ? aiInsights.targetRace.name : 'Course cible'}
                  />
                  <InsightMetric
                    label="Allure prévisionnelle"
                    value={`${aiInsights.predictedPaceMinutesPerKm.toFixed(2)} min/km`}
                    helper="Basé sur le volume et l'intensité actuels"
                  />
                  <InsightMetric
                    label="Fatigue cumulée"
                    value={`${aiInsights.fatigueScore}/100`}
                    helper=">70 = attention récupération"
                  />
                  <InsightMetric
                    label="Préparation"
                    value={`${aiInsights.readinessScore}/100`}
                    helper={`Confiance ${translateConfidence(aiInsights.confidence)}`}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <InsightList title="Focus prioritaires" items={aiInsights.recommendedFocus} />
                  <InsightList
                    title="Ajustements recommandés"
                    items={aiInsights.recommendedAdjustments}
                  />
                </div>

                <InsightList title="Risques à surveiller" items={aiInsights.topRisks} compact />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Ajoutez des séances et actualisez le plan pour recevoir des insights IA.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-lg">Calendrier du plan</CardTitle>
            <p className="text-sm text-muted-foreground">
              Visualisez vos séances par semaine et accédez au détail complet.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCalendarExpanded(previous => !previous)}
            disabled={plansLoading || sessionsLoading}
          >
            {calendarExpanded ? 'Masquer' : 'Afficher'}
          </Button>
        </CardHeader>
        {calendarExpanded && (
          <CardContent>
            {plansLoading ? (
              <p className="text-sm text-muted-foreground">Chargement des plans…</p>
            ) : selectedPlan ? (
              sessionsLoading && selectedPlanSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chargement des séances…</p>
              ) : (
                <TrainingPlanCalendar sessions={selectedPlanSessions} />
              )
            ) : (
              <p className="text-sm text-muted-foreground">
                Sélectionnez un plan pour consulter le calendrier global.
              </p>
            )}
          </CardContent>
        )}
      </Card>

      {/* Activité récente */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Activité Récente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {statsLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                Chargement de l'activité récente...
              </div>
            ) : displayStats.recentActivity.length > 0 ? (
              displayStats.recentActivity.map(activity => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 bg-accent/30 rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="font-medium text-sm">{activity.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(activity.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm font-medium">
                      {trainingService.formatDuration(activity.duration || 60)}
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${SESSION_TYPE_COLORS[activity.type]}`}
                    >
                      {SESSION_TYPE_LABELS[activity.type]}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucune activité récente</p>
                <p className="text-sm">Vos séances d'entraînement apparaîtront ici</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Générer un plan IA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Sélectionnez une course parmi vos inscriptions pour que l'IA compose automatiquement
              un plan adapté.
            </p>
            <form className="space-y-3" onSubmit={handleGeneratePlan}>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground" htmlFor="targetRaceId">
                  Course cible
                </label>
                {registrationsLoading ? (
                  <p className="text-sm text-muted-foreground">Chargement de vos inscriptions…</p>
                ) : registrations.length > 0 ? (
                  <select
                    id="targetRaceId"
                    name="targetRaceId"
                    value={generationState.form.targetRaceId}
                    onChange={handleGenerateFormChange}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                  >
                    {registrations.map(registration => {
                      const targetDateLabel = registration.targetDate
                        ? new Date(registration.targetDate).toLocaleDateString('fr-FR')
                        : 'date à confirmer'
                      return (
                        <option key={registration.id} value={registration.courseId}>
                          {registration.course.name} • {registration.course.distance} km •{' '}
                          {targetDateLabel}
                        </option>
                      )
                    })}
                  </select>
                ) : (
                  <p className="text-sm text-destructive">
                    {registrationsError ||
                      'Aucune inscription active : inscrivez-vous à une course pour générer un plan.'}
                  </p>
                )}
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground" htmlFor="startDate">
                    Début
                  </label>
                  <input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={generationState.form.startDate}
                    onChange={handleGenerateFormChange}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground" htmlFor="endDate">
                    Fin
                  </label>
                  <input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={generationState.form.endDate}
                    onChange={handleGenerateFormChange}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                  />
                </div>
              </div>
              {generationState.error && (
                <p className="text-sm text-destructive">{generationState.error}</p>
              )}
              {generationState.successMessage && (
                <p className="text-sm text-emerald-600">{generationState.successMessage}</p>
              )}
              <Button
                type="submit"
                disabled={
                  generationState.submitting || !isAuthenticated || registrations.length === 0
                }
                className="w-full"
              >
                {isAuthenticated
                  ? generationState.submitting
                    ? 'Génération...'
                    : 'Générer le plan'
                  : 'Connectez-vous pour générer'}
              </Button>
            </form>
            <div className="grid gap-2 pt-4">
              <Button asChild>
                <Link href="/registrations">Accéder aux inscriptions</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/courses">Explorer les courses</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Templates de plan</CardTitle>
              <p className="text-xs text-muted-foreground">
                Les templates sont des structures pré-configurées (phases, types de séances, durée)
                que vous pouvez réutiliser lors de la génération de nouveaux plans.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshTemplates}
              disabled={templatesLoading || !isAuthenticated}
            >
              {templatesLoading ? 'Chargement...' : 'Actualiser'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {templatesError && <p className="text-sm text-destructive">{templatesError}</p>}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {templatesLoading && templates.length === 0 && (
                <p className="text-sm text-muted-foreground">Chargement des templates...</p>
              )}
              {!templatesLoading && templates.length === 0 && !templatesError && (
                <p className="text-sm text-muted-foreground">
                  Aucun template pour l'instant. Utilisez le formulaire ci-dessous pour en créer un.
                </p>
              )}
              {templates.map(template => (
                <div key={template.id} className="rounded-md border border-border p-3 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{template.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {template.targetCategory} • {template.durationWeeks} semaines
                      </p>
                      {template.targetExperience && (
                        <p className="text-xs text-muted-foreground">
                          Expérience cible: {template.targetExperience}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => console.log('TODO: afficher le template', template.id)}
                      >
                        Voir
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteTemplate(template.id)}
                        disabled={deleteSubmittingId === template.id || !isAuthenticated}
                      >
                        {deleteSubmittingId === template.id ? 'Suppression...' : 'Supprimer'}
                      </Button>
                    </div>
                  </div>
                  {template.description && (
                    <p className="mt-2 text-xs text-muted-foreground">{template.description}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="rounded-md border border-dashed border-primary/40 bg-primary/5 p-4">
              <h4 className="text-sm font-semibold text-primary">Créer un template rapide</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Renseignez un template minimal pour vos prochains plans.
              </p>
              <form className="mt-3 space-y-3" onSubmit={handleCreateTemplate}>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground" htmlFor="template-name">
                      Nom du template
                    </label>
                    <input
                      id="template-name"
                      name="name"
                      type="text"
                      value={templateForm.name}
                      onChange={handleTemplateFieldChange}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                      placeholder="Ex: Base trail 12 semaines"
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      className="text-xs font-medium text-foreground"
                      htmlFor="template-category"
                    >
                      Catégorie cible
                    </label>
                    <input
                      id="template-category"
                      name="targetCategory"
                      type="text"
                      value={templateForm.targetCategory}
                      onChange={handleTemplateFieldChange}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                      placeholder="ULTRA_TRAIL"
                    />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label
                      className="text-xs font-medium text-foreground"
                      htmlFor="template-durationWeeks"
                    >
                      Durée (semaines)
                    </label>
                    <input
                      id="template-durationWeeks"
                      name="durationWeeks"
                      type="number"
                      min={1}
                      value={templateForm.durationWeeks}
                      onChange={handleTemplateFieldChange}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      className="text-xs font-medium text-foreground"
                      htmlFor="template-targetExperience"
                    >
                      Expérience (facultatif)
                    </label>
                    <input
                      id="template-targetExperience"
                      name="targetExperience"
                      type="text"
                      value={templateForm.targetExperience}
                      onChange={handleTemplateFieldChange}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                      placeholder="INTERMEDIATE"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    className="text-xs font-medium text-foreground"
                    htmlFor="template-description"
                  >
                    Description (facultatif)
                  </label>
                  <textarea
                    id="template-description"
                    name="description"
                    value={templateForm.description}
                    onChange={handleTemplateFieldChange}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                    rows={2}
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground" htmlFor="session-phase">
                      Phase
                    </label>
                    <select
                      id="session-phase"
                      name="phase"
                      value={templateForm.session.phase}
                      onChange={handleTemplateSessionChange}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                    >
                      {planPhaseOptions.map(phase => (
                        <option key={phase} value={phase}>
                          {phase}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground" htmlFor="session-type">
                      Type de séance
                    </label>
                    <select
                      id="session-type"
                      name="type"
                      value={templateForm.session.type}
                      onChange={handleTemplateSessionChange}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                    >
                      {trainingTypeOptions.map(type => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label
                      className="text-xs font-medium text-foreground"
                      htmlFor="session-intensity"
                    >
                      Intensité
                    </label>
                    <select
                      id="session-intensity"
                      name="intensity"
                      value={templateForm.session.intensity}
                      onChange={handleTemplateSessionChange}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                    >
                      {intensityOptions.map(intensity => (
                        <option key={intensity} value={intensity}>
                          {intensity}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label
                      className="text-xs font-medium text-foreground"
                      htmlFor="session-weekOffset"
                    >
                      Semaine (offset)
                    </label>
                    <input
                      id="session-weekOffset"
                      name="weekOffset"
                      type="number"
                      min={0}
                      value={templateForm.session.weekOffset}
                      onChange={handleTemplateSessionChange}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label
                      className="text-xs font-medium text-foreground"
                      htmlFor="session-dayOfWeek"
                    >
                      Jour (0=Dimanche)
                    </label>
                    <input
                      id="session-dayOfWeek"
                      name="dayOfWeek"
                      type="number"
                      min={0}
                      max={6}
                      value={templateForm.session.dayOfWeek}
                      onChange={handleTemplateSessionChange}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      className="text-xs font-medium text-foreground"
                      htmlFor="session-duration"
                    >
                      Durée (minutes)
                    </label>
                    <input
                      id="session-duration"
                      name="duration"
                      type="number"
                      min={20}
                      value={templateForm.session.duration}
                      onChange={handleTemplateSessionChange}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label
                      className="text-xs font-medium text-foreground"
                      htmlFor="session-distance"
                    >
                      Distance (km)
                    </label>
                    <input
                      id="session-distance"
                      name="distance"
                      type="number"
                      min={0}
                      value={templateForm.session.distance}
                      onChange={handleTemplateSessionChange}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      className="text-xs font-medium text-foreground"
                      htmlFor="session-description"
                    >
                      Note séance (facultatif)
                    </label>
                    <textarea
                      id="session-description"
                      name="description"
                      value={templateForm.session.description}
                      onChange={handleTemplateSessionChange}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                      rows={1}
                    />
                  </div>
                </div>

                {templateSubmitError && (
                  <p className="text-xs text-destructive">{templateSubmitError}</p>
                )}

                <Button
                  type="submit"
                  size="sm"
                  className="w-full"
                  disabled={templateSubmitting || !isAuthenticated}
                >
                  {isAuthenticated
                    ? templateSubmitting
                      ? 'Enregistrement...'
                      : 'Créer le template'
                    : 'Connectez-vous pour créer'}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface InsightMetricProps {
  label: string
  value: string
  helper?: string
}

function InsightMetric({ label, value, helper }: InsightMetricProps) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
    </div>
  )
}

interface InsightListProps {
  title: string
  items: string[]
  compact?: boolean
}

function InsightList({ title, items, compact = false }: InsightListProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune recommandation disponible.</p>
      ) : (
        <ul className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground space-y-1`}>
          {items.map(item => (
            <li key={item} className="list-disc list-inside">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function translateConfidence(level: ConfidenceLevel): string {
  switch (level) {
    case 'HIGH':
      return 'haute'
    case 'MEDIUM':
      return 'moyenne'
    default:
      return 'faible'
  }
}
