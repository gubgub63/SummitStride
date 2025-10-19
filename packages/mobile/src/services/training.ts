import type { TrainingPlanStatus } from '@summitstride/shared'

import { apiRequest } from './api'

export interface TrainingPlanSummary {
  id: string
  userId: string
  name: string
  description: string | null
  startDate: string
  endDate: string
  targetRaceId: string | null
  status: TrainingPlanStatus
  sourceTemplateId: string | null
  totalDuration: number | null
  totalDistance: number | null
  loadScore: number | null
  createdAt: string
  updatedAt: string
  targetRace?: {
    id: string
    name: string
    distance: number
    elevationGain: number
    difficulty: string
  } | null
  _count?: {
    trainingSessions: number
  }
}

export interface TrainingPlansResponse {
  success: boolean
  data: TrainingPlanSummary[]
}

export async function getTrainingPlans(token: string) {
  return apiRequest<TrainingPlansResponse>('/api/training-plans', {
    method: 'GET',
    token,
  })
}

export interface TrainingSession {
  id: string
  planId: string
  userId: string
  date: string
  type: string
  name: string
  description: string | null
  duration: number | null
  distance: number | null
  intensity: string
  completed: boolean
  phase: string | null
  weekNumber: number | null
  dayOfWeek: number | null
}

export interface TrainingPlanDetails extends TrainingPlanSummary {
  trainingSessions: TrainingSession[]
}

export interface TrainingPlanDetailsResponse {
  success: boolean
  data: TrainingPlanDetails
}

export async function getTrainingPlanById(token: string, planId: string) {
  return apiRequest<TrainingPlanDetailsResponse>(`/api/training-plans/${planId}`, {
    method: 'GET',
    token,
  })
}

interface CreateTrainingPlanPayload {
  name: string
  description?: string
  startDate: string
  endDate: string
  targetRaceId?: string
}

export async function createTrainingPlan(token: string, payload: CreateTrainingPlanPayload) {
  return apiRequest<TrainingPlanDetailsResponse>('/api/training-plans', {
    method: 'POST',
    token,
    body: payload,
  })
}

export interface TrainingPlanTemplate {
  id: string
  name: string
  description: string | null
  targetCategory: string
  targetExperience: string | null
  durationWeeks: number
}

export interface TrainingPlanTemplatesResponse {
  success: boolean
  data: TrainingPlanTemplate[]
}

export async function getTrainingPlanTemplates(token: string) {
  return apiRequest<TrainingPlanTemplatesResponse>('/api/training-plan-templates', {
    method: 'GET',
    token,
  })
}
