import { FastifyPluginAsync } from 'fastify'
import { authMiddleware } from '../middleware/auth.js'
import { AiInsightsService } from '../services/aiInsights.js'
import { TrainingPlanAnalytics } from '../services/trainingPlanAnalytics.js'

export const aiRoutes: FastifyPluginAsync = async fastify => {
  fastify.register(async inner => {
    inner.addHook('preHandler', authMiddleware)

    inner.get<{ Params: { id: string } }>(
      '/ai/training-plans/:id/insights',
      async (request, reply) => {
        try {
          const user = (request as any).user
          const { id } = request.params
          const userId = user.userId || user.id

          const plan = await inner.prisma.trainingPlan.findFirst({
            where: {
              id,
              userId,
            },
            include: {
              trainingSessions: true,
              targetRace: true,
            },
          })

          if (!plan) {
            return reply.code(404).send({
              success: false,
              error: 'Plan introuvable pour cet utilisateur',
            })
          }

          const userProfile = await inner.prisma.userProfile.findUnique({
            where: { userId },
          })

          const metrics = TrainingPlanAnalytics.summarizeSessions(plan.trainingSessions)

          const insights = AiInsightsService.generatePlanInsights({
            plan,
            sessions: plan.trainingSessions,
            targetRace: plan.targetRace,
            userProfile,
            metrics,
          })

          reply.send({
            success: true,
            data: insights,
          })
        } catch (error) {
          inner.log.error(error)
          reply.code(500).send({
            success: false,
            error: 'Impossible de générer les insights IA pour ce plan',
          })
        }
      }
    )
  })
}

export default aiRoutes
