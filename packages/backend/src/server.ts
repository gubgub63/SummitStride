import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import sensible from '@fastify/sensible'
import env from '@fastify/env'
import { PrismaClient } from '@prisma/client'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/user.js'
import courseRoutes from './routes/course.js'
import registrationRoutes from './routes/registration.js'
import { trainingRoutes } from './routes/training.js'
import aiRoutes from './routes/ai.js'
import premiumRoutes from './routes/premium.js'

const envSchema = {
  type: 'object',
  required: ['NODE_ENV', 'PORT'],
  properties: {
    NODE_ENV: {
      type: 'string',
      default: 'development',
    },
    PORT: {
      type: 'string',
      default: '4000',
    },
    DATABASE_URL: {
      type: 'string',
    },
    STRIPE_SECRET_KEY: {
      type: 'string',
      default: '',
    },
    STRIPE_WEBHOOK_SECRET: {
      type: 'string',
      default: '',
    },
    STRIPE_SUCCESS_URL: {
      type: 'string',
      default: '',
    },
    STRIPE_CANCEL_URL: {
      type: 'string',
      default: '',
    },
    STRIPE_PRICE_ID_CREDITS_20: { type: 'string', default: '' },
    STRIPE_PRICE_ID_CREDITS_50: { type: 'string', default: '' },
    STRIPE_PRICE_ID_CREDITS_100: { type: 'string', default: '' },
    STRIPE_PRICE_ID_PREMIUM_MONTHLY: { type: 'string', default: '' },
    STRIPE_PRICE_ID_PREMIUM_ANNUAL: { type: 'string', default: '' },
  },
}

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
  },
})

// Initialize Prisma
const prisma = new PrismaClient()

async function start() {
  try {
    // Register environment variables
    await fastify.register(env, {
      schema: envSchema,
      dotenv: true,
    })

    fastify.addContentTypeParser('application/json', { parseAs: 'buffer' }, (request, body, done) => {
      try {
        const buffer = body as Buffer
        ;(request as any).rawBody = buffer
        if (buffer.length === 0) {
          done(null, {})
          return
        }
        const parsed = JSON.parse(buffer.toString('utf8'))
        done(null, parsed)
      } catch (error) {
        done(error as Error, undefined)
      }
    })

    // Security plugins
    await fastify.register(helmet, {
      contentSecurityPolicy: false,
    })

    // CORS
    await fastify.register(cors, {
      origin: process.env.NODE_ENV === 'production' ? ['https://yourdomain.com'] : true,
    })

    // Sensible defaults
    await fastify.register(sensible)

    // Add Prisma instance to Fastify
    fastify.decorate('prisma', prisma)

    // Health check route
    fastify.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() }
    })

    // API routes
    fastify.get('/api', async () => {
      return {
        message: 'SummitStride API',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      }
    })

    // Authentication routes
    await fastify.register(authRoutes, { prefix: '/api/auth' })

    // User routes (protected)
    await fastify.register(userRoutes, { prefix: '/api/users' })

    // Course routes (protected)
    await fastify.register(courseRoutes, { prefix: '/api/courses' })

    // Registration routes (protected)
    await fastify.register(registrationRoutes, { prefix: '/api/registrations' })

    // Training routes (protected)
    await fastify.register(trainingRoutes, { prefix: '/api' })

    // AI insights routes (protected)
    await fastify.register(aiRoutes, { prefix: '/api' })

    // Premium & crédits routes (protected)
    await fastify.register(premiumRoutes, { prefix: '/api' })

    // Database status endpoint
    fastify.get('/api/db-status', async (_request, reply) => {
      try {
        await prisma.$queryRaw`SELECT 1`
        const userCount = await prisma.user.count()
        return {
          status: 'connected',
          userCount,
          timestamp: new Date().toISOString(),
        }
      } catch (error) {
        reply.code(500)
        return {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        }
      }
    })

    // Start server
    const port = parseInt(process.env.PORT || '4000', 10)
    await fastify.listen({ port, host: '0.0.0.0' })
    fastify.log.info(`🚀 Server ready at http://localhost:${port}`)
  } catch (err) {
    fastify.log.error(err)
    await prisma.$disconnect()
    process.exit(1)
  }

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    await prisma.$disconnect()
    await fastify.close()
  })
}

start()
