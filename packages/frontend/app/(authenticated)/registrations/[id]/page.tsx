/**
 * Registration Detail Page - SummitStride
 * Page de détail d'une inscription avec analyse de préparation
 */

'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card'
import { Button } from '../../../../components/ui/Button'
import { Input } from '../../../../components/ui/Input'
import { PreparationCalendar } from '../../../../components/registrations/PreparationCalendar'
import { useRegistrations } from '../../../../lib/hooks/useRegistrations'
import { registrationService, RegistrationStatus, UpdateRegistrationRequest } from '../../../../lib/services/registrationService'
import { courseService } from '../../../../lib/services/courseService'

export default function RegistrationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const registrationId = params.id as string

  const [isEditing, setIsEditing] = useState(false)
  const [editFormData, setEditFormData] = useState<UpdateRegistrationRequest>({})

  const {
    selectedRegistration,
    preparationAnalysis,
    loading,
    loadingAnalysis,
    loadingUpdate,
    error,
    analysisError,
    getRegistration,
    loadPreparationAnalysis,
    updateRegistration,
    deleteRegistration,
    clearError
  } = useRegistrations()

  useEffect(() => {
    if (registrationId) {
      getRegistration(registrationId)
      loadPreparationAnalysis(registrationId).catch(() => {
        // Analysis might not be available if no target date
      })
    }
  }, [registrationId, getRegistration, loadPreparationAnalysis])

  useEffect(() => {
    if (selectedRegistration && isEditing) {
      setEditFormData({
        targetDate: selectedRegistration.targetDate?.split('T')[0] || '',
        goal: selectedRegistration.goal || '',
        notes: selectedRegistration.notes || '',
        status: selectedRegistration.status
      })
    }
  }, [selectedRegistration, isEditing])

  const handleSaveEdit = async () => {
    if (!selectedRegistration) return

    const result = await updateRegistration(selectedRegistration.id, editFormData)
    if (result) {
      setIsEditing(false)
      // Reload analysis if target date changed
      if (editFormData.targetDate !== selectedRegistration.targetDate?.split('T')[0]) {
        loadPreparationAnalysis(selectedRegistration.id).catch(() => {})
      }
    }
  }

  const handleDelete = async () => {
    if (!selectedRegistration) return

    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette inscription ?')) {
      const success = await deleteRegistration(selectedRegistration.id)
      if (success) {
        router.push('/registrations')
      }
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-4 bg-muted rounded w-64"></div>
          <div className="h-8 bg-muted rounded w-96"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-muted rounded-lg"></div>
              <div className="h-48 bg-muted rounded-lg"></div>
            </div>
            <div className="space-y-6">
              <div className="h-32 bg-muted rounded-lg"></div>
              <div className="h-40 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !selectedRegistration) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Inscription introuvable
          </h3>
          <p className="text-muted-foreground mb-6">
            {error || "Cette inscription n'existe pas ou a été supprimée."}
          </p>
          <div className="flex justify-center space-x-3">
            <Button variant="outline" onClick={() => router.back()}>
              Retour
            </Button>
            <Button onClick={clearError} asChild>
              <Link href="/registrations">
                Voir toutes les inscriptions
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const registration = selectedRegistration

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/registrations" className="hover:text-foreground transition-colors">
          Inscriptions
        </Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-foreground font-medium">{registration.course.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="space-y-3">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{registration.course.name}</h1>
            <div className="flex items-center space-x-2 text-muted-foreground mt-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{registration.course.location}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
              {courseService.formatDistance(registration.course.distance)}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700">
              {courseService.formatElevation(registration.course.elevationGain)}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${registrationService.getStatusColor(registration.status)}`}>
              {registrationService.getStatusLabel(registration.status)}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            disabled={loadingUpdate}
          >
            {isEditing ? 'Annuler' : 'Modifier'}
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Supprimer
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Registration info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Registration Details */}
          <Card>
            <CardHeader>
              <CardTitle>Détails de l'inscription</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  {/* Target Date */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Date objectif
                    </label>
                    <Input
                      type="date"
                      value={editFormData.targetDate || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                    />
                  </div>

                  {/* Goal */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Objectif
                    </label>
                    <Input
                      type="text"
                      value={editFormData.goal || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, goal: e.target.value }))}
                      placeholder="Votre objectif pour cette course..."
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Notes
                    </label>
                    <textarea
                      value={editFormData.notes || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Notes personnelles..."
                      rows={3}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Statut
                    </label>
                    <select
                      value={editFormData.status || registration.status}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value as RegistrationStatus }))}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-600"
                    >
                      {Object.values(RegistrationStatus).map(status => (
                        <option key={status} value={status}>
                          {registrationService.getStatusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={loadingUpdate}
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleSaveEdit}
                      disabled={loadingUpdate}
                    >
                      {loadingUpdate ? 'Sauvegarde...' : 'Sauvegarder'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-foreground">Date objectif</div>
                      <div className="text-muted-foreground">
                        {registration.targetDate
                          ? registrationService.formatTargetDate(registration.targetDate)
                          : 'Non définie'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">Temps restant</div>
                      <div className="text-muted-foreground">
                        {registrationService.isUpcoming(registration)
                          ? `${registrationService.getDaysUntilRace(registration)} jours`
                          : 'Course passée'}
                      </div>
                    </div>
                  </div>

                  {registration.goal && (
                    <div>
                      <div className="text-sm font-medium text-foreground">Objectif</div>
                      <div className="text-muted-foreground">{registration.goal}</div>
                    </div>
                  )}

                  {registration.notes && (
                    <div>
                      <div className="text-sm font-medium text-foreground">Notes</div>
                      <div className="text-muted-foreground whitespace-pre-wrap">{registration.notes}</div>
                    </div>
                  )}

                  <div>
                    <div className="text-sm font-medium text-foreground">Temps de préparation</div>
                    <div className="text-muted-foreground">
                      {registrationService.formatPreparationTime(
                        registration.preparationTimeWeeks,
                        registration.preparationTimeDays
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-foreground">Date d'inscription</div>
                    <div className="text-muted-foreground">
                      {new Date(registration.registrationDate).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preparation Analysis */}
          {preparationAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle>Analyse de préparation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Risk Level */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Niveau de risque</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${registrationService.getRiskLevelColor(preparationAnalysis.riskLevel)}`}>
                      {registrationService.getRiskLevelLabel(preparationAnalysis.riskLevel)}
                    </span>
                  </div>

                  {/* Period Info */}
                  <div>
                    <div className="text-sm font-medium text-foreground mb-2">Période de préparation</div>
                    <div className="text-muted-foreground">
                      {preparationAnalysis.period.weeks} semaines ({preparationAnalysis.period.totalDays} jours)
                      {!preparationAnalysis.period.isAdequate && (
                        <span className="text-orange-600 ml-2">⚠️ Temps insuffisant</span>
                      )}
                    </div>
                  </div>

                  {/* Recommendations */}
                  {preparationAnalysis.period.recommendations.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-foreground mb-2">Recommandations</div>
                      <ul className="space-y-1">
                        {preparationAnalysis.period.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                            <span className="text-orange-500 mt-0.5">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggestions */}
                  {preparationAnalysis.suggestions.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-foreground mb-2">Suggestions</div>
                      <ul className="space-y-1">
                        {preparationAnalysis.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                            <span className="text-blue-500 mt-0.5">💡</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preparation Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Calendrier de préparation</CardTitle>
            </CardHeader>
            <CardContent>
              <PreparationCalendar registration={registration} />
            </CardContent>
          </Card>

          {analysisError && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 text-orange-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-sm">
                    Analyse de préparation non disponible. Définissez une date objectif pour obtenir une analyse.
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column - Course info and actions */}
        <div className="space-y-6">
          {/* Course Details */}
          <Card>
            <CardHeader>
              <CardTitle>Course</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Distance</span>
                  <span className="font-medium">{courseService.formatDistance(registration.course.distance)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Dénivelé positif</span>
                  <span className="font-medium text-green-600">+{registration.course.elevationGain} m</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Difficulté</span>
                  <span className="font-medium">{courseService.getDifficultyLabel(registration.course.difficulty)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Catégorie</span>
                  <span className="font-medium">{courseService.getCategoryLabel(registration.course.category)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full" asChild>
                  <Link href={`/courses/${registration.course.id}`}>
                    Voir la course
                  </Link>
                </Button>
                <Button variant="outline" className="w-full">
                  Créer un plan d'entraînement
                </Button>
                <Button variant="outline" className="w-full">
                  Partager mon inscription
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}