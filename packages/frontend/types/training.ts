/**
 * Types TypeScript pour le système d'entraînement
 * Phase 4.6 - Plans d'Entraînement (UI)
 */

export interface TrainingPlan {
  id: string
  name: string
  description: string
  startDate: string // ISO date string
  endDate: string // ISO date string
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'PAUSED'
  targetRaceId?: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface TrainingSession {
  id: string
  planId: string
  name: string
  description: string
  scheduledDate: string // ISO date string
  duration: number // minutes
  type: SessionType
  intensity: SessionIntensity
  status: SessionStatus
  actualDuration?: number // minutes if completed
  completedAt?: string // ISO date string
  notes?: string
  createdAt: string
  updatedAt: string
}

export type SessionType =
  | 'EASY_RUN'           // Course facile
  | 'LONG_RUN'           // Sortie longue
  | 'INTERVAL_TRAINING'  // Fractionné
  | 'TEMPO_RUN'          // Course au seuil
  | 'HILL_TRAINING'      // Côtes
  | 'RECOVERY_RUN'       // Récupération
  | 'STRENGTH_TRAINING'  // Renforcement
  | 'CROSS_TRAINING'     // Entraînement croisé
  | 'REST'               // Repos

export type SessionIntensity =
  | 'VERY_EASY'    // Très facile
  | 'EASY'         // Facile
  | 'MODERATE'     // Modéré
  | 'HARD'         // Difficile
  | 'VERY_HARD'    // Très difficile

export type SessionStatus =
  | 'SCHEDULED'    // Planifiée
  | 'COMPLETED'    // Terminée
  | 'SKIPPED'      // Sautée
  | 'MODIFIED'     // Modifiée

// Types utilitaires pour les composants UI
export interface WeeklyPlanProps {
  weekStartDate: Date
  trainingSessions: TrainingSession[]
  className?: string
}

export interface DailySession {
  date: Date
  dayOfWeek: number // 0 = Dimanche, 1 = Lundi, etc.
  session?: TrainingSession
  isToday: boolean
}

// Utilitaires pour les couleurs et labels
export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  'EASY_RUN': 'Course facile',
  'LONG_RUN': 'Sortie longue',
  'INTERVAL_TRAINING': 'Fractionné',
  'TEMPO_RUN': 'Course au seuil',
  'HILL_TRAINING': 'Côtes',
  'RECOVERY_RUN': 'Récupération',
  'STRENGTH_TRAINING': 'Renforcement',
  'CROSS_TRAINING': 'Entraînement croisé',
  'REST': 'Repos'
}

export const SESSION_TYPE_COLORS: Record<SessionType, string> = {
  'EASY_RUN': 'bg-blue-100 text-blue-800',
  'LONG_RUN': 'bg-purple-100 text-purple-800',
  'INTERVAL_TRAINING': 'bg-red-100 text-red-800',
  'TEMPO_RUN': 'bg-orange-100 text-orange-800',
  'HILL_TRAINING': 'bg-yellow-100 text-yellow-800',
  'RECOVERY_RUN': 'bg-green-100 text-green-800',
  'STRENGTH_TRAINING': 'bg-gray-100 text-gray-800',
  'CROSS_TRAINING': 'bg-indigo-100 text-indigo-800',
  'REST': 'bg-gray-50 text-gray-600'
}

export const INTENSITY_LABELS: Record<SessionIntensity, string> = {
  'VERY_EASY': 'Très facile',
  'EASY': 'Facile',
  'MODERATE': 'Modéré',
  'HARD': 'Difficile',
  'VERY_HARD': 'Très difficile'
}

export const STATUS_LABELS: Record<SessionStatus, string> = {
  'SCHEDULED': 'Planifiée',
  'COMPLETED': 'Terminée',
  'SKIPPED': 'Sautée',
  'MODIFIED': 'Modifiée'
}