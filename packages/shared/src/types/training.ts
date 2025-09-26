export interface TrainingPlan {
  id: string
  userId: string
  name: string
  description?: string
  startDate: Date
  endDate: Date
  targetRaceId?: string
  status: TrainingPlanStatus
  sourceTemplateId?: string
  totalDuration?: number
  totalDistance?: number
  loadScore?: number
  progression?: WeeklyPlanProgress[]
  lastAnalyzedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export enum TrainingPlanStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED',
}

export enum PlanPhase {
  BASE = 'BASE',
  BUILD = 'BUILD',
  PEAK = 'PEAK',
  TAPER = 'TAPER',
  RECOVERY = 'RECOVERY',
}

export interface TrainingSession {
  id: string
  planId: string
  userId: string
  date: Date
  type: TrainingType
  name: string
  description?: string
  duration?: number
  distance?: number
  intensity: Intensity
  completed: boolean
  templateSessionId?: string
  phase?: PlanPhase
  weekNumber?: number
  dayOfWeek?: number
  plannedLoad?: number
  metrics?: SessionMetrics
  createdAt: Date
  updatedAt: Date
}

export enum TrainingType {
  ENDURANCE = 'ENDURANCE',
  THRESHOLD = 'THRESHOLD',
  INTERVAL = 'INTERVAL',
  RECOVERY = 'RECOVERY',
  STRENGTH = 'STRENGTH',
  CROSS_TRAINING = 'CROSS_TRAINING',
}

export enum Intensity {
  VERY_LOW = 'VERY_LOW',
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH',
}

export interface SessionMetrics {
  actualDuration?: number
  actualDistance?: number
  averageHeartRate?: number
  maxHeartRate?: number
  calories?: number
  elevationGain?: number
  averagePace?: number
  perceivedExertion?: number // 1-10 scale
}

export interface TrainingPlanTemplate {
  id: string
  name: string
  description?: string
  targetCategory: string
  targetExperience?: string
  durationWeeks: number
  sessions: TrainingSessionTemplate[]
  createdAt: Date
  updatedAt: Date
}

export interface TrainingSessionTemplate {
  id: string
  planTemplateId: string
  phase: PlanPhase
  weekOffset: number
  dayOfWeek: number
  type: TrainingType
  intensity: Intensity
  duration?: number
  distance?: number
  description?: string
  focusAreas: string[]
  createdAt: Date
  updatedAt: Date
}

export interface WeeklyPlanProgress {
  weekNumber: number
  phase?: PlanPhase
  totalDuration: number
  totalDistance: number
  loadScore: number
  sessionCount: number
}

export interface TrainingPlanProgress {
  totalDuration: number
  totalDistance: number
  loadScore: number
  weekly: WeeklyPlanProgress[]
}
