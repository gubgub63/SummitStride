import Constants from 'expo-constants'

type ExtraConfig = {
  apiUrl?: string
  stravaFrontendUrl?: string
}

const extra = (Constants.expoConfig?.extra ?? {}) as ExtraConfig

export const API_URL = extra.apiUrl ?? 'http://localhost:4000'
export const STRAVA_FRONTEND_URL = extra.stravaFrontendUrl ?? 'http://localhost:3000'

export const isDevelopment = process.env.NODE_ENV !== 'production'
