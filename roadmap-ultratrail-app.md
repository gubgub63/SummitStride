# Roadmap - Application Web d'Entraînement Ultra Trail

## Vue d'ensemble du projet
Application web complète pour aider les ultra-traileurs à se préparer de manière optimale à leurs courses, avec génération de plans d'entraînement personnalisés, suivi via APIs externes, gestion nutritionnelle et planification calendaire. **Modèle freemium avec système de crédits intelligent et abonnement premium** pour assurer la viabilité économique tout en maximisant l'engagement utilisateur.

## 🚀 Statut Global du Projet
- **Phase 1**: Architecture et Base ✅ **TERMINÉE**
- **Phase 2**: Authentification et Profils ✅ **TERMINÉE**
- **Phase 3**: Course et Inscription ✅ **TERMINÉE**
- **Phase 4**: Interface Utilisateur ✅ **TERMINÉE** (9/9 sections terminées)
  - 4.1 Design System ✅ TERMINÉ
  - 4.2 Authentification et Onboarding ✅ TERMINÉ
  - 4.3 Gestion des Profils Utilisateur ✅ TERMINÉ
  - 4.4 Catalogue et Recherche de Courses ✅ TERMINÉ
  - 4.5 Inscription et Gestion des Objectifs ✅ **TERMINÉ**
  - 4.6 Plans d'Entraînement (UI) ⭐ **EN COURS** - Infrastructure prête, composant d'apprentissage à finaliser
  - 4.7 Nutrition et Suivi ⭐ **EN COURS** - Infrastructure prête, composant d'apprentissage useEffect à finaliser
  - 4.8 Responsive et Mobile ✅ **TERMINÉ** (passe d'optimisation mars 2025)
  - 4.9 Landing & Pricing marketing ✅ **TERMINÉ**
- **Phase 5**: Training Plans - **PRÉVU**
- **Phase 6**: Intelligence Artificielle - **PRÉVU**

---

## Phase 1: Architecture et Base du Projet

### 1.1 Configuration initiale
- [x] Choix de la stack technique (Next.js + Fastify + PostgreSQL)
- [x] Configuration de l'environnement de développement
- [x] Mise en place du versioning (Git)
- [x] Structure des dossiers du projet
- [x] Configuration des outils de développement (ESLint, Prettier, etc.)

### 1.2 Base de données
- [x] Conception du schéma de base de données
- [x] Tables utilisateurs (profil, niveau, expérience)
- [x] Tables courses (nom, date, distance, dénivelé)
- [x] Tables plans d'entraînement
- [x] Tables séances et exercices
- [x] Tables nutrition et calories
- [x] Mise en place des migrations

**✅ Implémentation terminée:**
- Schéma Prisma complet avec tous les modèles
- Base de données PostgreSQL avec PostGIS pour les données géographiques
- Migrations automatiques configurées
- Client Prisma intégré dans l'API backend
- Endpoint de test de la base de données (/api/db-status)
- Support des enums TypeScript pour les types structurés

---

## Phase 2: Authentification et Gestion Utilisateur

### 2.1 Système d'authentification
- [x] Inscription/Connexion utilisateur
- [x] Gestion des sessions
- [x] Récupération de mot de passe
- [x] Sécurisation des routes

**✅ Implémentation terminée:**
- Endpoints d'inscription et connexion avec validation
- Hachage sécurisé des mots de passe avec bcrypt
- Génération et validation de tokens JWT
- Middleware d'authentification pour routes protégées
- Système de récupération de mot de passe
- Routes utilisateur sécurisées (/api/users/profile)
- Tests fonctionnels validés pour tous les endpoints

### 2.2 Profil utilisateur
- [x] Création du profil détaillé
- [x] Niveau d'expérience (débutant, intermédiaire, expert)
- [x] Historique sportif
- [x] Objectifs personnels
- [x] Données physiologiques (âge, poids, VMA, etc.)
- [x] Disponibilités d'entraînement

**✅ Implémentation terminée:**
- Endpoints CRUD complets pour profils détaillés (/api/users/detailed-profile)
- Validation robuste des données avec messages d'erreur en français
- Calculs automatiques : âge et BMI
- Système de complétude du profil avec pourcentage
- Endpoints utilitaires : niveaux d'expérience, objectifs communs, jours de semaine
- Types TypeScript complets avec interfaces
- Support des enum (ExperienceLevel: BEGINNER → EXPERT)
- Gestion des tableaux (objectifs, conditions médicales, jours préférés)
- Tests fonctionnels validés pour tous les scenarios

---

## Phase 3: Gestion des Courses

### 3.1 Base de données des courses
- [x] Interface d'ajout de courses
- [x] Recherche de courses existantes
- [x] Profil détaillé des courses (distance, dénivelé, profil altimétrique)
- [x] Catégorisation des courses (trail court, long, ultra)

**✅ Implémentation terminée:**
- Endpoints CRUD complets pour la gestion des courses (/api/courses)
- Système de recherche avancée avec filtres multiples (texte, difficulté, distance, dénivelé)
- Catégorisation automatique : Trail court (<25km), long (25-50km), ultra (>50km)
- Calcul automatique de difficulté basé sur distance et dénivelé
- Support des données de parcours (GPX, checkpoints, profil altimétrique)
- Endpoints utilitaires : difficultés, catégories, statistiques, suggestions de recherche
- Pagination et tri pour les listes de courses
- Validation robuste des données avec messages d'erreur
- Tests fonctionnels validés pour tous les scenarios CRUD

### 3.2 Inscription aux courses
- [x] Sélection de la course cible
- [x] Définition de la date objectif
- [x] Calcul du temps de préparation disponible

**✅ Implémentation terminée:**
- Endpoints CRUD complets pour l'inscription aux courses (/api/registrations)
- Validation des dates objectifs avec contraintes temporelles
- Calcul automatique du temps de préparation avec recommandations
- Analyse des risques basée sur l'expérience utilisateur et difficulté de course
- Système de statuts : REGISTERED, PREPARATION, COMPLETED, CANCELLED, DNS, DNF
- Validation de l'unicité des inscriptions actives par utilisateur/course
- Endpoints utilitaires : statuts, objectifs communs, analyse de préparation
- Formatage des réponses avec temps de préparation calculé
- Tests fonctionnels validés pour tous les endpoints CRUD

---

## Phase 4: Interface Utilisateur et Design (UI/UX)

### 4.1 Design System et Fondations
- [x] Définition de la charte graphique et identité visuelle
- [x] Création du design system (couleurs, typographies, espacements)
- [x] Composants de base (buttons, inputs, cards, modals)
- [x] Système de grille et layout responsive
- [x] Guidelines d'accessibilité (WCAG 2.1)

**✅ Implémentation terminée (mise à jour mars 2025):**
- Identité visuelle "Aurora Trail" (palette Indigo polaire / Sunrise flare / Alpine canopy / Midnight summit)
- Design tokens remaniés (CSS Custom Properties + TypeScript) et synchronisés avec Tailwind 4
- Typographies brand : Manrope (sans), Space Grotesk (display) et JetBrains Mono (UI technique)
- Composants UI piliers : Button (CTA pill gradients, états loading), Input (glass + focus offset), Card (glass/gradient/ghost), Modal accessibles
- Composants spécialisés : StatsCard, CourseCard, ConfirmationModal
- ThemeProvider clair/sombre/système + ThemeToggle pill revisité
- Hooks & utilitaires communs (`useResponsive` v2, `useBreakpoint`, `cn`, formatters)
- Guidelines WCAG 2.1 (contrastes, focus visibles, navigation clavier)
- Page design-system interactive toujours synchronisée avec les tokens

### 4.2 Authentification et Onboarding
- [x] Pages de connexion/inscription
- [x] Processus d'onboarding utilisateur
- [x] Création de profil guidée (wizard)
- [x] Dashboard d'accueil personnalisé
- [x] Menu de navigation principal

**✅ Implémentation terminée:**
- Infrastructure complète d'authentification avec Context et hooks
- Services API pour auth et gestion des profils utilisateur
- Pages de connexion, inscription et récupération de mot de passe
- Navigation principale avec menu utilisateur et indicateur de profil
- Layout authentifié avec protection des routes
- Composants de formulaires avec validation temps réel
- Gestion des états de loading et d'erreur
- Integration complète avec le backend Fastify existant

### 4.3 Gestion des Profils Utilisateur ✅
- [x] Interface de profil détaillé
- [x] Formulaires de mise à jour des données
- [x] Visualisation des statistiques personnelles
- [x] Gestion des préférences et paramètres
- [x] Indicateur de complétude du profil

**✅ Implémentation terminée:**
- Page de profil principale avec navigation par onglets (Vue d'ensemble, Statistiques, Progression, Activité)
- Composants de statistiques avec données mockées (ProfileStats, ProgressCharts, ActivitySummary)
- Hook useStats avec données de développement complètes et documentation des APIs à implémenter
- ProfileEditor pour la gestion complète des données personnelles
- Intégration avec les APIs backend existantes (profil, completion, options)
- Design cohérent avec le système Alpine Tech (navigation, couleurs, icônes SVG)
- Documentation des stubs API dans PROFILE_STUBS.md pour migration future
- Interface responsive et professionnelle prête pour l'intégration des vraies APIs

**📋 APIs à développer pour compléter l'intégration:**
- `GET /api/user/stats` - Statistiques agrégées d'entraînement
- `GET /api/user/progress?period=12weeks` - Données de progression temporelle
- `GET /api/training-sessions?limit=5&completed=true` - Activités récentes
- `GET /api/training-sessions?limit=3&upcoming=true` - Activités planifiées

### 4.4 Catalogue et Recherche de Courses ✅
- [x] Interface de liste des courses avec filtres
- [x] Fiche détaillée de course (profil altimétrique)
- [x] Système de recherche avancée
- [x] Carte interactive des courses
- [x] Comparateur de courses

**✅ Implémentation terminée:**
- Interface complète de catalogue avec recherche, filtres et pagination
- Service API frontend intégré avec les endpoints backend développés en Phase 3
- Hook `useCourses` pour gestion d'état et cache des données
- Composants de recherche avec autocomplétion et suggestions
- Panneau de filtres avancés (difficulté, catégorie, distance, dénivelé, lieu)
- Page de détail avec profil altimétrique (stub avec visualisation de base)
- Pages stub pour carte interactive et comparateur avec interface complète
- Intégration parfaite avec le design system Alpine Tech existant
- Navigation responsive et accessibilité WCAG 2.1
- Stubs documentés pour fonctionnalités avancées futures

**🔧 APIs backend utilisées (développées en Phase 3):**
- `GET /api/courses` - Liste avec filtres, tri et pagination
- `GET /api/courses/:id` - Détail d'une course
- `GET /api/courses/meta/*` - Métadonnées (difficultés, catégories, statistiques)
- Service complet avec validation, formatage et gestion d'erreurs

**📋 Stubs documentés pour évolutions futures:**
- Profil altimétrique interactif (nécessite parsing GPX + librairie de graphiques)
- Carte interactive (nécessite intégration API cartes + affichage parcours)
- Comparateur avancé (graphiques comparatifs, analyses de compatibilité)
- Toutes les fonctionnalités sont marquées avec notes de développement futur

### 4.5 Inscription et Gestion des Objectifs ✅
- [x] Interface d'inscription à une course
- [x] Sélection d'objectifs et dates cibles
- [x] Calendrier de préparation visuel
- [x] Suivi des inscriptions actives
- [x] Notifications et rappels (interface)

**✅ Implémentation terminée:**
- Service frontend `registrationService.ts` avec API calls complets
- Hook `useRegistrations.ts` pour gestion d'état centralisée
- Modal `RegistrationModal.tsx` d'inscription depuis page course detail
- Page `/registrations` pour gestion centralisée des inscriptions
- Page détail `/registrations/[id]` avec analyse de préparation
- Composant `PreparationCalendar.tsx` avec phases visuelles de préparation
- Composant `GoalTracker.tsx` pour widgets dashboard
- Navigation intégrée dans le menu principal
- Design cohérent avec le système Alpine Tech existant
- Intégration complète avec l'API backend développée en Phase 3

**🔗 APIs backend utilisées (développées en Phase 3):**
- `POST /api/registrations` - Création d'inscription
- `GET /api/registrations` - Liste des inscriptions utilisateur
- `GET /api/registrations/:id` - Détail d'une inscription
- `PUT /api/registrations/:id` - Modification d'inscription
- `DELETE /api/registrations/:id` - Suppression d'inscription
- `GET /api/registrations/:id/preparation-analysis` - Analyse de préparation
- `GET /api/registrations/meta/*` - Métadonnées (statuts, objectifs)

**🎨 Fonctionnalités clés implémentées:**
1. **Inscription rapide** - Modal accessible depuis n'importe quelle course
2. **Gestion centralisée** - Page dédiée avec filtres et actions
3. **Calendrier visuel** - Phases de préparation avec progression temps réel
4. **Analyse de préparation** - Recommandations basées sur niveau utilisateur
5. **Widgets dashboard** - Composants pour suivi des objectifs
6. **Interface responsive** - Design mobile-first et accessibilité WCAG 2.1

### 4.6 Plans d'Entraînement (UI) ⭐ **EN COURS**
- [x] Types TypeScript pour l'entraînement (TrainingPlan, TrainingSession)
- [x] Données mockées pour développement et tests
- [x] Page principale TrainingPlanDashboard avec statistiques
- [x] **Composant d'apprentissage WeeklyPlanWidget** (à compléter par l'utilisateur)
- [x] Intégration avec la navigation existante
- [ ] Calendrier interactif des séances (Phase future)
- [ ] Interface de suivi des séances (Phase future)
- [ ] Graphiques de progression (Phase future)
- [ ] Adaptation du plan en temps réel (Phase future)

**✅ Implémentation en cours :**
- Infrastructure complète Phase 4.6 préparée pour apprentissage React
- Composant éducatif `WeeklyPlanWidget.tsx` avec instructions détaillées
- Types TypeScript complets (SessionType, SessionIntensity, SessionStatus)
- Données mock réalistes avec séances d'entraînement variées
- TrainingPlanDashboard avec statistiques et vue d'ensemble
- Page `/training` intégrée dans l'architecture existante

**🎯 Élément d'apprentissage React pour l'utilisateur :**
- **WeeklyPlanWidget.tsx** - Composant pédagogique à implémenter
- **Concepts React à apprendre :** Props, useState, conditional rendering, event handlers, map, CSS conditionnelles
- **Fonctionnalités :** Affichage 7 jours, sélection de jour, détail de séance, indicateurs visuels
- **Support fourni :** Types, données mock, fonctions utilitaires, instructions détaillées

**📁 Fichiers créés :**
- `types/training.ts` - Types complets avec utilitaires
- `lib/data/mockTrainingData.ts` - Données de développement
- `components/training/TrainingPlanDashboard.tsx` - Interface principale
- `components/training/WeeklyPlanWidget.tsx` - Composant d'apprentissage
- `app/(authenticated)/training/page.tsx` - Point d'entrée

### 4.7 Nutrition et Suivi ⭐ **EN COURS**
- [x] Types TypeScript pour la nutrition (NutritionProfile, CalorieResult, FoodItem)
- [x] Données mockées et formules de calcul (MET, validation, recommandations)
- [x] Page principale NutritionDashboard avec statistiques complètes
- [x] **Composant d'apprentissage CalorieCalculator** (à compléter par l'utilisateur)
- [x] Intégration avec la navigation existante (/nutrition)
- [ ] Base de données alimentaire searchable (Phase future)
- [ ] Planificateur de repas avancé (Phase future)
- [ ] Graphiques de balance nutritionnelle (Phase future)
- [ ] Synchronisation avec wearables (Phase future)

