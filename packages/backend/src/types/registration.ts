export interface CreateRaceRegistrationRequest {
  courseId: string
  targetDate?: string // ISO date string - date objectif de la course
  goal?: string // Objectif personnel (temps, finir, classement)
  notes?: string // Notes personnelles
}

export interface UpdateRaceRegistrationRequest {
  targetDate?: string
  goal?: string
  notes?: string
  status?: RaceRegistrationStatus
}

export interface RaceRegistrationResponse {
  id: string
  userId: string
  courseId: string
  status: RaceRegistrationStatus
  goal?: string
  notes?: string
  targetDate?: Date
  registrationDate: Date
  preparationTimeWeeks?: number
  preparationTimeDays?: number
  course: {
    id: string
    name: string
    location: string
    distance: number
    elevationGain: number
    difficulty: string
    category: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface RaceRegistrationListResponse {
  registrations: RaceRegistrationResponse[]
  summary: {
    total: number
    active: number
    completed: number
    upcoming: number
  }
}

export enum RaceRegistrationStatus {
  REGISTERED = 'REGISTERED',
  PREPARATION = 'PREPARATION',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DNS = 'DNS', // Did Not Start
  DNF = 'DNF'  // Did Not Finish
}

export const REGISTRATION_STATUS_LABELS = {
  REGISTERED: 'Inscrit',
  PREPARATION: 'En préparation',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
  DNS: 'Non-partant',
  DNF: 'Abandon'
} as const

export const COMMON_RACE_GOALS = [
  'Finir la course',
  'Sous les 4h',
  'Sous les 6h',
  'Sous les 10h',
  'Sous les 24h',
  'Top 10',
  'Top 50',
  'Première course',
  'Améliorer mon record personnel',
  'Découvrir le parcours'
] as const

// Utility types for preparation calculation
export interface PreparationPeriod {
  weeks: number
  days: number
  totalDays: number
  isAdequate: boolean
  recommendations: string[]
}

export interface PreparationAnalysis {
  period: PreparationPeriod
  userLevel: string
  courseCategory: string
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  suggestions: string[]
}