/**
 * Strava Service - SummitStride
 * Gestion des appels API liés à l'intégration Strava
 */

interface StravaStatus {
  connected: boolean
  athlete?: {
    id: number
    username?: string | null
    firstName?: string | null
    lastName?: string | null
  }
  expiresAt?: string
  lastSyncAt?: string | null
}

export interface StravaActivity {
  id: number
  name: string
  distance: number
  moving_time: number
  elapsed_time: number
  total_elevation_gain: number
  sport_type: string
  type: string
  start_date: string
  start_date_local: string
  average_speed?: number
  max_speed?: number
  average_heartrate?: number
  max_heartrate?: number
  suffer_score?: number
  workout_type?: number
}

interface FetchActivitiesResponse {
  activities: StravaActivity[]
  paging: {
    perPage: number
    page: number
    total: number
    totalPages: number
  }
}

class StravaService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

    const response = await fetch(`${this.baseUrl}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })

    const payload = await response.json().catch(() => ({ success: false }))

    if (!response.ok || payload.success === false) {
      throw new Error(payload?.error || `HTTP ${response.status}`)
    }

    return payload.data
  }

  async getAuthorizationUrl(): Promise<string> {
    const data = await this.fetchWithAuth('/api/integrations/strava/auth-url')
    return data.authorizationUrl
  }

  async getStatus(): Promise<StravaStatus> {
    return this.fetchWithAuth('/api/integrations/strava/status')
  }

  async getActivities(params: { perPage?: number; afterDays?: number; page?: number } = {}) {
    const query = new URLSearchParams()

    if (params.perPage) {
      query.set('perPage', String(params.perPage))
    }

    if (params.afterDays) {
      query.set('afterDays', String(params.afterDays))
    }

    if (params.page) {
      query.set('page', String(params.page))
    }

    const suffix = query.toString() ? `?${query.toString()}` : ''
    return this.fetchWithAuth(`/api/integrations/strava/activities${suffix}`) as Promise<FetchActivitiesResponse>
  }

  async syncActivities(): Promise<{ syncedAt: string; previewActivity: StravaActivity | null }> {
    const data = await this.fetchWithAuth('/api/integrations/strava/sync', {
      method: 'POST',
    })
    return data
  }
}

const stravaService = new StravaService()
export default stravaService
export type { StravaStatus }