**✅ Implémentation en cours :**
- Infrastructure complète Phase 4.7 préparée pour apprentissage React avancé
- Composant éducatif `CalorieCalculator.tsx` avec instructions détaillées useEffect
- Types TypeScript complets avec système de validation
- Formules scientifiques MET pour calculs caloriques précis
- NutritionDashboard avec statistiques temps réel et macronutriments
- Page `/nutrition` intégrée dans l'architecture existante

**🎯 Élément d'apprentissage React pour l'utilisateur :**
- **CalorieCalculator.tsx** - Composant avancé à implémenter avec useEffect
- **Nouveaux concepts React :** useEffect, formulaires contrôlés, validation, calculs temps réel, état complexe
- **Fonctionnalités :** Formulaire multi-champs, recalcul automatique, validation temps réel, recommandations nutritionnelles
- **Support fourni :** Formules MET, données d'activités, fonctions de validation, types complets

**📁 Fichiers créés :**
- `types/nutrition.ts` - Types complets nutrition avec utilitaires
- `lib/data/mockNutritionData.ts` - Données et formules scientifiques
- `components/nutrition/NutritionDashboard.tsx` - Interface principale complète
- `components/nutrition/CalorieCalculator.tsx` - Composant d'apprentissage useEffect
- `app/(authenticated)/nutrition/page.tsx` - Point d'entrée

