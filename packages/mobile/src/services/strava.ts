import { apiRequest } from './api'

export interface StravaConnectionStatus {
  connected: boolean
  lastSyncAt: string | null
  athlete: {
    id: number | null
    username: string | null
    firstName: string | null
    lastName: string | null
  }
}

export async function getStravaStatus(token: string) {
  return apiRequest<{ success: boolean; data: StravaConnectionStatus }>('/api/integrations/strava/status', {
    method: 'GET',
    token,
  })
}

export async function getStravaAuthorizationUrl(token: string) {
  return apiRequest<{ success: boolean; data: { authorizationUrl: string } }>('/api/integrations/strava/auth-url', {
    method: 'GET',
    token,
  })
}

export async function triggerStravaSync(token: string) {
  return apiRequest<{ success: boolean; data: { syncedAt: string; previewActivity: unknown } }>(
    '/api/integrations/strava/sync',
    {
      method: 'POST',
      token,
    }
  )
}

export interface StravaActivity {
  id: number
  name: string
  distance: number
  moving_time: number
  start_date: string
  sport_type: string
  average_heartrate?: number
}

interface StravaActivitiesPayload {
  activities: StravaActivity[]
  paging: {
    perPage: number
    page: number
    total: number
    totalPages: number
  }
}

export async function getStravaActivities(token: string, params: { perPage?: number; afterDays?: number } = {}) {
  const query = new URLSearchParams()
  if (params.perPage) query.set('perPage', params.perPage.toString())
  if (params.afterDays) query.set('afterDays', params.afterDays.toString())

  const suffix = query.toString() ? `?${query.toString()}` : ''
  return apiRequest<{ success: boolean; data: StravaActivitiesPayload }>(
    `/api/integrations/strava/activities${suffix}`,
    {
      method: 'GET',
      token,
    }
  )
}
