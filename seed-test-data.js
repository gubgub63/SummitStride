#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import bcrypt from 'bcryptjs'
import {
  PrismaClient,
  CourseDifficulty,
  ExperienceLevel,
  Units,
  RaceRegistrationStatus,
  TrainingPlanStatus,
  TrainingType,
  Intensity,
  MealType,
  PlanPhase,
  FoodCategory,
} from '@prisma/client'

function loadEnvFile(relativePath) {
  const envPath = path.resolve(process.cwd(), relativePath)
  if (!fs.existsSync(envPath)) {
    return
  }

  const content = fs.readFileSync(envPath, 'utf-8')
  content.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      return
    }
    const equalsIndex = trimmed.indexOf('=')
    if (equalsIndex === -1) {
      return
    }
    const key = trimmed.slice(0, equalsIndex).trim()
    let value = trimmed.slice(equalsIndex + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith('\'') && value.endsWith('\''))) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) {
      process.env[key] = value
    }
  })
}

// Load environment variables from root and backend .env files if present
loadEnvFile('.env')
loadEnvFile('packages/backend/.env')

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set. Please export it or configure .env files before running the seed script.')
  process.exit(1)
}

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding SummitStride development data...')

  const password = 'summit123'
  const hashedPassword = await bcrypt.hash(password, 12)

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@summitstride.dev' },
    update: {
      name: 'Demo Runner',
    },
    create: {
      id: 'user-demo-runner',
      email: 'demo@summitstride.dev',
      name: 'Demo Runner',
      password: hashedPassword,
    },
  })

  console.log('✅ User ready:', demoUser.email)

  await prisma.userProfile.upsert({
    where: { userId: demoUser.id },
    update: {
      weight: 70,
      height: 178,
      experienceLevel: ExperienceLevel.INTERMEDIATE,
      fitnessGoals: ['Ultra endurance', 'Nutrition optimisation'],
      medicalConditions: ['Asthme léger'],
      preferredTrainingDays: [1, 3, 5, 6],
      maxTrainingHoursPerWeek: 12,
      vma: 17.5,
    },
    create: {
      id: 'profile-demo-runner',
      userId: demoUser.id,
      dateOfBirth: new Date('1990-05-12'),
      weight: 70,
      height: 178,
      experienceLevel: ExperienceLevel.INTERMEDIATE,
      fitnessGoals: ['Ultra endurance', 'Nutrition optimisation'],
      medicalConditions: ['Asthme léger'],
      preferredTrainingDays: [1, 3, 5, 6],
      maxTrainingHoursPerWeek: 12,
      vma: 17.5,
    },
  })

  await prisma.userPreferences.upsert({
    where: { userId: demoUser.id },
    update: {
      language: 'fr',
      timezone: 'Europe/Paris',
      units: Units.METRIC,
      notificationTrainingReminders: true,
      notificationNutritionReminders: true,
    },
    create: {
      id: 'prefs-demo-runner',
      userId: demoUser.id,
      language: 'fr',
      timezone: 'Europe/Paris',
      units: Units.METRIC,
      notificationTrainingReminders: true,
      notificationNutritionReminders: true,
    },
  })

  const courses = [
    {
      id: 'course-utmb-2025',
      name: 'UTMB 100M - Chamonix',
      location: 'Chamonix, France',
      distance: 171,
      elevationGain: 10042,
      elevationLoss: 10042,
      difficulty: CourseDifficulty.EXTREME,
      description:
        "Course emblématique autour du massif du Mont-Blanc. Une expérience ultime pour les ultra-traileurs expérimentés.",
    },
    {
      id: 'course-verbier-76',
      name: 'Verbier Saint-Bernard X-Alpine',
      location: 'Verbier, Suisse',
      distance: 76,
      elevationGain: 5700,
      elevationLoss: 5700,
      difficulty: CourseDifficulty.HARD,
      description:
        "Parcours technique et engagé dans les montagnes suisses avec passages aériens et panoramas alpins.",
    },
    {
      id: 'course-ecotrail-paris',
      name: 'EcoTrail Paris 80 km',
      location: 'Paris, France',
      distance: 80,
      elevationGain: 1500,
      elevationLoss: 1500,
      difficulty: CourseDifficulty.MODERATE,
      description:
        "Trail urbain et forestier autour de Paris, mélangeant sentiers en forêt et passages urbains iconiques.",
    },
    {
      id: 'course-fkts-occi',
      name: 'GR20 Nord - FKT',
      location: 'Corse, France',
      distance: 90,
      elevationGain: 6800,
      elevationLoss: 6400,
      difficulty: CourseDifficulty.EXTREME,
      description:
        "Traversée nord du GR20 corse, réputée pour son terrain technique, ses pierriers et ses crêtes spectaculaires.",
    },
    {
      id: 'course-beaujolais-35',
      name: 'Trail des Crêtes du Beaujolais 35 km',
      location: 'Villefranche-sur-Saône, France',
      distance: 35,
      elevationGain: 1500,
      elevationLoss: 1500,
      difficulty: CourseDifficulty.MODERATE,
      description:
        "Trail vallonné au coeur des vignes du Beaujolais, idéal pour préparer un premier ultra-trail.",
    },
  ]

  for (const course of courses) {
    await prisma.course.upsert({
      where: { id: course.id },
      update: course,
      create: course,
    })
  }

  console.log(`✅ Seeded ${courses.length} courses`)

  const template = await prisma.trainingPlanTemplate.upsert({
    where: { id: 'template-ultra-12-weeks' },
    update: {
      description: "Plan de 12 semaines pour préparer un ultra de montagne exigeant",
    },
    create: {
      id: 'template-ultra-12-weeks',
      name: 'Ultra Montagne 12 semaines',
      description: "Plan structuré BASE → BUILD → PEAK → TAPER pour ultra trail",
      targetCategory: 'ULTRA',
      targetExperience: ExperienceLevel.INTERMEDIATE,
      durationWeeks: 12,
    },
  })

  await prisma.trainingSessionTemplate.deleteMany({ where: { planTemplateId: template.id } })

  const sessionTemplates = [
    {
      id: 'tst-base-longrun',
      planTemplateId: template.id,
      phase: PlanPhase.BASE,
      weekOffset: 1,
      dayOfWeek: 6,
      type: TrainingType.ENDURANCE,
      intensity: Intensity.LOW,
      duration: 180,
      distance: 28,
      description: 'Sortie longue en terrain vallonné, focus endurance fondamentale',
      focusAreas: ['Endurance', 'Gestion effort'],
    },
    {
      id: 'tst-build-hillrepeats',
      planTemplateId: template.id,
      phase: PlanPhase.BUILD,
      weekOffset: 6,
      dayOfWeek: 3,
      type: TrainingType.INTERVAL,
      intensity: Intensity.HIGH,
      duration: 90,
      distance: 12,
      description: 'Séance de côtes 8x4min avec récup 3min, travail puissance ascensionnelle',
      focusAreas: ['Puissance', 'Technique montée'],
    },
    {
      id: 'tst-peak-back2back',
      planTemplateId: template.id,
      phase: PlanPhase.PEAK,
      weekOffset: 10,
      dayOfWeek: 6,
      type: TrainingType.ENDURANCE,
      intensity: Intensity.MODERATE,
      duration: 240,
      distance: 40,
      description: 'Back-to-back long run avec 1500m D+, gestion alimentation en effort',
      focusAreas: ['Nutrition', 'Gestion fatigue'],
    },
  ]

  for (const tmpl of sessionTemplates) {
    await prisma.trainingSessionTemplate.create({ data: tmpl })
  }

  const registration = await prisma.raceRegistration.upsert({
    where: {
      userId_courseId: {
        userId: demoUser.id,
        courseId: 'course-utmb-2025',
      },
    },
    update: {
      status: RaceRegistrationStatus.PREPARATION,
      goal: 'Boucler en moins de 42 heures',
      notes: 'Focus sur gestion sommeil et alimentation',
      targetDate: new Date('2025-08-29'),
    },
    create: {
      id: 'registration-demo-utmb',
      userId: demoUser.id,
      courseId: 'course-utmb-2025',
      status: RaceRegistrationStatus.PREPARATION,
      goal: 'Boucler en moins de 42 heures',
      notes: 'Focus sur gestion sommeil et alimentation',
      targetDate: new Date('2025-08-29'),
    },
  })

  await prisma.trainingPlan.deleteMany({ where: { id: 'plan-demo-ultra' } })

  const trainingPlan = await prisma.trainingPlan.create({
    data: {
      id: 'plan-demo-ultra',
      userId: demoUser.id,
      name: 'Prépa UTMB 2025',
      description: 'Plan personnalisé basé sur le template Ultra Montagne',
      startDate: new Date('2025-05-05'),
      endDate: new Date('2025-08-25'),
      targetRaceId: registration.courseId,
      status: TrainingPlanStatus.ACTIVE,
      sourceTemplateId: template.id,
      totalDuration: 5400,
      totalDistance: 720,
      loadScore: 860,
      progression: {
        weeklyLoad: [480, 520, 560, 600, 480, 640, 680, 720, 760, 620, 580, 520],
      },
      lastAnalyzedAt: new Date(),
    },
  })

  await prisma.trainingSession.deleteMany({ where: { planId: trainingPlan.id } })
  await prisma.trainingSession.deleteMany({
    where: {
      id: { in: ['session-demo-1', 'session-demo-2', 'session-demo-3'] },
    },
  })

  const trainingSessions = [
    {
      id: 'session-demo-1',
      planId: trainingPlan.id,
      userId: demoUser.id,
      date: new Date('2025-05-10'),
      type: TrainingType.ENDURANCE,
      name: 'Sortie endurance vallonnée',
      description: 'Circuit forêt de 24 km, travail endurance fondamentale',
      duration: 180,
      distance: 24,
      intensity: Intensity.LOW,
      completed: true,
      templateSessionId: 'tst-base-longrun',
      phase: PlanPhase.BASE,
      weekNumber: 1,
      dayOfWeek: 6,
      plannedLoad: 140,
      actualDuration: 185,
      actualDistance: 24.6,
      averageHeartRate: 138,
      maxHeartRate: 162,
      calories: 2100,
      elevationGain: 850,
      nutritionPlan: {
        strategy: 'GELS',
        carbsPerHour: { min: 55, max: 65 },
        totalCarbs: 165,
        gels: [
          { timeOffsetMin: 30, carbsGr: 25 },
          { timeOffsetMin: 60, carbsGr: 25 },
          { timeOffsetMin: 90, carbsGr: 25 },
          { timeOffsetMin: 120, carbsGr: 25 },
          {
            timeOffsetMin: 150,
            carbsGr: 25,
            caffeinated: true,
            note: 'Gel caféiné pour le final',
          },
        ],
        notes: [
          'Sortie longue : viser 55-65 g/h et boire 150 ml avec chaque gel.',
          'Caféine uniquement en fin de séance.',
        ],
      },
    },
    {
      id: 'session-demo-2',
      planId: trainingPlan.id,
      userId: demoUser.id,
      date: new Date('2025-06-18'),
      type: TrainingType.INTERVAL,
      name: 'Séance de côtes 8x4min',
      description: 'Montées 8x4min RPE 8, récupération 3min descente active',
      duration: 95,
      distance: 12,
      intensity: Intensity.HIGH,
      completed: true,
      templateSessionId: 'tst-build-hillrepeats',
      phase: PlanPhase.BUILD,
      weekNumber: 7,
      dayOfWeek: 3,
      plannedLoad: 120,
      actualDuration: 98,
      actualDistance: 11.6,
      averageHeartRate: 152,
      maxHeartRate: 178,
      calories: 980,
      elevationGain: 750,
      nutritionPlan: {
        strategy: 'GELS',
        carbsPerHour: { min: 60, max: 70 },
        totalCarbs: 105,
        gels: [
          { timeOffsetMin: 30, carbsGr: 25 },
          { timeOffsetMin: 60, carbsGr: 25 },
          {
            timeOffsetMin: 80,
            carbsGr: 25,
            caffeinated: true,
            note: 'Gel caféiné pour soutenir la fin d\'intervalle',
          },
        ],
        notes: [
          'Séance intense : viser la fourchette haute (60-70 g/h).',
          'Hydratation : 150 ml toutes les 15-20 min.',
        ],
      },
    },
    {
      id: 'session-demo-3',
      planId: trainingPlan.id,
      userId: demoUser.id,
      date: new Date('2025-07-27'),
      type: TrainingType.ENDURANCE,
      name: 'Back-to-back long run',
      description: 'Sortie longue 40 km avec 1500 D+ en montagne',
      duration: 240,
      distance: 39.5,
      intensity: Intensity.MODERATE,
      completed: false,
      templateSessionId: 'tst-peak-back2back',
      phase: PlanPhase.PEAK,
      weekNumber: 11,
      dayOfWeek: 6,
      plannedLoad: 180,
      nutritionPlan: {
        strategy: 'GELS',
        carbsPerHour: { min: 60, max: 75 },
        totalCarbs: 260,
        gels: [
          { timeOffsetMin: 30, carbsGr: 25 },
          { timeOffsetMin: 60, carbsGr: 25 },
          { timeOffsetMin: 90, carbsGr: 25 },
          { timeOffsetMin: 120, carbsGr: 25 },
          { timeOffsetMin: 150, carbsGr: 25 },
          {
            timeOffsetMin: 180,
            carbsGr: 25,
            caffeinated: true,
            note: 'Gel caféiné pour préparation dernière heure',
          },
          { timeOffsetMin: 210, carbsGr: 25 },
        ],
        notes: [
          'Back-to-back long run : maintenir 60-75 g/h avec alternance gel/boisson.',
          'Prévoir compléments salés toutes les 2 heures.',
        ],
      },
    },
  ]

  for (const session of trainingSessions) {
    await prisma.trainingSession.create({ data: session })
  }

  const foodItems = [
    {
      id: 'food-gel-framboise',
      name: 'Gel énergétique Framboise',
      brand: 'TrailBoost',
      caloriesPer100g: 280,
      proteinPer100g: 2,
      carbsPer100g: 68,
      fatPer100g: 0.5,
      fiberPer100g: 1.2,
      sugarPer100g: 32,
      category: FoodCategory.SPORTS_NUTRITION,
    },
    {
      id: 'food-barres-amandes',
      name: 'Barre énergétique Amandes & Miel',
      brand: 'UltraFuel',
      caloriesPer100g: 410,
      proteinPer100g: 12,
      carbsPer100g: 55,
      fatPer100g: 14,
      fiberPer100g: 6,
      sugarPer100g: 28,
      category: FoodCategory.SNACKS,
    },
  ]

  for (const item of foodItems) {
    await prisma.foodItem.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }

  await prisma.nutritionPlan.deleteMany({ where: { id: 'nutrition-plan-demo' } })

  await prisma.nutritionPlan.create({
    data: {
      id: 'nutrition-plan-demo',
      userId: demoUser.id,
      name: 'Plan nutrition UTMB',
      description: 'Plan nutrition sur 4 semaines avec stratégie course',
      dailyCalorieTarget: 3200,
      proteinTarget: 20,
      carbsTarget: 55,
      fatTarget: 25,
      isActive: true,
    },
  })

  await prisma.nutritionEntry.deleteMany({
    where: { id: { in: ['nutrition-entry-breakfast', 'nutrition-entry-longrun'] } },
  })

  const nutritionEntries = [
    {
      id: 'nutrition-entry-breakfast',
      userId: demoUser.id,
      foodItemId: 'food-barres-amandes',
      date: new Date(),
      mealType: MealType.BREAKFAST,
      quantity: 60,
      calories: 246,
      protein: 7.2,
      carbs: 33,
      fat: 8.4,
      fiber: 3.6,
      sugar: 16.8,
    },
    {
      id: 'nutrition-entry-longrun',
      userId: demoUser.id,
      foodItemId: 'food-gel-framboise',
      date: new Date(),
      mealType: MealType.DURING_RACE,
      quantity: 40,
      calories: 112,
      protein: 0.8,
      carbs: 27.2,
      fat: 0.2,
      fiber: 0.5,
      sugar: 12.8,
    },
  ]

  for (const entry of nutritionEntries) {
    await prisma.nutritionEntry.create({ data: entry })
  }

  console.log('✅ Training, race and nutrition data seeded')
  console.log('ℹ️  Demo login -> email: demo@summitstride.dev | password:', password)
}

main()
  .catch(error => {
    console.error('❌ Failed to seed database:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
