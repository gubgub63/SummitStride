import { Prisma, PrismaClient, StravaIntegration } from '@prisma/client'
import jwt from 'jsonwebtoken'

const STRAVA_OAUTH_AUTHORIZE_URL = 'https://www.strava.com/oauth/authorize'
const STRAVA_OAUTH_TOKEN_URL = 'https://www.strava.com/oauth/token'
const STRAVA_API_BASE_URL = 'https://www.strava.com/api/v3'

interface StravaConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  frontendBaseUrl: string
}

interface StravaTokenResponse {
  token_type: string
  access_token: string
  expires_at: number
  expires_in: number
  refresh_token: string
  scope: string
  athlete?: {
    id: number
    username?: string
    firstname?: string
    lastname?: string
  }
}

interface FetchActivitiesOptions {
  perPage?: number
  page?: number
  after?: number
  before?: number
}

interface StravaActivity {
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

interface AuthorizationStatePayload {
  sub: string
  scope: string
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'

function getStravaConfig(): StravaConfig {
  const clientId = process.env.STRAVA_CLIENT_ID
  const clientSecret = process.env.STRAVA_CLIENT_SECRET
  const redirectUri = process.env.STRAVA_REDIRECT_URI || 'http://localhost:4000/api/integrations/strava/callback'
  const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000'

  if (!clientId || !clientSecret) {
    throw new Error('STRAVA_CLIENT_ID et STRAVA_CLIENT_SECRET doivent être configurés dans les variables d\'environnement.')
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
    frontendBaseUrl,
  }
}

function createStateToken(userId: string): string {
  const payload: AuthorizationStatePayload = {
    sub: userId,
    scope: 'strava-connect',
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '10m',
  })
}

function verifyStateToken(state: string): string {
  try {
    const payload = jwt.verify(state, JWT_SECRET) as AuthorizationStatePayload

    if (payload.scope !== 'strava-connect') {
      throw new Error('Invalid state scope')
    }

    return payload.sub
  } catch (error) {
    throw new Error('Invalid or expired Strava authorization state.')
  }
}

export function buildAuthorizationUrl(userId: string): string {
  const { clientId, redirectUri } = getStravaConfig()
  const scopes = ['read', 'profile:read_all', 'activity:read_all']
  const state = createStateToken(userId)

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: scopes.join(','),
    approval_prompt: 'auto',
    state,
  })

  return `${STRAVA_OAUTH_AUTHORIZE_URL}?${params.toString()}`
}

async function requestToken(params: URLSearchParams): Promise<StravaTokenResponse> {
  const response = await fetch(STRAVA_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  const payload = await response.json()

  if (!response.ok) {
    const message = payload?.message || payload?.error || 'Erreur lors de la communication avec Strava.'
    throw new Error(message)
  }

  return payload as StravaTokenResponse
}

export async function exchangeAuthorizationCode(
  prisma: PrismaClient,
  userId: string,
  code: string
): Promise<StravaIntegration> {
  const { clientId, clientSecret } = getStravaConfig()

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: 'authorization_code',
  })

  const tokenResponse = await requestToken(params)

  const expiresAt = new Date(tokenResponse.expires_at * 1000)
  const athlete = tokenResponse.athlete

  if (!athlete?.id) {
    throw new Error("Impossible de récupérer l'athlète Strava associé.")
  }

  const integration = await prisma.stravaIntegration.upsert({
    where: { userId },
    update: {
      athleteId: athlete.id,
      athleteUsername: athlete?.username ?? null,
      athleteFirstName: athlete?.firstname ?? null,
      athleteLastName: athlete?.lastname ?? null,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      tokenType: tokenResponse.token_type,
      scope: tokenResponse.scope,
      expiresAt,
      lastSyncAt: null,
    },
    create: {
      userId,
      athleteId: athlete.id,
      athleteUsername: athlete?.username ?? null,
      athleteFirstName: athlete?.firstname ?? null,
      athleteLastName: athlete?.lastname ?? null,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      tokenType: tokenResponse.token_type,
      scope: tokenResponse.scope,
      expiresAt,
    },
  })

  return integration
}

