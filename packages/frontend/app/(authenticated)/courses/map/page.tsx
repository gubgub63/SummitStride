/**
 * Course Map Page - Coach IA Hugo
 * Carte interactive des courses (STUB)
 *
 * TODO: Implémentation complète nécessitera:
 * - Intégration avec une API de cartes (Google Maps, Mapbox, ou OpenStreetMap)
 * - Parsing et affichage des données GPX
 * - Filtres géographiques avancés
 * - Clustering des courses par région
 * - Vue street view et satellite
 * - Export des itinéraires
 */

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card'
import { Button } from '../../../../components/ui/Button'

export default function CourseMapPage() {
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [mapView, setMapView] = useState('terrain')

  // Simulation de données de régions pour la démonstration
  const regions = [
    { id: 'all', name: 'Toutes les régions', count: 127 },
    { id: 'alps', name: 'Alpes', count: 45 },
    { id: 'pyrenees', name: 'Pyrénées', count: 32 },
    { id: 'vosges', name: 'Vosges', count: 18 },
    { id: 'jura', name: 'Jura', count: 14 },
    { id: 'corsica', name: 'Corse', count: 12 },
    { id: 'other', name: 'Autres', count: 6 }
  ]

  const mapViews = [
    { id: 'terrain', name: 'Terrain', icon: '🗻' },
    { id: 'satellite', name: 'Satellite', icon: '🛰️' },
    { id: 'street', name: 'Routes', icon: '🗺️' }
  ]

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Carte des courses</h1>
          <p className="text-muted-foreground mt-2">
            Explorez les courses d'ultra-trail par région géographique
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link href="/courses">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Vue liste
            </Link>
          </Button>
        </div>
      </div>

      {/* Development notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Carte interactive en développement
            </h3>
            <p className="text-blue-800 mb-4">
              La carte interactive complète sera disponible prochainement avec l'affichage des parcours GPX,
              les filtres géographiques avancés et la visualisation en temps réel des courses.
            </p>

            <div className="bg-white/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-blue-900">Fonctionnalités prévues :</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Affichage des parcours GPX</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Filtres par région et difficulté</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Clustering intelligent des courses</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Export d'itinéraires pour GPS</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Vue satellite et street view</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Calcul d'itinéraires d'accès</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Filtres géographiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Region filter */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Région</h4>
                <div className="space-y-2">
                  {regions.map((region) => (
                    <label key={region.id} className="flex items-center">
                      <input
                        type="radio"
                        name="region"
                        value={region.id}
                        checked={selectedRegion === region.id}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        className="rounded-full border-border text-primary-600 focus:ring-primary-600 focus:ring-offset-0"
                      />
                      <span className="ml-3 text-sm">
                        {region.name}
                        <span className="text-muted-foreground ml-1">({region.count})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Map view */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Type de carte</h4>
                <div className="grid grid-cols-1 gap-2">
                  {mapViews.map((view) => (
                    <button
                      key={view.id}
                      onClick={() => setMapView(view.id)}
                      className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors ${
                        mapView === view.id
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-border hover:bg-accent'
                      }`}
                    >
                      <span className="text-lg">{view.icon}</span>
                      <span className="text-sm font-medium">{view.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-border">
                <Button className="w-full mb-2" disabled>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Exporter la vue
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Partager
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map area */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              {/* Placeholder map */}
              <div className="relative h-96 lg:h-[600px] bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 rounded-lg overflow-hidden">
                {/* Simulated map interface */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="text-6xl">🗺️</div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-foreground">
                        Carte interactive
                      </h3>
                      <p className="text-muted-foreground max-w-md">
                        L'interface cartographique sera intégrée ici avec l'affichage des parcours GPX,
                        les marqueurs de courses et les outils de navigation.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Map controls mockup */}
                <div className="absolute top-4 right-4 space-y-2">
                  <div className="bg-white/90 rounded-lg shadow-sm p-2">
                    <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors">
                      <span className="text-lg">+</span>
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors">
                      <span className="text-lg">−</span>
                    </button>
                  </div>
                  <button className="bg-white/90 rounded-lg shadow-sm p-2 hover:bg-white/100 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>

                {/* Legend mockup */}
                <div className="absolute bottom-4 left-4 bg-white/90 rounded-lg shadow-sm p-3 space-y-2">
                  <h4 className="text-sm font-medium">Légende</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Facile</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Modéré</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span>Difficile</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Extrême</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary-600">127</div>
            <div className="text-sm text-muted-foreground">Courses cartographiées</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">89</div>
            <div className="text-sm text-muted-foreground">Parcours GPX disponibles</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">12</div>
            <div className="text-sm text-muted-foreground">Régions couvertes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">2,847</div>
            <div className="text-sm text-muted-foreground">km de parcours</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}