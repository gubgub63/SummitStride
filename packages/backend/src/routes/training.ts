/**
 * Routes pour la gestion des plans d'entraînement
 * Phase 5.1 - Algorithme de génération de base
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { TrainingPlanStatus, TrainingType, Intensity } from '@coach-ia-hugo/shared'
import { authMiddleware } from '../middleware/auth'
import { TrainingPlanGenerator } from '../services/trainingPlanGenerator'

// Schémas de validation
const createTrainingPlanSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  targetRaceId: z.string().optional(),
})

const createTrainingSessionSchema = z.object({
  planId: z.string().optional(),
  date: z.string().transform((str) => new Date(str)),
  type: z.nativeEnum(TrainingType),
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
  duration: z.number().positive().optional(),
  distance: z.number().positive().optional(),
  intensity: z.nativeEnum(Intensity),
})

const generatePlanSchema = z.object({
  targetRaceId: z.string(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  preferences: z.object({
    sessionsPerWeek: z.number().min(1).max(7).default(4),
    preferredDays: z.array(z.number().min(0).max(6)).optional(),
    maxSessionDuration: z.number().positive().default(120), // minutes
    includeStrength: z.boolean().default(true),
    includeCrossTraining: z.boolean().default(false),
  }).optional().default({}),
})

export async function trainingRoutes(fastify: FastifyInstance) {
  // Instance du générateur de plans avec Prisma
  const trainingPlanGenerator = new TrainingPlanGenerator(fastify.prisma)

  // Middleware d'authentification pour toutes les routes
  fastify.register(async function (fastify) {
    fastify.addHook('preHandler', authMiddleware)

    // ============================
    // TRAINING PLANS CRUD
    // ============================

    // GET /api/training-plans - Liste des plans d'entraînement
    fastify.get('/training-plans', async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = (request as any).user

        const plans = await fastify.prisma.trainingPlan.findMany({
          where: { userId: user.userId || user.id },
          include: {
            targetRace: {
              select: {
                id: true,
                name: true,
                distance: true,
                elevationGain: true,
                difficulty: true,
              },
            },
            _count: {
              select: {
                trainingSessions: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        })

        reply.send({
          success: true,
          data: plans,
        })
      } catch (error) {
        fastify.log.error(error)
        reply.code(500).send({
          success: false,
          error: 'Erreur lors de la récupération des plans',
        })
      }
    })

    // GET /api/training-plans/:id - Détail d'un plan
    fastify.get<{ Params: { id: string } }>(
      '/training-plans/:id',
      async (request, reply) => {
        try {
          const user = (request as any).user
          const { id } = request.params

          const plan = await fastify.prisma.trainingPlan.findFirst({
            where: {
              id,
              userId: user.userId || user.id,
            },
            include: {
              targetRace: true,
              trainingSessions: {
                orderBy: { date: 'asc' },
              },
            },
          })

          if (!plan) {
            return reply.code(404).send({
              success: false,
              error: 'Plan d\'entraînement non trouvé',
            })
          }

          reply.send({
            success: true,
            data: plan,
          })
        } catch (error) {
          fastify.log.error(error)
          reply.code(500).send({
            success: false,
            error: 'Erreur lors de la récupération du plan',
          })
        }
      }
    )

    // POST /api/training-plans - Création d'un plan
    fastify.post('/training-plans', async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = (request as any).user
        const validatedData = createTrainingPlanSchema.parse(request.body)

        const plan = await fastify.prisma.trainingPlan.create({
          data: {
            name: validatedData.name,
            description: validatedData.description || null,
            startDate: validatedData.startDate,
            endDate: validatedData.endDate,
            targetRaceId: validatedData.targetRaceId || null,
            userId: user.userId || user.id,
            status: TrainingPlanStatus.DRAFT,
          },
          include: {
            targetRace: true,
          },
        })

        reply.code(201).send({
          success: true,
          data: plan,
        })
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            success: false,
            error: 'Données invalides',
            details: error.errors,
          })
        }

        fastify.log.error(error)
        reply.code(500).send({
          success: false,
          error: 'Erreur lors de la création du plan',
        })
      }
    })

    // PUT /api/training-plans/:id - Modification d'un plan
    fastify.put<{ Params: { id: string } }>(
      '/training-plans/:id',
      async (request, reply) => {
        try {
          const user = (request as any).user
          const { id } = request.params
          const validatedData = createTrainingPlanSchema.partial().parse(request.body)

          const plan = await fastify.prisma.trainingPlan.updateMany({
            where: {
              id,
              userId: user.userId || user.id,
            },
            data: Object.fromEntries(
              Object.entries({
                name: validatedData.name,
                description: validatedData.description,
                startDate: validatedData.startDate,
                endDate: validatedData.endDate,
                targetRaceId: validatedData.targetRaceId,
              }).filter(([_, value]) => value !== undefined)
            ),
          })

          if (plan.count === 0) {
            return reply.code(404).send({
              success: false,
              error: 'Plan d\'entraînement non trouvé',
            })
          }

          const updatedPlan = await fastify.prisma.trainingPlan.findUnique({
            where: { id },
            include: { targetRace: true },
          })

          reply.send({
            success: true,
            data: updatedPlan,
          })
        } catch (error) {
          if (error instanceof z.ZodError) {
            return reply.code(400).send({
              success: false,
              error: 'Données invalides',
              details: error.errors,
            })
          }

          fastify.log.error(error)
          reply.code(500).send({
            success: false,
            error: 'Erreur lors de la modification du plan',
          })
        }
      }
    )

    // DELETE /api/training-plans/:id - Suppression d'un plan
    fastify.delete<{ Params: { id: string } }>(
      '/training-plans/:id',
      async (request, reply) => {
        try {
          const user = (request as any).user
          const { id } = request.params

          const plan = await fastify.prisma.trainingPlan.deleteMany({
            where: {
              id,
              userId: user.userId || user.id,
            },
          })

          if (plan.count === 0) {
            return reply.code(404).send({
              success: false,
              error: 'Plan d\'entraînement non trouvé',
            })
          }

          reply.send({
            success: true,
            message: 'Plan supprimé avec succès',
          })
        } catch (error) {
          fastify.log.error(error)
          reply.code(500).send({
            success: false,
            error: 'Erreur lors de la suppression du plan',
          })
        }
      }
    )

    // ============================
    // TRAINING SESSIONS CRUD
    // ============================

    // GET /api/training-sessions - Liste des séances
    fastify.get('/training-sessions', async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = (request as any).user
        const query = request.query as any

        const where: any = { userId: user.userId || user.id }

        // Filtres optionnels
        if (query.planId) {
          where.planId = query.planId
        }
        if (query.completed !== undefined) {
          where.completed = query.completed === 'true'
        }
        if (query.startDate && query.endDate) {
          where.date = {
            gte: new Date(query.startDate),
            lte: new Date(query.endDate),
          }
        }

        const sessions = await fastify.prisma.trainingSession.findMany({
          where,
          include: {
            plan: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { date: 'desc' },
          ...(query.limit && { take: parseInt(query.limit) }),
        })

        reply.send({
          success: true,
          data: sessions,
        })
      } catch (error) {
        fastify.log.error(error)
        reply.code(500).send({
          success: false,
          error: 'Erreur lors de la récupération des séances',
        })
      }
    })

    // POST /api/training-sessions - Création d'une séance
    fastify.post('/training-sessions', async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = (request as any).user
        const validatedData = createTrainingSessionSchema.parse(request.body)

        const session = await fastify.prisma.trainingSession.create({
          data: {
            planId: validatedData.planId || null,
            date: validatedData.date,
            type: validatedData.type,
            name: validatedData.name,
            description: validatedData.description || null,
            duration: validatedData.duration || null,
            distance: validatedData.distance || null,
            intensity: validatedData.intensity,
            userId: user.userId || user.id,
          },
          include: {
            plan: true,
          },
        })

        reply.code(201).send({
          success: true,
          data: session,
        })
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            success: false,
            error: 'Données invalides',
            details: error.errors,
          })
        }

        fastify.log.error(error)
        reply.code(500).send({
          success: false,
          error: 'Erreur lors de la création de la séance',
        })
      }
    })

    // PUT /api/training-sessions/:id - Modification d'une séance
    fastify.put<{ Params: { id: string } }>(
      '/training-sessions/:id',
      async (request, reply) => {
        try {
          const user = (request as any).user
          const { id } = request.params
          const validatedData = createTrainingSessionSchema.partial().parse(request.body)

          const session = await fastify.prisma.trainingSession.updateMany({
            where: {
              id,
              userId: user.userId || user.id,
            },
            data: Object.fromEntries(
              Object.entries({
                planId: validatedData.planId,
                date: validatedData.date,
                type: validatedData.type,
                name: validatedData.name,
                description: validatedData.description,
                duration: validatedData.duration,
                distance: validatedData.distance,
                intensity: validatedData.intensity,
              }).filter(([_, value]) => value !== undefined)
            ),
          })

          if (session.count === 0) {
            return reply.code(404).send({
              success: false,
              error: 'Séance d\'entraînement non trouvée',
            })
          }

          const updatedSession = await fastify.prisma.trainingSession.findUnique({
            where: { id },
            include: { plan: true },
          })

          reply.send({
            success: true,
            data: updatedSession,
          })
        } catch (error) {
          if (error instanceof z.ZodError) {
            return reply.code(400).send({
              success: false,
              error: 'Données invalides',
              details: error.errors,
            })
          }

          fastify.log.error(error)
          reply.code(500).send({
            success: false,
            error: 'Erreur lors de la modification de la séance',
          })
        }
      }
    )

    // ============================
    // PLAN GENERATION ENDPOINTS
    // ============================

    // POST /api/training-plans/generate - Génération automatique d'un plan
    fastify.post('/training-plans/generate', async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = (request as any).user
        const validatedData = generatePlanSchema.parse(request.body)

        // Récupération des données utilisateur et course
        const [userProfile, targetRace] = await Promise.all([
          fastify.prisma.user.findUnique({
            where: { id: user.userId || user.id },
            include: { preferences: true },
          }),
          fastify.prisma.course.findUnique({
            where: { id: validatedData.targetRaceId },
          }),
        ])

        if (!userProfile) {
          return reply.code(400).send({
            success: false,
            error: 'Profil utilisateur incomplet. Veuillez compléter votre profil d\'abord.',
          })
        }

        if (!targetRace) {
          return reply.code(404).send({
            success: false,
            error: 'Course cible non trouvée',
          })
        }

        // Adaptation du profil utilisateur
        const adaptedUserProfile = {
          experienceLevel: 'INTERMEDIATE', // Default value - should come from user profile
          currentFitnessLevel: 3, // Default value - should come from user profile
          vma: 15, // Default value - should come from user profile
          weight: 70, // Default value - should come from user profile
          weeklyTrainingHours: 6, // Default value - should come from user profile
          availableTrainingDays: ['1', '2', '3', '4', '5'], // Default value - should come from user profile
          goals: ['PERFORMANCE'], // Default value - should come from user profile
          medicalConditions: [], // Default value - should come from user profile
        }

        // Adaptation des préférences
        const adaptedPreferences = {
          sessionsPerWeek: validatedData.preferences?.sessionsPerWeek || 4,
          ...(validatedData.preferences?.preferredDays && { preferredDays: validatedData.preferences.preferredDays }),
          maxSessionDuration: validatedData.preferences?.maxSessionDuration || 120,
          includeStrength: validatedData.preferences?.includeStrength || true,
          includeCrossTraining: validatedData.preferences?.includeCrossTraining || false,
        }

        // Génération du plan avec l'algorithme
        const generatedPlan = await trainingPlanGenerator.generatePlan({
          user: {
            id: user.userId || user.id,
            profile: adaptedUserProfile,
          },
          targetRace,
          startDate: validatedData.startDate,
          endDate: validatedData.endDate,
          preferences: adaptedPreferences,
        })

        reply.code(201).send({
          success: true,
          data: generatedPlan,
          message: 'Plan d\'entraînement généré avec succès',
        })
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            success: false,
            error: 'Données invalides',
            details: error.errors,
          })
        }

        fastify.log.error(error)
        reply.code(500).send({
          success: false,
          error: 'Erreur lors de la génération du plan',
        })
      }
    })

    // GET /api/training-plans/:id/analysis - Analyse d'un plan
    fastify.get<{ Params: { id: string } }>(
      '/training-plans/:id/analysis',
      async (request, reply) => {
        try {
          const user = (request as any).user
          const { id } = request.params

          const plan = await fastify.prisma.trainingPlan.findFirst({
            where: {
              id,
              userId: user.userId || user.id,
            },
            include: {
              trainingSessions: true,
              targetRace: true,
            },
          })

          if (!plan) {
            return reply.code(404).send({
              success: false,
              error: 'Plan d\'entraînement non trouvé',
            })
          }

          const analysis = await trainingPlanGenerator.analyzePlan(plan)

          reply.send({
            success: true,
            data: analysis,
          })
        } catch (error) {
          fastify.log.error(error)
          reply.code(500).send({
            success: false,
            error: 'Erreur lors de l\'analyse du plan',
          })
        }
      }
    )

    // ============================
    // PHASE 5.2 - PERSONNALISATION AVANCÉE
    // ============================

    // GET /api/training-sessions/:id/alternatives - Alternatives de séance
    fastify.get<{
      Params: { id: string }
      Querystring: { weather?: string; injury?: string; equipment?: string }
    }>('/training-sessions/:id/alternatives', async (request, reply) => {
      try {
        const user = (request as any).user
        const { id } = request.params
        const constraints = request.query

        const session = await fastify.prisma.trainingSession.findFirst({
          where: {
            id,
            userId: user.userId || user.id,
          },
        })

        if (!session) {
          return reply.code(404).send({
            success: false,
            error: 'Séance d\'entraînement non trouvée',
          })
        }

        const alternatives = trainingPlanGenerator.generateSessionAlternatives(
          session,
          constraints
        )

        reply.send({
          success: true,
          data: alternatives,
          message: 'Alternatives générées avec succès',
        })
      } catch (error) {
        fastify.log.error(error)
        reply.code(500).send({
          success: false,
          error: 'Erreur lors de la génération des alternatives',
        })
      }
    })

    // POST /api/training-plans/generate-advanced - Génération avec personnalisation avancée
    fastify.post('/training-plans/generate-advanced', async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = (request as any).user
        const body = request.body as any

        const advancedPreferences = {
          ...body.preferences,
          // Phase 5.2 - Nouvelles options
          intensityPreference: body.intensityPreference || 'moderate',
          recoveryNeeds: body.recoveryNeeds || 'medium',
          injuryHistory: body.injuryHistory || [],
          focusAreas: body.focusAreas || ['endurance'],
          adaptToWeather: body.adaptToWeather || false,
          timeConstraints: body.timeConstraints || {}
        }

        const validatedData = generatePlanSchema.parse({
          ...body,
          preferences: advancedPreferences
        })

        // Récupération des données utilisateur et course
        const [userProfile, targetRace] = await Promise.all([
          fastify.prisma.user.findUnique({
            where: { id: user.userId || user.id },
            include: { preferences: true },
          }),
          fastify.prisma.course.findUnique({
            where: { id: validatedData.targetRaceId },
          }),
        ])

        if (!userProfile) {
          return reply.code(400).send({
            success: false,
            error: 'Profil utilisateur incomplet. Veuillez compléter votre profil d\'abord.',
          })
        }

        if (!targetRace) {
          return reply.code(404).send({
            success: false,
            error: 'Course cible non trouvée',
          })
        }

        // Adaptation du profil utilisateur avec données personnalisées
        const adaptedUserProfile = {
          experienceLevel: body.userProfile?.experienceLevel || 'INTERMEDIATE',
          currentFitnessLevel: body.userProfile?.currentFitnessLevel || 3,
          vma: body.userProfile?.vma || 15,
          weight: body.userProfile?.weight || 70,
          weeklyTrainingHours: body.userProfile?.weeklyTrainingHours || 6,
          availableTrainingDays: body.userProfile?.availableTrainingDays || ['1', '2', '3', '4', '5'],
          goals: body.userProfile?.goals || ['PERFORMANCE'],
          medicalConditions: body.userProfile?.medicalConditions || [],
        }

        // Génération du plan avec personnalisation avancée
        const generatedPlan = await trainingPlanGenerator.generatePlan({
          user: {
            id: user.userId || user.id,
            profile: adaptedUserProfile,
          },
          targetRace,
          startDate: validatedData.startDate,
          endDate: validatedData.endDate,
          preferences: advancedPreferences,
        })

        reply.code(201).send({
          success: true,
          data: generatedPlan,
          message: 'Plan d\'entraînement personnalisé généré avec succès',
        })
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            success: false,
            error: 'Données invalides',
            details: error.errors,
          })
        }

        fastify.log.error(error)
        reply.code(500).send({
          success: false,
          error: 'Erreur lors de la génération du plan personnalisé',
        })
      }
    })
  })
}