async function refreshAccessToken(
  prisma: PrismaClient,
  integration: StravaIntegration
): Promise<StravaIntegration> {
  const { clientId, clientSecret } = getStravaConfig()

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: integration.refreshToken,
    grant_type: 'refresh_token',
  })

  const tokenResponse = await requestToken(params)
  const expiresAt = new Date(tokenResponse.expires_at * 1000)

  return prisma.stravaIntegration.update({
    where: { id: integration.id },
    data: {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      tokenType: tokenResponse.token_type,
      scope: tokenResponse.scope,
      expiresAt,
    },
  })
}

async function ensureValidAccessToken(
  prisma: PrismaClient,
  integration: StravaIntegration
): Promise<StravaIntegration> {
  const now = Date.now()
  const expiry = integration.expiresAt.getTime()

  if (expiry - now > 60 * 1000) {
    return integration
  }

  return refreshAccessToken(prisma, integration)
}

export async function getConnectionStatus(prisma: PrismaClient, userId: string) {
  try {
    const integration = await prisma.stravaIntegration.findUnique({ where: { userId } })

    if (!integration) {
      return { connected: false as const }
    }

    return {
      connected: true as const,
      athlete: {
        id: integration.athleteId,
        username: integration.athleteUsername,
        firstName: integration.athleteFirstName,
        lastName: integration.athleteLastName,
      },
      expiresAt: integration.expiresAt,
      lastSyncAt: integration.lastSyncAt ?? null,
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      return { connected: false as const }
    }

    throw error
  }
}

