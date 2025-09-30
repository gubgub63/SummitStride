/**
 * Registrations Page - SummitStride
 * Page principale de gestion des inscriptions aux courses
 */

'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { useRegistrations } from '../../../lib/hooks/useRegistrations'
import { RegistrationStatus, registrationService } from '../../../lib/services/registrationService'
import { courseService } from '../../../lib/services/courseService'

export default function RegistrationsPage() {
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | 'ALL'>('ALL')
  const [viewMode, setViewMode] = useState<'all' | 'upcoming' | 'completed'>('all')

  const {
    registrations,
    summary,
    loading,
    error,
    loadRegistrations,
    deleteRegistration,
    updateRegistration,
    clearError
  } = useRegistrations()

  useEffect(() => {
    loadRegistrations()
  }, [loadRegistrations])

  const filteredRegistrations = React.useMemo(() => {
    let filtered = registrations

    // Filter by view mode
    if (viewMode === 'upcoming') {
      filtered = filtered.filter(reg => registrationService.isUpcoming(reg))
    } else if (viewMode === 'completed') {
      filtered = filtered.filter(reg =>
        reg.status === RegistrationStatus.COMPLETED ||
        reg.status === RegistrationStatus.DNS ||
        reg.status === RegistrationStatus.DNF
      )
    }

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(reg => reg.status === statusFilter)
    }

    return filtered
  }, [registrations, statusFilter, viewMode])

  const handleStatusChange = async (registrationId: string, newStatus: RegistrationStatus) => {
    await updateRegistration(registrationId, { status: newStatus })
  }

  const handleDelete = async (registrationId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette inscription ?')) {
      await deleteRegistration(registrationId)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-muted rounded-lg"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mes Inscriptions</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos inscriptions aux courses et suivez votre préparation
          </p>
        </div>
        <Button asChild>
          <Link href="/courses">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nouvelle inscription
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-foreground">{summary.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Actives</p>
                  <p className="text-2xl font-bold text-foreground">{summary.active}</p>
                </div>
                <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">À venir</p>
                  <p className="text-2xl font-bold text-foreground">{summary.upcoming}</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Terminées</p>
                  <p className="text-2xl font-bold text-foreground">{summary.completed}</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* View Mode Tabs */}
        <div className="flex bg-muted rounded-lg p-1">
          <button
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'all'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setViewMode('upcoming')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'upcoming'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            À venir
          </button>
          <button
            onClick={() => setViewMode('completed')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'completed'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Terminées
          </button>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as RegistrationStatus | 'ALL')}
          className="px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-600"
        >
          <option value="ALL">Tous les statuts</option>
          {Object.values(RegistrationStatus).map(status => (
            <option key={status} value={status}>
              {registrationService.getStatusLabel(status)}
            </option>
          ))}
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm text-red-700">{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Ignorer
          </button>
        </div>
      )}

      {/* Registrations List */}
      {filteredRegistrations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Aucune inscription</h3>
            <p className="text-muted-foreground mb-6">
              Vous n'avez pas encore d'inscription aux courses.
            </p>
            <Button asChild>
              <Link href="/courses">Découvrir les courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRegistrations.map(registration => (
            <Card key={registration.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  {/* Course Info */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="space-y-3">
                        <div>
                          <Link
                            href={`/courses/${registration.course.id}`}
                            className="text-lg font-semibold text-foreground hover:text-primary-600 transition-colors"
                          >
                            {registration.course.name}
                          </Link>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{registration.course.location}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700">
                            {courseService.formatDistance(registration.course.distance)}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-700">
                            {courseService.formatElevation(registration.course.elevationGain)}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${registrationService.getStatusColor(registration.status)}`}>
                            {registrationService.getStatusLabel(registration.status)}
                          </span>
                        </div>

                        {registration.goal && (
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Objectif:</span> {registration.goal}
                          </div>
                        )}
                      </div>

                      {/* Date and Time Info */}
                      <div className="text-right space-y-2">
                        {registration.targetDate && (
                          <div>
                            <div className="text-sm font-medium text-foreground">
                              {registrationService.formatTargetDate(registration.targetDate)}
                            </div>
                            {registrationService.isUpcoming(registration) && (
                              <div className="text-xs text-muted-foreground">
                                Dans {registrationService.getDaysUntilRace(registration)} jours
                              </div>
                            )}
                          </div>
                        )}

                        {(registration.preparationTimeWeeks || registration.preparationTimeDays) && (
                          <div className="text-xs text-muted-foreground">
                            Préparation: {registrationService.formatPreparationTime(
                              registration.preparationTimeWeeks,
                              registration.preparationTimeDays
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t lg:border-t-0 lg:border-l border-border p-4 lg:p-6 space-y-2 lg:w-48">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      asChild
                    >
                      <Link href={`/registrations/${registration.id}`}>
                        Voir détail
                      </Link>
                    </Button>

                    <select
                      value={registration.status}
                      onChange={(e) => handleStatusChange(registration.id, e.target.value as RegistrationStatus)}
                      className="w-full px-3 py-2 text-xs border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary-600"
                    >
                      {Object.values(RegistrationStatus).map(status => (
                        <option key={status} value={status}>
                          {registrationService.getStatusLabel(status)}
                        </option>
                      ))}
                    </select>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(registration.id)}
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}