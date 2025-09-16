import { z } from 'zod'

export const CourseDifficultySchema = z.enum(['EASY', 'MODERATE', 'HARD', 'EXTREME'])
export const WaypointTypeSchema = z.enum(['START', 'FINISH', 'AID_STATION', 'CHECKPOINT', 'WATER', 'VIEWPOINT'])

export const ElevationPointSchema = z.object({
  distance: z.number().min(0),
  elevation: z.number()
})

export const WaypointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  elevation: z.number().optional(),
  name: z.string().max(100).optional(),
  type: WaypointTypeSchema
})

export const RouteDataSchema = z.object({
  gpxData: z.string().optional(),
  waypoints: z.array(WaypointSchema),
  elevationProfile: z.array(ElevationPointSchema)
})

export const CourseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  location: z.string().min(1).max(200),
  distance: z.number().positive(),
  elevationGain: z.number().min(0),
  elevationLoss: z.number().min(0),
  difficulty: CourseDifficultySchema,
  description: z.string().max(2000).optional(),
  routeData: RouteDataSchema.optional(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const CreateCourseSchema = z.object({
  name: z.string().min(1).max(200),
  location: z.string().min(1).max(200),
  distance: z.number().positive(),
  elevationGain: z.number().min(0),
  elevationLoss: z.number().min(0),
  difficulty: CourseDifficultySchema,
  description: z.string().max(2000).optional(),
  routeData: RouteDataSchema.optional()
})

export type CreateCourseInput = z.infer<typeof CreateCourseSchema>