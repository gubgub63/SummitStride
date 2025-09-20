/**
 * Données mockées pour la nutrition
 * Phase 4.7 - Données et formules pour développement
 */

import {
  Activity,
  CalorieResult,
  IntakeRecommendation,
  FoodItem,
  NutritionProfile,
  IntensityLevel,
  INTENSITY_MET_MULTIPLIER
} from '../../types/nutrition'

// Activités disponibles avec leurs MET (Metabolic Equivalent of Task)
export const mockActivities: Activity[] = [
  {
    id: 'running-easy',
    name: 'Course facile (8-10 km/h)',
    met: 8.0,
    category: 'RUNNING',
    description: 'Course d\'endurance, rythme conversationnel'
  },
  {
    id: 'running-moderate',
    name: 'Course modérée (10-12 km/h)',
    met: 10.0,
    category: 'RUNNING',
    description: 'Allure soutenue, effort modéré'
  },
  {
    id: 'running-fast',
    name: 'Course rapide (12-14 km/h)',
    met: 12.0,
    category: 'RUNNING',
    description: 'Allure rapide, effort intense'
  },
  {
    id: 'trail-hiking',
    name: 'Randonnée trail',
    met: 6.0,
    category: 'HIKING',
    description: 'Marche rapide en terrain varié'
  },
  {
    id: 'mountain-hiking',
    name: 'Randonnée montagne',
    met: 7.5,
    category: 'HIKING',
    description: 'Randonnée avec dénivelé important'
  },
  {
    id: 'cycling-leisure',
    name: 'Vélo loisir (15-20 km/h)',
    met: 6.8,
    category: 'CYCLING',
    description: 'Cyclisme de loisir, terrain plat'
  },
  {
    id: 'swimming-moderate',
    name: 'Natation modérée',
    met: 8.3,
    category: 'SWIMMING',
    description: 'Nage libre, rythme modéré'
  }
]

