import { FastifyPluginAsync } from 'fastify'
import { authMiddleware } from '../middleware/auth.js'
import {
  buildAuthorizationUrl,
  buildCallbackErrorRedirect,
  fetchStravaActivities,
  getConnectionStatus,
  handleStravaCallback,
} from '../services/stravaIntegration.js'

export const stravaRoutes: FastifyPluginAsync = async fastify => {
  fastify.register(async inner => {
    inner.addHook('preHandler', authMiddleware)

    inner.get('/integrations/strava/status', async request => {
      const user = (request as any).user
      const userId = user.userId || user.id
      const status = await getConnectionStatus(inner.prisma, userId)

      return {
        success: true,
        data: status,
      }
    })

    inner.get('/integrations/strava/auth-url', async request => {
      const user = (request as any).user
      const userId = user.userId || user.id
      try {
        const authorizationUrl = buildAuthorizationUrl(userId)
        return {
          success: true,
          data: { authorizationUrl },
        }
      } catch (error) {
        inner.log.error(error)
        throw inner.httpErrors.internalServerError(
          error instanceof Error ? error.message : 'Impossible de générer le lien Strava.'
        )
      }
    })

    inner.post('/integrations/strava/sync', async request => {
      const user = (request as any).user
      const userId = user.userId || user.id
      try {
        const result = await fetchStravaActivities(inner.prisma, userId, { perPage: 1 })

        return {
          success: true,
          data: {
            syncedAt: new Date().toISOString(),
            previewActivity: result.activities[0] ?? null,
          },
        }
      } catch (error) {
        inner.log.error(error)
        throw inner.httpErrors.badRequest(
          error instanceof Error ? error.message : 'Synchronisation Strava impossible.'
        )
      }
    })

    inner.get('/integrations/strava/activities', async request => {
      const user = (request as any).user
      const userId = user.userId || user.id
      const { perPage, page, afterDays } = request.query as {
        perPage?: string
        page?: string
        afterDays?: string
      }

      let after: number | undefined
      if (afterDays) {
        const days = Number.parseInt(afterDays, 10)
        if (!Number.isNaN(days) && days > 0) {
          const since = Math.floor((Date.now() - days * 24 * 60 * 60 * 1000) / 1000)
          after = since
        }
      }

      try {
        const activities = await fetchStravaActivities(inner.prisma, userId, {
          perPage: perPage ? Number.parseInt(perPage, 10) : undefined,
          page: page ? Number.parseInt(page, 10) : undefined,
          after,
        })

        return {
          success: true,
          data: activities,
        }
      } catch (error) {
        inner.log.error(error)
        throw inner.httpErrors.badRequest(
          error instanceof Error ? error.message : 'Impossible de récupérer les activités Strava.'
        )
      }
    })
  }, { prefix: '/api' })

  fastify.get('/api/integrations/strava/callback', async (request, reply) => {
    try {
      const query = request.query as Record<string, string | undefined>
      const { redirectUrl } = await handleStravaCallback(fastify.prisma, query)
      reply.redirect(redirectUrl)
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'unknown'
      const redirectUrl = await buildCallbackErrorRedirect(reason)
      reply.redirect(redirectUrl)
    }
  })
}

export default stravaRoutes
