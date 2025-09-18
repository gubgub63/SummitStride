/**
 * ProfileStats Component - Coach IA Hugo
 * Affiche les statistiques générales d'entraînement de l'utilisateur
 *
 * TODO: Replace with real API when backend statistics endpoints are available
 * Currently using mocked data from useStats hook
 */

'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { useStats } from '../../lib/hooks/useStats'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
}

function StatCard({ title, value, subtitle, icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className="h-8 w-8 text-primary-600">
              {icon}
            </div>
          )}
        </div>
        {trend && (
          <div className="mt-4 flex items-center">
            <span className={`text-sm font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-sm text-gray-500 ml-2">vs semaine précédente</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function ProfileStats() {
  const { stats, loading, error, formatDuration, formatDistance, formatPace } = useStats()

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">Erreur lors du chargement des statistiques</p>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-3">
          Statistiques générales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total séances"
            value={stats.totalSessions}
            subtitle="Depuis le début"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          />

          <StatCard
            title="Distance totale"
            value={formatDistance(stats.totalDistance)}
            subtitle="Depuis le début"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />

          <StatCard
            title="Temps total"
            value={formatDuration(stats.totalDuration)}
            subtitle="Depuis le début"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          <StatCard
            title="Allure moyenne"
            value={formatPace(stats.averagePace)}
            subtitle="Sur les 30 derniers jours"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">
          Cette semaine
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Distance"
            value={formatDistance(stats.currentWeekDistance)}
            subtitle="Cette semaine"
            trend={{ value: 12, isPositive: true }}
          />

          <StatCard
            title="Durée"
            value={formatDuration(stats.currentWeekDuration)}
            subtitle="Cette semaine"
            trend={{ value: 8, isPositive: true }}
          />

          <StatCard
            title="Courses terminées"
            value={stats.completedRaces}
            subtitle="Total"
          />

          <StatCard
            title="Courses à venir"
            value={stats.upcomingRaces}
            subtitle="Inscriptions actives"
          />
        </div>
      </div>

      {stats.lastActivityDate && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dernière activité</p>
                <p className="text-lg font-semibold">
                  {stats.lastActivityDate.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-sm text-gray-500">
                  Il y a {Math.floor((new Date().getTime() - stats.lastActivityDate.getTime()) / (1000 * 60 * 60 * 24))} jours
                </p>
              </div>
              <div className="h-8 w-8 text-primary-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}