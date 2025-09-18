# API Stubs Documentation - Profile Statistics (4.3)

Ce document liste tous les stubs d'API utilisés dans l'implémentation de la visualisation des statistiques personnelles (étape 4.3 du roadmap).

## APIs mockées temporairement

### 1. Hook `useStats` (lib/hooks/useStats.ts)

**Données mockées :**
- `MOCK_STATS` - Statistiques générales de l'utilisateur
- `MOCK_PROGRESS` - Données de progression sur 12 semaines
- `MOCK_RECENT_ACTIVITIES` - 5 dernières activités
- `MOCK_UPCOMING_ACTIVITIES` - 3 prochaines activités planifiées

**APIs à implémenter plus tard :**

#### GET /api/user/stats
```typescript
interface UserStatsResponse {
  totalSessions: number
  totalDistance: number // km
  totalDuration: number // minutes
  completedRaces: number
  upcomingRaces: number
  currentWeekDistance: number
  currentWeekDuration: number
  averagePace: number // min/km
  lastActivityDate: Date | null
}
```

#### GET /api/user/progress?period=12weeks
```typescript
interface ProgressResponse {
  data: Array<{
    week: string
    distance: number
    duration: number // minutes
    sessions: number
  }>
}
```

#### GET /api/training-sessions?limit=5&completed=true
```typescript
interface RecentActivitiesResponse {
  sessions: Array<{
    id: string
    date: Date
    type: 'run' | 'bike' | 'strength' | 'cross-training'
    name: string
    distance?: number
    duration: number
    intensity: 'low' | 'moderate' | 'high' | 'very-high'
    completed: boolean
  }>
}
```

#### GET /api/training-sessions?limit=3&upcoming=true
```typescript
interface UpcomingActivitiesResponse {
  sessions: Array<{
    id: string
    date: Date
    type: 'run' | 'bike' | 'strength' | 'cross-training'
    name: string
    plannedDistance?: number
    plannedDuration: number
    intensity: 'low' | 'moderate' | 'high' | 'very-high'
  }>
}
```

## Composants utilisant des stubs

### ProfileStats.tsx
- Utilise `useStats()` pour afficher les statistiques générales
- **TODO:** Remplacer par vraies APIs une fois disponibles

### ProgressCharts.tsx
- Utilise `useStats().progress` pour les graphiques de progression
- **TODO:** Remplacer par vraies APIs une fois disponibles

### ActivitySummary.tsx
- Utilise `useStats().recentActivities` et `useStats().upcomingActivities`
- **TODO:** Remplacer par vraies APIs une fois disponibles

## APIs existantes (déjà fonctionnelles)

### Gestion du profil
- ✅ `GET /api/user/profile` - Données de profil utilisateur
- ✅ `GET /api/user/detailed-profile` - Profil détaillé
- ✅ `POST /api/user/detailed-profile` - Création profil
- ✅ `PUT /api/user/detailed-profile` - Mise à jour profil
- ✅ `GET /api/user/profile-completion` - Statut de complétude

### Options de formulaires
- ✅ `GET /api/user/experience-levels` - Niveaux d'expérience
- ✅ `GET /api/user/fitness-goals` - Objectifs fitness
- ✅ `GET /api/user/days-of-week` - Jours de la semaine

## Migration vers vraies APIs

Quand les APIs backend seront prêtes :

1. **Remplacer le hook `useStats`** (lib/hooks/useStats.ts)
   - Supprimer les `MOCK_*` constantes
   - Implémenter les vrais appels API avec `apiClient`
   - Conserver les fonctions utilitaires de formatage

2. **Mettre à jour les composants**
   - Supprimer les commentaires `TODO: Replace with real API`
   - Vérifier que la structure des données correspond

3. **Tester l'intégration**
   - Vérifier que toutes les statistiques s'affichent correctement
   - Tester les cas d'erreur et de chargement
   - Valider les performances

## Structure des données
Toutes les interfaces TypeScript sont définies dans `lib/hooks/useStats.ts` et peuvent être réutilisées pour les vraies APIs backend.

Le code est structuré pour faciliter cette migration future sans changements majeurs dans les composants UI.