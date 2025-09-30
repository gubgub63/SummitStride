# SummitStride - Application d'Entraînement Ultra Trail

Application web complète pour aider les ultra-traileurs à se préparer de manière optimale à leurs courses, avec génération de plans d'entraînement personnalisés, suivi via APIs externes, gestion nutritionnelle et planification calendaire.

## 🏗️ Architecture

### Stack Technique
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: Fastify + TypeScript
- **Base de données**: PostgreSQL 16 + PostGIS
- **Cache**: Redis
- **ORM**: Prisma
- **Monorepo**: npm workspaces + Turbo

### Structure du Projet
```
SummitStride/
├── packages/
│   ├── frontend/     # Application Next.js
│   ├── backend/      # API Fastify
│   └── shared/       # Types et schemas communs
├── docker/           # Configuration Docker
├── scripts/          # Scripts utilitaires
└── docs/            # Documentation
```

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- Docker & Docker Compose
- Git

### Installation Automatique
```bash
# Cloner le repository
git clone <repository-url>
cd SummitStride

# Lancer le script de configuration
./scripts/setup.sh
```

### Installation Manuelle

1. **Installer les dépendances**
```bash
npm install
```

2. **Configuration de l'environnement**
```bash
cp .env.example .env
cp packages/backend/.env.example packages/backend/.env
```

3. **Démarrer les services Docker**
```bash
docker-compose up -d
```

4. **Construire le package partagé**
```bash
npm run build --workspace=@summitstride/shared
```

5. **Démarrer le développement**
```bash
npm run dev
```

## 📝 Scripts Disponibles

```bash
# Développement
npm run dev              # Démarre tous les serveurs de développement
npm run build            # Construit tous les packages
npm run start            # Démarre en production

# Qualité du code
npm run lint             # Lint tous les packages
npm run type-check       # Vérification des types
npm run format           # Formatage du code
npm run format:check     # Vérification du formatage

# Base de données
npm run db:generate      # Génère le client Prisma
npm run db:push          # Push les changements de schéma
npm run db:migrate       # Applique les migrations
npm run db:studio        # Ouvre Prisma Studio

# Utilitaires
npm run clean            # Nettoie les builds
```

## 🐳 Services Docker

### PostgreSQL + PostGIS
- Port: 5432
- Database: summitstride_dev
- User: summit_user

### Redis
- Port: 6379

## 🌐 URLs de Développement

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API Health**: http://localhost:4000/health

## 📁 Packages

### @summitstride/frontend
Application Next.js avec interface utilisateur complète.

### @summitstride/backend
API Fastify avec authentification, gestion des utilisateurs, et intégrations externes.

### @summitstride/shared
Types TypeScript, schemas Zod, et utilitaires partagés.

## 🔧 Configuration

### Variables d'Environnement
Consultez `.env.example` pour les variables disponibles.

### APIs Externes
- Strava API pour synchronisation des activités
- Google Maps API pour données géographiques

## 📚 Documentation

- [Roadmap du projet](./roadmap-ultratrail-app.md)
- [Configuration Docker](./docker/README.md)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -m 'Ajouter nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.
