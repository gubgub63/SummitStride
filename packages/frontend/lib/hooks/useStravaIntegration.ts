'use client'

import { useCallback, useEffect, useState } from 'react'
import stravaService, { StravaStatus } from '../services/stravaService'

interface StravaIntegrationState {
  status: StravaStatus | null
  loading: boolean
  error: string | null
  syncing: boolean
}

export function useStravaIntegration() {
  const [state, setState] = useState<StravaIntegrationState>({
    status: null,
    loading: true,
    error: null,
    syncing: false,
  })

  const loadStatus = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const status = await stravaService.getStatus()
      setState(prev => ({ ...prev, status, loading: false }))
    } catch (error) {
      console.error('Erreur Strava status:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Impossible de récupérer le statut Strava',
      }))
    }
  }, [])

  useEffect(() => {
    loadStatus().catch(err => {
      console.error('Erreur initiale Strava:', err)
    })
  }, [loadStatus])

  const connect = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }))
      const url = await stravaService.getAuthorizationUrl()
      window.location.href = url
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Impossible de démarrer la connexion Strava',
      }))
    }
  }, [])

  const sync = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, syncing: true, error: null }))
      await stravaService.syncActivities()
      await loadStatus()
    } catch (error) {
      console.error('Erreur synchronisation Strava:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Impossible de synchroniser Strava pour le moment',
      }))
    } finally {
      setState(prev => ({ ...prev, syncing: false }))
    }
  }, [loadStatus])

  return {
    status: state.status,
    loading: state.loading,
    error: state.error,
    syncing: state.syncing,
    connect,
    refresh: loadStatus,
    sync,
  }
}
