import { z } from 'zod'

export const ExperienceLevelSchema = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'])

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2).max(100),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  dateOfBirth: z.date().optional(),
  weight: z.number().min(20).max(300).optional(),
  height: z.number().min(100).max(250).optional(),
  experienceLevel: ExperienceLevelSchema,
  fitnessGoals: z.array(z.string()),
  medicalConditions: z.array(z.string()).optional(),
  preferredTrainingDays: z.array(z.number().min(0).max(6)),
  maxTrainingHoursPerWeek: z.number().min(1).max(50),
  vma: z.number().min(8).max(25).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  password: z.string().min(8).max(100),
})

export const UpdateUserProfileSchema = UserProfileSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).partial()

export type CreateUserInput = z.infer<typeof CreateUserSchema>
export type UpdateUserProfileInput = z.infer<typeof UpdateUserProfileSchema>
