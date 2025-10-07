/**
 * ActivitySummary Component - SummitStride
 * Affiche un résumé de l'activité récente synchronisée via Strava.
 */

'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { useStats } from '../../lib/hooks/useStats'

type ActivityView = 'recent' | 'upcoming'

interface ActivityItemProps {
  activity: any // RecentActivity | UpcomingActivity
  isUpcoming?: boolean
}

function ActivityItem({ activity, isUpcoming = false }: ActivityItemProps) {
  const { getActivityTypeLabel, getIntensityLabel, getIntensityColor, formatDistance, formatDuration } = useStats()

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffTime = isUpcoming ? date.getTime() - now.getTime() : now.getTime() - date.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (isUpcoming) {
      if (diffDays === 0) return "Aujourd'hui"
      if (diffDays === 1) return "Demain"
      if (diffDays <= 7) return `Dans ${diffDays} jours`
      return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })
    } else {
      if (diffDays === 0) return "Aujourd'hui"
      if (diffDays === 1) return "Hier"
      if (diffDays <= 7) return `Il y a ${diffDays} jours`
      return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'run':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
      case 'bike':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )
      case 'strength':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        )
      case 'cross-training':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
    }
  }

  return (
    <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors">
      <div className={`p-2 rounded-full ${
        isUpcoming ? 'bg-blue-100 text-blue-600' :
        activity.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
      }`}>
        {getTypeIcon(activity.type)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h4 className="text-sm font-medium truncate text-gray-500!">
            {activity.name}
          </h4>
          <span className={`text-xs px-2 py-1 rounded-full ${
            activity.intensity === 'low' ? 'bg-green-100 text-green-700' :
            activity.intensity === 'moderate' ? 'bg-blue-100 text-blue-700' :
            activity.intensity === 'high' ? 'bg-orange-100 text-orange-700' :
            'bg-red-100 text-red-700'
          }`}>
            {getIntensityLabel(activity.intensity)}
          </span>
        </div>

        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
          <span>{getActivityTypeLabel(activity.type)}</span>

          {(activity.distance || activity.plannedDistance) && (
            <span>
              {formatDistance(activity.distance || activity.plannedDistance)}
            </span>
          )}

          <span>
            {formatDuration(activity.duration || activity.plannedDuration)}
          </span>
        </div>
      </div>

      <div className="text-right">
        <div className="text-sm text-gray-500">
          {formatDate(new Date(activity.date))}
        </div>
        <div className="text-xs text-gray-400">
          {new Date(activity.date).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>

      {!isUpcoming && (
        <div className="flex-shrink-0">
          {activity.completed ? (
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function ActivitySummary() {
  const { recentActivities, upcomingActivities, loading, error, needsStravaConnection } = useStats()
  const [activeView, setActiveView] = useState<ActivityView>('recent')

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="flex space-x-2">
              <div className="h-10 bg-gray-200 rounded w-32"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (needsStravaConnection) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              Connectez Strava pour afficher vos dernières sorties et planifier vos prochaines séances.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600">Erreur lors du chargement des activités</p>
            <p className="text-sm text-gray-500 mt-2">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentActivities = activeView === 'recent' ? recentActivities : upcomingActivities

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {activeView === 'recent' ? 'Activités récentes' : 'Prochaines activités'}
          </CardTitle>

          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveView('recent')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                activeView === 'recent'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Récentes
            </button>
            <button
              onClick={() => setActiveView('upcoming')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                activeView === 'upcoming'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              À venir
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {currentActivities.length > 0 ? (
          <div className="space-y-3">
            {currentActivities.map((activity) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                isUpcoming={activeView === 'upcoming'}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {activeView === 'recent'
              ? 'Aucune activité récente'
              : 'Aucune activité planifiée'
            }
          </div>
        )}

        {currentActivities.length > 0 && (
          <div className="mt-6 text-center">
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              {activeView === 'recent' ? 'Voir toutes les activités' : 'Voir le planning complet'}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
