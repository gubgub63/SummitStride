/**
 * ProgressCharts Component - SummitStride
 * Affiche les graphiques de progression d'entraînement
 *
 * TODO: Replace with real API when backend statistics endpoints are available
 * Currently using mocked data from useStats hook
 */

'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { useStats } from '../../lib/hooks/useStats'

type ChartPeriod = '4weeks' | '12weeks' | '26weeks'
type ChartMetric = 'distance' | 'duration' | 'sessions'

interface ChartControlsProps {
  period: ChartPeriod
  metric: ChartMetric
  onPeriodChange: (period: ChartPeriod) => void
  onMetricChange: (metric: ChartMetric) => void
}

function ChartControls({ period, metric, onPeriodChange, onMetricChange }: ChartControlsProps) {
  const periodOptions = [
    { value: '4weeks' as ChartPeriod, label: '4 semaines' },
    { value: '12weeks' as ChartPeriod, label: '12 semaines' },
    { value: '26weeks' as ChartPeriod, label: '26 semaines' }
  ]

  const metricOptions = [
    { value: 'distance' as ChartMetric, label: 'Distance' },
    { value: 'duration' as ChartMetric, label: 'Durée' },
    { value: 'sessions' as ChartMetric, label: 'Séances' }
  ]

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Période
        </label>
        <select
          value={period}
          onChange={(e) => onPeriodChange(e.target.value as ChartPeriod)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          {periodOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Métrique
        </label>
        <select
          value={metric}
          onChange={(e) => onMetricChange(e.target.value as ChartMetric)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          {metricOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

interface SimpleBarChartProps {
  data: Array<{ label: string; value: number }>
  metric: ChartMetric
}

function SimpleBarChart({ data, metric }: SimpleBarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value))

  const formatValue = (value: number) => {
    switch (metric) {
      case 'distance':
        return `${value.toFixed(1)} km`
      case 'duration':
        const hours = Math.floor(value / 60)
        const mins = value % 60
        return hours > 0 ? `${hours}h${mins > 0 ? mins.toString().padStart(2, '0') : ''}` : `${mins}min`
      case 'sessions':
        return `${value} séances`
      default:
        return value.toString()
    }
  }

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="flex items-center space-x-4">
          <div className="w-16 text-sm text-gray-600 text-right">
            {item.label}
          </div>
          <div className="flex-1 relative">
            <div className="bg-gray-200 rounded-full h-6 relative overflow-hidden">
              <div
                className="bg-primary-600 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-start pl-3">
                <span className="text-xs font-medium text-white">
                  {formatValue(item.value)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ProgressCharts() {
  const { progress, loading, error, formatDuration } = useStats()
  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>('12weeks')
  const [selectedMetric, setSelectedMetric] = useState<ChartMetric>('distance')

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progression d'entraînement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="flex space-x-4">
              <div className="h-10 bg-gray-200 rounded w-32"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-16 h-6 bg-gray-200 rounded"></div>
                  <div className="flex-1 h-6 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progression d'entraînement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600">Erreur lors du chargement des données de progression</p>
            <p className="text-sm text-gray-500 mt-2">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Filtrer les données selon la période sélectionnée
  const getFilteredData = () => {
    let dataToShow = progress

    switch (selectedPeriod) {
      case '4weeks':
        dataToShow = progress.slice(-4)
        break
      case '12weeks':
        dataToShow = progress.slice(-12)
        break
      case '26weeks':
        dataToShow = progress.slice(-26)
        break
    }

    return dataToShow.map(item => ({
      label: item.week,
      value: selectedMetric === 'distance' ? item.distance :
             selectedMetric === 'duration' ? item.duration :
             item.sessions
    }))
  }

  const chartData = getFilteredData()

  // Calculer les statistiques de tendance
  const calculateTrend = () => {
    if (chartData.length < 2) return null

    const recent = chartData.slice(-4).reduce((sum, item) => sum + item.value, 0) / 4
    const older = chartData.slice(-8, -4).reduce((sum, item) => sum + item.value, 0) / 4

    if (older === 0) return null

    const change = ((recent - older) / older) * 100
    return {
      value: Math.abs(change),
      isPositive: change > 0,
      label: change > 0 ? 'amélioration' : 'diminution'
    }
  }

  const trend = calculateTrend()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progression d'entraînement</CardTitle>
        {trend && (
          <div className="text-sm text-gray-600">
            <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
              {trend.isPositive ? '↗' : '↘'} {trend.value.toFixed(1)}% de {trend.label}
            </span>
            {' '}sur les 4 dernières semaines
          </div>
        )}
      </CardHeader>

      <CardContent>
        <ChartControls
          period={selectedPeriod}
          metric={selectedMetric}
          onPeriodChange={setSelectedPeriod}
          onMetricChange={setSelectedMetric}
        />

        {chartData.length > 0 ? (
          <SimpleBarChart data={chartData} metric={selectedMetric} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            Aucune donnée disponible pour cette période
          </div>
        )}

        {/* Résumé statistique */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium mb-2 text-gray-900">
            Résumé de la période
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total:</span>
              <div className="font-medium text-gray-900">
                {selectedMetric === 'distance' &&
                  `${chartData.reduce((sum, item) => sum + item.value, 0).toFixed(1)} km`}
                {selectedMetric === 'duration' &&
                  formatDuration(chartData.reduce((sum, item) => sum + item.value, 0))}
                {selectedMetric === 'sessions' &&
                  `${chartData.reduce((sum, item) => sum + item.value, 0)} séances`}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Moyenne:</span>
              <div className="font-medium text-gray-900">
                {selectedMetric === 'distance' &&
                  `${(chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length).toFixed(1)} km`}
                {selectedMetric === 'duration' &&
                  formatDuration(chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length)}
                {selectedMetric === 'sessions' &&
                  `${Math.round(chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length)} séances`}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Maximum:</span>
              <div className="font-medium text-gray-900">
                {selectedMetric === 'distance' &&
                  `${Math.max(...chartData.map(d => d.value)).toFixed(1)} km`}
                {selectedMetric === 'duration' &&
                  formatDuration(Math.max(...chartData.map(d => d.value)))}
                {selectedMetric === 'sessions' &&
                  `${Math.max(...chartData.map(d => d.value))} séances`}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Minimum:</span>
              <div className="font-medium text-gray-900">
                {selectedMetric === 'distance' &&
                  `${Math.min(...chartData.map(d => d.value)).toFixed(1)} km`}
                {selectedMetric === 'duration' &&
                  formatDuration(Math.min(...chartData.map(d => d.value)))}
                {selectedMetric === 'sessions' &&
                  `${Math.min(...chartData.map(d => d.value))} séances`}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
