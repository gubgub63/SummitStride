export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
  profile?: UserProfile
}

export interface UserProfile {
  id: string
  userId: string
  dateOfBirth?: Date
  weight?: number
  height?: number
  experienceLevel: ExperienceLevel
  fitnessGoals: string[]
  medicalConditions?: string[]
  preferredTrainingDays: number[]
  maxTrainingHoursPerWeek: number
  vma?: number // Vitesse Maximale Aérobie
  createdAt: Date
  updatedAt: Date
}

export enum ExperienceLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

export interface UserPreferences {
  id: string
  userId: string
  language: string
  timezone: string
  units: 'METRIC' | 'IMPERIAL'
  notifications: NotificationSettings
  privacy: PrivacySettings
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  trainingReminders: boolean
  nutritionReminders: boolean
  weeklyReports: boolean
}

export interface PrivacySettings {
  profilePublic: boolean
  trainingDataPublic: boolean
  allowDataSharing: boolean
}
