import { FastifyPluginAsync } from 'fastify'
import { authMiddleware } from '../middleware/auth.js'
import {
  getStripeClient,
  getStripeSuccessUrl,
  getStripeCancelUrl,
  getStripePriceIdForSlug,
  isSubscriptionSlug,
} from '../utils/stripe.js'
import { ensureCreditBalance, addCredits } from '../services/premiumCredits.js'
import { Prisma } from '@prisma/client'

const DEFAULT_TRANSACTION_LIMIT = 25

export const premiumRoutes: FastifyPluginAsync = async fastify => {
  fastify.register(async inner => {
    inner.addHook('preHandler', authMiddleware)

    inner.get('/premium/credits', async request => {
      const user = (request as any).user
      const userId = user.userId || user.id

      const balance = await ensureCreditBalance(inner.prisma, userId)
      const totalCredits = balance.balance + balance.bonusBalance

      return {
        success: true,
        data: {
          balance: balance.balance,
          bonusBalance: balance.bonusBalance,
          totalCredits,
          lastUpdated: balance.updatedAt,
        },
      }
    })

    inner.get('/premium/transactions', async request => {
      const user = (request as any).user
      const userId = user.userId || user.id
      const { limit } = request.query as { limit?: string }
      const take = Math.min(Number(limit) || DEFAULT_TRANSACTION_LIMIT, 100)

      const transactions = await inner.prisma.creditTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take,
      })

      return {
        success: true,
        data: transactions,
      }
    })

    inner.get('/premium/subscription-plans', async () => {
      const plans = await inner.prisma.subscriptionPlan.findMany({
        where: { active: true },
        orderBy: { priceInCents: 'asc' },
      })

      return {
        success: true,
        data: plans,
      }
    })

    inner.post('/premium/checkout/session', async (request, reply) => {
      const user = (request as any).user
      const userId = user.userId || user.id
      const { slug } = request.body as { slug?: string }

      if (!slug) {
        return reply.code(400).send({ success: false, error: 'Le champ slug est requis.' })
      }

      const plan = await inner.prisma.subscriptionPlan.findUnique({ where: { slug } })
      if (!plan) {
        return reply.code(404).send({ success: false, error: 'Offre inconnue.' })
      }

      const priceId = getStripePriceIdForSlug(slug) || plan.stripePriceId
      if (!priceId) {
        return reply.code(500).send({
          success: false,
          error:
            "Aucun priceId Stripe configuré pour cette offre. Merci de compléter les variables d'environnement.",
        })
      }

      const stripe = await getStripeClient()
      const userRecord = await inner.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      })

      const isSubscription = isSubscriptionSlug(slug)

      const baseSession: any = {
        mode: isSubscription ? 'subscription' : 'payment',
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: getStripeSuccessUrl(),
        cancel_url: getStripeCancelUrl(),
        customer_email: userRecord?.email,
        metadata: {
          planSlug: slug,
          userId,
          mode: isSubscription ? 'subscription' : 'payment',
          creditsIncluded: String(plan.creditsIncluded),
          bonusCredits: String(plan.bonusCredits),
        },
      }

      if (isSubscription) {
        baseSession.subscription_data = {
          metadata: {
            planSlug: slug,
            userId,
          },
        }
      } else {
        baseSession.payment_intent_data = {
          metadata: {
            planSlug: slug,
            userId,
          },
        }
      }

      const session = await stripe.checkout.sessions.create(baseSession)

      return {
        success: true,
        data: {
          url: session.url,
        },
      }
    })
  })

  fastify.post('/stripe/webhook', async (request, reply) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      reply.code(500).send({ success: false, error: 'STRIPE_WEBHOOK_SECRET manquant.' })
      return
    }

    const signature = request.headers['stripe-signature'] as string | undefined
    if (!signature) {
      reply.code(400).send({ success: false, error: 'Signature Stripe absente.' })
      return
    }

    const rawBody = (request as any).rawBody
    if (!rawBody) {
      reply.code(400).send({ success: false, error: 'Corps de requête absent.' })
      return
    }

    const stripe = await getStripeClient()
    let event: any

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    } catch (error) {
      fastify.log.error({ error }, 'Signature Stripe invalide')
      reply.code(400).send({ success: false, error: 'Signature invalide.' })
      return
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as any

          if (session.payment_status !== 'paid') {
            break
          }

          const metadata = session.metadata || {}
          const planSlug = metadata.planSlug
          const userId = metadata.userId

          if (!planSlug || !userId) {
            break
          }

          const plan = await fastify.prisma.subscriptionPlan.findUnique({
            where: { slug: planSlug },
          })
          if (!plan) {
            break
          }

          const creditsToGrant = plan.creditsIncluded + plan.bonusCredits
          const alreadyRecorded = await fastify.prisma.creditTransaction.findFirst({
            where: {
              userId,
              metadata: {
                path: ['checkoutSessionId'],
                equals: session.id,
              },
            },
          })

          if (alreadyRecorded) {
            break
          }

          if (creditsToGrant > 0) {
            await addCredits(fastify.prisma, {
              userId,
              amount: creditsToGrant,
              description: `Recharge ${plan.name}`,
              metadata: {
                checkoutSessionId: session.id,
                paymentIntentId: session.payment_intent,
                subscriptionId: session.subscription,
              },
              subscriptionPlanId: plan.id,
              transactionType: isSubscriptionSlug(planSlug)
                ? Prisma.CreditTransactionType.SUBSCRIPTION_BONUS
                : Prisma.CreditTransactionType.CREDIT_PURCHASE,
            })
          }

          break
        }
        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as any
          const subscriptionIdRaw = invoice.subscription

          if (!subscriptionIdRaw) {
            break
          }

          let subscriptionMetadata: Stripe.Metadata | undefined
          if (typeof subscriptionIdRaw === 'string') {
            const subscription = await stripe.subscriptions.retrieve(subscriptionIdRaw)
            subscriptionMetadata = subscription.metadata
          } else {
            subscriptionMetadata = subscriptionIdRaw.metadata
          }

          const planSlug = subscriptionMetadata?.planSlug || invoice.metadata?.planSlug
          const userId = subscriptionMetadata?.userId || invoice.metadata?.userId
          const subscriptionId =
            typeof subscriptionIdRaw === 'string' ? subscriptionIdRaw : subscriptionIdRaw.id

          if (!planSlug || !userId) {
            break
          }

          const plan = await fastify.prisma.subscriptionPlan.findUnique({
            where: { slug: planSlug },
          })
          if (!plan) {
            break
          }

          const existing = await fastify.prisma.creditTransaction.findFirst({
            where: {
              userId,
              metadata: {
                path: ['invoiceId'],
                equals: invoice.id,
              },
            },
          })

          if (existing) {
            break
          }

          const creditsToGrant = plan.creditsIncluded + plan.bonusCredits
          if (creditsToGrant > 0) {
            await addCredits(fastify.prisma, {
              userId,
              amount: creditsToGrant,
              description: `Renouvellement ${plan.name}`,
              metadata: {
                invoiceId: invoice.id,
                subscriptionId,
              },
              subscriptionPlanId: plan.id,
              transactionType: Prisma.CreditTransactionType.SUBSCRIPTION_BONUS,
            })
          }

          break
        }
        default: {
          fastify.log.debug({ type: event.type }, 'Évènement Stripe non traité')
        }
      }

      reply.send({ received: true })
    } catch (error) {
      fastify.log.error({ error }, 'Erreur durant le traitement Stripe')
      reply
        .code(500)
        .send({ success: false, error: "Erreur lors du traitement de l'évènement Stripe." })
    }
  })
}

export default premiumRoutes
