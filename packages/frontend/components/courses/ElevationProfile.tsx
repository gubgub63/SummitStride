/**
 * ElevationProfile Component - SummitStride
 * Affichage du profil altimétrique d'une course (STUB)
 *
 * TODO: Implémentation complète nécessitera:
 * - Parsing des données GPX du backend
 * - Librairie de graphiques (Chart.js, D3.js, ou Recharts)
 * - Calcul des segments et points d'intérêt
 * - Interaction avec le graphique (zoom, hover, etc.)
 */

'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'

interface ElevationProfileProps {
  courseId: string
  routeData?: any
  distance: number
  elevationGain: number
  elevationLoss: number
  className?: string
}

export function ElevationProfile({
  courseId,
  routeData,
  distance,
  elevationGain,
  elevationLoss,
  className = ""
}: ElevationProfileProps) {

  // Stub: Simulation de données d'élévation pour la démonstration
  const generateMockElevationData = () => {
    const points = 50
    const data = []

    for (let i = 0; i <= points; i++) {
      const distanceAtPoint = (i / points) * distance
      // Simulation d'un profil montagneux avec des montées et descentes
      const baseElevation = 1000
      const elevationVariation = Math.sin(i * 0.3) * 300 + Math.sin(i * 0.1) * 150
      const elevation = baseElevation + elevationVariation + (elevationGain * i / points)

      data.push({
        distance: Math.round(distanceAtPoint * 10) / 10,
        elevation: Math.round(elevation)
      })
    }

    return data
  }

  const mockData = generateMockElevationData()
  const maxElevation = Math.max(...mockData.map(p => p.elevation))
  const minElevation = Math.min(...mockData.map(p => p.elevation))

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
          <span>Profil altimétrique</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Development notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-blue-900!">Fonctionnalité en développement</h4>
              <p className="text-sm text-blue-800 mt-1">
                Le profil altimétrique interactif sera disponible prochainement avec l'analyse des données GPX.
                Actuellement affiché : profil de démonstration basé sur les données de dénivelé.
              </p>
            </div>
          </div>
        </div>

        {/* Mock elevation chart */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3 bg-accent rounded-lg">
              <div className="font-semibold text-foreground">{distance} km</div>
              <div className="text-muted-foreground">Distance</div>
            </div>
            <div className="text-center p-3 bg-accent rounded-lg">
              <div className="font-semibold text-green-600">+{elevationGain} m</div>
              <div className="text-muted-foreground">Dénivelé +</div>
            </div>
            <div className="text-center p-3 bg-accent rounded-lg">
              <div className="font-semibold text-red-600">-{elevationLoss} m</div>
              <div className="text-muted-foreground">Dénivelé -</div>
            </div>
            <div className="text-center p-3 bg-accent rounded-lg">
              <div className="font-semibold text-foreground">{maxElevation} m</div>
              <div className="text-muted-foreground">Point haut</div>
            </div>
          </div>

          {/* Simplified visual elevation profile */}
          <div className="relative h-48 bg-gradient-to-b from-blue-50 to-green-50 rounded-lg overflow-hidden">
            {/* SVG path for elevation profile */}
            <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="elevationGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.1" />
                </linearGradient>
              </defs>

              {/* Generate path from mock data */}
              <path
                d={mockData.reduce((path, point, index) => {
                  const x = (point.distance / distance) * 400
                  const y = 200 - ((point.elevation - minElevation) / (maxElevation - minElevation)) * 180
                  return path + (index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`)
                }, '') + ` L 400 200 L 0 200 Z`}
                fill="url(#elevationGradient)"
                stroke="#3B82F6"
                strokeWidth="2"
              />
            </svg>

            {/* Distance markers */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-between px-2 text-xs text-muted-foreground">
              <span>0 km</span>
              <span>{Math.round(distance / 4)} km</span>
              <span>{Math.round(distance / 2)} km</span>
              <span>{Math.round(3 * distance / 4)} km</span>
              <span>{distance} km</span>
            </div>
          </div>

          {/* Coming soon features */}
          <div className="border border-dashed border-border rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-2">Fonctionnalités à venir :</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Graphique interactif avec zoom et navigation</li>
              <li>• Points d'intérêt et ravitaillements sur le parcours</li>
              <li>• Analyse des segments et pentes</li>
              <li>• Export et partage du profil</li>
              <li>• Comparaison avec d'autres parcours</li>
            </ul>
          </div>

          {/* Technical info */}
          {routeData && (
            <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted rounded">
              <strong>Données disponibles :</strong>
              {routeData.gpxData && " GPX"}
              {routeData.segments && ` • ${routeData.segments.length} segments`}
              {routeData.checkpoints && ` • ${routeData.checkpoints.length} points de contrôle`}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
