/**
 * Données mockées pour l'entraînement
 * Phase 4.6 - Pour développement et tests
 */

import { TrainingPlan, TrainingSession } from '../../types/training'

// Fonction utilitaire pour créer une date dans le futur/passé
function createDate(daysFromToday: number): string {
  const date = new Date()
  date.setDate(date.getDate() + daysFromToday)
  return date.toISOString()
}

// Plan d'entraînement mock
export const mockTrainingPlan: TrainingPlan = {
  id: 'plan-1',
  name: 'Préparation Ultra Trail 100km',
  description: 'Plan de 16 semaines pour se préparer à un ultra trail de 100km avec 4000m de dénivelé',
  startDate: createDate(-30), // Commencé il y a 30 jours
  endDate: createDate(80),   // Se termine dans 80 jours
  status: 'ACTIVE',
  targetRaceId: 'race-1',
  userId: 'user-1',
  createdAt: createDate(-35),
  updatedAt: createDate(-1)
}

// Séances de la semaine courante (pour ton composant WeeklyPlanWidget)
export const mockWeeklyTrainingSessions: TrainingSession[] = [
  {
    id: 'session-1',
    planId: 'plan-1',
    name: 'Course facile matinale',
    description: 'Course d\'échauffement en endurance fondamentale, rythme conversationnel',
    scheduledDate: createDate(1), // Demain (Mardi)
    duration: 45,
    type: 'EASY_RUN',
    intensity: 'EASY',
    status: 'SCHEDULED',
    createdAt: createDate(-7),
    updatedAt: createDate(-7)
  },
  {
    id: 'session-2',
    planId: 'plan-1',
    name: 'Séance fractionné 5x1000m',
    description: '5 répétitions de 1000m avec 2min de récupération. Allure légèrement plus rapide que le seuil.',
    scheduledDate: createDate(3), // Jeudi
    duration: 75,
    type: 'INTERVAL_TRAINING',
    intensity: 'HARD',
    status: 'SCHEDULED',
    createdAt: createDate(-7),
    updatedAt: createDate(-7)
  },
  {
    id: 'session-3',
    planId: 'plan-1',
    name: 'Sortie longue trail',
    description: 'Sortie longue de 2h30 en montagne, privilégier le dénivelé positif',
    scheduledDate: createDate(5), // Samedi
    duration: 150,
    type: 'LONG_RUN',
    intensity: 'MODERATE',
    status: 'SCHEDULED',
    createdAt: createDate(-7),
    updatedAt: createDate(-7)
  },
  {
    id: 'session-4',
    planId: 'plan-1',
    name: 'Récupération active',
    description: 'Course très facile de récupération, ou marche rapide si fatigue',
    scheduledDate: createDate(6), // Dimanche
    duration: 30,
    type: 'RECOVERY_RUN',
    intensity: 'VERY_EASY',
    status: 'SCHEDULED',
    createdAt: createDate(-7),
    updatedAt: createDate(-7)
  },
  // Séance passée (pour montrer le statut "COMPLETED")
  {
    id: 'session-5',
    planId: 'plan-1',
    name: 'Renforcement musculaire',
    description: 'Circuit de renforcement spécifique trail: mollets, quadriceps, fessiers',
    scheduledDate: createDate(-1), // Hier (Lundi)
    duration: 45,
    type: 'STRENGTH_TRAINING',
    intensity: 'MODERATE',
    status: 'COMPLETED',
    actualDuration: 50,
    completedAt: createDate(-1),
    notes: 'Très bonne séance, j\'ai ajouté 5 minutes d\'étirements',
    createdAt: createDate(-8),
    updatedAt: createDate(-1)
  }
]

// Données pour les statistiques du dashboard
export const mockTrainingStats = {
  activePlans: 1,
  weeklySessionsCompleted: 2,
  weeklySessionsTotal: 4,
  monthlyDistance: 245, // km
  nextSession: mockWeeklyTrainingSessions.find(s => s.status === 'SCHEDULED'),
  recentActivity: [
    {
      id: 'activity-1',
      name: 'Course facile 8km',
      date: createDate(-2),
      duration: 40,
      type: 'EASY_RUN' as const
    },
    {
      id: 'activity-2',
      name: 'Sortie longue 18km',
      date: createDate(-5),
      duration: 105,
      type: 'LONG_RUN' as const
    },
    {
      id: 'activity-3',
      name: 'Fractionné 6x800m',
      date: createDate(-7),
      duration: 60,
      type: 'INTERVAL_TRAINING' as const
    }
  ]
}

// Fonction utilitaire pour obtenir le lundi de la semaine courante
export function getCurrentWeekStart(): Date {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = Dimanche, 1 = Lundi, etc.
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Si dimanche, reculer de 6 jours

  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset)
  monday.setHours(0, 0, 0, 0) // Minuit

  return monday
}

// Fonction utilitaire pour formater la durée
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours}h`
  }

  return `${hours}h${remainingMinutes.toString().padStart(2, '0')}`
}

// Fonction utilitaire pour vérifier si une date est aujourd'hui
export function isToday(date: Date): boolean {
  const today = new Date()
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear()
}