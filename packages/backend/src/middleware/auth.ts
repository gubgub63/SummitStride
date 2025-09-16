import { FastifyRequest, FastifyReply } from 'fastify'
import { AuthUtils, JwtPayload } from '../utils/auth.js'

declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload
  }
}

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({
        error: 'Authorization token required',
      })
    }

    const token = authHeader.substring(7)

    try {
      const payload = AuthUtils.verifyToken(token)
      request.user = payload
    } catch (tokenError) {
      return reply.code(401).send({
        error: 'Invalid or expired token',
      })
    }
  } catch (error) {
    return reply.code(401).send({
      error: 'Authentication failed',
    })
  }
}
