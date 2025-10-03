'use client'

import React, { useMemo, useState, useEffect } from 'react'
import type { TrainingSession } from '../../types/training'
import { Button } from '../ui/Button'
import { TrainingSessionDetail } from './TrainingSessionDetail'

interface TrainingPlanCalendarProps {
  sessions: TrainingSession[]
  className?: string
}

type CalendarFilter = 'active' | 'history'

export function TrainingPlanCalendar({ sessions, className }: TrainingPlanCalendarProps) {
  const [filter, setFilter] = useState<CalendarFilter>('active')
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  const today = startOfDay(new Date())

  const filteredSessions = useMemo(() => {
    const sorted = [...sessions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    if (filter === 'active') {
      return sorted.filter(session => startOfDay(new Date(session.date)) >= today)
    }

    return sorted.filter(session => startOfDay(new Date(session.date)) < today).reverse()
  }, [sessions, filter, today])

  useEffect(() => {
    if (filteredSessions.length === 0) {
      setSelectedSessionId(null)
      return
    }

    if (!filteredSessions.find(session => session.id === selectedSessionId)) {
      setSelectedSessionId(filteredSessions[0]!.id)
    }
  }, [filteredSessions, selectedSessionId])

  const groupedByWeek = useMemo(() => {
    const map = new Map<string, TrainingSession[]>()

    filteredSessions.forEach(session => {
      const weekKey = getWeekStartKey(new Date(session.date))
      const bucket = map.get(weekKey)
      if (bucket) {
        bucket.push(session)
      } else {
        map.set(weekKey, [session])
      }
    })

    return Array.from(map.entries()).sort(
      (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
    )
  }, [filteredSessions])

  const selectedSession = filteredSessions.find(session => session.id === selectedSessionId) || null

  return (
    <div className={className}>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={filter === 'active' ? 'default' : 'outline'}
          onClick={() => setFilter('active')}
        >
          Plan actif
        </Button>
        <Button
          size="sm"
          variant={filter === 'history' ? 'default' : 'outline'}
          onClick={() => setFilter('history')}
        >
          Historique
        </Button>
      </div>

      {filteredSessions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          {filter === 'active'
            ? 'Aucune séance future planifiée pour ce plan.'
            : 'Aucune séance terminée pour ce plan.'}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {groupedByWeek.map(([weekStart, weekSessions]) => (
            <div
              key={weekStart}
              className="space-y-3 rounded-lg border border-border bg-background p-4"
            >
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Semaine du</span>
                <span className="font-medium text-foreground">
                  {formatWeekLabel(new Date(weekStart))}
                </span>
              </div>
              <div className="space-y-2">
                {weekSessions.map(session => {
                  const sessionDate = new Date(session.date)
                  const isSelected = selectedSessionId === session.id
                  return (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => setSelectedSessionId(session.id)}
                      className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary/5 text-foreground'
                          : 'border-border bg-background text-muted-foreground hover:border-primary/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">{session.name}</p>
                          <p>
                            {sessionDate.toLocaleDateString('fr-FR', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          {session.duration && (
                            <p className="text-xs">{formatMinutes(session.duration)}</p>
                          )}
                          {session.distance && <p className="text-xs">{session.distance} km</p>}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSession && (
        <div className="mt-6">
          <TrainingSessionDetail session={selectedSession} />
        </div>
      )}
    </div>
  )
}

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function getWeekStartKey(date: Date): string {
  const d = startOfDay(date)
  const day = d.getDay()
  const diff = (day + 6) % 7
  d.setDate(d.getDate() - diff)
  return d.toISOString()
}

function formatWeekLabel(weekStart: Date): string {
  const end = new Date(weekStart)
  end.setDate(end.getDate() + 6)
  return `${weekStart.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  })} → ${end.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  })}`
}

function formatMinutes(minutes?: number): string {
  if (!minutes) {
    return ''
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (hours === 0) {
    return `${remainingMinutes} min`
  }
  return `${hours} h ${remainingMinutes.toString().padStart(2, '0')} min`
}
