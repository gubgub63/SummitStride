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

export const EXPERIENCE_LEVELS = {
  BEGINNER: 'Débutant - Moins de 6 mois d\'expérience en trail',
  INTERMEDIATE: 'Intermédiaire - 6 mois à 2 ans d\'expérience',
  ADVANCED: 'Avancé - 2 à 5 ans d\'expérience régulière',
  EXPERT: 'Expert - Plus de 5 ans d\'expérience et compétitions'
} as const

export const COMMON_FITNESS_GOALS = [
  'Terminer mon premier trail',
  'Améliorer mon endurance',
  'Perdre du poids',
  'Préparer une course spécifique',
  'Améliorer ma vitesse',
  'Renforcer mes muscles',
  'Améliorer ma technique de course',
  'Prévenir les blessures',
  'Améliorer ma récupération',
  'Augmenter mon kilométrage hebdomadaire'
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
