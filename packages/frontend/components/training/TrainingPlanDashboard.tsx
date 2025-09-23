/**
 * TrainingPlanDashboard - Page principale des plans d'entraînement
 * Phase 5.1 - Intégration avec les vraies APIs
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { WeeklyPlanWidget } from './WeeklyPlanWidget'
import { useTrainingStats, useTrainingPlans, useCurrentWeekSessions } from '../../lib/hooks/useTraining'
import { getCurrentWeekStart } from '../../lib/data/mockTrainingData'
import { SESSION_TYPE_LABELS, SESSION_TYPE_COLORS } from '../../types/training'
import trainingService from '../../lib/services/trainingService'

export function TrainingPlanDashboard() {
  const { stats, loading: statsLoading, error: statsError } = useTrainingStats()
  const { plans, loading: plansLoading } = useTrainingPlans()
  const { sessions: weekSessions, loading: sessionsLoading } = useCurrentWeekSessions()

  const weekStart = getCurrentWeekStart()
  const activePlan = plans.find(plan => plan.status === 'ACTIVE')

  // Fallback vers les mock data si pas de données réelles
  const displayStats = stats || {
    activePlans: 0,
    weeklySessionsCompleted: 0,
    weeklySessionsTotal: 0,
    monthlyDistance: 0,
    recentActivity: []
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
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
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
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : `${displayStats.weeklySessionsCompleted}/${displayStats.weeklySessionsTotal}`}
            </div>
            <p className="text-xs text-muted-foreground">Complétées cette semaine</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Distance mois</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
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
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : (
                displayStats.nextSession ?
                  trainingService.formatDuration(displayStats.nextSession.duration || 60) :
                  '--'
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {displayStats.nextSession ?
                SESSION_TYPE_LABELS[displayStats.nextSession.type] :
                'Aucune séance planifiée'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Plan actuel */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Informations du plan actuel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Plan Actuel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {plansLoading ? (
                <div className="text-center py-4">
                  <div className="text-sm text-muted-foreground">Chargement...</div>
                </div>
              ) : activePlan ? (
                <div className="space-y-2">
                  <h3 className="font-medium text-foreground">{activePlan.name}</h3>
                  <p className="text-sm text-muted-foreground">{activePlan.description}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="font-medium text-foreground">Aucun plan actif</h3>
                  <p className="text-sm text-muted-foreground">Créez ou générez un plan d'entraînement pour commencer</p>
                </div>
              )}

              {activePlan && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Durée:</span>
                      <span className="font-medium">
                        {Math.ceil(
                          (new Date(activePlan.endDate).getTime() - new Date(activePlan.startDate).getTime()) /
                          (7 * 24 * 60 * 60 * 1000)
                        )} semaines
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Statut:</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {activePlan.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Début:</span>
                      <span className="font-medium">
                        {new Date(activePlan.startDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary-600 h-2 rounded-full" style={{ width: '25%' }} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">En cours...</div>
                  </div>
                </>
              )}

              <div className="space-y-2 pt-2">
                <Button variant="outline" className="w-full" size="sm">
                  Voir le plan complet
                </Button>
                <Button variant="ghost" className="w-full" size="sm">
                  Modifier le plan
                </Button>
              </div>
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
              <WeeklyPlanWidget
                weekStartDate={weekStart}
                trainingSessions={weekSessions}
                loading={sessionsLoading}
              />
            </CardContent>
          </Card>
        </div>
      </div>

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
              displayStats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium text-sm">{activity.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(activity.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm font-medium">
                      {trainingService.formatDuration(activity.duration || 60)}
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${SESSION_TYPE_COLORS[activity.type]}`}>
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

      {/* Actions rapides */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nouveau Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Créez un nouveau plan d'entraînement personnalisé basé sur vos objectifs et votre niveau.
            </p>
            <Button className="w-full" disabled>
              Créer un nouveau plan
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calendrier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Visualisez votre planning d'entraînement sur un calendrier complet avec toutes vos séances.
            </p>
            <Button variant="outline" className="w-full" disabled>
              Voir le calendrier
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}