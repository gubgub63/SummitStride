import {
  CreditBalanceSummary,
  CreditTransactionSummary,
  SubscriptionPlanSummary,
} from '@summitstride/shared'

class PremiumService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') {
      return null
    }

    return localStorage.getItem('auth_token')
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getAuthToken()

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      body: options.body,
    })

    const payload = await response.json()

    if (!response.ok) {
      throw new Error(payload.error || `HTTP ${response.status}`)
    }

    return payload.data as T
  }

  async getBalance(): Promise<CreditBalanceSummary> {
    return this.request<CreditBalanceSummary>('/premium/credits')
  }

  async getTransactions(limit = 25): Promise<CreditTransactionSummary[]> {
    const searchParams = new URLSearchParams({ limit: String(limit) })
    return this.request<CreditTransactionSummary[]>(`/premium/transactions?${searchParams}`)
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlanSummary[]> {
    return this.request<SubscriptionPlanSummary[]>('/premium/subscription-plans')
  }

  async createCheckoutSession(slug: string): Promise<{ url: string }> {
    return this.request<{ url: string }>('/premium/checkout/session', {
      method: 'POST',
      body: JSON.stringify({ slug }),
    })
  }
}

const premiumService = new PremiumService()
export default premiumService
