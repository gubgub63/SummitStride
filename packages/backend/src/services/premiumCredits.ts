import { PrismaClient, Prisma, CreditTransactionType } from '@prisma/client'

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
    transactionType?: CreditTransactionType
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
