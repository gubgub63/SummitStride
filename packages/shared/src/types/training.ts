export interface TrainingPlan {
  id: string
  userId: string
  name: string
  description?: string
  startDate: Date
  endDate: Date
  targetRaceId?: string
  status: TrainingPlanStatus
  createdAt: Date
  updatedAt: Date
}

export enum TrainingPlanStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED',
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
