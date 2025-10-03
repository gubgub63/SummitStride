/**
 * WeeklyPlanWidget - Composant d'apprentissage React
 *
 * 🎯 TON DÉFI : Implémenter ce composant pour apprendre React !
 *
 * Concepts React à apprendre dans ce composant :
 * ✅ Props (recevoir des données du parent)
 * ✅ useState (gérer l'état local)
 * ✅ Conditional rendering (affichage conditionnel)
 * ✅ Event handlers (gérer les clics)
 * ✅ Map pour les listes (afficher des listes d'éléments)
 * ✅ CSS classes conditionnelles (changer l'apparence selon l'état)
 *
 * 📋 INSTRUCTIONS POUR TOI :
 *
 * 1. Regarde les imports et types ci-dessous
 * 2. Utilise useState pour gérer le jour sélectionné
 * 3. Génère un tableau de 7 jours (Lundi à Dimanche)
 * 4. Affiche chaque jour avec sa date
 * 5. Ajoute des pastilles colorées si une séance est prévue
 * 6. Gère le clic sur un jour pour le sélectionner
 * 7. Affiche les détails de la séance sélectionnée
 *
 * 💡 AIDE :
 * - Regarde les données dans mockTrainingData.ts
 * - Utilise les couleurs de SESSION_TYPE_COLORS
 * - Inspire-toi du GoalTracker.tsx pour la structure
 * - N'hésite pas à demander de l'aide !
 */

'use client'

import React, { useState } from 'react'
import type { WeeklyPlanProps, TrainingSession, DailySession } from '../../types/training'
import { isToday } from '../../lib/data/mockTrainingData'

export function WeeklyPlanWidget({
  weekStartDate,
  trainingSessions,
  className = '',
}: WeeklyPlanProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const days = Array.from({ length: 7 }, (_, index) => {
    const d = new Date(weekStartDate)
    d.setDate(d.getDate() + index)
    return d
  })

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 🎯 Grille des 7 jours - TON CODE ICI */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((currentDay, idx) => {
          const session = trainingSessions.find(session => isSameDay(session.date, currentDay))
          const isCurrentDay = isToday(currentDay)

          return (
            <div
              key={idx}
              className={`text-center p-2 border rounded-md cursor-pointer hover:bg-accent/50 ${
                isCurrentDay ? 'border-green-500 border-2' : 'border-border'
              }`}
              onClick={() => setSelectedDay(idx)}
            >
              <div className="text-xs text-muted-foreground mb-1">{getDayName(currentDay)}</div>
              <div className="text-sm font-medium">{getDayNumber(currentDay)}</div>

              {/* Pastilles */}
              <div className="flex justify-center items-center space-x-1 mt-1">
                {/* Pastille si séance prévue */}
                {session && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                {/* Pastille si jour d'aujourd'hui */}
                {isCurrentDay && <div className="w-2 h-2 rounded-full bg-green-600"></div>}
              </div>
            </div>
          )
        })}
      </div>

      {selectedDay !== null &&
        days[selectedDay] &&
        (() => {
          const selectedSession = trainingSessions.find(session =>
            isSameDay(session.date, days[selectedDay])
          )
          if (selectedSession) {
            return (
              <div className="mt-4 rounded-lg bg-accent/30 p-4">
                <div className="text-sm font-medium mb-2">Détail de la séance</div>
                <TrainingSessionDetail session={selectedSession} />
              </div>
            )
          } else {
            return (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center text-muted-foreground text-sm">
                  Aucune séance planifiée pour ce jour
                </div>
              </div>
            )
          }
        })()}

      {/* Message si aucun jour sélectionné */}
      {selectedDay === null && (
        <div className="text-center text-muted-foreground text-sm py-4">
          Cliquez sur un jour pour voir le détail de la séance
        </div>
      )}
    </div>
  )
}

function isSameDay(dateString: string, date: Date): boolean {
  const sessionDate = new Date(dateString)
  return (
    sessionDate.getDate() === date.getDate() &&
    sessionDate.getMonth() === date.getMonth() &&
    sessionDate.getFullYear() === date.getFullYear()
  )
}

/**
 * Obtient le nom court du jour (Lun, Mar, etc.)
 */
function getDayName(date: Date): string {
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
  return days[date.getDay()]
}

/**
 * Obtient le numéro du jour du mois
 */
function getDayNumber(date: Date): number {
  return date.getDate()
}
