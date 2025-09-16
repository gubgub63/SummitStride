import { z } from 'zod'

export const FoodCategorySchema = z.enum([
  'FRUITS',
  'VEGETABLES',
  'GRAINS',
  'PROTEINS',
  'DAIRY',
  'FATS',
  'SPORTS_NUTRITION',
  'BEVERAGES',
  'SNACKS',
])
export const MealTypeSchema = z.enum([
  'BREAKFAST',
  'LUNCH',
  'DINNER',
  'SNACK',
  'PRE_WORKOUT',
  'POST_WORKOUT',
  'DURING_RACE',
])

export const MacrosSchema = z.object({
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fat: z.number().min(0),
  fiber: z.number().min(0).optional(),
  sugar: z.number().min(0).optional(),
})

export const MacroTargetsSchema = z
  .object({
    protein: z.number().min(0).max(100),
    carbs: z.number().min(0).max(100),
    fat: z.number().min(0).max(100),
  })
  .refine(data => data.protein + data.carbs + data.fat === 100, {
    message: 'Macro percentages must sum to 100',
  })

export const FoodItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  brand: z.string().max(100).optional(),
  caloriesPer100g: z.number().positive(),
  macrosPer100g: MacrosSchema,
  category: FoodCategorySchema,
})

export const NutritionPlanSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  dailyCalorieTarget: z.number().positive(),
  macroTargets: MacroTargetsSchema,
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const NutritionEntrySchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  date: z.date(),
  mealType: MealTypeSchema,
  foodItemId: z.string().uuid(),
  quantity: z.number().positive(),
  calories: z.number().min(0),
  macros: MacrosSchema,
  createdAt: z.date(),
})

export const CreateNutritionPlanSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  dailyCalorieTarget: z.number().positive(),
  macroTargets: MacroTargetsSchema,
})

export type CreateNutritionPlanInput = z.infer<typeof CreateNutritionPlanSchema>
