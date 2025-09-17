import { FastifyPluginAsync } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth.js'
import {
  CreateRaceRegistrationRequest,
  UpdateRaceRegistrationRequest,
  RaceRegistrationStatus,
  COMMON_RACE_GOALS,
  REGISTRATION_STATUS_LABELS,
} from '../types/registration.js'
import { RegistrationUtils } from '../utils/registration.js'
import { CourseUtils } from '../utils/course.js'

const prisma = new PrismaClient()

const registrationRoutes: FastifyPluginAsync = async fastify => {
  // All routes require authentication
  fastify.addHook('onRequest', authMiddleware)

  // Create a new race registration
  fastify.post<{ Body: CreateRaceRegistrationRequest }>('/', async (request, reply) => {
    try {
      const registrationData = request.body
      const userId = request.user!.userId

      // Validate input data
      const validationErrors = RegistrationUtils.validateRegistrationData(registrationData)
      if (validationErrors.length > 0) {
        return reply.code(400).send({
          error: 'Validation failed',
          details: validationErrors,
        })
      }

      // Check if course exists
      const course = await prisma.course.findUnique({
        where: { id: registrationData.courseId },
      })

      if (!course) {
        return reply.code(404).send({
          error: 'Course not found',
        })
      }

      // Get user's existing registrations
      const existingRegistrations = await prisma.raceRegistration.findMany({
        where: { userId },
      })

      // Check if user can register for this course (no duplicate active registrations)
      const canRegister = RegistrationUtils.validateUniqueRegistration(
        existingRegistrations,
        registrationData.courseId
      )

      if (!canRegister) {
        return reply.code(409).send({
          error: 'Une inscription active existe déjà pour cette course',
        })
      }

      // Get user experience level for validation
      const userProfile = await prisma.userProfile.findUnique({
        where: { userId },
      })

      if (userProfile) {
        // Check if user can register for this course based on experience
        const { canRegister: canRegisterForCourse, reasons } =
          RegistrationUtils.canRegisterForCourse(course, userProfile.experienceLevel)

        if (!canRegisterForCourse) {
          return reply.code(400).send({
            error: 'Registration not recommended',
            details: reasons,
          })
        }
      }

      // Create registration
      const registration = await prisma.raceRegistration.create({
        data: {
          userId,
          courseId: registrationData.courseId,
          targetDate: registrationData.targetDate ? new Date(registrationData.targetDate) : null,
          goal: registrationData.goal?.trim() || null,
          notes: registrationData.notes?.trim() || null,
          status: RaceRegistrationStatus.REGISTERED,
        },
        include: {
          course: true,
        },
      })

      const formattedRegistration = RegistrationUtils.formatRegistrationResponse(
        registration,
        course
      )

      return reply.code(201).send({
        message: 'Registration created successfully',
        registration: formattedRegistration,
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({
        error: 'Internal server error',
      })
    }
  })

  // Get user's race registrations
  fastify.get('/', async (request, reply) => {
    try {
      const userId = request.user!.userId

      const registrations = await prisma.raceRegistration.findMany({
        where: { userId },
        include: {
          course: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      const formattedRegistrations = registrations.map(reg =>
        RegistrationUtils.formatRegistrationResponse(reg, reg.course)
      )

      const summary = RegistrationUtils.getRegistrationSummary(registrations)

      return reply.send({
        registrations: formattedRegistrations,
        summary,
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({
        error: 'Internal server error',
      })
    }
  })

  // Get a specific race registration by ID
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    try {
      const { id } = request.params
      const userId = request.user!.userId

      const registration = await prisma.raceRegistration.findFirst({
        where: {
          id,
          userId, // Ensure user can only access their own registrations
        },
        include: {
          course: true,
          user: {
            select: {
              profile: true,
            },
          },
        },
      })

      if (!registration) {
        return reply.code(404).send({
          error: 'Registration not found',
        })
      }

      const formattedRegistration = RegistrationUtils.formatRegistrationResponse(
        registration,
        registration.course
      )

      // Add preparation analysis if target date is set
      if (registration.targetDate && registration.user.profile) {
        const courseCategory = CourseUtils.determineTrailCategory(registration.course.distance)
        const analysis = RegistrationUtils.analyzePreparation(
          registration.targetDate,
          registration.course.distance,
          courseCategory,
          registration.user.profile.experienceLevel
        )
        formattedRegistration.preparationAnalysis = analysis
      }

      return reply.send({
        registration: formattedRegistration,
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({
        error: 'Internal server error',
      })
    }
  })

  // Update a race registration
  fastify.put<{ Params: { id: string }; Body: UpdateRaceRegistrationRequest }>(
    '/:id',
    async (request, reply) => {
      try {
        const { id } = request.params
        const updateData = request.body
        const userId = request.user!.userId

        // Validate input data
        const validationErrors = RegistrationUtils.validateRegistrationData(updateData)
        if (validationErrors.length > 0) {
          return reply.code(400).send({
            error: 'Validation failed',
            details: validationErrors,
          })
        }

        // Check if registration exists and belongs to user
        const existingRegistration = await prisma.raceRegistration.findFirst({
          where: {
            id,
            userId,
          },
          include: {
            course: true,
          },
        })

        if (!existingRegistration) {
          return reply.code(404).send({
            error: 'Registration not found',
          })
        }

        // Prepare update data
        const registrationUpdateData: any = {}

        if (updateData.targetDate !== undefined) {
          registrationUpdateData.targetDate = updateData.targetDate
            ? new Date(updateData.targetDate)
            : null
        }
        if (updateData.goal !== undefined) {
          registrationUpdateData.goal = updateData.goal?.trim() || null
        }
        if (updateData.notes !== undefined) {
          registrationUpdateData.notes = updateData.notes?.trim() || null
        }
        if (updateData.status !== undefined) {
          registrationUpdateData.status = updateData.status
        }

        // Update registration
        const updatedRegistration = await prisma.raceRegistration.update({
          where: { id },
          data: registrationUpdateData,
          include: {
            course: true,
          },
        })

        const formattedRegistration = RegistrationUtils.formatRegistrationResponse(
          updatedRegistration,
          updatedRegistration.course
        )

        return reply.send({
          message: 'Registration updated successfully',
          registration: formattedRegistration,
        })
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({
          error: 'Internal server error',
        })
      }
    }
  )

  // Delete a race registration
  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    try {
      const { id } = request.params
      const userId = request.user!.userId

      // Check if registration exists and belongs to user
      const existingRegistration = await prisma.raceRegistration.findFirst({
        where: {
          id,
          userId,
        },
      })

      if (!existingRegistration) {
        return reply.code(404).send({
          error: 'Registration not found',
        })
      }

      // Delete registration
      await prisma.raceRegistration.delete({
        where: { id },
      })

      return reply.send({
        message: 'Registration deleted successfully',
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({
        error: 'Internal server error',
      })
    }
  })

  // Get registration status labels
  fastify.get('/meta/status-labels', async (request, reply) => {
    return reply.send({
      statusLabels: REGISTRATION_STATUS_LABELS,
    })
  })

  // Get common race goals
  fastify.get('/meta/common-goals', async (request, reply) => {
    return reply.send({
      commonGoals: COMMON_RACE_GOALS,
    })
  })

  // Get preparation analysis for a registration
  fastify.get<{ Params: { id: string } }>('/:id/preparation-analysis', async (request, reply) => {
    try {
      const { id } = request.params
      const userId = request.user!.userId

      const registration = await prisma.raceRegistration.findFirst({
        where: {
          id,
          userId,
        },
        include: {
          course: true,
          user: {
            select: {
              profile: true,
            },
          },
        },
      })

      if (!registration) {
        return reply.code(404).send({
          error: 'Registration not found',
        })
      }

      if (!registration.targetDate) {
        return reply.code(400).send({
          error: 'No target date set for this registration',
        })
      }

      if (!registration.user.profile) {
        return reply.code(400).send({
          error: 'User profile not found - needed for preparation analysis',
        })
      }

      const courseCategory = CourseUtils.determineTrailCategory(registration.course.distance)
      const analysis = RegistrationUtils.analyzePreparation(
        registration.targetDate,
        registration.course.distance,
        courseCategory,
        registration.user.profile.experienceLevel
      )

      return reply.send({
        analysis,
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({
        error: 'Internal server error',
      })
    }
  })
}

export default registrationRoutes
