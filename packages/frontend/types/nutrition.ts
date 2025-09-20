/**
 * Types TypeScript pour le système de nutrition
 * Phase 4.7 - Nutrition et Suivi
 */

export interface NutritionProfile {
  id: string
  userId: string
  weight: number // kg
  height: number // cm
  age: number
  activityLevel: ActivityLevel
  dietaryRestrictions: string[]
  waterIntakeGoal: number // ml/day
  calorieGoal: number // kcal/day
  macroGoals: MacroGoals
  createdAt: string
  updatedAt: string
}

export interface MacroGoals {
  carbs: number // %
  proteins: number // %
  fats: number // %
}

export type ActivityLevel =
  | 'SEDENTARY'     // Sédentaire
  | 'LIGHT'         // Légère activité
  | 'MODERATE'      // Activité modérée
  | 'ACTIVE'        // Actif
  | 'VERY_ACTIVE'   // Très actif

export interface CalorieCalculatorProps {
  currentWeight?: number
  currentAge?: number
  onCaloriesCalculated: (result: CalorieResult) => void
  className?: string
}

export interface CalorieResult {
  calories: number
  caloriesPerHour: number
  waterNeeded: number // ml
  carbsNeeded: number // g
  recommendedIntake: IntakeRecommendation[]
}

export interface IntakeRecommendation {
  time: string // "Toutes les 20min"
  type: 'WATER' | 'CARBS' | 'ELECTROLYTES'
  amount: string // "150ml" ou "15g"
  description: string
}

export interface Activity {
  id: string
  name: string
  met: number // Metabolic Equivalent of Task
  category: ActivityCategory
  description: string
}

export type ActivityCategory =
  | 'RUNNING'        // Course à pied
  | 'HIKING'         // Randonnée
  | 'CYCLING'        // Vélo
  | 'SWIMMING'       // Natation
  | 'STRENGTH'       // Musculation
  | 'OTHER'          // Autre

export interface FoodItem {
  id: string
  name: string
  category: FoodCategory
  caloriesPer100g: number
  macros: {
    carbs: number // g per 100g
    proteins: number // g per 100g
    fats: number // g per 100g
  }
  micronutrients: {
    sodium: number // mg per 100g
    potassium: number // mg per 100g
    calcium: number // mg per 100g
    iron: number // mg per 100g
  }
}

export type FoodCategory =
  | 'FRUITS'         // Fruits
  | 'VEGETABLES'     // Légumes
  | 'CEREALS'        // Céréales
  | 'PROTEINS'       // Protéines
  | 'DAIRY'          // Produits laitiers
  | 'SPORTS_FOOD'    // Alimentation sportive
  | 'BEVERAGES'      // Boissons

export interface MealPlan {
  id: string
  name: string
  userId: string
  targetDate: string
  meals: Meal[]
  totalCalories: number
  totalMacros: MacroGoals
  createdAt: string
}

export interface Meal {
  id: string
  name: string
  type: MealType
  time: string
  foods: FoodPortion[]
  totalCalories: number
}

export type MealType =
  | 'BREAKFAST'      // Petit-déjeuner
  | 'LUNCH'          // Déjeuner
  | 'DINNER'         // Dîner
  | 'SNACK'          // Collation
  | 'PRE_WORKOUT'    // Avant effort
  | 'DURING_WORKOUT' // Pendant effort
  | 'POST_WORKOUT'   // Après effort

export interface FoodPortion {
  foodId: string
  quantity: number // g
  calories: number
}

// Types utilitaires pour les composants UI
export interface NutritionDashboardProps {
  className?: string
}

export interface CalorieCalculatorState {
  weight: number
  duration: number
  activity: string
  intensity: IntensityLevel
  isValid: boolean
  errors: ValidationError[]
}

export type IntensityLevel =
  | 'VERY_LIGHT'     // Très léger
  | 'LIGHT'          // Léger
  | 'MODERATE'       // Modéré
  | 'VIGOROUS'       // Intense
  | 'VERY_VIGOROUS'  // Très intense

export interface ValidationError {
  field: string
  message: string
}

// Constantes et utilitaires
export const ACTIVITY_LABELS: Record<ActivityCategory, string> = {
  'RUNNING': 'Course à pied',
  'HIKING': 'Randonnée',
  'CYCLING': 'Vélo',
  'SWIMMING': 'Natation',
  'STRENGTH': 'Musculation',
  'OTHER': 'Autre'
}

export const INTENSITY_LABELS: Record<IntensityLevel, string> = {
  'VERY_LIGHT': 'Très léger',
  'LIGHT': 'Léger',
  'MODERATE': 'Modéré',
  'VIGOROUS': 'Intense',
  'VERY_VIGOROUS': 'Très intense'
}

export const INTENSITY_MET_MULTIPLIER: Record<IntensityLevel, number> = {
  'VERY_LIGHT': 0.8,
  'LIGHT': 1.0,
  'MODERATE': 1.2,
  'VIGOROUS': 1.5,
  'VERY_VIGOROUS': 1.8
}

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  'BREAKFAST': 'Petit-déjeuner',
  'LUNCH': 'Déjeuner',
  'DINNER': 'Dîner',
  'SNACK': 'Collation',
  'PRE_WORKOUT': 'Avant effort',
  'DURING_WORKOUT': 'Pendant effort',
  'POST_WORKOUT': 'Après effort'
}

export const FOOD_CATEGORY_LABELS: Record<FoodCategory, string> = {
  'FRUITS': 'Fruits',
  'VEGETABLES': 'Légumes',
  'CEREALS': 'Céréales',
  'PROTEINS': 'Protéines',
  'DAIRY': 'Produits laitiers',
  'SPORTS_FOOD': 'Alimentation sportive',
  'BEVERAGES': 'Boissons'
}