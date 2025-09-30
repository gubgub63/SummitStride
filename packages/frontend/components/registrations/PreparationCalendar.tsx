/**
 * PreparationCalendar Component - SummitStride
 * Calendrier visuel de préparation pour une inscription
 */

'use client'

import React, { useMemo } from 'react'
import { Registration } from '../../lib/services/registrationService'

interface PreparationCalendarProps {
  registration: Registration
  className?: string
}

interface PreparationPhase {
  name: string
  description: string
  startDate: Date
  endDate: Date
  color: string
  progress: number
}

export function PreparationCalendar({ registration, className = '' }: PreparationCalendarProps) {
  const phases = useMemo(() => {
    if (!registration.targetDate) {
      console.log('PreparationCalendar: No target date found', registration)
      return []
    }

    const targetDate = new Date(registration.targetDate)
    const registrationDate = new Date(registration.createdAt) // Use createdAt instead of registrationDate
    const now = new Date()


    // Validate dates
    if (isNaN(targetDate.getTime()) || isNaN(registrationDate.getTime())) {
      console.error('PreparationCalendar: Invalid dates detected')
      return []
    }

    const totalDays = Math.ceil((targetDate.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24))
    const daysElapsed = Math.ceil((now.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24))
    const daysRemaining = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    console.log('PreparationCalendar: Calculated days:', { totalDays, daysElapsed, daysRemaining })

    // Accept any positive preparation time, even 1 day
    if (totalDays < 1) {
      console.log('PreparationCalendar: totalDays < 1, returning empty phases')
      return []
    }

    // Calculate phases based on total preparation time
    const phases: PreparationPhase[] = []

    if (totalDays >= 112) { // 16 weeks
      // Long preparation: Base building, Specific training, Tapering
      const baseDays = Math.max(1, Math.floor(totalDays * 0.6))
      const specificDays = Math.max(1, Math.floor(totalDays * 0.3))
      const taperingDays = totalDays - baseDays - specificDays

      const baseEndDate = new Date(registrationDate.getTime() + baseDays * 24 * 60 * 60 * 1000)
      const specificEndDate = new Date(baseEndDate.getTime() + specificDays * 24 * 60 * 60 * 1000)

      phases.push({
        name: 'Base Building',
        description: 'Développement de l\'endurance fondamentale',
        startDate: registrationDate,
        endDate: baseEndDate,
        color: 'bg-blue-500',
        progress: Math.min(100, Math.max(0, (daysElapsed / baseDays) * 100))
      })

      phases.push({
        name: 'Entraînement Spécifique',
        description: 'Travail spécifique à la course',
        startDate: baseEndDate,
        endDate: specificEndDate,
        color: 'bg-orange-500',
        progress: Math.min(100, Math.max(0, ((daysElapsed - baseDays) / specificDays) * 100))
      })

      phases.push({
        name: 'Tapering',
        description: 'Affûtage et récupération',
        startDate: specificEndDate,
        endDate: targetDate,
        color: 'bg-green-500',
        progress: Math.min(100, Math.max(0, ((daysElapsed - baseDays - specificDays) / taperingDays) * 100))
      })
    } else if (totalDays >= 56) { // 8 weeks
      // Medium preparation: Conditioning and Tapering
      const conditioningDays = Math.max(1, Math.floor(totalDays * 0.8))
      const taperingDays = totalDays - conditioningDays

      const conditioningEndDate = new Date(registrationDate.getTime() + conditioningDays * 24 * 60 * 60 * 1000)

      phases.push({
        name: 'Conditionnement',
        description: 'Préparation intensive',
        startDate: registrationDate,
        endDate: conditioningEndDate,
        color: 'bg-orange-500',
        progress: Math.min(100, Math.max(0, (daysElapsed / conditioningDays) * 100))
      })

      phases.push({
        name: 'Affûtage',
        description: 'Récupération avant course',
        startDate: conditioningEndDate,
        endDate: targetDate,
        color: 'bg-green-500',
        progress: Math.min(100, Math.max(0, ((daysElapsed - conditioningDays) / taperingDays) * 100))
      })
    } else {
      // Short preparation: Single phase
      phases.push({
        name: 'Préparation Express',
        description: 'Préparation courte et maintien',
        startDate: registrationDate,
        endDate: targetDate,
        color: 'bg-red-500',
        progress: Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100))
      })
    }

    const filteredPhases = phases.filter(phase => phase.endDate > phase.startDate)

    console.log('PreparationCalendar: Final phases:', {
      totalPhases: phases.length,
      filteredPhases: filteredPhases.length,
      phases: filteredPhases.map(p => ({ name: p.name, startDate: p.startDate, endDate: p.endDate }))
    })

    return filteredPhases
  }, [registration.targetDate, registration.createdAt])

  const timelineStats = useMemo(() => {
    if (!registration.targetDate) return null

    const targetDate = new Date(registration.targetDate)
    const registrationDate = new Date(registration.createdAt)
    const now = new Date()

    const totalDays = Math.ceil((targetDate.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24))
    const daysElapsed = Math.ceil((now.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24))
    const daysRemaining = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const overallProgress = Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100))

    return {
      totalDays,
      daysElapsed: Math.max(0, daysElapsed),
      daysRemaining: Math.max(0, daysRemaining),
      overallProgress,
      isOverdue: daysRemaining < 0
    }
  }, [registration.targetDate, registration.createdAt])

  if (!registration.targetDate || !phases.length) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <div className="text-muted-foreground">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">Calendrier de préparation non disponible</p>
          <p className="text-xs mt-1">Définissez une date objectif pour voir votre planning</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Timeline Stats */}
      {timelineStats && (
        <div className="text-center space-y-2">
          <div className="text-2xl font-bold text-foreground">
            {timelineStats.isOverdue ? 'Course terminée' : `${timelineStats.daysRemaining} jours restants`}
          </div>
          <div className="text-sm text-muted-foreground">
            {timelineStats.daysElapsed} jours écoulés sur {timelineStats.totalDays} jours total
          </div>

          {/* Overall Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2 mt-3">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                timelineStats.isOverdue ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(100, timelineStats.overallProgress)}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground">
            {Math.round(timelineStats.overallProgress)}% de la préparation
          </div>
        </div>
      )}

      {/* Phases Timeline */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">Phases de préparation</h4>

        <div className="space-y-3">
          {phases.map((phase, index) => (
            <div key={index} className="space-y-2">
              {/* Phase Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${phase.color}`} />
                  <span className="text-sm font-medium text-foreground">{phase.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {Math.round(phase.progress)}%
                </span>
              </div>

              {/* Phase Description */}
              <p className="text-xs text-muted-foreground pl-5">
                {phase.description}
              </p>

              {/* Phase Progress Bar */}
              <div className="pl-5">
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${phase.color}`}
                    style={{ width: `${phase.progress}%` }}
                  />
                </div>
              </div>

              {/* Phase Dates */}
              <div className="pl-5 text-xs text-muted-foreground">
                {phase.startDate.toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short'
                })} → {phase.endDate.toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short'
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="text-xs text-muted-foreground space-y-1">
        <div className="font-medium">Légende :</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Endurance de base</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span>Entraînement spécifique</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Affûtage</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>Préparation courte</span>
          </div>
        </div>
      </div>

      {/* Next Milestone */}
      {timelineStats && !timelineStats.isOverdue && (
        <div className="mt-6 p-3 bg-accent/30 rounded-lg">
          <div className="text-xs font-medium text-foreground mb-1">Prochaine étape</div>
          <div className="text-xs text-muted-foreground">
            {phases.find(phase => phase.progress < 100)?.name || 'Course dans'} {timelineStats.daysRemaining} jours
          </div>
        </div>
      )}
    </div>
  )
}
