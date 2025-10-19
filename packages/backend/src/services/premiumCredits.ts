import { PrismaClient, Prisma } from '@prisma/client'

export class InsufficientCreditsError extends Error {
  constructor(message = 'Solde de crédits insuffisant.') {
    super(message)
    this.name = 'InsufficientCreditsError'
  }
}

interface ConsumeCreditsOptions {
  userId: string
  amount: number
  description?: string
  metadata?: Prisma.JsonValue
  subscriptionPlanId?: string | null
  prisma?: PrismaClient
}

const DEFAULT_CONSUMPTION_DESCRIPTION = 'Consommation de crédits'

type QuotaInterval = 'month'

interface FreeQuotaRule {
  limit: number
  interval: QuotaInterval
  description: string
}

const DEFAULT_AI_INSIGHTS_LIMIT = Number.parseInt(
  process.env.FREE_AI_INSIGHTS_MONTHLY_LIMIT ?? '2',
  10
)

const NORMALIZED_AI_INSIGHTS_LIMIT = Number.isFinite(DEFAULT_AI_INSIGHTS_LIMIT)
  ? Math.max(DEFAULT_AI_INSIGHTS_LIMIT, 0)
  : 2

const FREE_QUOTA_RULES: Record<string, FreeQuotaRule> = {
  'ai-insights': {
    limit: NORMALIZED_AI_INSIGHTS_LIMIT,
    interval: 'month',
    description: 'Quota gratuit - Insights IA',
  },
}

function getQuotaRule(featureKey: string): FreeQuotaRule | undefined {
  const rule = FREE_QUOTA_RULES[featureKey]
  if (!rule) {
    return undefined
  }

  // Garantit que la limite est au moins 0 (fallback si override invalide)
  const limit = Math.max(rule.limit, 0)
  return {
    ...rule,
    limit,
  }
}

function getIntervalStart(interval: QuotaInterval): Date {
  const now = new Date()
  switch (interval) {
    case 'month':
      return new Date(now.getFullYear(), now.getMonth(), 1)
    default:
      return new Date(now.getFullYear(), now.getMonth(), 1)
  }
}

export async function ensureCreditBalance(prisma: PrismaClient, userId: string) {
  return prisma.userCreditBalance.upsert({
    where: { userId },
    update: {},
    create: { userId },
  })
}

export async function consumeCredits(prisma: PrismaClient, options: ConsumeCreditsOptions) {
  const { userId, amount, description, metadata, subscriptionPlanId = null } = options

  if (amount <= 0) {
    throw new Error('Le montant consommé doit être strictement positif.')
  }

  return prisma.$transaction(async tx => {
    const balance = await tx.userCreditBalance.upsert({
      where: { userId },
      update: {},
      create: { userId },
    })

    const availableCredits = balance.balance + balance.bonusBalance

    if (availableCredits < amount) {
      throw new InsufficientCreditsError()
    }

    let remaining = amount
    let bonusBalance = balance.bonusBalance
    let standardBalance = balance.balance

    if (bonusBalance > 0) {
      const bonusUsed = Math.min(bonusBalance, remaining)
      bonusBalance -= bonusUsed
      remaining -= bonusUsed
    }

    if (remaining > 0) {
      standardBalance -= remaining
    }

    const updatedBalance = await tx.userCreditBalance.update({
      where: { id: balance.id },
      data: {
        balance: standardBalance,
        bonusBalance,
        lastSnapshot: new Date(),
      },
    })

    await tx.creditTransaction.create({
      data: {
        userId,
        amount: -amount,
        type: 'CREDIT_CONSUMPTION',
        balanceSnapshot: updatedBalance.balance + updatedBalance.bonusBalance,
        description: description || DEFAULT_CONSUMPTION_DESCRIPTION,
        metadata: metadata ?? Prisma.DbNull,
        balanceId: updatedBalance.id,
        subscriptionPlanId,
      },
    })

    return updatedBalance
  })
}

export async function addCredits(
  prisma: PrismaClient,
  options: {
    userId: string
    amount: number
    description?: string
    metadata?: Prisma.JsonValue
    subscriptionPlanId?: string | null
    transactionType?: Prisma.CreditTransactionType
  }
) {
  const {
    userId,
    amount,
    description,
    metadata,
    subscriptionPlanId = null,
    transactionType,
  } = options

  if (amount <= 0) {
    throw new Error('Le montant crédité doit être strictement positif.')
  }

  return prisma.$transaction(async tx => {
    const balance = await tx.userCreditBalance.upsert({
      where: { userId },
      update: {},
      create: { userId },
    })

    const updatedBalance = await tx.userCreditBalance.update({
      where: { id: balance.id },
      data: {
        balance: balance.balance + amount,
        lastSnapshot: new Date(),
      },
    })

    await tx.creditTransaction.create({
      data: {
        userId,
        amount,
        type: transactionType ?? 'CREDIT_PURCHASE',
        balanceSnapshot: updatedBalance.balance + updatedBalance.bonusBalance,
        description: description || 'Ajout de crédits',
        metadata: metadata ?? Prisma.DbNull,
        balanceId: updatedBalance.id,
        subscriptionPlanId,
      },
    })

    return updatedBalance
  })
}

interface ConsumeWithQuotaOptions extends ConsumeCreditsOptions {
  featureKey?: string
  allowQuotaFallback?: boolean
}

export async function consumeCreditsWithQuota(
  prisma: PrismaClient,
  options: ConsumeWithQuotaOptions
) {
  const { featureKey, allowQuotaFallback = true, ...creditOptions } = options

  try {
    return await consumeCredits(prisma, creditOptions)
  } catch (error) {
    if (
      !(error instanceof InsufficientCreditsError) ||
      !allowQuotaFallback ||
      !featureKey
    ) {
      throw error
    }

    const quotaRule = getQuotaRule(featureKey)
    if (!quotaRule || quotaRule.limit <= 0) {
      throw error
    }

    const periodStart = getIntervalStart(quotaRule.interval)

    const usageCount = await prisma.creditTransaction.count({
      where: {
        userId: creditOptions.userId,
        type: Prisma.CreditTransactionType.FREE_QUOTA_USAGE,
        createdAt: {
          gte: periodStart,
        },
        metadata: {
          path: ['featureKey'],
          equals: featureKey,
        },
      },
    })

    if (usageCount >= quotaRule.limit) {
      throw error
    }

    const balance = await ensureCreditBalance(prisma, creditOptions.userId)

    const quotaMetadata: Prisma.JsonObject = {
      featureKey,
      quotaInterval: quotaRule.interval,
      quotaLimit: quotaRule.limit,
      quotaUsage: usageCount + 1,
      appliedAt: new Date().toISOString(),
    }

    if (
      creditOptions.metadata &&
      typeof creditOptions.metadata === 'object' &&
      creditOptions.metadata !== null &&
      !Array.isArray(creditOptions.metadata) &&
      creditOptions.metadata !== Prisma.DbNull
    ) {
      Object.assign(quotaMetadata, creditOptions.metadata as Prisma.JsonObject)
    }

    await prisma.creditTransaction.create({
      data: {
        userId: creditOptions.userId,
        amount: 0,
        type: Prisma.CreditTransactionType.FREE_QUOTA_USAGE,
        balanceSnapshot: balance.balance + balance.bonusBalance,
        description:
          creditOptions.description || quotaRule.description || 'Quota gratuit utilisé',
        metadata: quotaMetadata,
        balanceId: balance.id,
        subscriptionPlanId: creditOptions.subscriptionPlanId ?? null,
      },
    })

    return balance
  }
}
