export interface NutritionPlan {
  id: string
  userId: string
  name: string
  description?: string
  dailyCalorieTarget: number
  macroTargets: MacroTargets
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface MacroTargets {
  protein: number // percentage
  carbs: number // percentage
  fat: number // percentage
}

export interface FoodItem {
  id: string
  name: string
  brand?: string
  caloriesPer100g: number
  macrosPer100g: Macros
  category: FoodCategory
}

export interface Macros {
  protein: number // grams
  carbs: number // grams
  fat: number // grams
  fiber?: number // grams
  sugar?: number // grams
}

export enum FoodCategory {
  FRUITS = 'FRUITS',
  VEGETABLES = 'VEGETABLES',
  GRAINS = 'GRAINS',
  PROTEINS = 'PROTEINS',
  DAIRY = 'DAIRY',
  FATS = 'FATS',
  SPORTS_NUTRITION = 'SPORTS_NUTRITION',
  BEVERAGES = 'BEVERAGES',
  SNACKS = 'SNACKS',
}

export interface NutritionEntry {
  id: string
  userId: string
  date: Date
  mealType: MealType
  foodItemId: string
  quantity: number // in grams
  calories: number
  macros: Macros
  createdAt: Date
}

export enum MealType {
  BREAKFAST = 'BREAKFAST',
  LUNCH = 'LUNCH',
  DINNER = 'DINNER',
  SNACK = 'SNACK',
  PRE_WORKOUT = 'PRE_WORKOUT',
  POST_WORKOUT = 'POST_WORKOUT',
  DURING_RACE = 'DURING_RACE',
}
