import { FastifyPluginAsync } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth.js'
import {
  CreateCourseRequest,
  UpdateCourseRequest,
  CourseSearchQuery,
  TrailCategory,
  COURSE_DIFFICULTIES,
  TRAIL_CATEGORIES,
  COURSE_SORT_OPTIONS,
} from '../types/course.js'
import { CourseUtils } from '../utils/course.js'

const prisma = new PrismaClient()

const courseRoutes: FastifyPluginAsync = async fastify => {

  // PUBLIC ROUTES (no authentication required)

  // Get courses with search and filtering (public for browsing)
  fastify.get<{ Querystring: CourseSearchQuery }>('/', async (request, reply) => {
    try {
      const filters = request.query
      const { page, limit, skip } = CourseUtils.calculatePagination(filters.page, filters.limit)

      // Build search query
      const where = CourseUtils.buildSearchQuery(filters)
      const orderBy = CourseUtils.buildOrderBy(filters.sortBy, filters.sortOrder)

      // Get courses with pagination
      const [courses, total] = await Promise.all([
        prisma.course.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include: {
            raceRegistrations: true,
          },
        }),
        prisma.course.count({ where }),
      ])

      // Get filter options for UI
      const allCourses = await prisma.course.findMany({
        select: {
          difficulty: true,
          location: true,
          distance: true,
        },
      })

      const difficulties = [...new Set(allCourses.map(c => c.difficulty))]
      const locations = CourseUtils.extractUniqueLocations(allCourses)
      const categories = Object.values(TrailCategory)

      const formattedCourses = courses.map(course => CourseUtils.formatCourseResponse(course))

      return reply.send({
        courses: formattedCourses,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        filters: {
          difficulties,
          categories,
          locations,
        },
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({
        error: 'Internal server error',
      })
    }
  })

  // Get a specific course by ID (public for sharing)
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    try {
      const { id } = request.params

      const course = await prisma.course.findUnique({
        where: { id },
        include: {
          raceRegistrations: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      })

      if (!course) {
        return reply.code(404).send({
          error: 'Course not found',
        })
      }

      const formattedCourse = CourseUtils.formatCourseResponse(course)

      return reply.send({
        course: formattedCourse,
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({
        error: 'Internal server error',
      })
    }
  })

  // Get course difficulties (public for filters)
  fastify.get('/meta/difficulties', async (request, reply) => {
    return reply.send({
      difficulties: COURSE_DIFFICULTIES,
    })
  })

  // Get trail categories (public for filters)
  fastify.get('/meta/categories', async (request, reply) => {
    return reply.send({
      categories: TRAIL_CATEGORIES,
    })
  })

  // Get sort options (public for UI)
  fastify.get('/meta/sort-options', async (request, reply) => {
    return reply.send({
      sortOptions: COURSE_SORT_OPTIONS,
    })
  })

  // Get course statistics (public for homepage/stats)
  fastify.get('/meta/statistics', async (request, reply) => {
    try {
      const [
        totalCourses,
        coursesByDifficulty,
        coursesByCategory,
        averageDistance,
        averageElevation,
      ] = await Promise.all([
        prisma.course.count(),
        prisma.course.groupBy({
          by: ['difficulty'],
          _count: { difficulty: true },
        }),
        prisma.course.findMany({
          select: { distance: true },
        }),
        prisma.course.aggregate({
          _avg: { distance: true },
        }),
        prisma.course.aggregate({
          _avg: { elevationGain: true },
        }),
      ])

      // Calculate categories from distances
      const categoryCounts = {
        SHORT: 0,
        LONG: 0,
        ULTRA: 0,
      }

      coursesByCategory.forEach(course => {
        const category = CourseUtils.determineTrailCategory(course.distance)
        categoryCounts[category]++
      })

      return reply.send({
        totalCourses,
        byDifficulty: coursesByDifficulty.reduce(
          (acc, item) => {
            acc[item.difficulty] = item._count.difficulty
            return acc
          },
          {} as Record<string, number>
        ),
        byCategory: categoryCounts,
        averageDistance: Math.round((averageDistance._avg.distance || 0) * 10) / 10,
        averageElevation: Math.round(averageElevation._avg.elevationGain || 0),
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({
        error: 'Internal server error',
      })
    }
  })

  // Search suggestions for autocomplete (public for UX)
  fastify.get('/meta/search-suggestions', async (request, reply) => {
    try {
      const { q } = request.query as { q?: string }

      if (!q || q.length < 2) {
        return reply.send({
          suggestions: [],
        })
      }

      const [nameResults, locationResults] = await Promise.all([
        prisma.course.findMany({
          where: {
            name: {
              contains: q,
              mode: 'insensitive',
            },
          },
          select: {
            name: true,
          },
          take: 5,
        }),
        prisma.course.findMany({
          where: {
            location: {
              contains: q,
              mode: 'insensitive',
            },
          },
          select: {
            location: true,
          },
          take: 5,
        }),
      ])

      const suggestions = [
        ...nameResults.map(r => ({ type: 'course', value: r.name })),
        ...locationResults.map(r => ({ type: 'location', value: r.location })),
      ]

      return reply.send({
        suggestions: suggestions.slice(0, 10),
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({
        error: 'Internal server error',
      })
    }
  })

  // PROTECTED ROUTES (authentication required)

  await fastify.register(async function (fastify) {
    // Add authentication middleware to this context
    fastify.addHook('onRequest', authMiddleware)

    // Create a new course (admin only)
    fastify.post<{ Body: CreateCourseRequest }>('/admin', async (request, reply) => {
      try {
        const courseData = request.body

        // Validate input data
        const validationErrors = CourseUtils.validateCourseData(courseData)
        if (validationErrors.length > 0) {
          return reply.code(400).send({
            error: 'Validation failed',
            details: validationErrors,
          })
        }

        // Validate route data if present
        if (courseData.routeData) {
          const routeErrors = CourseUtils.validateRouteData(courseData.routeData)
          if (routeErrors.length > 0) {
            return reply.code(400).send({
              error: 'Route data validation failed',
              details: routeErrors,
            })
          }
        }

        // Auto-calculate difficulty if not provided
        const difficulty =
          courseData.difficulty ||
          CourseUtils.calculateAutomaticDifficulty(courseData.distance, courseData.elevationGain)

        // Create course
        const course = await prisma.course.create({
          data: {
            name: courseData.name.trim(),
            location: courseData.location.trim(),
            distance: courseData.distance,
            elevationGain: courseData.elevationGain,
            elevationLoss: courseData.elevationLoss,
            difficulty,
            description: courseData.description?.trim() || null,
            routeData: courseData.routeData || null,
          },
          include: {
            raceRegistrations: true,
          },
        })

        const formattedCourse = CourseUtils.formatCourseResponse(course)

        return reply.code(201).send({
          message: 'Course created successfully',
          course: formattedCourse,
        })
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({
          error: 'Internal server error',
        })
      }
    })

    // Create a new course (athlete contribution)
    fastify.post<{ Body: CreateCourseRequest }>('/user', async (request, reply) => {
      try {
        const courseData = request.body

        // Basic validation (reuse existing helper)
        const validationErrors = CourseUtils.validateCourseData(courseData)
        if (validationErrors.length > 0) {
          return reply.code(400).send({
            error: 'Validation failed',
            details: validationErrors,
          })
        }

        const difficulty =
          courseData.difficulty ||
          CourseUtils.calculateAutomaticDifficulty(courseData.distance, courseData.elevationGain)

        const course = await prisma.course.create({
          data: {
            name: courseData.name.trim(),
            location: courseData.location.trim(),
            distance: courseData.distance,
            elevationGain: courseData.elevationGain,
            elevationLoss: courseData.elevationLoss ?? courseData.elevationGain,
            difficulty,
            description: courseData.description?.trim() || null,
            routeData: courseData.routeData || null,
          },
          include: { raceRegistrations: true },
        })

        const formattedCourse = CourseUtils.formatCourseResponse(course)

        return reply.code(201).send({
          message: 'Course created successfully',
          course: formattedCourse,
        })
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({
          error: 'Internal server error',
        })
      }
    })

    // Update a course (admin only)
    fastify.put<{ Params: { id: string }; Body: UpdateCourseRequest }>(
      '/admin/:id',
      async (request, reply) => {
        try {
          const { id } = request.params
          const updateData = request.body

          // Check if course exists
          const existingCourse = await prisma.course.findUnique({
            where: { id },
          })

          if (!existingCourse) {
            return reply.code(404).send({
              error: 'Course not found',
            })
          }

          // Validate input data
          const validationErrors = CourseUtils.validateCourseData(updateData)
          if (validationErrors.length > 0) {
            return reply.code(400).send({
              error: 'Validation failed',
              details: validationErrors,
            })
          }

          // Validate route data if present
          if (updateData.routeData) {
            const routeErrors = CourseUtils.validateRouteData(updateData.routeData)
            if (routeErrors.length > 0) {
              return reply.code(400).send({
                error: 'Route data validation failed',
                details: routeErrors,
              })
            }
          }

          // Prepare update data
          const courseUpdateData: any = {}

          if (updateData.name !== undefined) courseUpdateData.name = updateData.name.trim()
          if (updateData.location !== undefined)
            courseUpdateData.location = updateData.location.trim()
          if (updateData.distance !== undefined) courseUpdateData.distance = updateData.distance
          if (updateData.elevationGain !== undefined)
            courseUpdateData.elevationGain = updateData.elevationGain
          if (updateData.elevationLoss !== undefined)
            courseUpdateData.elevationLoss = updateData.elevationLoss
          if (updateData.description !== undefined)
            courseUpdateData.description = updateData.description?.trim() || null
          if (updateData.routeData !== undefined) courseUpdateData.routeData = updateData.routeData

          // Auto-calculate difficulty if distance or elevation changed and difficulty not explicitly set
          if (
            (updateData.distance !== undefined || updateData.elevationGain !== undefined) &&
            updateData.difficulty === undefined
          ) {
            const newDistance = updateData.distance ?? existingCourse.distance
            const newElevationGain = updateData.elevationGain ?? existingCourse.elevationGain
            courseUpdateData.difficulty = CourseUtils.calculateAutomaticDifficulty(
              newDistance,
              newElevationGain
            )
          } else if (updateData.difficulty !== undefined) {
            courseUpdateData.difficulty = updateData.difficulty
          }

          // Update course
          const updatedCourse = await prisma.course.update({
            where: { id },
            data: courseUpdateData,
            include: {
              raceRegistrations: true,
            },
          })

          const formattedCourse = CourseUtils.formatCourseResponse(updatedCourse)

          return reply.send({
            message: 'Course updated successfully',
            course: formattedCourse,
          })
        } catch (error) {
          fastify.log.error(error)
          return reply.code(500).send({
            error: 'Internal server error',
          })
        }
      }
    )

    // Delete a course (admin only)
    fastify.delete<{ Params: { id: string } }>('/admin/:id', async (request, reply) => {
      try {
        const { id } = request.params

        // Check if course exists
        const existingCourse = await prisma.course.findUnique({
          where: { id },
          include: {
            raceRegistrations: true,
            trainingPlans: true,
          },
        })

        if (!existingCourse) {
          return reply.code(404).send({
            error: 'Course not found',
          })
        }

        // Check if course has dependencies
        if (existingCourse.raceRegistrations.length > 0 || existingCourse.trainingPlans.length > 0) {
          return reply.code(409).send({
            error: 'Cannot delete course with existing registrations or training plans',
            details: {
              registrations: existingCourse.raceRegistrations.length,
              trainingPlans: existingCourse.trainingPlans.length,
            },
          })
        }

        // Delete course
        await prisma.course.delete({
          where: { id },
        })

        return reply.send({
          message: 'Course deleted successfully',
        })
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({
          error: 'Internal server error',
        })
      }
    })
  })
}

export default courseRoutes
