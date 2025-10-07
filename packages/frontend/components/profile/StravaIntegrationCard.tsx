'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { useStravaIntegration } from '../../lib/hooks/useStravaIntegration'

interface StravaIntegrationCardProps {
  onSynced?: () => void | Promise<void>
}

export function StravaIntegrationCard({ onSynced }: StravaIntegrationCardProps) {
  const { status, loading, error, connect, sync, syncing } = useStravaIntegration()

  const handleSync = async () => {
    await sync()
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('summitstride-stats-refresh'))
    }
    if (onSynced) {
      await onSynced()
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-40 animate-pulse" />
          <div className="h-9 bg-gray-200 rounded w-64 animate-pulse" />
        </div>
      )
    }

    if (error) {
      return (
        <div className="space-y-4">
          <p className="text-sm text-red-600">{error}</p>
          <Button variant="outline" onClick={() => connect()}>Réessayer la connexion Strava</Button>
        </div>
      )
    }

    if (!status || !status.connected) {
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Connectez votre compte Strava pour synchroniser automatiquement vos activités et alimenter vos statistiques.
          </p>
          <Button onClick={() => connect()} size="lg">
            Connecter Strava
          </Button>
        </div>
      )
    }

    return (
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Compte connecté</p>
          <p className="text-lg font-semibold">
            {status.athlete?.firstName || ''} {status.athlete?.lastName || ''}
            {status.athlete?.username ? ` (@${status.athlete.username})` : ''}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Dernière synchronisation : {status.lastSyncAt ? new Date(status.lastSyncAt).toLocaleString('fr-FR') : 'jamais'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => connect()}>
            Reconnecter
          </Button>
          <Button onClick={handleSync} loading={syncing}>
            Synchroniser maintenant
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Intégration Strava</CardTitle>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  )
}
