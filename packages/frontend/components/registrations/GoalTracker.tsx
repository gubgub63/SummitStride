/**
 * GoalTracker Component - Coach IA Hugo
 * Widget de suivi des objectifs d'inscription
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { Registration, registrationService } from '../../lib/services/registrationService'
import { courseService } from '../../lib/services/courseService'

interface GoalTrackerProps {
  registrations: Registration[]
  className?: string
}

export function GoalTracker({ registrations, className = '' }: GoalTrackerProps) {
  const upcomingRegistrations = registrations.filter(reg => registrationService.isUpcoming(reg))
  const nextRace = upcomingRegistrations
    .filter(reg => reg.targetDate)
    .sort((a, b) => new Date(a.targetDate!).getTime() - new Date(b.targetDate!).getTime())[0]

  const stats = React.useMemo(() => {
    const total = registrations.length
    const active = upcomingRegistrations.length
    const completed = registrations.filter(reg =>
      reg.status === 'COMPLETED' || reg.status === 'DNS' || reg.status === 'DNF'
    ).length

    // Calculate average preparation time for upcoming races
    const avgPrepTime = upcomingRegistrations.length > 0
      ? Math.round(upcomingRegistrations.reduce((sum, reg) =>
          sum + (reg.preparationTimeWeeks || 0), 0) / upcomingRegistrations.length)
      : 0

    return { total, active, completed, avgPrepTime }
  }, [registrations, upcomingRegistrations])

  if (registrations.length === 0) {
    return (
      <div className={`p-6 text-center bg-background border border-border rounded-lg ${className}`}>
        <div className="text-muted-foreground">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-sm font-medium text-foreground mb-1">Aucun objectif</h3>
          <p className="text-xs mb-4">Commencez par vous inscrire à une course</p>
          <Link
            href="/courses"
            className="inline-flex items-center justify-center rounded-md text-xs font-medium bg-primary-600 text-white hover:bg-primary-700 h-8 px-3 transition-colors"
          >
            Découvrir les courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-background border border-border rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Mes Objectifs</h3>
          <Link
            href="/registrations"
            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            Voir tout
          </Link>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 bg-accent/30 rounded-md">
            <div className="text-lg font-bold text-foreground">{stats.active}</div>
            <div className="text-xs text-muted-foreground">Active{stats.active > 1 ? 's' : ''}</div>
          </div>
          <div className="text-center p-2 bg-accent/30 rounded-md">
            <div className="text-lg font-bold text-foreground">{stats.completed}</div>
            <div className="text-xs text-muted-foreground">Terminée{stats.completed > 1 ? 's' : ''}</div>
          </div>
        </div>

        {/* Next Race */}
        {nextRace ? (
          <div className="space-y-2">
            <div className="text-xs font-medium text-foreground">Prochaine course</div>
            <Link
              href={`/registrations/${nextRace.id}`}
              className="block p-3 bg-accent/30 rounded-md hover:bg-accent/50 transition-colors"
            >
              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground line-clamp-1">
                  {nextRace.course.name}
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="line-clamp-1">{nextRace.course.location}</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                    {courseService.formatDistance(nextRace.course.distance)}
                  </span>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border ${registrationService.getStatusColor(nextRace.status)}`}>
                    {registrationService.getStatusLabel(nextRace.status)}
                  </span>
                </div>

                {nextRace.targetDate && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {registrationService.formatTargetDate(nextRace.targetDate)}
                    </span>
                    <span className="font-medium text-primary-600">
                      J-{registrationService.getDaysUntilRace(nextRace)}
                    </span>
                  </div>
                )}

                {nextRace.goal && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Objectif:</span> {nextRace.goal}
                  </div>
                )}
              </div>
            </Link>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-xs text-muted-foreground">Aucune course à venir</div>
          </div>
        )}

        {/* Recent Activity */}
        {stats.total > 1 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-foreground">Activité récente</div>
            <div className="space-y-1">
              {registrations
                .slice(0, 3)
                .map(registration => (
                  <Link
                    key={registration.id}
                    href={`/registrations/${registration.id}`}
                    className="block p-2 hover:bg-accent/30 rounded-md transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-foreground line-clamp-1">
                          {registration.course.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {courseService.formatDistance(registration.course.distance)} • {registration.course.location}
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border ml-2 ${registrationService.getStatusColor(registration.status)}`}>
                        {registrationService.getStatusLabel(registration.status)}
                      </span>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-2 border-t border-border space-y-2">
          <Link
            href="/courses"
            className="block w-full text-center py-2 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
          >
            Nouvelle inscription
          </Link>

          {upcomingRegistrations.length > 0 && (
            <Link
              href="/training-plans"
              className="block w-full text-center py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/30 rounded-md transition-colors"
            >
              Plans d'entraînement
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Variant compact pour affichage dans sidebar ou petits espaces
 */
export function GoalTrackerCompact({ registrations, className = '' }: GoalTrackerProps) {
  const upcomingRegistrations = registrations.filter(reg => registrationService.isUpcoming(reg))
  const nextRace = upcomingRegistrations
    .filter(reg => reg.targetDate)
    .sort((a, b) => new Date(a.targetDate!).getTime() - new Date(b.targetDate!).getTime())[0]

  if (!nextRace) {
    return (
      <div className={`p-3 text-center bg-background border border-border rounded-md ${className}`}>
        <div className="text-xs text-muted-foreground">Aucun objectif défini</div>
        <Link
          href="/courses"
          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
        >
          S'inscrire à une course
        </Link>
      </div>
    )
  }

  return (
    <Link
      href={`/registrations/${nextRace.id}`}
      className={`block p-3 bg-background border border-border rounded-md hover:bg-accent/30 transition-colors ${className}`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-muted-foreground">Prochain objectif</div>
          <div className="text-xs font-bold text-primary-600">
            J-{registrationService.getDaysUntilRace(nextRace)}
          </div>
        </div>

        <div className="text-sm font-medium text-foreground line-clamp-1">
          {nextRace.course.name}
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {courseService.formatDistance(nextRace.course.distance)}
          </span>
          <span className={`px-1.5 py-0.5 rounded font-medium border ${registrationService.getStatusColor(nextRace.status)}`}>
            {registrationService.getStatusLabel(nextRace.status)}
          </span>
        </div>

        {nextRace.goal && (
          <div className="text-xs text-muted-foreground line-clamp-1">
            {nextRace.goal}
          </div>
        )}
      </div>
    </Link>
  )
}