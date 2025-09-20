/**
 * CalorieCalculator - Composant d'apprentissage React Phase 4.7
 *
 * 🎯 TON NOUVEAU DÉFI : Calculateur de calories avec useEffect !
 *
 * Nouveaux concepts React à apprendre dans ce composant :
 * ✅ useEffect - Réagir aux changements de données
 * ✅ Formulaires contrôlés - Input avec value et onChange
 * ✅ Calculs temps réel - Recalcul automatique
 * ✅ Validation de formulaire - Vérifier les données saisies
 * ✅ État complexe - Gérer plusieurs valeurs liées
 * ✅ Conditional rendering avancé - Affichage selon validation
 *
 * 📋 INSTRUCTIONS POUR TOI :
 *
 * 1. Utilise useState pour gérer le poids, durée, activité, intensité
 * 2. Utilise useEffect pour recalculer automatiquement quand les valeurs changent
 * 3. Ajoute de la validation avec des messages d'erreur
 * 4. Affiche le résultat en temps réel
 * 5. Gère les cas d'erreur et les états de chargement
 *
 * 💡 AIDE :
 * - Regarde calculateCalories et validateCalculatorInput dans mockNutritionData.ts
 * - Utilise les types CalorieCalculatorProps et CalorieResult
 * - Inspire-toi de WeeklyPlanWidget pour la structure
 */

'use client'

import React, { useState, useEffect } from 'react'
import type { CalorieCalculatorProps, CalorieResult, IntensityLevel } from '../../types/nutrition'
import { INTENSITY_LABELS } from '../../types/nutrition'
import {
  mockActivities,
  calculateCalories,
  validateCalculatorInput,
  formatDuration,
  getCalorieColor,
  getIntensityMessage,
} from '../../lib/data/mockNutritionData'
import { Input } from '../ui'
import { useAuth } from '../../lib/contexts/AuthContext'

