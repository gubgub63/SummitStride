# Suivi de l'application mobile SummitStride

## 2025-10-18 — Initialisation

- Mise en place d'un workspace Expo (SDK 54) dans `packages/mobile` intégré au Turborepo.
- Définition de la charte noire & blanche (palette, espacements, typographies) et d'un thème React Native partagé.
- Création des cinq écrans clés : Tableau de bord, Plans, Planner central, Nutrition et Profil.
- Navigation personnalisée avec barre fixe et bouton central proéminent pour les actions de planification.
- Données factices typées via `@summitstride/shared` pour valider les parcours UX et les états (charge, nutrition, objectifs).

### Prochaines étapes suggérées

1. Connecter les écrans aux API backend (Fastify) et mettre en place la synchronisation hors-ligne de base.
2. Intégrer l'authentification mobile (SSO Expo + backend) et gérer l'état utilisateur partagé.
3. Ajouter des tests E2E (Detox/Expo Go) et mettre en place un pipeline CI dédié au build mobile.

## 2025-10-18 — Intégration backend & Strava

- Couche réseau unifiée (fetch sécurisé + React Query) avec persistance token `SecureStore` et flux login/register complet.
- Écrans principaux alimentés par l'API Fastify : plans actifs, bibliothèques de templates, planner hebdo et profil dynamique.
- Création de plan côté mobile (formulaire + DateTimePicker) avec rafraîchissement automatique et sélection multi-plans.
- Intégration Strava (statut, auth web, synchro, activités récentes) et nutrition dérivée des séances en temps réel.
- Documentation des dépendances Expo supplémentaires (Secure Store, Web Browser, DateTime Picker).
- Dashboard & nutrition alimentés par Strava : progression hebdo réelle, macros et hydratation recalculées.
- Planner repensé (sélecteur de semaine, détail de séance, création de plan avec distance/D+/date de course).
- Génération de plan mobile alignée avec le web (sélection course, fenêtre d'entraînement, préférences IA, suppression de plan).
- Gestion des dossards sur mobile (consultation, inscription/suppression, catalogue de courses filtrables).

### Prochaines étapes suggérées

1. Ajouter des états hors-ligne/cache persistant pour les plans et sessions (React Query persist ou AsyncStorage).
2. Implémenter le support deep link Strava mobile (`expo-auth-session`) pour fermer automatiquement le navigateur et rafraîchir le statut.
3. Couvrir l'app avec des tests E2E (Detox) et instrumentation QA (expo-doctor + pipeline CI) avant mise en beta TestFlight/Play.
