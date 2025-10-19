import { apiRequest } from './api'

export interface UserProfileResponse {
  user: {
    id: string
    email: string
    name: string
    createdAt: string
    updatedAt: string
    profile: {
      id: string
      userId: string
      dateOfBirth: string | null
      weight: number | null
      height: number | null
      experienceLevel: string
      fitnessGoals: string[]
      medicalConditions: string[]
      preferredTrainingDays: number[]
      maxTrainingHoursPerWeek: number
      vma: number | null
      createdAt: string
      updatedAt: string
    } | null
    preferences: {
      id: string
      userId: string
      language: string
      timezone: string
      units: 'METRIC' | 'IMPERIAL'
      notifications: Record<string, boolean>
      privacy: Record<string, boolean>
    } | null
  }
}

export async function getUserProfile(token: string) {
  return apiRequest<UserProfileResponse>('/api/users/profile', {
    method: 'GET',
    token,
  })
}