export function CalorieCalculator({
  currentWeight = 70,
  onCaloriesCalculated,
  className = '',
}: CalorieCalculatorProps) {
  const { profile } = useAuth()
  // 🎯 TON CODE ICI :
  // 1. Utilise useState pour gérer toutes les valeurs du formulaire
  const [weight, setWeight] = useState<number>(profile?.weight || currentWeight)
  const [duration, setDuration] = useState<number>(60)
  const [activity, setActivity] = useState<string>('running-moderate')
  const [intensity, setIntensity] = useState<IntensityLevel>('MODERATE')
  const [result, setResult] = useState<CalorieResult | null>(null)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    const validation = validateCalculatorInput(weight, duration, activity)

    if (validation.isValid) {
      try {
        const calculatedResult = calculateCalories(weight, activity, duration, intensity)
        setResult(calculatedResult)
        onCaloriesCalculated(calculatedResult)
      } catch (error) {
        setErrors(['Erreur de calculs'])
        setResult(null)
      }
    } else {
      setErrors(validation.errors.map(e => e.message))
      setResult(null)
    }
  }, [weight, duration, activity, intensity])
  // 4. Fonctions de gestion des événements
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWeight(Number(e.target.value))
  }
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDuration(Number(e.target.value))
  }
  const handleActivityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActivity(e.target.value)
  }
  const handleIntensityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIntensity(e.target.value as IntensityLevel)
  }
  return (
    <div className={`space-y-6 ${className}`}>
      {/* 🎯 Formulaire de saisie */}
      <div className="space-y-4">
        {/* Input pour le poids */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Poids (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={handleWeightChange}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            min="1"
            max="200"
          />
        </div>

        {/* Input pour la durée */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Durée d'effort (minutes)
          </label>
          <input
            type="number"
            value={duration}
            onChange={handleDurationChange}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            min="1"
            max="720"
          />
        </div>

        {/* Sélecteur d'activité */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Type d'activité</label>
          <select
            value={activity}
            onChange={handleActivityChange}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {mockActivities.map(act => (
              <option key={act.id} value={act.id}>
                {act.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sélecteur d'intensité */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Intensité de l'effort
          </label>
          <select
            value={intensity}
            onChange={handleIntensityChange}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {Object.entries(INTENSITY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 🎯 Affichage des erreurs */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          ))}
        </div>
      )}

      {/* 🎯 Résultat du calcul */}
      {result && errors.length === 0 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="space-y-4">
            {/* Résultat principal */}
            <div className="text-center">
              <div className={`text-3xl font-bold ${getCalorieColor(result.caloriesPerHour)}`}>
                {result.calories} kcal
              </div>
              <div className="text-sm text-muted-foreground">
                {getIntensityMessage(result.caloriesPerHour)}
              </div>
            </div>

            {/* Détails */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Par heure:</span>
                <div className="font-medium">{result.caloriesPerHour} kcal/h</div>
              </div>
              <div>
                <span className="text-muted-foreground">Hydratation:</span>
                <div className="font-medium">{result.waterNeeded} ml</div>
              </div>
              {result.carbsNeeded > 0 && (
                <>
                  <div>
                    <span className="text-muted-foreground">Glucides:</span>
                    <div className="font-medium">{result.carbsNeeded} g</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Durée:</span>
                    <div className="font-medium">{formatDuration(duration)}</div>
                  </div>
                </>
              )}
            </div>

            {/* Recommandations */}
            {result.recommendedIntake.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Recommandations:</h4>
                {result.recommendedIntake.map((rec, index) => (
                  <div key={index} className="text-xs p-2 bg-white border rounded">
                    <div className="font-medium text-foreground">
                      {rec.time}: <span className="text-blue-600">{rec.amount}</span>
                    </div>
                    <div className="text-muted-foreground mt-1">{rec.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message par défaut si pas de calcul */}
      {!result && errors.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <div className="text-4xl mb-2">⚡</div>
          <p className="text-sm">Ajustez les paramètres pour calculer vos besoins</p>
        </div>
      )}
    </div>
  )
}

// 🛠️ EXEMPLES DE STRUCTURE POUR T'AIDER :

// État du composant :
// const [weight, setWeight] = useState<number>(currentWeight)
// const [duration, setDuration] = useState<number>(60)
// const [activity, setActivity] = useState<string>('running-moderate')
// const [intensity, setIntensity] = useState<IntensityLevel>('MODERATE')
// const [result, setResult] = useState<CalorieResult | null>(null)
// const [errors, setErrors] = useState<string[]>([])

// useEffect pour recalculer :
// useEffect(() => {
//   const validation = validateCalculatorInput(weight, duration, activity)
//
//   if (validation.isValid) {
//     try {
//       const calculatedResult = calculateCalories(weight, activity, duration, intensity)
//       setResult(calculatedResult)
//       setErrors([])
//       onCaloriesCalculated(calculatedResult)
//     } catch (error) {
//       setErrors(['Erreur de calcul'])
//       setResult(null)
//     }
//   } else {
//     setErrors(validation.errors.map(e => e.message))
//     setResult(null)
//   }
// }, [weight, duration, activity, intensity, onCaloriesCalculated])

// Input exemple :
// <input
//   type="number"
//   value={weight}
//   onChange={(e) => setWeight(Number(e.target.value))}
//   className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
//   min="1"
//   max="200"
// />

// Select exemple :
// <select
//   value={activity}
//   onChange={(e) => setActivity(e.target.value)}
//   className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
// >
//   {mockActivities.map((act) => (
//     <option key={act.id} value={act.id}>
//       {act.name}
//     </option>
//   ))}
// </select>

/*
🎯 CSS CLASSES SUGGÉRÉES :

Input normal:
  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"

Input avec erreur:
  className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"

Message d'erreur:
  className="text-sm text-red-600 mt-1"

Résultat:
  className="p-4 bg-green-50 border border-green-200 rounded-lg"
*/
