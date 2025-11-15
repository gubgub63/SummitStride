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

export interface UpdateUserProfilePayload {
  dateOfBirth?: string | null
  weight?: number | null
  height?: number | null
  experienceLevel?: string
  fitnessGoals?: string[]
  medicalConditions?: string[]
  preferredTrainingDays?: number[]
  maxTrainingHoursPerWeek?: number
  vma?: number | null
}

export async function updateUserProfile(token: string, payload: UpdateUserProfilePayload) {
  return apiRequest<UserProfileResponse>('/api/users/detailed-profile', {
    method: 'PUT',
    token,
    body: payload,
  })
}

export interface ExperienceLevelOption {
  value: string
  label: string
  description?: string | null
}

export async function getExperienceLevels(token: string) {
  return apiRequest<{ experienceLevels: ExperienceLevelOption[] }>('/api/users/experience-levels', {
    method: 'GET',
    token,
  })
}

export async function getDaysOfWeek(token: string) {
  return apiRequest<{ daysOfWeek: Array<{ value: number; label: string }> }>('/api/users/days-of-week', {
    method: 'GET',
    token,
  })
}
