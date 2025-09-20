/**
 * NutritionDashboard - Page principale de nutrition
 * Phase 4.7 - Nutrition et Suivi
 */

'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { CalorieCalculator } from './CalorieCalculator'
import {
  mockNutritionProfile,
  mockNutritionStats,
  mockFoods,
} from '../../lib/data/mockNutritionData'
import type { CalorieResult } from '../../types/nutrition'
import { FOOD_CATEGORY_LABELS } from '../../types/nutrition'
import { useAuth } from '../../lib/contexts/AuthContext'

export function NutritionDashboard() {
  const [calculatedCalories, setCalculatedCalories] = useState<CalorieResult | null>(null)
  const { profile } = useAuth()
  const handleCaloriesCalculated = (result: CalorieResult) => {
    setCalculatedCalories(result)
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Nutrition et Hydratation</h1>
        <p className="text-muted-foreground">
          Gérez votre alimentation et calculez vos besoins nutritionnels pour vos entraînements
          ultra-trail
        </p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calories aujourd'hui</CardTitle>
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockNutritionStats.dailyCaloriesConsumed}</div>
            <p className="text-xs text-muted-foreground">
              Objectif: {mockNutritionStats.dailyCalorieGoal} kcal
            </p>
            <div className="mt-2 w-full bg-muted rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${Math.min(100, (mockNutritionStats.dailyCaloriesConsumed / mockNutritionStats.dailyCalorieGoal) * 100)}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hydratation</CardTitle>
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3V1m0 0L5.5 2.5M7 1l1.5 1.5"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(mockNutritionStats.waterConsumed / 1000).toFixed(1)}L
            </div>
            <p className="text-xs text-muted-foreground">
              Objectif: {(mockNutritionStats.waterGoal / 1000).toFixed(1)}L
            </p>
            <div className="mt-2 w-full bg-muted rounded-full h-2">
              <div
                className="bg-cyan-600 h-2 rounded-full"
                style={{
                  width: `${Math.min(100, (mockNutritionStats.waterConsumed / mockNutritionStats.waterGoal) * 100)}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Poids actuel</CardTitle>
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ profile?.weight } kg</div>
            <p className="text-xs text-muted-foreground">Âge: { profile?.age } ans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calories semaine</CardTitle>
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockNutritionStats.weeklyAverage.calories}</div>
            <p className="text-xs text-muted-foreground">Moyenne quotidienne</p>
          </CardContent>
        </Card>
      </div>

      {/* Calculateur de calories - TON COMPOSANT */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Calculateur de Besoins Caloriques</CardTitle>
            </CardHeader>
            <CardContent>
              <CalorieCalculator
                currentWeight={mockNutritionProfile.weight}
                currentAge={mockNutritionProfile.age}
                onCaloriesCalculated={handleCaloriesCalculated}
              />
            </CardContent>
          </Card>
        </div>

        {/* Résultat du calcul */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Résultat du Calcul</CardTitle>
            </CardHeader>
            <CardContent>
              {calculatedCalories ? (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-primary-50 rounded-lg">
                    <div className="text-3xl font-bold text-primary-600">
                      {calculatedCalories.calories}
                    </div>
                    <div className="text-sm text-muted-foreground">Calories totales</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Par heure:</span>
                      <span className="font-medium">
                        {calculatedCalories.caloriesPerHour} kcal/h
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Hydratation:</span>
                      <span className="font-medium">{calculatedCalories.waterNeeded} ml</span>
                    </div>
                    {calculatedCalories.carbsNeeded > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Glucides:</span>
                        <span className="font-medium">{calculatedCalories.carbsNeeded} g</span>
                      </div>
                    )}
                  </div>

                  {calculatedCalories.recommendedIntake.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Recommandations:</h4>
                      {calculatedCalories.recommendedIntake.map((rec, index) => (
                        <div key={index} className="text-xs p-2 bg-accent/30 rounded">
                          <div className="font-medium">
                            {rec.time}: {rec.amount}
                          </div>
                          <div className="text-muted-foreground">{rec.description}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-4xl mb-2">🧮</div>
                  <p className="text-sm">
                    Utilisez le calculateur pour voir vos besoins nutritionnels
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Macronutriments d'aujourd'hui */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Répartition des Macronutriments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {mockNutritionStats.macrosConsumed.carbs}%
              </div>
              <div className="text-sm text-muted-foreground">Glucides</div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${mockNutritionStats.macrosConsumed.carbs}%` }}
                />
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {mockNutritionStats.macrosConsumed.proteins}%
              </div>
              <div className="text-sm text-muted-foreground">Protéines</div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${mockNutritionStats.macrosConsumed.proteins}%` }}
                />
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {mockNutritionStats.macrosConsumed.fats}%
              </div>
              <div className="text-sm text-muted-foreground">Lipides</div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div
                  className="bg-orange-600 h-2 rounded-full"
                  style={{ width: `${mockNutritionStats.macrosConsumed.fats}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aliments recommandés */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aliments Recommandés Ultra-Trail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {mockFoods.map(food => (
              <div key={food.id} className="p-3 border border-border rounded-lg">
                <div className="font-medium text-sm">{food.name}</div>
                <div className="text-xs text-muted-foreground mb-2">
                  {FOOD_CATEGORY_LABELS[food.category]}
                </div>
                <div className="text-xs">
                  <div className="flex justify-between">
                    <span>Calories:</span>
                    <span className="font-medium">{food.caloriesPer100g}/100g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Glucides:</span>
                    <span className="font-medium">{food.macros.carbs}g</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Partenaire Nutrition */}
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/20">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <div>
              <CardTitle className="text-lg">Partenaire Flavora</CardTitle>
              <p className="text-sm text-muted-foreground">Application IA de nutrition personnalisée</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p className="text-sm text-foreground">
              <strong>Flavora</strong> utilise l'intelligence artificielle pour créer des plans alimentaires personnalisés parfaitement adaptés aux besoins des ultra-traileurs.
            </p>

            <div className="grid gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>Recettes IA adaptées à vos macronutriments sportifs</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>Optimisation des repas avec vos ingrédients existants</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>Scanner code-barres et suivi nutritionnel précis</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>Planification automatique des repas et listes de courses</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button className="flex-1" asChild>
              <a href="https://flavora.fr/" target="_blank" rel="noopener noreferrer">
                Découvrir Flavora
              </a>
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <a href="https://apps.apple.com/fr/app/flavora/id6742901179" target="_blank" rel="noopener noreferrer">
                App Store
              </a>
            </Button>
          </div>

          <div className="text-xs text-muted-foreground bg-white/50 dark:bg-gray-800/50 p-2 rounded">
            <strong>Spécial ultra-trail :</strong> Flavora adapte automatiquement vos besoins nutritionnels selon vos calculs caloriques Coach IA Hugo pour optimiser vos performances d'endurance.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
