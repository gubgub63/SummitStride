import { z } from 'zod'

export const TrainingPlanStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'PAUSED'])
export const PlanPhaseSchema = z.enum(['BASE', 'BUILD', 'PEAK', 'TAPER', 'RECOVERY'])
export const TrainingTypeSchema = z.enum([
  'ENDURANCE',
  'THRESHOLD',
  'INTERVAL',
  'RECOVERY',
  'STRENGTH',
  'CROSS_TRAINING',
])
export const IntensitySchema = z.enum(['VERY_LOW', 'LOW', 'MODERATE', 'HIGH', 'VERY_HIGH'])

export const SessionMetricsSchema = z.object({
  actualDuration: z.number().positive().optional(),
  actualDistance: z.number().positive().optional(),
  averageHeartRate: z.number().min(40).max(220).optional(),
  maxHeartRate: z.number().min(40).max(220).optional(),
  calories: z.number().positive().optional(),
  elevationGain: z.number().min(0).optional(),
  averagePace: z.number().positive().optional(),
  perceivedExertion: z.number().min(1).max(10).optional(),
})

export const TrainingPlanSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  startDate: z.date(),
  endDate: z.date(),
  targetRaceId: z.string().uuid().optional(),
  status: TrainingPlanStatusSchema,
  sourceTemplateId: z.string().uuid().optional(),
  totalDuration: z.number().nonnegative().optional(),
  totalDistance: z.number().min(0).optional(),
  loadScore: z.number().nonnegative().optional(),
  progression: z.array(z.object({
    weekNumber: z.number().min(1),
    phase: PlanPhaseSchema.optional(),
    totalDuration: z.number().nonnegative(),
    totalDistance: z.number().min(0),
    loadScore: z.number().nonnegative(),
    sessionCount: z.number().nonnegative(),
  })).optional(),
  lastAnalyzedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const TrainingSessionSchema = z.object({
  id: z.string().uuid(),
  planId: z.string().uuid(),
  userId: z.string().uuid(),
  date: z.date(),
  type: TrainingTypeSchema,
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  duration: z.number().positive().optional(),
  distance: z.number().positive().optional(),
  intensity: IntensitySchema,
  completed: z.boolean(),
  templateSessionId: z.string().uuid().optional(),
  phase: PlanPhaseSchema.optional(),
  weekNumber: z.number().min(1).optional(),
  dayOfWeek: z.number().min(0).max(6).optional(),
  plannedLoad: z.number().nonnegative().optional(),
  metrics: SessionMetricsSchema.optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const CreateTrainingPlanSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  startDate: z.date(),
  endDate: z.date(),
  targetRaceId: z.string().uuid().optional(),
})

export type CreateTrainingPlanInput = z.infer<typeof CreateTrainingPlanSchema>

export const TrainingSessionTemplateSchema = z.object({
  id: z.string().uuid(),
  planTemplateId: z.string().uuid(),
  phase: PlanPhaseSchema,
  weekOffset: z.number().min(0),
  dayOfWeek: z.number().min(0).max(6),
  type: TrainingTypeSchema,
  intensity: IntensitySchema,
  duration: z.number().positive().optional(),
  distance: z.number().positive().optional(),
  description: z.string().max(500).optional(),
  focusAreas: z.array(z.string().min(1)).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const TrainingPlanTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  targetCategory: z.string().min(1),
  targetExperience: z.string().optional(),
  durationWeeks: z.number().min(1),
  sessions: z.array(TrainingSessionTemplateSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const TrainingPlanProgressSchema = z.object({
  totalDuration: z.number().nonnegative(),
  totalDistance: z.number().min(0),
  loadScore: z.number().nonnegative(),
  weekly: z.array(z.object({
    weekNumber: z.number().min(1),
    phase: PlanPhaseSchema.optional(),
    totalDuration: z.number().nonnegative(),
    totalDistance: z.number().min(0),
    loadScore: z.number().nonnegative(),
    sessionCount: z.number().nonnegative(),
  })),
})
