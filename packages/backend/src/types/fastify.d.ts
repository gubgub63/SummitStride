/**
 * Extension des types Fastify pour inclure Prisma
 */

import { PrismaClient } from '@prisma/client'

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}