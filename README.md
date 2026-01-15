# 🚀 Weeb Website

Site web complet de l'entreprise **Weeb**, développé en React avec un système d'authentification, un panneau d'administration, un blog, des formations et bien plus encore.

## 🗂 Table des matières

1. [📖 Présentation](#-présentation)
2. [⚙️ Stack technique](#-stack-technique)
3. [📁 Arborescence du projet](#-arborescence-du-projet)
4. [💾 Installation](#-installation)
5. [🛠 Scripts disponibles](#-scripts-disponibles)
6. [✨ Fonctionnalités](#-fonctionnalités)
7. [🔐 Authentification et rôles](#-authentification-et-rôles)
8. [🌐 Configuration](#-configuration)
9. [🐳 Docker](#-docker)
10. [🧪 Tests](#-tests)
11. [🚀 Déploiement](#-déploiement)
12. [🔧 Conventions Git et CI/CD](#-conventions-git-et-cicd)

---

## 📖 Présentation

Weeb est une plateforme web moderne offrant :

- **Pages publiques** : Accueil, À propos, Contact, Blog, Formations
- **Authentification** : Connexion et inscription avec gestion de session
- **Profil utilisateur** : Gestion du profil personnel
- **Panneau d'administration** : Interface complète pour la gestion du contenu
  - Gestion des articles de blog
  - Gestion des formations
  - Gestion des genres
  - Gestion des messages de contact
  - Gestion des feedbacks
  - Gestion des formations utilisateurs (personnel)

Le design suit les maquettes fournies par l'équipe Weeb et utilise **Tailwind CSS** pour le styling.

## ⚙️ Stack technique

### Core
- ⚛️ **React** (v19.1.0)
- 🏎 **Vite** (v6.3.5)
- 🎨 **Tailwind CSS** (v4.1.7)
- 🌐 **react-router-dom** (v7.6.0) - Routing et navigation

### UI & Animations
- 🎬 **Framer Motion** (v12.12.1) - Animations fluides
- 📦 **React Icons** (v5.5.0) - Bibliothèque d'icônes SVG

### Qualité de code
- 🔍 **ESLint** (v9.25.0) - Linting
- 🎨 **Prettier** - Formatage automatique

### Tests
- 🧪 **Cypress** (v14.5.4) - Tests E2E et composants

### DevOps
- 🤖 **GitHub Actions** - CI/CD automatisé
- 🐳 **Docker** - Containerisation
- ☁️ **Vercel** - Déploiement (configuré)

## 📁 Arborescence du projet

```text
weeb-website/
├── .github/
│   └── workflows/          # Workflows CI/CD GitHub Actions
├── cypress/
│   ├── e2e/                # Tests end-to-end
│   ├── fixtures/           # Données de test
│   └── support/            # Commandes et configuration Cypress
├── dist/                   # Build de production
├── locales/
│   ├── en/                 # Traductions anglaises
│   └── fr/                 # Traductions françaises
├── public/                 # Ressources statiques (images, SVG)
├── src/
│   ├── assets/             # Logos, illustrations
│   ├── components/         # Composants UI réutilisables
│   │   ├── About/          # Composants de la page À propos
│   │   ├── admin/          # Composants du panneau admin
│   │   ├── Blog/           # Composants du blog
│   │   ├── Contact/        # Composants de contact
│   │   ├── Formations/     # Composants des formations
│   │   ├── Home/           # Composants de la page d'accueil
│   │   ├── Icon/           # Composants d'icônes
│   │   ├── profile/        # Composants du profil
│   │   └── ui/             # Composants UI génériques
│   ├── context/            # Contextes React
│   │   ├── AuthContext.jsx     # Gestion de l'authentification
│   │   ├── LanguageContext.jsx  # Gestion de l'i18n
│   │   └── ThemeContext.jsx     # Gestion du thème dark/light
│   ├── layouts/            # Layouts réutilisables
│   │   └── AdminLayout.jsx # Layout du panneau admin
│   ├── lib/                # Bibliothèques utilitaires
│   │   ├── api.js          # Client API avec gestion CSRF
│   │   └── cookies.js      # Gestion des cookies
│   ├── pages/              # Pages de l'application
│   │   ├── admin/          # Pages du panneau admin
│   │   ├── About.jsx
│   │   ├── Blog.jsx
│   │   ├── BlogDetail.jsx
│   │   ├── Contact.jsx
│   │   ├── Feedbacks.jsx
│   │   ├── Formations.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Messages.jsx
│   │   ├── Profile.jsx
│   │   └── Register.jsx
│   ├── routes/             # Routes protégées
│   │   ├── PersonnelRoute.jsx
│   │   └── StaffRoute.jsx
│   ├── utils/              # Utilitaires
│   │   └── roles.js        # Gestion des rôles et permissions
│   ├── App.jsx             # Composant principal avec routing
│   ├── App.css             # Styles globaux
│   ├── main.jsx            # Point d'entrée de l'application
│   └── index.css           # Styles de base
├── .gitignore
├── cypress.config.js       # Configuration Cypress
├── docker-compose.yml      # Configuration Docker Compose
├── Dockerfile              # Image Docker pour développement
├── eslint.config.js        # Configuration ESLint
├── index.html              # Template HTML
├── package.json            # Dépendances & scripts
├── postcss.config.js       # Configuration PostCSS
├── tailwind.config.js      # Configuration Tailwind CSS
├── vercel.json             # Configuration Vercel
└── vite.config.js          # Configuration Vite
```

## 💾 Installation

### Prérequis

- **Node.js** (v20 ou supérieur recommandé)
- **npm** (v9 ou supérieur)
- **Git**

### Étapes d'installation

```bash
# Cloner le dépôt
git clone https://github.com/<votre-org>/weeb-website.git
cd weeb-website

# Installer les dépendances
npm install
```

### Variables d'environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# URL de l'API backend
VITE_API_URL=http://localhost:8000/api

# URLs spécifiques par environnement (optionnel)
VITE_DEV_API_URL=http://localhost:8000/api
VITE_PROD_API_URL=https://weebbackend.melissa-mangione.com/api
```

## 🛠 Scripts disponibles

| Commande                | Description                                           |
| ----------------------- | ----------------------------------------------------- |
| `npm run dev`           | 🔄 Lancer le serveur de développement (HMR)            |
| `npm run build`         | 📦 Générer le build de production                     |
| `npm run preview`       | 👀 Prévisualiser le build local                       |
| `npm run lint`          | 🔍 Exécuter ESLint pour vérifier le code              |
| `npm run cypress:open`  | 🧪 Ouvrir l'interface Cypress (tests interactifs)     |
| `npm run cypress:run`   | 🧪 Exécuter les tests Cypress en mode headless        |

## ✨ Fonctionnalités

### 🌐 Pages publiques

- **🏠 Accueil** (`/`) : Page d'accueil avec sections Hero, TrustedBy, Learning et Trends
- **📖 À propos** (`/about-us`) : Page de présentation de l'entreprise
- **📨 Contact** (`/contact`) : Formulaire de contact avec validation
- **📝 Blog** (`/blog`) : Liste des articles de blog avec pagination et filtres par genre
- **📚 Formations** (`/formations`) : Catalogue des formations disponibles
- **🔐 Connexion** (`/login`) : Page de connexion avec validation et animations
- **📝 Inscription** (`/register`) : Page d'inscription

### 🔒 Pages protégées

- **👤 Profil** (`/profile`) : Gestion du profil utilisateur (nécessite authentification)

### 🛡️ Panneau d'administration

Toutes les pages admin nécessitent une authentification et les permissions appropriées :

- **🏠 Tableau de bord** (`/admin`) : Vue d'ensemble de l'administration
- **📝 Articles** (`/admin/articles`) : Gestion CRUD des articles de blog
- **📚 Formations** (`/admin/formations`) : Gestion des formations (accès Personnel requis)
- **👥 Formations utilisateurs** (`/admin/user-formations`) : Gestion des formations assignées aux utilisateurs (accès Personnel requis)
- **🏷️ Genres** (`/admin/genres`) : Gestion des genres pour les articles
- **💬 Messages** (`/admin/messages`) : Gestion des messages de contact
- **⭐ Feedbacks** (`/admin/feedbacks`) : Gestion des retours utilisateurs

### 🎨 Fonctionnalités transversales

- **🌗 Thème Dark/Light** : Switch accessible, persistance dans localStorage
- **🌐 Internationalisation** : Support FR/EN via context et fichiers JSON
- **📱 Responsive Design** : Design mobile-first avec breakpoints Tailwind
- **⚡ Lazy Loading** : Chargement différé des composants pour optimiser les performances
- **🔄 Gestion CSRF** : Protection contre les attaques CSRF avec tokens

## 🔐 Authentification et rôles

### Système d'authentification

L'application utilise un système d'authentification basé sur des cookies avec protection CSRF. Le contexte `AuthContext` gère :

- Connexion (`login`)
- Inscription (`register`)
- Déconnexion (`logout`)
- Vérification de l'utilisateur actuel (`me`)

### Rôles et permissions

Le système de rôles est géré via `src/utils/roles.js` :

- **Staff/Superuser** : Accès complet à toutes les fonctionnalités
- **Personnel** : Accès aux formations et aux formations utilisateurs
- **Commercial** : Accès aux fonctionnalités commerciales
- **Redacteur** : Accès à la rédaction d'articles

Les routes protégées utilisent :
- `ProtectedRoute` : Vérifie l'authentification
- `PersonnelRoute` : Vérifie le rôle Personnel
- `StaffRoute` : Vérifie les rôles Staff

## 🌐 Configuration

### API Backend

L'application se connecte à une API backend Django. La configuration de l'URL de l'API se fait automatiquement selon l'environnement :

1. **Variables d'environnement explicites** (`VITE_API_URL`)
2. **Mode production** : Utilise `VITE_PROD_API_URL` ou détecte automatiquement HTTPS/Vercel
3. **Mode développement** : Utilise `VITE_DEV_API_URL` ou `http://localhost:8000/api` par défaut

### Internationalisation

Les traductions sont stockées dans `locales/` avec des fichiers JSON séparés par langue (fr/en) et par section (home, blog, contact, etc.).

### Thème

Le thème est géré via `ThemeContext` et persiste dans `localStorage`. Les classes Tailwind s'adaptent automatiquement selon le thème sélectionné.

## 🐳 Docker

### Développement avec Docker

```bash
# Lancer avec Docker Compose
docker-compose up

# L'application sera accessible sur http://localhost:5173
```

Le fichier `docker-compose.yml` configure :
- Volume pour le code source (hot-reload)
- Port 5173 exposé
- Variables d'environnement pour le file watching

### Build Docker

```bash
# Construire l'image
docker build -t weeb-website .

# Lancer le conteneur
docker run -p 5173:5173 weeb-website
```

## 🧪 Tests

### Tests Cypress

L'application inclut une suite de tests E2E avec Cypress :

```bash
# Ouvrir Cypress en mode interactif
npm run cypress:open

# Exécuter tous les tests en mode headless
npm run cypress:run
```

Les tests couvrent :
- Authentification (connexion, inscription)
- Navigation
- Blog
- Formations
- Contact
- Profil
- Administration (articles, formations, genres, messages, feedbacks)
- Tests de smoke

Les fixtures de test sont dans `cypress/fixtures/`.

## 🚀 Déploiement

### Vercel

Le projet est configuré pour être déployé sur Vercel :

1. Connectez votre dépôt GitHub à Vercel
2. Configurez les variables d'environnement dans Vercel
3. Le déploiement se fait automatiquement à chaque push sur `main`

La configuration est dans `vercel.json` :
- Build command : `npm run build`
- Output directory : `dist`
- Rewrites pour le routing SPA

### Build de production

```bash
# Générer le build
npm run build

# Le dossier dist/ contient les fichiers statiques prêts à être déployés
```

## 🔧 Conventions Git et CI/CD

### 🌳 Branches

- `main` : Branche stable de production
- `issueNumber-name` : Branches de fonctionnalités (ex: `42-add-blog-page`)

### 📝 Commits

Utilisez des messages de commit conventionnels :

- `feat:` : Ajout d'une nouvelle fonctionnalité
- `fix:` : Correction d'un bug
- `style:` : Modification de style sans impact fonctionnel
- `refactor:` : Refactorisation du code
- `test:` : Ajout ou modification de tests
- `docs:` : Modification de la documentation
- `chore:` : Tâches de maintenance

Exemple :
```
feat: ajout de la page blog avec pagination
fix: correction du bug d'authentification
style: amélioration du responsive sur mobile
```

### 🤖 CI/CD

Les workflows GitHub Actions dans `.github/workflows/` exécutent automatiquement :

- **Linting** : Vérification ESLint sur chaque PR
- **Build** : Vérification que le build fonctionne
- **Tests** : Exécution des tests Cypress (si configuré)

Les workflows incluent :
- `create-pr.yml` : Workflow pour la création de PR
- `manual.yml` : Workflow manuel

---

## 📄 Licence

Ce projet est privé et propriétaire de Weeb.

## 👥 Contribution

Pour contribuer au projet, veuillez suivre les conventions Git et créer une branche depuis `main` avec le format `issueNumber-description`.

---

**Développé avec ❤️ par l'équipe Weeb**