// Profil nutrition par défaut
export const mockNutritionProfile: NutritionProfile = {
  id: 'profile-1',
  userId: 'user-1',
  weight: 70,
  height: 175,
  age: 35,
  activityLevel: 'ACTIVE',
  dietaryRestrictions: [],
  waterIntakeGoal: 2500, // ml/day
  calorieGoal: 2400, // kcal/day
  macroGoals: {
    carbs: 55, // %
    proteins: 20, // %
    fats: 25 // %
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

// Aliments de base pour ultra-trail
export const mockFoods: FoodItem[] = [
  {
    id: 'banana',
    name: 'Banane',
    category: 'FRUITS',
    caloriesPer100g: 89,
    macros: { carbs: 22.8, proteins: 1.1, fats: 0.3 },
    micronutrients: { sodium: 1, potassium: 358, calcium: 5, iron: 0.3 }
  },
  {
    id: 'energy-gel',
    name: 'Gel énergétique',
    category: 'SPORTS_FOOD',
    caloriesPer100g: 300,
    macros: { carbs: 75, proteins: 0, fats: 0 },
    micronutrients: { sodium: 200, potassium: 50, calcium: 0, iron: 0 }
  },
  {
    id: 'sports-drink',
    name: 'Boisson isotonique',
    category: 'BEVERAGES',
    caloriesPer100g: 25,
    macros: { carbs: 6, proteins: 0, fats: 0 },
    micronutrients: { sodium: 100, potassium: 30, calcium: 0, iron: 0 }
  },
  {
    id: 'dates',
    name: 'Dattes',
    category: 'FRUITS',
    caloriesPer100g: 277,
    macros: { carbs: 75, proteins: 1.8, fats: 0.2 },
    micronutrients: { sodium: 1, potassium: 696, calcium: 64, iron: 0.9 }
  }
]

// Statistiques pour le dashboard
export const mockNutritionStats = {
  dailyCaloriesConsumed: 1850,
  dailyCalorieGoal: 2400,
  waterConsumed: 1800, // ml
  waterGoal: 2500, // ml
  macrosConsumed: {
    carbs: 45, // %
    proteins: 25, // %
    fats: 30 // %
  },
  weeklyAverage: {
    calories: 2150,
    water: 2200,
    workoutCalories: 450
  }
}

/**
 * 🎯 FORMULE PRINCIPALE pour ton composant CalorieCalculator
 *
 * Calcule les calories brûlées selon la formule MET
 * Calories = MET × Poids (kg) × Durée (heures)
 */
export function calculateCalories(
  weight: number,
  activityId: string,
  duration: number, // minutes
  intensity: IntensityLevel = 'MODERATE'
): CalorieResult {
  // Trouve l'activité
  const activity = mockActivities.find(a => a.id === activityId)
  if (!activity) {
    throw new Error('Activité non trouvée')
  }

  // Applique le multiplicateur d'intensité
  const intensityMultiplier = INTENSITY_MET_MULTIPLIER[intensity]
  const adjustedMET = activity.met * intensityMultiplier

  // Calcul principal
  const durationHours = duration / 60
  const totalCalories = Math.round(adjustedMET * weight * durationHours)
  const caloriesPerHour = Math.round(totalCalories / durationHours)

  // Calculs pour ultra-trail (hydratation et glucides)
  const waterNeeded = Math.round(duration * 10) // 10ml par minute d'effort
  const carbsNeeded = duration > 60 ? Math.round(duration * 0.8) : 0 // 0.8g/min après 1h

  // Recommandations d'apport
  const recommendations: IntakeRecommendation[] = []

  // Hydratation
  if (duration > 30) {
    const waterInterval = duration > 90 ? 15 : 20
    recommendations.push({
      time: `Toutes les ${waterInterval}min`,
      type: 'WATER',
      amount: `${Math.round(waterNeeded / (duration / waterInterval))}ml`,
      description: 'Hydratation régulière pour maintenir les performances'
    })
  }

  // Glucides pour efforts longs
  if (duration > 60) {
    recommendations.push({
      time: 'Toutes les 30-45min',
      type: 'CARBS',
      amount: `${Math.round(carbsNeeded / (duration / 35))}g`,
      description: 'Apport de glucides pour maintenir la glycémie'
    })
  }

  // Électrolytes pour efforts très longs
  if (duration > 90) {
    recommendations.push({
      time: 'Toutes les 60min',
      type: 'ELECTROLYTES',
      amount: '200-300mg sodium',
      description: 'Compensation des pertes en électrolytes'
    })
  }

  return {
    calories: totalCalories,
    caloriesPerHour,
    waterNeeded,
    carbsNeeded,
    recommendedIntake: recommendations
  }
}

/**
 * Valide les données du calculateur
 */
export function validateCalculatorInput(weight: number, duration: number, activityId: string) {
  const errors = []

  if (!weight || weight <= 0 || weight > 200) {
    errors.push({ field: 'weight', message: 'Le poids doit être entre 1 et 200 kg' })
  }

  if (!duration || duration <= 0 || duration > 720) {
    errors.push({ field: 'duration', message: 'La durée doit être entre 1 et 720 minutes (12h)' })
  }

  if (!activityId || !mockActivities.find(a => a.id === activityId)) {
    errors.push({ field: 'activity', message: 'Veuillez sélectionner une activité valide' })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Formatte la durée en heures et minutes
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours}h`
  }

  return `${hours}h${remainingMinutes.toString().padStart(2, '0')}`
}

/**
 * Obtient une couleur selon le niveau de calories
 */
export function getCalorieColor(caloriesPerHour: number): string {
  if (caloriesPerHour < 300) return 'text-blue-600' // Léger
  if (caloriesPerHour < 500) return 'text-green-600' // Modéré
  if (caloriesPerHour < 700) return 'text-orange-600' // Intense
  return 'text-red-600' // Très intense
}

/**
 * Obtient un message selon l'intensité
 */
export function getIntensityMessage(caloriesPerHour: number): string {
  if (caloriesPerHour < 300) return 'Effort léger - Récupération active'
  if (caloriesPerHour < 500) return 'Effort modéré - Endurance fondamentale'
  if (caloriesPerHour < 700) return 'Effort intense - Travail au seuil'
  return 'Effort très intense - Fractionné/Competition'
}