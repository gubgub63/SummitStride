/**
 * Types d'Authentification - Coach IA Hugo
 * Types TypeScript pour l'authentification et gestion utilisateur
 */

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
  updatedAt?: string
}

export interface UserProfile {
  id: string
  userId: string
  dateOfBirth: string | null
  age: number | null
  weight: number | null
  height: number | null
  bmi: number | null
  experienceLevel: ExperienceLevel | null
  fitnessGoals: string[]
  medicalConditions: string[]
  preferredTrainingDays: number[]
  maxTrainingHoursPerWeek: number | null
  vma: number | null
  createdAt: string
  updatedAt: string
}

export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'

export interface AuthState {
  user: User | null
  profile: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// Requêtes d'authentification
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  name: string
  password: string
}

export interface ForgotPasswordRequest {
  email: string
}

// Réponses d'authentification
export interface AuthResponse {
  message: string
  user: User
  token: string
}

export interface ProfileResponse {
  user: User & {
    profile: UserProfile | null
    preferences: any
  }
}

// Requêtes de profil détaillé
export interface CreateProfileRequest {
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

export interface UpdateProfileRequest extends Partial<CreateProfileRequest> {}

// Complétude du profil
export interface ProfileCompletion {
  completionPercentage: number
  missingFields: string[]
  completedFields: string[]
  hasProfile: boolean
}

// Utilitaires pour les formulaires
export interface FormErrors {
  [key: string]: string | undefined
}

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | undefined
}

export interface FormField {
  name: string
  label: string
  type: string
  placeholder?: string
  validation?: ValidationRule
}

// Options pour les formulaires
export interface ExperienceLevelOption {
  value: ExperienceLevel
  label: string
  description: string
}

export interface DayOfWeekOption {
  value: number
  label: string
}

export interface FitnessGoalOption {
  value: string
  label: string
}