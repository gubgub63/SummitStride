'use client'

import React, { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'

export default function StravaIntegrationResultPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const status = searchParams.get('status')
  const reason = searchParams.get('reason')

  useEffect(() => {
    if (status === 'success' && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('summitstride-stats-refresh'))
    }
  }, [status])

  const renderContent = () => {
    if (status === 'success') {
      return (
        <div className="space-y-4 text-center">
          <h2 className="text-xl font-semibold text-primary-600">Connexion Strava réussie</h2>
          <p className="text-sm text-muted-foreground">
            Vos activités seront synchronisées automatiquement. Vous pouvez relancer la synchronisation depuis votre profil.
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => router.replace('/profile')}>Retourner au profil</Button>
            <Button variant="outline" asChild>
              <Link href="/">Accéder au tableau de bord</Link>
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-semibold text-red-600">Connexion Strava interrompue</h2>
        <p className="text-sm text-muted-foreground">
          {reason || 'La connexion à Strava a été annulée ou a échoué. Réessayez depuis votre profil.'}
        </p>
        <div className="flex justify-center gap-3">
          <Button onClick={() => router.replace('/profile')}>Retourner au profil</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle>Intégration Strava</CardTitle>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>
    </div>
  )
}