**🧮 Formules et données scientifiques :**
- **Système MET** (Metabolic Equivalent of Task) pour calculs précis
- **Activités ultra-trail** : Course, randonnée, vélo avec intensités
- **Recommandations nutritionnelles** : Hydratation, glucides, électrolytes
- **Validation complète** : Poids, durée, types d'activités

### 4.8 Responsive et Mobile ✅ **TERMINÉ** (passe d'optimisation mars 2025)
- [x] Refonte `useResponsive` (détection SSR-safe + mobile/tablette/desktop)
- [x] Barre de navigation responsive (drawer mobile, body locking, transitions)
- [x] Harmonisation des layouts publics & authentifiés (fonds radiaux, espacements container)
- [x] Optimisations tactiles (cibles 44px, focus offset, safe areas)
- [x] Nettoyage Tailwind (`.btn`, `.card`, `.input`) pour cohérence petits écrans

**✅ Implémentation livrée (mars 2025)**
- Landing & Pricing : menu hamburger partagé, drawer mobile, ancres (#features/#comparatif)
- Authentifié : header sticky ajusté, mobile drawer aligné, suppression route pricing côté connecté
- `useResponsive` v2 + helpers `useBreakpoint`, `useMediaQuery` (refactor SSR/hydratation)
- Composants UI (Button/Input/Card) pivotés en pills glassy compatibles mobile
- Styles globaux (`globals.css`, tokens) avec fonds radiaux light/dark et gradients adaptatifs

**🎯 Héritage pédagogique** : `components/navigation/MobileNavigation.tsx`
- Concepts : useState/useEffect/useResponsive, gestion overlay & clics outside
- Challenge : animations hamburger → X, transitions panel, accessibilité clavier

**📁 Fichiers clés**
- `lib/hooks/useResponsive.ts` (refactor)
- `components/navigation/Header.tsx` & `MobileNavigation.tsx`
- `app/page.tsx`, `app/pricing/page.tsx` (menus marketing)
- `components/ui/Button.tsx`, `Card.tsx`, `Input.tsx`
- `app/globals.css`, `app/design-system/tokens.css`, `tailwind.config.ts`

### 4.9 Landing & Pricing marketing ✅
- [x] Refonte complète de la landing page (hero, stats, pipeline IA, témoignages, CTA)
- [x] Nouvelle page `/pricing` (toggle mensuel/annuel, comparatif, FAQ, section démo)
- [x] Intégration des nouveaux tokens (palette Aurora Trail, typographies brand)
- [x] Responsive complet (grid adaptative, drawer mobile partagé)
- [x] Alignement CTA (register/pricing) et ancres (#plans, #faq, #contact)

**✅ Implémentation livrée (mars 2025)**
- `app/page.tsx` réécrit avec contenu marketing, social proof, section pipeline
- `app/pricing/page.tsx` ajoutée + navigation mobile dédiée
- Mise à jour `premiumService.createCheckoutSession` consommée par la page Premium
- Expérience mobile fluide (body scroll lock, overlay, ThemeToggle intégré)
- Contenu marketing mis à jour (copie FR, logos partenaires, stats)

**📋 Tests et Optimisation UX (reportés après Phase 5-6) :**
- [ ] Tests utilisateurs avec ultra-traileurs - *Nécessite des fonctionnalités core complètes*
- [ ] Optimisation des parcours utilisateur - *Dépend des retours utilisateurs sur l'app complète*
- [ ] Tests d'accessibilité - *À faire quand l'UI est stabilisée*
- [ ] Performance et loading states - *Pertinent avec données réelles (Phase 5+)*
- [ ] Analytics d'usage et heatmaps - *Nécessite des utilisateurs actifs*

---

## Phase 5: Génération de Plans d'Entraînement

### 5.1 Algorithme de génération de base ✅ **TERMINÉ**
- [x] Analyse du profil utilisateur (niveau, VMA, disponibilités)
- [x] Analyse des caractéristiques de la course cible
- [x] Calcul de la charge d'entraînement optimale
- [x] Progression adaptée au temps disponible
- [x] Types de séances (endurance, seuil, fractionné, spécifique trail)

**Implémentation réalisée :**
- ✅ Service `TrainingPlanGenerator` avec algorithme complet de génération
- ✅ API `/training-plans/generate` avec validation et authentification
- ✅ Calculs scientifiques (VMA, zones cardiaques, progression)
- ✅ Périodisation automatique (base, build, peak, taper)
- ✅ Intégration Prisma avec base de données synchronisée
- ✅ Tests fonctionnels : plan généré avec 52 sessions pour 75km ultra-trail
- ✅ Service frontend pour intégration complète API

### 5.2 Personnalisation des plans ✅ **TERMINÉ**
- [x] Adaptation selon le niveau d'expérience
- [x] Prise en compte des contraintes temporelles
- [x] Intégration du dénivelé spécifique
- [x] Plans de récupération et tapering
- [x] Séances alternatives (mauvais temps, blessure)

**✅ Implémentation réalisée :**
- Analyse automatique du profil (`experienceLevel`, capacité horaire, historique médical) avec ajustement de volume/intensité
- Préférences enrichies (jours favoris, limites de durée, focus endurance/vitesse/technique/force)
- Gestion des contraintes : adaptation semaines décharge, week-ends limités, périodes de vacances, jours de travail
- Renforcement spécifique montagne via intégration du ratio dénivelé/distance et annotation des séances
- Génération systématique d'alternatives météo/blessure et insertion de semaines de récupération

**🔗 Endpoints concernés :**
- `POST /api/training-plans/generate`
- `POST /api/training-plans/generate-advanced`

**📁 Fichiers clés :**
- `packages/backend/src/routes/training.ts`
- `packages/backend/src/services/trainingPlanGenerator.ts`

### 5.3 Backend des plans d'entraînement
- [x] Modèles de données pour plans et séances
- [x] API CRUD complète pour plans d'entraînement
- [x] Système de templates de séances
- [x] Calculs de progression et périodisation
- [x] Gestion des adaptations et modifications

**✅ Implémentation réalisée :**
- Extension Prisma (`TrainingPlanTemplate`, `TrainingSessionTemplate`, métadonnées progression) + génération Prisma à lancer (`npm run db:generate`)
- Nouvelles routes Fastify : progression agrégée (`GET /api/training-plans/:id/progression`), mise à jour de statut (`PATCH /api/training-plans/:id/status`), gestion des templates (`GET|POST|PUT /api/training-plan-templates`)
- Service Analytics centralisé (`TrainingPlanAnalytics`) pour charges, volumes, semaines décharge et synchronisation automatique des métriques
- Générateur mis à jour : planification par phase `PlanPhase`, charges planifiées, stockage progression JSON, insertion automatique dans les nouvelles colonnes
- Service frontend enrichi (progression, statut, templates) + types partagés (`PlanPhase`, `TrainingPlanProgress`, templates)

**🎯 À faire (apprentissage recommandé) :** implémenter la route `DELETE /api/training-plan-templates/:id` côté backend + méthode correspondante côté `trainingService` pour finaliser le cycle de vie des templates.

**✅ Intégration UI réalisée :** le dashboard `TrainingPlanDashboard` permet désormais de générer un plan, de modifier son statut (activer / pause / terminé), et de gérer les templates (listing, création rapide, suppression).

### Nutrition — Gel intake & timing

- [x] Définir les seuils d'usage des gels : <60 min ⇒ note “non requis”, ≥60 min ⇒ objectif 50–70 g/h avec prises toutes 20–30 min.
- [x] Documenter les ajustements selon intensité, durée, chaleur, tolérance gastro-intestinale et préférence caféine (champ `preferences.nutrition`).
- [x] Étendre `session.nutritionPlan` avec `gels[]` (`timeOffsetMin`, `carbsGr`, `caffeinated?`, `note`) stocké en JSON dans Prisma.
- [x] Générer ce schedule côté API lors de la préparation des séances (⚠️ affichage UI à brancher dans “Séances — Détail enrichi”).
- [x] Baliser les gels caféinés en fin d’effort uniquement si `preferences.nutrition.caffeinePreference` le permet, sinon ajouter une note “Caféine évitée”.

**✅ Implémentation livrée (2025-10-01)**
- Nouveau champ Prisma `training_sessions.nutritionPlan` + migration `20251001125652_add_session_nutrition_plan`.
- Générateur de plan enrichi (`TrainingPlanGenerator.buildSessionNutritionPlan`) : calcul des fourchettes glucidiques, intervalle 20–30 min, adaptation chaleur/GI/caféine.
- Préférences de génération étendues (`generationPreferencesSchema.nutrition`) avec tolérance GI, caféine, chaleur, taille des gels.
- Types partagés (backend + frontend) mis à jour (`SessionNutritionPlan`, `SessionGelIntake`).
- Script de seed enrichi avec plans nutrition pour les séances démo.
- Widget hebdomadaire (`WeeklyPlanWidget`) affiche désormais les objectifs glucidiques, les gels programmés et les notes coaching.
- Reste : étendre le panneau « Séances — Détail enrichi » global pour aligner toutes les vues (cf. section dédiée).

### Plans — Unicité du plan actif par utilisateur

- [x] Réitérer la règle « un seul plan `ACTIVE` par `userId` », en se reposant sur les statuts existants (`DRAFT`, `ACTIVE`, `COMPLETED`, etc.).
- [x] À l’activation (PUT/PATCH existant), vérifier l’absence d’un autre plan actif ; sinon, demander la mise en pause/archivage via l’UI avant de confirmer.
- [x] Conserver la création par défaut en `DRAFT`, l’activation restant une action explicite utilisateur.
- [x] Documenter la contrainte côté Prisma ou middleware (unicité logique) sans ajouter de nouvelle route.

**✅ Implémentation livrée**
- Vérification back-end (`PATCH /training-plans/:id/status`) : renvoie `409` si un autre plan actif du même utilisateur existe, avec métadonnées pour l’UI.
- Tableau de bord mis à jour : gestion d’erreurs/success visuelles et blocage des boutons pendant les actions.
- Règle rappelée dans la documentation pour éviter les régressions futures.

### Visualisation — Calendrier global du plan

- [x] Proposer une vue calendrier globale (Semaine / Mois / Agenda) réutilisant l’endpoint de récupération des séances avec filtres `dateStart`/`dateEnd` déjà supportés.
- [x] Offrir un switch “Plan actif” vs “Historique” en filtrant les statuts existants (`ACTIVE`, `COMPLETED`, etc.).
- [x] Afficher pour chaque séance : titre, icône/type (EF, seuil, VMA, sortie longue), durée, distance ; le clic ouvre le panneau détail existant.
- [x] Ne pas ajouter de dépendance UI externe : réutiliser les composants maison (carte, grille, widget hebdo étendu).

**✅ Implémentation livrée**
- Nouveau composant `TrainingPlanCalendar` : grouping hebdomadaire, switch Actif/Historiques, réutilisation des styles Button/Card.
- Intégré au dashboard plan avec état de chargement et sélection synchronisée.
- Interaction ouvre `TrainingSessionDetail` pour rester cohérent avec le widget hebdomadaire.

### Séances — Détail enrichi

- [x] Structurer le panneau détail en sections : Résumé (nom, type, objectif), Volume (durée/distance/D+ si disponible), Intensité (zone ou %VMA/%FC), Intervalles (échauffement, travail, récup, retour au calme) quand présents.
- [x] Afficher la nutrition : `session.nutritionPlan.gels[]` + rappels hydratation déjà documentés ; aucun champ nouveau. *(Composant générique utilisé par le widget hebdomadaire & le calendrier.)*
- [x] Inclure matériel/notes/météo si les champs existent déjà dans la séance ou le plan.
- [ ] Prévoir un encart RPE/ressenti (lecture/édition) en réutilisant le champ existant (ou alias) sans créer de nouvelle entité.

**✅ Implémentation livrée**
- Création du composant `TrainingSessionDetail` : sections Résumé, Volume & Intensité, Intervalles (avec fallback), Nutrition & hydratation.
- Intégration dans `WeeklyPlanWidget` et `TrainingPlanCalendar` pour offrir une expérience unifiée.
- Affiche les notes, le plan de gels et signale l’absence de métriques/RPE quand non saisis.
- Reste à implémenter : formulaire RPE éditable (cf. dernier sous-point).

### Gouvernance — Idempotence & Non-régression

- [x] Toute entrée déjà définie doit être marquée “(déjà couvert)” au lieu d’être dupliquée.
- [x] Aucune nouvelle entité/route/librairie ne doit être ajoutée si une alternative existe déjà dans l’architecture (Fastify, Prisma, React, etc.).
- [x] Les titres/ancres restent stables pour garantir l’idempotence des mises à jour automatisées.
- [x] Vérifier après chaque modification que la roadmap reste sans doublon et fidèle aux structures existantes.

**✅ Implémentation livrée**
- Mise à jour de la roadmap avec sections consolidées et mentions explicites des éléments déjà couverts.
- Réutilisation stricte des composants existants (Button/Card) et des services/traductions sans dépendances additionnelles.
- Rappel dans la roadmap pour maintenir cette gouvernance lors des prochaines phases.

**📋 Backend requis pour Phase 4.6 UI :**
- Tables TrainingPlan et TrainingSession déjà créées ✅
- APIs nécessaires : `/api/training-plans`, `/api/training-sessions`
- Endpoints de génération et adaptation de plans
- Système de suivi de progression

---

## Phase 6: Intelligence Artificielle Core 🧠

**🎯 Notre avantage concurrentiel : l'IA construite sur une base solide de données**

### 6.1 Moteur IA d'Analyse Prédictive
- [x] **Analyse multi-factorielle** des données existantes (profils, plans, performances) *(implémentée via heuristiques analytiques consolidant volume, intensité, complétion et difficulté course).* 
- [ ] **Algorithmes de machine learning** pour prédiction de performance de course *(prochaine étape : remplacer l’heuristique par un modèle supervisé).* 
- [ ] **Modèle d'adaptation automatique** basé sur la fatigue physiologique détectée
- [x] **IA de détection de risque de blessure** via pattern recognition des données d'entraînement *(heuristique actuelle basée sur la densité de séances intenses et la charge cumulée).* 
- [ ] **Système d'apprentissage continu** à partir des données de plans existants
- [ ] **Scoring de forme physique** en temps réel basé sur les performances récentes

### 6.2 Optimisation IA des Plans Existants
- [x] **IA d'amélioration** des algorithmes de génération de plans (Phase 5) *(les insights signalent les ajustements recommandés à injecter côté planificateur).* 
- [ ] **Optimisation multi-objectifs** (performance, récupération, motivation, contraintes)
- [ ] **Adaptation temps réel** selon conditions météo, terrain et état de forme
- [ ] **IA de personnalisation poussée** (préférences, biorhythme, contraintes personnelles)
- [ ] **Simulation de course** avec prédiction de stratégie optimale par segments
- [ ] **Plans de récupération intelligents** avec détection automatique de surmenage

### 6.3 Coach Virtuel IA Avancé
- [ ] **Natural Language Processing** pour questions en français naturel
- [ ] **IA conversationnelle spécialisée** ultra-trail avec base de connaissances expert
- [ ] **Analyse de sentiment et motivation** via interactions utilisateur
- [ ] **Recommandations proactives** basées sur comportement et patterns d'entraînement
- [ ] **IA de coaching psychologique** pour préparation mentale spécifique trail
- [ ] **Chatbot intelligent 24/7** pour conseils immédiats et motivation

### 6.4 Analytics IA Prédictifs Premium
- [x] **Prédiction de temps de course** avec intervalle de confiance et probabilités *(première version heuristique : estimation finish time + tempo cible, à raffiner avec intervalles).* 
- [ ] **IA d'optimisation nutritionnelle** personnalisée selon effort et profil métabolique
- [x] **Détection précoce de surmenage/sous-entraînement** via biomarkers virtuels *(score de fatigue et readiness dérivés des charges hebdo).* 
- [ ] **Modèles prédictifs de récupération** optimale selon type d'effort et individu
- [ ] **IA de benchmarking intelligent** avec comparaison athlètes au profil similaire
- [ ] **Analyse prédictive de performance** à long terme (6-12 mois)

**✅ Implémentation livrée (2025-10-01)**
- Service `AiInsightsService` (back-end) agrège volume, charge et difficulté pour produire une estimation heuristique (temps de course, allure, fatigue, readiness, risque blessure).
- Endpoint protégé `/api/ai/training-plans/:id/insights` exposé côté Fastify.
- Dashboard enrichi : carte « Insights IA » (statuts, focus, ajustements, risques), widget semaine et calendrier réutilisent `TrainingSessionDetail` pour la cohérence UX.
- Prochaine étape : substitution de l'heuristique par un vrai modèle ML (Phase 6.1 second bullet) et boucles d'apprentissage continu.

**🚀 Avantages concurrentiels uniques :**
```
🎯 DIFFÉRENCIATION IA (construite sur données réelles)
├── Coach virtuel 24/7 spécialisé ultra-trail
├── Prédictions de performance ultra-précises
├── Adaptation temps réel aux données physiologiques
├── Détection précoce risques blessure
├── Apprentissage continu communauté 2500+ traileurs
└── IA conversationnelle en français naturel

💡 VS CONCURRENCE
├── TrainingPeaks: Plans statiques, pas d'IA conversationnelle
├── Strava: Social + tracking, zéro IA prédictive
├── Garmin: Hardware focus, IA limitée
└── Coachs humains: Disponibilité limitée, coût élevé
```

---

## Phase 7: Système Premium et Monétisation

### 7.1 Architecture du système de crédits
- [x] Tables base de données (UserCredits, CreditTransactions, SubscriptionPlans)
- [ ] Modèles de consommation par fonctionnalité
- [ ] Système de rechargement de crédits
- [x] Historique des transactions et facturation *(tables + endpoints de lecture disponibles)*
- [ ] Gestion des crédits gratuits (nouveau utilisateur, promotions)

### 7.2 Intégration de paiement
- [x] Configuration Stripe pour paiements sécurisés *(SDK backend, variables d'environnement, endpoint Checkout)*
- [x] Packages de crédits (20, 50, 100 crédits avec remises)
- [x] Abonnement Premium annuel/mensuel *(sessions Stripe dynamiques + seed premium-monthly/premium-annual)*
- [ ] Gestion des remboursements et litiges
- [x] Webhooks Stripe pour synchronisation automatique *(route `/api/stripe/webhook` + signature et mise à jour du solde)*
- [x] Checkout front → back : `premiumService.createCheckoutSession` → `POST /premium/checkout/session` → `stripe.checkout.sessions.create`

### 7.3 Logique métier premium
- [x] Middleware de vérification des crédits *(consommation appliquée sur les insights IA, retour 402 en cas d'insuffisance)*
- [x] Décompte automatique lors d'actions premium *(appel aux insights IA retranche 3 crédits et journalise la transaction)*
- [x] Système de quotas pour comptes gratuits *(fallback mensuel pour les modules sans crédits)*
- [ ] Alertes de solde faible et suggestions de recharge
- [ ] Fonctionnalités exclusives Premium (analyses IA avancées)

### 7.4 Interface utilisateur premium
- [x] Dashboard de gestion des crédits *(page /premium avec solde, transactions, offres)*
- [x] Pages d'achat et upgrade *(Landing + `/pricing` + CTA Stripe directs depuis PremiumDashboard)*
- [x] Indicateurs visuels premium/gratuit *(cartes solde/recommandations + encart insuffisance)*
- [ ] Historique des consommations et factures
- [ ] Centre d'aide pour questions de facturation

**💰 Stratégie de monétisation :**
```
🆓 GRATUIT (Engagement maximal)
├── 1 plan d'entraînement basique/mois
├── Suivi manuel des séances
├── Communauté et partage
└── Base de données courses

💎 SMART CREDITS (Flexibilité)
├── 20 crédits = 9.90€
├── 50 crédits = 19.90€ (-20%)
├── 100 crédits = 34.90€ (-30%)
└── Crédits n'expirent jamais

🚀 PREMIUM (79€/an)
├── Plans illimités + IA avancée
├── Sync multi-plateformes
├── Coaching virtuel personnalisé
└── Analytics de performance

📊 Consommation :
├── Plan IA personnalisé : 15 crédits
├── Adaptation plan : 5 crédits
├── Analyse performance : 3 crédits
└── Plan nutrition : 8 crédits
```

**✅ Implémentation livrée (2025-03)**
- Tables Prisma (`user_credit_balances`, `credit_transactions`, `subscription_plans`) + migrations en place
- Routes protégées `/api/premium/*` (solde, transactions, plans) et middleware de consommation
- Service front `premiumService` + `PremiumDashboard` (solde, historique, CTA checkout)
- Flux Stripe complet : landing/pricing CTA → service front → endpoint Fastify → `stripe.checkout.sessions.create` → redirection utilisateur
- Webhook Stripe opérationnel pour créditer/décrémenter automatiquement
- Quotas free tier : usage gratuit mensuel (AI insights) journalisé (`FREE_QUOTA_USAGE`) avec fallback automatique sans crédits

**À poursuivre**
- Modèles de consommation affinés par fonctionnalité, gestion des crédits gratuits et quotas free tier
- Alertes solde faible / upsell, historique factures, help center facturation
- Support remboursements/litiges Stripe côté back-office

---

## Phase 8: Intégrations API Externes

### 8.1 Intégration Strava ✅
- [x] Configuration OAuth Strava (auth-url + callback backend)
- [x] Synchronisation des activités (API Strava v3, refresh token automatique)
- [x] Import des données d'entraînement (stockage minimal + mapping vers UI)
- [x] Analyse basique des performances réelles (agrégations hebdo, statistiques de volume)

**✅ Implémentation livrée (mars 2025)**
- Modèle Prisma `strava_integrations` + stockage tokens/athlète
- Routes Fastify `/api/integrations/strava/*` (status, auth-url, activities, sync, callback)
- Service Strava (refresh token, fetch activities, quotas JWT state)
- Hook front `useStravaIntegration` + service `stravaService`
- Persistance locale `strava_activities` & agrégations hebdo (progression, stats, activités récentes)
- UI : carte de connexion Strava, page `/integrations/strava` de retour OAuth, stats/activités réelles sans mocks
- Variables à renseigner : `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_REDIRECT_URI`, `FRONTEND_URL`, `FREE_AI_INSIGHTS_MONTHLY_LIMIT`

### 8.2 Autres intégrations possibles
- [ ] Garmin Connect
- [ ] Polar Flow
- [ ] Suunto App
- [ ] TrainingPeaks

### 8.3 Adaptation automatique IA
- [ ] **IA de comparaison** performance réelle vs objectif avec apprentissage
- [ ] **Ajustement automatique IA** des séances suivantes basé sur données réelles
- [ ] **IA de détection de fatigue/surmenage** via patterns multi-sources
- [ ] **Recommandations IA de récupération** personnalisées et prédictives

---

## Phase 9: Calendrier et Planification

### 9.1 Interface calendaire
- [ ] Vue calendaire mensuelle/hebdomadaire
- [ ] Glisser-déposer des séances
- [ ] Gestion des créneaux disponibles
- [ ] Notifications et rappels

### 9.2 Flexibilité du planning
- [ ] Reprogrammation des séances manquées
- [ ] Adaptation aux imprévus
- [ ] Gestion des périodes de congés
- [ ] Synchronisation avec calendriers externes (Google, Outlook)

---

## Phase 10: Nutrition et Gestion des Calories

### 10.1 Planification nutritionnelle IA
- [ ] Base de données des aliments
- [ ] Calcul des besoins caloriques selon l'entraînement
- [ ] Plans alimentaires pré/pendant/post course
- [ ] Gestion des électrolytes et hydratation

### 10.2 Suivi pendant la course IA
- [ ] **IA de calcul dynamique** des besoins énergétiques par segment
- [ ] **Stratégie IA de ravitaillement** optimisée selon profil métabolique
- [ ] **Alertes IA nutrition/hydratation** prédictives et personnalisées
- [ ] **Adaptation IA temps réel** selon conditions (chaleur, altitude, fatigue)

---

## Phase 11: Suivi et Analyse IA

### 11.1 Tableau de bord IA
- [ ] **Visualisation IA des progrès** avec patterns prédictifs
- [ ] **Statistiques d'entraînement intelligentes** avec insights automatiques
- [ ] **Graphiques de performance IA** avec projections futures
- [ ] **Comparaison IA avec objectifs** et recommandations d'ajustement

### 11.2 Analyse avancée IA
- [ ] **IA de détection de tendances** cachées dans les données
- [ ] **Prédiction IA de performance** multi-factorielle précise
- [ ] **Recommandations IA d'amélioration** personnalisées et actionnables
- [ ] **Rapports IA détaillés** avec insights et prédictions

---

## Phase 12: Fonctionnalités Avancées

### 12.1 Communauté
- [ ] Profils publics
- [ ] Partage de plans d'entraînement
- [ ] Forums/discussions
- [ ] Défis communautaires

### 12.2 Coaching virtuel IA (Migration depuis Phase 5)
- [ ] **IA pour conseils personnalisés ultra-spécialisés**
- [ ] **Chatbot IA d'assistance 24/7** en français naturel
- [ ] **Alertes IA intelligentes** prédictives et contextuelles
- [ ] **Recommandations IA proactives** basées sur comportement

### 12.3 Matériel et équipement
- [ ] Recommandations d'équipement
- [ ] Gestion de l'usure du matériel
- [ ] Calendrier de remplacement
- [ ] Comparatifs produits

---

## Phase 13: Tests et Déploiement

### 13.1 Tests
- [ ] Tests unitaires
- [ ] Tests d'intégration
- [ ] Tests utilisateur (beta testeurs ultra-traileurs)
- [ ] Tests de charge
- [ ] Tests de sécurité

### 13.2 Déploiement
- [ ] Configuration serveur de production
- [ ] Domaine et certificats SSL
- [ ] Monitoring et logs
- [ ] Système de backup
- [ ] Documentation utilisateur

---

## Phase 14: Maintenance et Évolution

### 14.1 Maintenance
- [ ] Corrections de bugs
- [ ] Mises à jour de sécurité
- [ ] Optimisations performances
- [ ] Sauvegarde des données

### 14.2 Évolutions futures IA
- [ ] Application mobile (iOS/Android) avec IA embarquée
- [ ] Intégration capteurs IoT avec IA temps réel
- [ ] Réalité augmentée pour parcours avec IA contextuelle
- [ ] **IA de nouvelle génération** (GPT-5+, modèles spécialisés)
- [ ] API publique IA pour développeurs tiers

---

## Technologies Recommandées

### Frontend
- **Framework**: React.js avec TypeScript
- **UI Library**: Material-UI ou Chakra UI
- **State Management**: Redux Toolkit ou Zustand
- **Charts**: Chart.js ou D3.js
- **Calendar**: FullCalendar ou react-big-calendar

### Backend
- **Runtime**: Node.js avec Express ou Python avec FastAPI
- **Base de données**: PostgreSQL avec Prisma ORM
- **Authentication**: JWT avec Passport.js
- **Paiements**: Stripe pour processing sécurisé
- **Cache**: Redis
- **File Storage**: AWS S3 ou Cloudinary

### Infrastructure
- **Hosting**: Vercel/Netlify (frontend) + Heroku/Railway (backend)
- **Database**: Supabase ou PlanetScale
- **Monitoring**: Sentry pour les erreurs
- **Analytics**: Google Analytics ou Mixpanel

---

## Estimation Timeline

- **Phase 1-2**: 2-3 semaines
- **Phase 3-4**: 4-6 semaines
- **Phase 5 (IA Core)**: 6-8 semaines 🧠 **PRIORITÉ DIFFÉRENCIATION**
- **Phase 6 (Implémentation IA)**: 4-5 semaines
- **Phase 7 (Premium/Monétisation)**: 3-4 semaines
- **Phase 8-9**: 4-5 semaines
- **Phase 10-11**: 4-6 semaines
- **Phase 12-13**: 2-3 semaines

**Total estimé**: 8-11 mois pour un MVP complet avec IA avancée et monétisation

**📅 Planning recommandé IA-First:**
- **Maintenant (Phase 4.1-4.2)** : Design system et authentification UI ✅
- **Après Phase 3.2** : Interfaces de gestion des courses et profils utilisateur
- **Phase 5 PRIORITÉ** : Développement du moteur IA core (avantage concurrentiel)
- **En parallèle Phase 6** : UI des plans d'entraînement IA et tableaux de bord
- **Phase 7 rapidement** : Système premium pour monétiser l'IA
- **Phase 4.8-4.9** : Optimisation mobile et tests UX

---

## Points Critiques pour le Succès

1. **Réalisme des plans**: Collaboration avec entraîneurs ultra trail expérimentés
2. **UX/UI intuitive**: Tests utilisateur fréquents avec de vrais ultra-traileurs
3. **Fiabilité des données**: Validation scientifique des algorithmes d'entraînement
4. **Performance**: Application rapide même avec beaucoup de données
5. **Sécurité**: Protection des données personnelles et de santé (RGPD)
6. **Modèle économique**: Équilibre freemium pour engagement + premium pour monétisation
7. **Conformité paiements**: Respect PCI DSS et réglementations financières
