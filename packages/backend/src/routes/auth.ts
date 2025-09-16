import { FastifyPluginAsync } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { AuthUtils } from '../utils/auth.js'

const prisma = new PrismaClient()

interface RegisterBody {
  email: string
  name: string
  password: string
}

interface LoginBody {
  email: string
  password: string
}

interface ResetPasswordBody {
  email: string
}

const authRoutes: FastifyPluginAsync = async fastify => {
  // Register endpoint
  fastify.post<{ Body: RegisterBody }>('/register', async (request, reply) => {
    try {
      const { email, name, password } = request.body

      // Validation
      if (!email || !name || !password) {
        return reply.code(400).send({
          error: 'Missing required fields: email, name, password',
        })
      }

      if (password.length < 6) {
        return reply.code(400).send({
          error: 'Password must be at least 6 characters long',
        })
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        return reply.code(409).send({
          error: 'User with this email already exists',
        })
      }

      // Hash password
      const hashedPassword = await AuthUtils.hashPassword(password)

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      })

      // Generate JWT token
      const token = AuthUtils.generateToken({
        userId: user.id,
        email: user.email,
      })

      return reply.code(201).send({
        message: 'User registered successfully',
        user,
        token,
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({
        error: 'Internal server error',
      })
    }
  })

  // Login endpoint
  fastify.post<{ Body: LoginBody }>('/login', async (request, reply) => {
    try {
      const { email, password } = request.body

      // Validation
      if (!email || !password) {
        return reply.code(400).send({
          error: 'Missing required fields: email, password',
        })
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        return reply.code(401).send({
          error: 'Invalid email or password',
        })
      }

      // Verify password
      const isPasswordValid = await AuthUtils.verifyPassword(password, user.password)

      if (!isPasswordValid) {
        return reply.code(401).send({
          error: 'Invalid email or password',
        })
      }

      // Generate JWT token
      const token = AuthUtils.generateToken({
        userId: user.id,
        email: user.email,
      })

      return reply.send({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
        token,
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({
        error: 'Internal server error',
      })
    }
  })

  // Password reset request endpoint
  fastify.post<{ Body: ResetPasswordBody }>('/forgot-password', async (request, reply) => {
    try {
      const { email } = request.body

      if (!email) {
        return reply.code(400).send({
          error: 'Email is required',
        })
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        // Don't reveal if user exists or not
        return reply.send({
          message: 'If the email exists, a password reset link has been sent',
        })
      }

      // Generate reset token
      const resetToken = AuthUtils.generateResetToken(user.id)

      // In a real application, you would send this token via email
      // For now, we'll just return it in the response
      fastify.log.info(`Password reset token for ${email}: ${resetToken}`)

      return reply.send({
        message: 'If the email exists, a password reset link has been sent',
        // Remove this in production - only for development
        resetToken,
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({
        error: 'Internal server error',
      })
    }
  })

  // Get current user profile (protected route)
  fastify.get('/me', async (request, reply) => {
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

        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
          },
        })

        if (!user) {
          return reply.code(404).send({
            error: 'User not found',
          })
        }

        return reply.send({ user })
      } catch (tokenError) {
        return reply.code(401).send({
          error: 'Invalid token',
        })
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({
        error: 'Internal server error',
      })
    }
  })
}

export default authRoutes
