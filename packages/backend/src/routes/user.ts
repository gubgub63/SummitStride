import { FastifyPluginAsync } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth.js'
import {
  CreateUserProfileRequest,
  UpdateUserProfileRequest,
  EXPERIENCE_LEVELS,
  COMMON_FITNESS_GOALS,
  DAYS_OF_WEEK
} from '../types/profile.js'
import { ProfileUtils } from '../utils/profile.js'

const prisma = new PrismaClient()

const userRoutes: FastifyPluginAsync = async fastify => {
  // All routes in this plugin will require authentication
  fastify.addHook('onRequest', authMiddleware)

  // Get user profile with extended information
  fastify.get('/profile', async (request, reply) => {
    try {
      const userId = request.user!.userId

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          preferences: true,
        },
      })

      if (!user) {
        return reply.code(404).send({
          error: 'User not found',
        })
      }

      return reply.send({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          profile: user.profile,
          preferences: user.preferences,
        },
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({
        error: 'Internal server error',
      })
    }
  })

  // Update user basic information
  fastify.put('/profile', async (request, reply) => {
    try {
      const userId = request.user!.userId
      const { name } = request.body as { name?: string }

      if (!name) {
        return reply.code(400).send({
          error: 'Name is required',
        })
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { name },
        select: {
          id: true,
          email: true,
          name: true,
          updatedAt: true,
        },
      })

      return reply.send({
        message: 'Profile updated successfully',
        user: updatedUser,
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({
        error: 'Internal server error',
      })
    }
  })

  // Create detailed user profile
  fastify.post<{ Body: CreateUserProfileRequest }>('/detailed-profile', async (request, reply) => {
    try {
      const userId = request.user!.userId
      const profileData = request.body

      // Validate input data
      const validationErrors = ProfileUtils.validateProfileData(profileData)
      if (validationErrors.length > 0) {
        return reply.code(400).send({
          error: 'Validation failed',
          details: validationErrors
        })
      }

      // Check if profile already exists
      const existingProfile = await prisma.userProfile.findUnique({
        where: { userId }
      })

      if (existingProfile) {
        return reply.code(409).send({
          error: 'User profile already exists. Use PUT to update.'
        })
      }

      // Create profile
      const profile = await prisma.userProfile.create({
        data: {
          userId,
          dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : null,
          weight: profileData.weight ?? null,
          height: profileData.height ?? null,
          experienceLevel: profileData.experienceLevel,
          fitnessGoals: profileData.fitnessGoals || [],
          medicalConditions: profileData.medicalConditions || [],
          preferredTrainingDays: profileData.preferredTrainingDays || [],
          maxTrainingHoursPerWeek: profileData.maxTrainingHoursPerWeek,
          vma: profileData.vma ?? null
        }
      })

      const formattedProfile = ProfileUtils.formatProfileResponse(profile)

      return reply.code(201).send({
        message: 'Profile created successfully',
        profile: formattedProfile
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({
        error: 'Internal server error'
      })
    }
  })

  // Update detailed user profile
  fastify.put<{ Body: UpdateUserProfileRequest }>('/detailed-profile', async (request, reply) => {
    try {
      const userId = request.user!.userId
      const profileData = request.body

      // Validate input data
      const validationErrors = ProfileUtils.validateProfileData(profileData)
      if (validationErrors.length > 0) {
        return reply.code(400).send({
          error: 'Validation failed',
          details: validationErrors
        })
      }

      // Check if profile exists
      const existingProfile = await prisma.userProfile.findUnique({
        where: { userId }
      })

      if (!existingProfile) {
        return reply.code(404).send({
          error: 'User profile not found. Use POST to create.'
        })
      }

      // Update profile
      const updateData: any = {}

      if (profileData.dateOfBirth !== undefined) {
        updateData.dateOfBirth = profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : null
      }
      if (profileData.weight !== undefined) updateData.weight = profileData.weight ?? null
      if (profileData.height !== undefined) updateData.height = profileData.height ?? null
      if (profileData.experienceLevel !== undefined) updateData.experienceLevel = profileData.experienceLevel
      if (profileData.fitnessGoals !== undefined) updateData.fitnessGoals = profileData.fitnessGoals
      if (profileData.medicalConditions !== undefined) updateData.medicalConditions = profileData.medicalConditions
      if (profileData.preferredTrainingDays !== undefined) updateData.preferredTrainingDays = profileData.preferredTrainingDays
      if (profileData.maxTrainingHoursPerWeek !== undefined) updateData.maxTrainingHoursPerWeek = profileData.maxTrainingHoursPerWeek
      if (profileData.vma !== undefined) updateData.vma = profileData.vma ?? null

      const updatedProfile = await prisma.userProfile.update({
        where: { userId },
        data: updateData
      })

      const formattedProfile = ProfileUtils.formatProfileResponse(updatedProfile)

      return reply.send({
        message: 'Profile updated successfully',
        profile: formattedProfile
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({
        error: 'Internal server error'
      })
    }
  })

  // Get detailed user profile
  fastify.get('/detailed-profile', async (request, reply) => {
    try {
      const userId = request.user!.userId

      const profile = await prisma.userProfile.findUnique({
        where: { userId }
      })

      if (!profile) {
        return reply.code(404).send({
          error: 'User profile not found'
        })
      }

      const formattedProfile = ProfileUtils.formatProfileResponse(profile)

      return reply.send({
        profile: formattedProfile
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({
        error: 'Internal server error'
      })
    }
  })

  // Get profile completion status
  fastify.get('/profile-completion', async (request, reply) => {
    try {
      const userId = request.user!.userId

      const profile = await prisma.userProfile.findUnique({
        where: { userId }
      })

      if (!profile) {
        return reply.send({
          completionPercentage: 0,
          missingFields: ['dateOfBirth', 'weight', 'height', 'experienceLevel', 'maxTrainingHoursPerWeek'],
          completedFields: [],
          hasProfile: false
        })
      }

      const completion = ProfileUtils.calculateProfileCompletion(profile)

      return reply.send({
        ...completion,
        hasProfile: true
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({
        error: 'Internal server error'
      })
    }
  })

  // Get available experience levels
  fastify.get('/experience-levels', async (_request, reply) => {
    return reply.send({
      experienceLevels: EXPERIENCE_LEVELS
    })
  })

  // Get common fitness goals
  fastify.get('/fitness-goals', async (_request, reply) => {
    return reply.send({
      commonGoals: COMMON_FITNESS_GOALS
    })
  })

  // Get days of week
  fastify.get('/days-of-week', async (_request, reply) => {
    return reply.send({
      daysOfWeek: DAYS_OF_WEEK.map((day, index) => ({
        value: index,
        label: day
      }))
    })
  })
}

export default userRoutes
