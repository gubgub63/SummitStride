import type { Course } from '@summitstride/shared'

import { apiRequest } from './api'

export interface RaceRegistration {
  id: string
  courseId: string
  status: string
  goal?: string | null
  notes?: string | null
  targetDate?: string | null
  createdAt: string
  updatedAt: string
  preparationTimeWeeks?: number
  preparationTimeDays?: number
  course: Course
}

export interface RegistrationsResponse {
  registrations: RaceRegistration[]
  summary: {
    total: number
    active: number
    completed: number
    upcoming: number
  }
}

export async function getRegistrations(token: string) {
  return apiRequest<RegistrationsResponse>('/api/registrations', {
    method: 'GET',
    token,
  })
}

export interface CreateRegistrationPayload {
  courseId: string
  targetDate?: string
  goal?: string
  notes?: string
}

export async function createRegistration(token: string, payload: CreateRegistrationPayload) {
  return apiRequest<{ registration: RaceRegistration }>('/api/registrations', {
    method: 'POST',
    token,
    body: payload,
  })
}

export async function deleteRegistration(token: string, registrationId: string) {
  return apiRequest<{ message: string }>(`/api/registrations/${registrationId}`, {
    method: 'DELETE',
    token,
  })
}
