import { ExperienceLevel } from '@coach-ia-hugo/shared'

export interface CreateUserProfileRequest {
  dateOfBirth?: string // ISO date string
  weight?: number // in kg
  height?: number // in cm
  experienceLevel: ExperienceLevel
  fitnessGoals?: string[]
  medicalConditions?: string[]
  preferredTrainingDays?: number[] // 0-6 (Sunday-Saturday)
  maxTrainingHoursPerWeek: number
  vma?: number // Vitesse Maximale Aérobie in km/h
}

export interface UpdateUserProfileRequest {
  dateOfBirth?: string
  weight?: number
  height?: number
  experienceLevel?: ExperienceLevel
  fitnessGoals?: string[]
  medicalConditions?: string[]
  preferredTrainingDays?: number[]
  maxTrainingHoursPerWeek?: number
  vma?: number
}

export interface ProfileCompletionResponse {
  completionPercentage: number
  missingFields: string[]
  completedFields: string[]
}

export interface UserProfileResponse {
  id: string
  userId: string
  dateOfBirth?: Date
  age?: number // calculated field
  weight?: number
  height?: number
  bmi?: number // calculated field
  experienceLevel: ExperienceLevel
  fitnessGoals: string[]
  medicalConditions: string[]
  preferredTrainingDays: number[]
  maxTrainingHoursPerWeek: number
  vma?: number
  createdAt: Date
  updatedAt: Date
}

export const EXPERIENCE_LEVELS = [
  {
    value: 'BEGINNER' as ExperienceLevel,
    label: 'Débutant',
    description: 'Moins de 6 mois d\'expérience en trail'
  },
  {
    value: 'INTERMEDIATE' as ExperienceLevel,
    label: 'Intermédiaire',
    description: '6 mois à 2 ans d\'expérience'
  },
  {
    value: 'ADVANCED' as ExperienceLevel,
    label: 'Avancé',
    description: '2 à 5 ans d\'expérience régulière'
  },
  {
    value: 'EXPERT' as ExperienceLevel,
    label: 'Expert',
    description: 'Plus de 5 ans d\'expérience et compétitions'
  }
] as const

export const COMMON_FITNESS_GOALS = [
  { value: 'finish_first_trail', label: 'Terminer mon premier trail' },
  { value: 'improve_endurance', label: 'Améliorer mon endurance' },
  { value: 'lose_weight', label: 'Perdre du poids' },
  { value: 'prepare_specific_race', label: 'Préparer une course spécifique' },
  { value: 'improve_speed', label: 'Améliorer ma vitesse' },
  { value: 'strengthen_muscles', label: 'Renforcer mes muscles' },
  { value: 'improve_technique', label: 'Améliorer ma technique de course' },
  { value: 'prevent_injuries', label: 'Prévenir les blessures' },
  { value: 'improve_recovery', label: 'Améliorer ma récupération' },
  { value: 'increase_weekly_distance', label: 'Augmenter mon kilométrage hebdomadaire' }
] as const

export const DAYS_OF_WEEK = [
  'Dimanche',
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi'
] as const
