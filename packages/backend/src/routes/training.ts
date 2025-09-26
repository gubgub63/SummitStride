/**
 * Routes pour la gestion des plans d'entraînement
 * Phase 5.1 - Algorithme de génération de base
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { TrainingPlanStatus, TrainingType, Intensity, PlanPhase } from '@coach-ia-hugo/shared'
import { authMiddleware } from '../middleware/auth'
import { TrainingPlanGenerator } from '../services/trainingPlanGenerator'
import { ensureTemplateInfrastructure } from '../utils/schemaGuard.js'
import { TrainingPlanAnalytics } from '../services/trainingPlanAnalytics'

const toDate = (value: unknown) => {
  if (value instanceof Date) return value
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed
    }
  }
  return value
}

const vacationPeriodSchema = z.object({
  start: z.preprocess(toDate, z.date()),
  end: z.preprocess(toDate, z.date()),
})

const generationPreferencesSchema = z.object({
  sessionsPerWeek: z.number().min(1).max(7).optional(),
  preferredDays: z.array(z.number().min(0).max(6)).optional(),
  maxSessionDuration: z.number().positive().optional(),
  includeStrength: z.boolean().optional(),
  includeCrossTraining: z.boolean().optional(),
  intensityPreference: z.enum(['conservative', 'moderate', 'aggressive']).optional(),
  recoveryNeeds: z.enum(['low', 'medium', 'high']).optional(),
  injuryHistory: z.array(z.string()).optional(),
  focusAreas: z.array(z.enum(['endurance', 'strength', 'technical', 'speed'])).optional(),
  adaptToWeather: z.boolean().optional(),
  timeConstraints: z.object({
    workDays: z.array(z.number().min(0).max(6)).optional(),
    maxWeekendDuration: z.number().positive().optional(),
    vacationPeriods: z.array(vacationPeriodSchema).optional(),
  }).optional(),
}).default({})

const EXPERIENCE_FITNESS_MAP: Record<string, number> = {
  BEGINNER: 3,
  INTERMEDIATE: 5,
  ADVANCED: 7,
  EXPERT: 8,
}

const normalizeDayArray = (days?: Array<number | string>) => {
  if (!days) return undefined
  const normalized = days
    .map((day) => {
      if (typeof day === 'number') return day
      const parsed = Number.parseInt(day, 10)
      return Number.isNaN(parsed) ? undefined : parsed
    })
    .filter((day): day is number => day !== undefined)

  return normalized.length > 0 ? normalized : undefined
}

const buildUserProfileInput = (userRecord: any, overrides: any = {}) => {
  const profile = userRecord?.profile
  const experienceLevel =
    overrides.experienceLevel || profile?.experienceLevel || 'INTERMEDIATE'

  const availableTrainingDaysOverride = normalizeDayArray(overrides.availableTrainingDays)
  const preferredTrainingDays = normalizeDayArray(profile?.preferredTrainingDays)

  const availableTrainingDays =
    availableTrainingDaysOverride?.map((day) => day.toString()) ||
    preferredTrainingDays?.map((day) => day.toString()) ||
    ['1', '3', '5']

  const derivedFitness = EXPERIENCE_FITNESS_MAP[experienceLevel] || 5

  return {
    experienceLevel,
    currentFitnessLevel: overrides.currentFitnessLevel || derivedFitness,
    vma: overrides.vma ?? profile?.vma ?? 14,
    weight: overrides.weight ?? profile?.weight ?? undefined,
    weeklyTrainingHours:
      overrides.weeklyTrainingHours ?? profile?.maxTrainingHoursPerWeek ?? 6,
    availableTrainingDays,
    goals: overrides.goals ?? profile?.fitnessGoals ?? ['PERFORMANCE'],
    medicalConditions: overrides.medicalConditions ?? profile?.medicalConditions ?? [],
  }
}

const buildGenerationPreferences = (
  rawPreferences: z.infer<typeof generationPreferencesSchema>,
  profile: any,
  userProfileInput: ReturnType<typeof buildUserProfileInput>
) => {
  const preferredDays = normalizeDayArray(rawPreferences.preferredDays) || normalizeDayArray(profile?.preferredTrainingDays)

  const inferredSessionsPerWeek = rawPreferences.sessionsPerWeek ?? Math.min(
    preferredDays?.length || userProfileInput.availableTrainingDays.length || 4,
    7
  )

  const weeklyHours = userProfileInput.weeklyTrainingHours || profile?.maxTrainingHoursPerWeek || 6
  const computedSessionCap = Math.round((weeklyHours / inferredSessionsPerWeek) * 60)
  const safeSessionCap = Math.min(Math.max(computedSessionCap, 30), 180)
  const inferredMaxSessionDuration = rawPreferences.maxSessionDuration ?? safeSessionCap

  const injuryHistory = rawPreferences.injuryHistory
    ? Array.from(
        new Set([
          ...rawPreferences.injuryHistory,
          ...(userProfileInput.medicalConditions || []),
        ])
      )
    : userProfileInput.medicalConditions

  const baseTimeConstraints = rawPreferences.timeConstraints
    ? {
        ...rawPreferences.timeConstraints,
        workDays: normalizeDayArray(rawPreferences.timeConstraints.workDays) || undefined,
        vacationPeriods: rawPreferences.timeConstraints.vacationPeriods || undefined,
      }
    : undefined

  return {
    sessionsPerWeek: inferredSessionsPerWeek,
    preferredDays,
    maxSessionDuration: inferredMaxSessionDuration,
    includeStrength: rawPreferences.includeStrength ?? true,
    includeCrossTraining: rawPreferences.includeCrossTraining ?? false,
    intensityPreference: rawPreferences.intensityPreference ?? 'moderate',
    recoveryNeeds: rawPreferences.recoveryNeeds ?? 'medium',
    injuryHistory,
    focusAreas: rawPreferences.focusAreas ?? [],
    adaptToWeather: rawPreferences.adaptToWeather ?? false,
    timeConstraints: baseTimeConstraints,
  }
}

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
  preferences: generationPreferencesSchema.optional().default({}),
})

const sessionTemplateInputSchema = z.object({
  phase: z.nativeEnum(PlanPhase),
  weekOffset: z.number().int().min(0),
  dayOfWeek: z.number().int().min(0).max(6),
  type: z.nativeEnum(TrainingType),
  intensity: z.nativeEnum(Intensity),
  duration: z.number().int().positive().optional(),
  distance: z.number().positive().optional(),
  description: z.string().max(500).optional(),
  focusAreas: z.array(z.string().min(1)).optional().default([]),
})

const planTemplateInputSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  targetCategory: z.string().min(1),
  targetExperience: z.string().optional(),
  durationWeeks: z.number().int().min(1),
  sessions: z.array(sessionTemplateInputSchema).min(1),
})

const updatePlanStatusSchema = z.object({
  status: z.nativeEnum(TrainingPlanStatus),
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
        const [userRecord, targetRace] = await Promise.all([
          fastify.prisma.user.findUnique({
            where: { id: user.userId || user.id },
            include: { profile: true, preferences: true },
          }),
          fastify.prisma.course.findUnique({
            where: { id: validatedData.targetRaceId },
          }),
        ])

        if (!userRecord) {
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

        const userProfileInput = buildUserProfileInput(userRecord)
        const adaptedPreferences = buildGenerationPreferences(
          validatedData.preferences,
          userRecord.profile,
          userProfileInput
        )

        // Génération du plan avec l'algorithme
        const generatedPlan = await trainingPlanGenerator.generatePlan({
          user: {
            id: user.userId || user.id,
            profile: userProfileInput,
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

    // GET /api/training-plans/:id/progression - Progression agrégée
    fastify.get<{ Params: { id: string } }>(
      '/training-plans/:id/progression',
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

          const metrics = TrainingPlanAnalytics.summarizeSessions(plan.trainingSessions)

          await fastify.prisma.trainingPlan.update({
            where: { id: plan.id },
            data: {
              totalDuration: metrics.totalDuration,
              totalDistance: metrics.totalDistance,
              loadScore: metrics.loadScore,
              progression: metrics.weekly,
              lastAnalyzedAt: new Date(),
            },
          })

          reply.send({
            success: true,
            data: metrics,
          })
        } catch (error) {
          fastify.log.error(error)
          reply.code(500).send({
            success: false,
            error: 'Erreur lors du calcul de la progression',
          })
        }
      }
    )

    // PATCH /api/training-plans/:id/status - Mise à jour du statut
    fastify.patch<{ Params: { id: string } }>(
      '/training-plans/:id/status',
      async (request, reply) => {
        try {
          const user = (request as any).user
          const { id } = request.params
          const { status } = updatePlanStatusSchema.parse(request.body)

          const updated = await fastify.prisma.trainingPlan.updateMany({
            where: {
              id,
              userId: user.userId || user.id,
            },
            data: { status },
          })

          if (updated.count === 0) {
            return reply.code(404).send({
              success: false,
              error: 'Plan d\'entraînement non trouvé',
            })
          }

          const plan = await fastify.prisma.trainingPlan.findUnique({
            where: { id },
          })

          reply.send({
            success: true,
            data: plan,
            message: 'Statut du plan mis à jour',
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
            error: 'Erreur lors de la mise à jour du statut',
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

        const mergedPreferences = {
          ...(body.preferences || {}),
          intensityPreference:
            body.intensityPreference ?? body.preferences?.intensityPreference,
          recoveryNeeds: body.recoveryNeeds ?? body.preferences?.recoveryNeeds,
          injuryHistory: body.injuryHistory ?? body.preferences?.injuryHistory,
          focusAreas: body.focusAreas ?? body.preferences?.focusAreas,
          adaptToWeather: body.adaptToWeather ?? body.preferences?.adaptToWeather,
          timeConstraints: body.timeConstraints || body.preferences?.timeConstraints,
        }

        const validatedData = generatePlanSchema.parse({
          ...body,
          preferences: mergedPreferences,
        })

        // Récupération des données utilisateur et course
        const [userRecord, targetRace] = await Promise.all([
          fastify.prisma.user.findUnique({
            where: { id: user.userId || user.id },
            include: { profile: true, preferences: true },
          }),
          fastify.prisma.course.findUnique({
            where: { id: validatedData.targetRaceId },
          }),
        ])

        if (!userRecord) {
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

        const userProfileInput = buildUserProfileInput(userRecord, body.userProfile)
        const adaptedPreferences = buildGenerationPreferences(
          validatedData.preferences,
          userRecord.profile,
          userProfileInput
        )

        // Génération du plan avec personnalisation avancée
        const generatedPlan = await trainingPlanGenerator.generatePlan({
          user: {
            id: user.userId || user.id,
            profile: userProfileInput,
          },
          targetRace,
          startDate: validatedData.startDate,
          endDate: validatedData.endDate,
          preferences: adaptedPreferences,
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

    // ============================
    // PLAN TEMPLATES MANAGEMENT
    // ============================

    // GET /api/training-plan-templates - Liste des templates
    fastify.get('/training-plan-templates', async (_request: FastifyRequest, reply: FastifyReply) => {
      try {
        await ensureTemplateInfrastructure(fastify.prisma)
        const templates = await fastify.prisma.trainingPlanTemplate.findMany({
          include: {
            sessions: {
              orderBy: [{ weekOffset: 'asc' }, { dayOfWeek: 'asc' }],
            },
          },
          orderBy: { createdAt: 'desc' },
        })

        reply.send({
          success: true,
          data: templates,
        })
      } catch (error) {
        fastify.log.error(error)
        reply.code(500).send({
          success: false,
          error: 'Erreur lors de la récupération des templates',
        })
      }
    })

    // GET /api/training-plan-templates/:id - Détail d'un template
    fastify.get<{ Params: { id: string } }>(
      '/training-plan-templates/:id',
      async (request, reply) => {
        try {
          await ensureTemplateInfrastructure(fastify.prisma)
          const { id } = request.params

          const template = await fastify.prisma.trainingPlanTemplate.findUnique({
            where: { id },
            include: {
              sessions: {
                orderBy: [{ weekOffset: 'asc' }, { dayOfWeek: 'asc' }],
              },
            },
          })

          if (!template) {
            return reply.code(404).send({
              success: false,
              error: 'Template introuvable',
            })
          }

          reply.send({
            success: true,
            data: template,
          })
        } catch (error) {
          fastify.log.error(error)
          reply.code(500).send({
            success: false,
            error: 'Erreur lors de la récupération du template',
          })
        }
      }
    )

    // POST /api/training-plan-templates - Création d'un template
    fastify.post('/training-plan-templates', async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await ensureTemplateInfrastructure(fastify.prisma)
        const body = planTemplateInputSchema.parse(request.body)

        const template = await fastify.prisma.$transaction(async (tx) => {
          if (!(tx as any).trainingSessionTemplate?.create) {
            throw fastify.httpErrors.internalServerError(
              'Modèle trainingSessionTemplate non disponible. Lancez `npx prisma generate` puis redémarrez le serveur.'
            )
          }

          const createdTemplate = await tx.trainingPlanTemplate.create({
            data: {
              name: body.name,
              description: body.description ?? null,
              targetCategory: body.targetCategory,
              targetExperience: body.targetExperience ?? null,
              durationWeeks: body.durationWeeks,
            },
          })

          await Promise.all(
            body.sessions.map((session) =>
              tx.trainingSessionTemplate.create({
                data: {
                  planTemplateId: createdTemplate.id,
                  phase: session.phase,
                  weekOffset: session.weekOffset,
                  dayOfWeek: session.dayOfWeek,
                  type: session.type,
                  intensity: session.intensity,
                  duration: session.duration ?? null,
                  distance: session.distance ?? null,
                  description: session.description ?? null,
                  focusAreas: session.focusAreas ?? [],
                },
              })
            )
          )

          return tx.trainingPlanTemplate.findUnique({
            where: { id: createdTemplate.id },
            include: {
              sessions: {
                orderBy: [{ weekOffset: 'asc' }, { dayOfWeek: 'asc' }],
              },
            },
          })
        })

        reply.code(201).send({
          success: true,
          data: template,
          message: 'Template créé avec succès',
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
        const statusCode = (error as any)?.statusCode ?? 500
        reply.code(statusCode).send({
          success: false,
          error:
            (error as any)?.message ||
            'Erreur lors de la création du template. Lancez `npx prisma generate` puis redémarrez le serveur.',
        })
      }
    })

    const planTemplateUpdateSchema = planTemplateInputSchema.partial()

    // PUT /api/training-plan-templates/:id - Mise à jour d'un template
    fastify.put<{ Params: { id: string } }>(
      '/training-plan-templates/:id',
      async (request, reply) => {
      try {
        await ensureTemplateInfrastructure(fastify.prisma)
        const { id } = request.params
        const body = planTemplateUpdateSchema.parse(request.body)

          const template = await fastify.prisma.$transaction(async (tx) => {
            if (!(tx as any).trainingSessionTemplate?.create) {
              throw fastify.httpErrors.internalServerError(
                'Modèle trainingSessionTemplate non disponible. Lancez `npx prisma generate` puis redémarrez le serveur.'
              )
            }

            const updatedTemplate = await tx.trainingPlanTemplate.update({
              where: { id },
              data: {
                name: body.name ?? undefined,
                description: body.description ?? undefined,
                targetCategory: body.targetCategory ?? undefined,
                targetExperience: body.targetExperience ?? undefined,
                durationWeeks: body.durationWeeks ?? undefined,
              },
            })

            if (body.sessions) {
              await tx.trainingSessionTemplate.deleteMany({
                where: { planTemplateId: id },
              })

              await Promise.all(
                body.sessions.map((session) =>
                  tx.trainingSessionTemplate.create({
                    data: {
                      planTemplateId: id,
                      phase: session.phase,
                      weekOffset: session.weekOffset,
                      dayOfWeek: session.dayOfWeek,
                      type: session.type,
                      intensity: session.intensity,
                      duration: session.duration ?? null,
                      distance: session.distance ?? null,
                      description: session.description ?? null,
                      focusAreas: session.focusAreas ?? [],
                    },
                  })
                )
              )
            }

            return tx.trainingPlanTemplate.findUnique({
              where: { id: updatedTemplate.id },
              include: {
                sessions: {
                  orderBy: [{ weekOffset: 'asc' }, { dayOfWeek: 'asc' }],
                },
              },
            })
          })

          if (!template) {
            return reply.code(404).send({
              success: false,
              error: 'Template introuvable',
            })
          }

          reply.send({
            success: true,
            data: template,
            message: 'Template mis à jour avec succès',
          })
        } catch (error) {
          if (error instanceof z.ZodError) {
            return reply.code(400).send({
              success: false,
              error: 'Données invalides',
              details: error.errors,
            })
          }

          if ((error as any)?.code === 'P2025') {
            return reply.code(404).send({
              success: false,
              error: 'Template introuvable',
            })
          }

          fastify.log.error(error)
          const statusCode = (error as any)?.statusCode ?? 500
          reply.code(statusCode).send({
            success: false,
            error:
              (error as any)?.message ||
              'Erreur lors de la mise à jour du template. Lancez `npx prisma generate` puis redémarrez le serveur.',
          })
        }
      }
    )

    // DELETE /api/training-plan-templates/:id - Suppression d'un template
    fastify.delete<{ Params: { id: string } }>(
      '/training-plan-templates/:id',
      async (request, reply) => {
        try {
          await ensureTemplateInfrastructure(fastify.prisma)
          const { id } = request.params

          const template = await fastify.prisma.trainingPlanTemplate.findUnique({
            where: { id },
          })

          if (!template) {
            return reply.code(404).send({
              success: false,
              error: 'Template introuvable',
            })
          }

          await fastify.prisma.$transaction(async tx => {
            await tx.trainingSessionTemplate.deleteMany({ where: { planTemplateId: id } })
            await tx.trainingPlanTemplate.delete({ where: { id } })
            await tx.trainingPlan.updateMany({
              where: { sourceTemplateId: id },
              data: { sourceTemplateId: null },
            })
          })

          reply.send({
            success: true,
            message: 'Template supprimé avec succès',
          })
        } catch (error) {
          fastify.log.error(error)
          reply.code((error as any)?.statusCode ?? 500).send({
            success: false,
            error:
              (error as any)?.message ||
              'Erreur lors de la suppression du template. Vérifiez les dépendances et réessayez.',
          })
        }
      }
    )
  })
}
