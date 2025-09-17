'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { useAuth } from '../../../lib/hooks/useAuth'
import { useProfile } from '../../../lib/hooks/useProfile'

export default function DashboardPage() {
  const { user } = useAuth()
  const { completion, needsOnboarding } = useProfile()

  return (
    <div className="space-y-6">
      {/* En-tête de bienvenue */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Bienvenue, {user?.name?.split(' ')[0]} ! 👋
        </h1>
        <p className="text-muted-foreground">
          Voici un aperçu de votre entraînement ultra-trail
        </p>
      </div>

      {/* Alerte profil incomplet */}
      {needsOnboarding && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-medium text-orange-800 dark:text-orange-200">
                  Complétez votre profil
                </h3>
                <p className="text-sm text-orange-600 dark:text-orange-300">
                  Votre profil est complété à {completion?.completionPercentage || 0}%.
                  Finalisez-le pour obtenir des recommandations personnalisées.
                </p>
              </div>
              <Button variant="default" size="sm">
                Compléter le profil
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grille de statistiques */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plans actifs</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Aucun plan en cours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Séances semaine</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0/0</div>
            <p className="text-xs text-muted-foreground">Complétées cette semaine</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Distance totale</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 km</div>
            <p className="text-xs text-muted-foreground">Ce mois-ci</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prochaine course</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Aucune course planifiée</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Commencer l'entraînement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Créez votre premier plan d'entraînement personnalisé pour atteindre vos objectifs ultra-trail.
            </p>
            <Button className="w-full" disabled>
              Créer un plan d'entraînement
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Explorer les courses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Découvrez des courses ultra-trail près de chez vous et planifiez vos prochains défis.
            </p>
            <Button variant="outline" className="w-full" disabled>
              Parcourir les courses
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder pour contenu futur */}
      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Aucune activité récente</p>
            <p className="text-sm">Vos séances d'entraînement apparaîtront ici</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}