'use client'

import React from 'react'
import {
  type TrainingSession,
  SESSION_TYPE_LABELS,
  SESSION_TYPE_COLORS,
  INTENSITY_LABELS,
} from '../../types/training'
import { cn } from '../../lib/utils'
import { formatDuration } from '../../lib/data/mockTrainingData'

interface TrainingSessionDetailProps {
  session: TrainingSession
  className?: string
}

export function TrainingSessionDetail({ session, className }: TrainingSessionDetailProps) {
  const sessionDate = new Date(session.date)
  const nutritionPlan = session.nutritionPlan
  const hasActuals = Boolean(
    session.actualDuration || session.actualDistance || session.completedAt
  )

  return (
    <div className={cn('space-y-4', className)}>
      <section>
        <header className="mb-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Résumé</p>
          <h3 className="text-lg font-semibold text-foreground">{session.name}</h3>
          <p className="text-sm text-muted-foreground">
            {sessionDate.toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
        </header>
        {session.description && (
          <p className="text-sm leading-relaxed text-muted-foreground">{session.description}</p>
        )}
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted-foreground">Type</p>
          <span
            className={cn(
              'mt-1 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
              SESSION_TYPE_COLORS[session.type]
            )}
          >
            {SESSION_TYPE_LABELS[session.type]}
          </span>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted-foreground">Durée planifiée</p>
          <p className="text-sm font-medium text-foreground">{formatDuration(session.duration)}</p>
        </div>
        {session.distance !== undefined && (
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs text-muted-foreground">Distance prévue</p>
            <p className="text-sm font-medium text-foreground">{session.distance} km</p>
          </div>
        )}
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted-foreground">Intensité cible</p>
          <p className="text-sm font-medium text-foreground">
            {INTENSITY_LABELS[session.intensity]}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted-foreground">Statut</p>
          <p className="text-sm font-medium text-foreground">{session.status ?? 'Planifiée'}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted-foreground">Charge planifiée</p>
          <p className="text-sm font-medium text-foreground">
            {session.plannedLoad ? `${session.plannedLoad} pts` : 'À définir'}
          </p>
        </div>
      </section>

      <section className="space-y-2">
        <header>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Volume &amp; Intensité
          </p>
        </header>
        {hasActuals ? (
          <div className="grid gap-3 md:grid-cols-3">
            {session.actualDuration && (
              <MetricCard label="Durée réelle" value={formatDuration(session.actualDuration)} />
            )}
            {session.actualDistance && (
              <MetricCard label="Distance réelle" value={`${session.actualDistance} km`} />
            )}
            {session.completedAt && (
              <MetricCard
                label="Séance complétée le"
                value={new Date(session.completedAt).toLocaleDateString('fr-FR')}
              />
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Complétez la séance pour renseigner les métriques (durée réelle, distance, RPE, etc.).
          </p>
        )}
      </section>

      <section className="space-y-2">
        <header>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Intervalles &amp; structure
          </p>
        </header>
        {session.notes ? (
          <p className="text-sm text-muted-foreground whitespace-pre-line">{session.notes}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Ajoutez les blocs d'échauffement, de travail et de récupération directement dans la
            séance pour obtenir un récapitulatif détaillé.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <header>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Nutrition &amp; hydratation
          </p>
        </header>
        {nutritionPlan ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground">Objectif glucides</span>
              <span className="font-medium text-foreground">
                {nutritionPlan.carbsPerHour.min}–{nutritionPlan.carbsPerHour.max} g/h
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground">Apport total estimé</span>
              <span className="font-medium text-foreground">≈ {nutritionPlan.totalCarbs} g</span>
            </div>
            <div className="rounded-lg border border-border bg-background p-3 space-y-2">
              {nutritionPlan.gels.length > 0 ? (
                nutritionPlan.gels.map(gel => (
                  <div
                    key={`${gel.timeOffsetMin}-${gel.carbsGr}-${gel.caffeinated ? 'caff' : 'std'}`}
                    className="flex flex-wrap items-center justify-between gap-2 text-xs"
                  >
                    <div className="font-medium text-foreground">
                      {formatTimeOffset(gel.timeOffsetMin)} • {gel.carbsGr} g
                      {gel.caffeinated ? ' · caféiné' : ''}
                    </div>
                    {gel.note && <div className="text-muted-foreground">{gel.note}</div>}
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Pas de gels requis sur cette séance. Hydratation légère recommandée : 150 ml
                  toutes les 20 minutes.
                </p>
              )}
            </div>
            {nutritionPlan.notes.length > 0 && (
              <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                {nutritionPlan.notes.map(note => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Ajoutez un plan de nutrition pour cette séance afin de visualiser les prises de gels et
            les rappels hydratation.
          </p>
        )}
      </section>
    </div>
  )
}

interface MetricCardProps {
  label: string
  value: string
  helper?: string
}

function MetricCard({ label, value, helper }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
    </div>
  )
}

function formatTimeOffset(minutes: number): string {
  if (minutes <= 0) {
    return 'Départ'
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  const parts: string[] = []
  if (hours > 0) {
    parts.push(`${hours} h`)
  }
  if (remainingMinutes > 0) {
    parts.push(`${remainingMinutes} min`)
  }

  return `+${parts.join(' ') || '0 min'}`
}
