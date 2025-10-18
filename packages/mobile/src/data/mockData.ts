import { CourseDifficulty, ExperienceLevel, PlanPhase, TrainingPlanStatus, TrainingType } from '@summitstride/shared'

export interface PlannerSession {
  id: string
  day: string
  type: TrainingType
  focus: string
  distanceKm?: number
  elevationGain?: number
  durationMin?: number
  status: 'PLANNED' | 'COMPLETED' | 'UPCOMING'
  highlight?: string
}

export const userProfileSummary = {
  name: 'Aurélie Marchand',
  location: 'Annecy, France',
  experience: ExperienceLevel.ADVANCED,
  targetRace: 'OCC by UTMB 2025',
  readinessScore: 0.82,
  fatigueScore: 0.34,
  streakWeeks: 6,
  vma: 17.8,
  maxTrainingHours: 12,
}

export const upcomingRace = {
  name: 'OCC by UTMB',
  location: 'Chamonix, France',
  date: '28 août 2025',
  distanceKm: 55,
  elevationGain: 3500,
  difficulty: CourseDifficulty.EXTREME,
}

export const activePlanOverview = {
  name: 'Bloc Spécifique OCC 12 semaines',
  status: TrainingPlanStatus.ACTIVE,
  phase: PlanPhase.PEAK,
  weeksCompleted: 7,
  totalWeeks: 12,
  weeklyLoadScore: 78,
  targetLoadScore: 82,
  focusAreas: ['Renfo ascensionnel', 'Gestion du dénivelé', 'Nutrition course'],
}

export const trainingProgress = {
  totalDistanceKm: 768,
  totalDurationHours: 122,
  loadScore: 82,
  weekly: [
    { week: 'S-4', distance: 82, duration: 11.5, load: 76 },
    { week: 'S-3', distance: 88, duration: 12, load: 82 },
    { week: 'S-2', distance: 94, duration: 12.5, load: 85 },
    { week: 'S-1', distance: 71, duration: 10.2, load: 68 },
  ],
}

export const plannerSessions: PlannerSession[] = [
  {
    id: 'mon',
    day: 'Lundi',
    type: TrainingType.RECOVERY,
    focus: 'Footing facile + mobilité',
    durationMin: 55,
    distanceKm: 9,
    status: 'COMPLETED',
  },
  {
    id: 'tue',
    day: 'Mardi',
    type: TrainingType.STRENGTH,
    focus: 'Renfo bas du corps + escalier',
    durationMin: 60,
    status: 'COMPLETED',
  },
  {
    id: 'wed',
    day: 'Mercredi',
    type: TrainingType.INTERVAL,
    focus: '3 x 8\' au seuil dans les montées',
    durationMin: 80,
    distanceKm: 12,
    elevationGain: 650,
    status: 'PLANNED',
    highlight: 'Priorité semaine',
  },
  {
    id: 'thu',
    day: 'Jeudi',
    type: TrainingType.CROSS_TRAINING,
    focus: 'Vélo gravel endurance',
    durationMin: 90,
    status: 'PLANNED',
  },
  {
    id: 'fri',
    day: 'Vendredi',
    type: TrainingType.RECOVERY,
    focus: 'Repos actif + cryothérapie',
    status: 'PLANNED',
  },
  {
    id: 'sat',
    day: 'Samedi',
    type: TrainingType.ENDURANCE,
    focus: 'Sortie longue montagne',
    durationMin: 210,
    distanceKm: 32,
    elevationGain: 1800,
    status: 'UPCOMING',
    highlight: 'Simulation course',
  },
  {
    id: 'sun',
    day: 'Dimanche',
    type: TrainingType.RECOVERY,
    focus: 'Rando active + gainage',
    durationMin: 75,
    status: 'UPCOMING',
  },
]

export const nutritionSnapshot = {
  planName: 'Fueling OCC 2025',
  macroTargets: {
    carbs: { target: 55, current: 52 },
    protein: { target: 20, current: 18 },
    fat: { target: 25, current: 30 },
  },
  hydration: {
    dailyTargetLiters: 3.4,
    streakDays: 5,
  },
  raceStrategy: {
    carbsPerHour: { min: 70, max: 85 },
    gels: [
      { time: '00:30', carbs: 28 },
      { time: '01:10', carbs: 30, caffeinated: true },
      { time: '01:55', carbs: 28 },
    ],
  },
  recommendations: [
    'Augmenter la part de glucides sur les repas d’avant séance clé',
    'Préparer 1 boisson isotonique supplémentaire pour la sortie longue',
    'Renforcer la collation post-effort en protéines (20g cible)',
  ],
}

export const planLibrary = [
  {
    id: 'trail-40',
    title: 'Trail 40km - Progression technique',
    durationWeeks: 10,
    focus: ['Force ascensionnelle', 'Gestion descentes', 'Plaisir'],
    suitableFor: [ExperienceLevel.INTERMEDIATE, ExperienceLevel.ADVANCED],
  },
  {
    id: 'ultra-80',
    title: 'Ultra 80km - Endurance & énergie',
    durationWeeks: 16,
    focus: ['Glycogène', 'Gestion sommeil', 'Micro-nutrition'],
    suitableFor: [ExperienceLevel.ADVANCED, ExperienceLevel.EXPERT],
  },
  {
    id: 'vertical',
    title: 'Bloc Vertical KM',
    durationWeeks: 6,
    focus: ['Fractionnés montée', 'Renfo excentrique', 'Coordination'],
    suitableFor: [ExperienceLevel.ADVANCED],
  },
]

export const profileHighlights = {
  strengths: ['Gestion du dénivelé', 'Nutrition course', 'Mental endurant'],
  focusNext: ['Renforcement cheville gauche', 'Optimiser le sommeil', 'Technicité descentes'],
  badges: [
    { id: 'streak', label: '6 semaines perfect' },
    { id: 'vertical', label: '+5 500 m D+ cette saison' },
    { id: 'hydration', label: 'Hydratation 30 jours' },
  ],
}
