export type CreditTransactionType =
  | 'CREDIT_PURCHASE'
  | 'CREDIT_CONSUMPTION'
  | 'CREDIT_ADJUSTMENT'
  | 'SUBSCRIPTION_CHARGE'
  | 'SUBSCRIPTION_BONUS'

export type SubscriptionInterval = 'MONTHLY' | 'YEARLY'

export interface CreditBalanceSummary {
  balance: number
  bonusBalance: number
  totalCredits: number
  lastUpdated: string
}

export interface CreditTransactionSummary {
  id: string
  amount: number
  type: CreditTransactionType
  description?: string
  metadata?: Record<string, unknown> | null
  balanceSnapshot: number
  createdAt: string
  subscriptionPlanId?: string | null
}

export interface SubscriptionPlanSummary {
  id: string
  slug: string
  name: string
  description?: string | null
  priceInCents: number
  currency: string
  interval: SubscriptionInterval
  creditsIncluded: number
  bonusCredits: number
  active: boolean
  createdAt: string
  updatedAt: string
}
