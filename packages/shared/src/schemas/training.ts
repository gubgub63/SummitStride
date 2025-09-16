import { z } from 'zod'

export const TrainingPlanStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'PAUSED'])
export const TrainingTypeSchema = z.enum(['ENDURANCE', 'THRESHOLD', 'INTERVAL', 'RECOVERY', 'STRENGTH', 'CROSS_TRAINING'])
export const IntensitySchema = z.enum(['VERY_LOW', 'LOW', 'MODERATE', 'HIGH', 'VERY_HIGH'])

export const SessionMetricsSchema = z.object({
  actualDuration: z.number().positive().optional(),
  actualDistance: z.number().positive().optional(),
  averageHeartRate: z.number().min(40).max(220).optional(),
  maxHeartRate: z.number().min(40).max(220).optional(),
  calories: z.number().positive().optional(),
  elevationGain: z.number().min(0).optional(),
  averagePace: z.number().positive().optional(),
  perceivedExertion: z.number().min(1).max(10).optional()
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
  createdAt: z.date(),
  updatedAt: z.date()
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
  metrics: SessionMetricsSchema.optional(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const CreateTrainingPlanSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  startDate: z.date(),
  endDate: z.date(),
  targetRaceId: z.string().uuid().optional()
})

export type CreateTrainingPlanInput = z.infer<typeof CreateTrainingPlanSchema>