export async function fetchStravaActivities(
  prisma: PrismaClient,
  userId: string,
  options: FetchActivitiesOptions = {}
) {
  const integration = await prisma.stravaIntegration.findUnique({ where: { userId } })

  if (!integration) {
    throw new Error('Aucun compte Strava connecté pour cet utilisateur.')
  }

  let validIntegration: StravaIntegration
  try {
    validIntegration = await ensureValidAccessToken(prisma, integration)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      throw new Error('Base de données non migrée pour Strava. Exécutez les migrations Prisma.')
    }
    throw error
  }

  const perPage = Math.min(Math.max(options.perPage ?? 20, 1), 200)
  const page = Math.max(options.page ?? 1, 1)

  const params = new URLSearchParams({
    per_page: String(perPage),
    page: String(page),
  })

  if (options.after) {
    params.set('after', String(options.after))
  }

  if (options.before) {
    params.set('before', String(options.before))
  }

  const response = await fetch(`${STRAVA_API_BASE_URL}/athlete/activities?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${validIntegration.accessToken}`,
    },
  })

  if (response.status === 401) {
    const refreshed = await refreshAccessToken(prisma, validIntegration)
    const retryResponse = await fetch(`${STRAVA_API_BASE_URL}/athlete/activities?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${refreshed.accessToken}`,
      },
    })

    if (!retryResponse.ok) {
      const payload = await retryResponse.json().catch(() => ({}))
      throw new Error(payload?.message || 'Impossible de récupérer les activités Strava.')
    }

    const retryPayload = (await retryResponse.json()) as StravaActivity[]
    await prisma.stravaIntegration.update({
      where: { id: refreshed.id },
      data: { lastSyncAt: new Date() },
    })

    return {
      activities: retryPayload,
      paging: {
        perPage,
        page,
      },
    }
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    const message = payload?.message || payload?.error || 'Impossible de récupérer les activités Strava.'
    throw new Error(message)
  }

  const activities = (await response.json()) as StravaActivity[]

  const now = new Date()

  await Promise.all(
    activities.map(activity =>
      prisma.stravaActivity.upsert({
        where: { stravaId: BigInt(activity.id) },
        update: {
          userId,
          name: activity.name,
          type: activity.type,
          sportType: activity.sport_type ?? activity.type,
          distance: activity.distance ?? 0,
          movingTime: activity.moving_time ?? 0,
          elapsedTime: activity.elapsed_time ?? 0,
          totalElevationGain: activity.total_elevation_gain ?? 0,
          startDate: new Date(activity.start_date),
          startDateLocal: activity.start_date_local ? new Date(activity.start_date_local) : null,
          averageSpeed: activity.average_speed ?? null,
          maxSpeed: activity.max_speed ?? null,
          averageHeartRate: activity.average_heartrate ?? null,
          maxHeartRate: activity.max_heartrate ?? null,
          sufferScore: activity.suffer_score ?? null,
          raw: activity as unknown as Prisma.JsonValue,
        },
        create: {
          userId,
          stravaId: BigInt(activity.id),
          name: activity.name,
          type: activity.type,
          sportType: activity.sport_type ?? activity.type,
          distance: activity.distance ?? 0,
          movingTime: activity.moving_time ?? 0,
          elapsedTime: activity.elapsed_time ?? 0,
          totalElevationGain: activity.total_elevation_gain ?? 0,
          startDate: new Date(activity.start_date),
          startDateLocal: activity.start_date_local ? new Date(activity.start_date_local) : null,
          averageSpeed: activity.average_speed ?? null,
          maxSpeed: activity.max_speed ?? null,
          averageHeartRate: activity.average_heartrate ?? null,
          maxHeartRate: activity.max_heartrate ?? null,
          sufferScore: activity.suffer_score ?? null,
          raw: activity as unknown as Prisma.JsonValue,
        },
      })
    )
  )

  await prisma.stravaIntegration.update({
    where: { id: validIntegration.id },
    data: { lastSyncAt: now },
  })

  const storedActivities = await prisma.stravaActivity.findMany({
    where: { userId },
    orderBy: { startDate: 'desc' },
    take: perPage,
    skip: (page - 1) * perPage,
  })

  const totalCount = await prisma.stravaActivity.count({ where: { userId } })

  return {
    activities: storedActivities.map(activity => ({
      id: Number(activity.stravaId),
      name: activity.name,
      distance: activity.distance,
      moving_time: activity.movingTime,
      elapsed_time: activity.elapsedTime,
      total_elevation_gain: activity.totalElevationGain ?? 0,
      sport_type: activity.sportType ?? activity.type,
      type: activity.type,
      start_date: activity.startDate.toISOString(),
      start_date_local: activity.startDateLocal?.toISOString() ?? activity.startDate.toISOString(),
      average_speed: activity.averageSpeed ?? undefined,
      max_speed: activity.maxSpeed ?? undefined,
      average_heartrate: activity.averageHeartRate ?? undefined,
      max_heartrate: activity.maxHeartRate ?? undefined,
      suffer_score: activity.sufferScore ?? undefined,
    })),
    paging: {
      perPage,
      page,
      total: totalCount,
      totalPages: Math.max(Math.ceil(totalCount / perPage), 1),
    },
  }
}

export async function handleStravaCallback(
  prisma: PrismaClient,
  query: Record<string, string | undefined>
) {
  if (query.error) {
    throw new Error(query.error_description || 'Autorisation Strava refusée.')
  }

  const code = query.code
  const state = query.state

  if (!code || !state) {
    throw new Error('Code ou état manquant lors du callback Strava.')
  }

  const userId = verifyStateToken(state)

  await exchangeAuthorizationCode(prisma, userId, code)

  const { frontendBaseUrl } = getStravaConfig()
  return {
    redirectUrl: `${frontendBaseUrl}/integrations/strava?status=success`,
  }
}

export async function buildCallbackErrorRedirect(reason: string) {
  const { frontendBaseUrl } = getStravaConfig()
  const params = new URLSearchParams({ status: 'error', reason })
  return `${frontendBaseUrl}/integrations/strava?${params.toString()}`
}
