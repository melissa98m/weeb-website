# 🚀 Weeb Website

Site web complet de l'entreprise **Weeb**, développé en React avec authentification, panneau d'administration, blog, formations et pages légales.

## 🗂 Table des matières

1. [📖 Présentation](#-présentation)
2. [⚙️ Stack technique](#️-stack-technique)
3. [📁 Arborescence du projet](#-arborescence-du-projet)
4. [💾 Installation](#-installation)
5. [🌐 Configuration & variables d'environnement](#-configuration--variables-denvironnement)
6. [🛠 Scripts disponibles](#-scripts-disponibles)
7. [✨ Fonctionnalités](#-fonctionnalités)
8. [🔐 Authentification et rôles](#-authentification-et-rôles)
9. [🧪 Tests](#-tests)
10. [📘 Storybook](#-storybook)
11. [🐳 Docker](#-docker)
12. [🚀 Déploiement](#-déploiement)
13. [📚 Architecture et structure](#-architecture-et-structure)
14. [🔧 Conventions Git et CI/CD](#-conventions-git-et-cicd)
15. [🐛 Dépannage](#-dépannage)

---

## 📖 Présentation

Weeb est une plateforme web moderne offrant :

- **Pages publiques** : Accueil, À propos, Contact, Blog, Formations, Mentions légales, Politique de confidentialité
- **Authentification complète** : Connexion, inscription, réinitialisation de mot de passe avec gestion de session
- **Profil utilisateur** : Gestion du profil personnel avec export de données et suppression de compte (RGPD)
- **Panneau d'administration** : Interface complète pour la gestion du contenu
  - Gestion des articles de blog (CRUD complet)
  - Gestion des formations (accès Personnel requis)
  - Gestion des genres pour les articles
  - Gestion des messages de contact
  - Gestion des feedbacks utilisateurs
  - Gestion des formations utilisateurs (personnel)
- **Fonctionnalités avancées** : Thème dark/light, internationalisation FR/EN, bannière de cookies RGPD

Le design suit les maquettes fournies par l'équipe Weeb et utilise **Tailwind CSS** pour le styling.

## ⚙️ Stack technique

### Core
- ⚛️ **React** (v19.1.0)
- 🏎 **Vite** (v6.3.5)
- 🎨 **Tailwind CSS** (v4.1.7)
- 🌐 **react-router-dom** (v7.6.0)

### UI & Observabilité
- 🎬 **Framer Motion** (v12.12.1)
- 📦 **React Icons** (v5.5.0)
- 🧭 **Sentry** (monitoring erreurs + perf, activé en prod si `VITE_SENTRY_DSN`)

### Qualité de code
- 🔍 **ESLint** (v9.x) avec règles React Hooks, React Refresh et Storybook
- 🎨 **Prettier** - Formatage automatique (recommandé)

### Tests
- 🧪 **Vitest** + **Testing Library** (tests unitaires / composants)
- 🧪 **Cypress** (E2E)
- 🧪 **Storybook** + **Vitest Addon** (tests de stories)
- 🧪 **Playwright** (exécution headless des tests Storybook)

### DevOps
- 🤖 **GitHub Actions**
- 🐳 **Docker / Docker Compose**
- ☁️ **Vercel**

## 📁 Arborescence du projet

```text
weeb-website/
├── .github/
│   ├── workflows/          # CI/CD GitHub Actions
│   │   ├── ci.yml
│   │   ├── create-pr.yml
│   │   └── deploy-storybook.yml
│   └── PULL_REQUEST_TEMPLATE.md
├── .storybook/             # Configuration Storybook
├── cypress/
│   ├── e2e/                # Tests end-to-end
│   ├── fixtures/           # Données de test
│   └── support/            # Commandes et configuration Cypress
├── dist/                   # Build de production
├── locales/                # Traductions FR/EN
├── public/                 # Ressources statiques (images, SVG)
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── admin/           # UI admin
│   │   ├── About/
│   │   ├── Blog/
│   │   ├── Contact/
│   │   ├── Formations/
│   │   ├── Home/
│   │   ├── Icon/
│   │   ├── profile/
│   │   ├── ui/
│   │   ├── CookieBanner.jsx
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/             # Contexts (Auth, Language, Theme)
│   ├── layouts/             # Layouts réutilisables
│   ├── lib/                 # Client API + cookies + env
│   ├── pages/
│   │   ├── admin/           # Pages admin
│   │   ├── About.jsx
│   │   ├── Blog.jsx
│   │   ├── BlogDetail.jsx
│   │   ├── Contact.jsx
│   │   ├── Feedbacks.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── Formations.jsx
│   │   ├── Home.jsx
│   │   ├── Legal.jsx
│   │   ├── Login.jsx
│   │   ├── Messages.jsx
│   │   ├── Privacy.jsx
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
├── .env                    # Variables locales (exemple, non versionné en prod)
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

- **Node.js** (v20+ recommandé, CI en v22)
- **npm**
- **Git**

### Étapes d'installation

```bash
# Cloner le dépôt
git clone https://github.com/<votre-org>/weeb-website.git
cd weeb-website

# Installer les dépendances
npm install
```

## 🌐 Configuration & variables d'environnement

Créez ou mettez à jour un fichier `.env` à la racine du projet :

```env
VITE_API_URL=http://localhost:8000/api
VITE_SENTRY_DSN=__votre_dsn_sentry__
```

- `VITE_API_URL` : URL du backend Django. **Si non défini**, l'app utilise par défaut `https://weebbackend.melissa-mangione.com/api`.
- `VITE_SENTRY_DSN` : DSN Sentry. **Si défini en production**, active le reporting d'erreurs et les traces/replays.

## 🛠 Scripts disponibles

| Commande                | Description                                         |
| ----------------------- | --------------------------------------------------- |
| `npm run dev`           | 🔄 Lancer le serveur de développement (HMR)        |
| `npm run build`         | 📦 Générer le build de production                  |
| `npm run preview`       | 👀 Prévisualiser le build local                    |
| `npm run lint`          | 🔍 Exécuter ESLint                                 |
| `npm test`              | 🧪 Lancer les tests Vitest (unitaires + stories)   |
| `npm run cypress:open`  | 🧪 Ouvrir l'interface Cypress                      |
| `npm run cypress:run`   | 🧪 Exécuter les tests Cypress (headless)           |
| `npm run storybook`     | 📚 Lancer Storybook                                |
| `npm run build-storybook` | 📦 Build statique Storybook                      |

## ✨ Fonctionnalités

### 🌐 Pages publiques

- **🏠 Accueil** (`/`) : Page d'accueil avec sections Hero, TrustedBy, Learning et Trends
- **📖 À propos** (`/about-us`) : Page de présentation de l'entreprise
- **📨 Contact** (`/contact`) : Formulaire de contact avec validation et envoi de messages
- **📝 Blog** (`/blog`) : Liste des articles de blog avec pagination et filtres par genre
- **📄 Détail article** (`/blog/:id`) : Page de détail d'un article avec contenu complet
- **📚 Formations** (`/formations`) : Catalogue des formations disponibles avec modal de détail
- **🪟 Détail formation** (`/formation/:id`) : Route dédiée au modal de formation
- **🔐 Connexion** (`/login`) : Page de connexion avec validation et animations
- **📝 Inscription** (`/register`) : Page d'inscription avec validation
- **🔑 Mot de passe oublié** (`/forgot-password`) : Demande de réinitialisation de mot de passe
- **🔄 Réinitialisation** (`/reset-password`) : Réinitialisation du mot de passe avec token
- **⚖️ Mentions légales** (`/mentions-legales`) : Page des mentions légales
- **🔒 Politique de confidentialité** (`/politique-confidentialite`) : Page de politique de confidentialité

### 🔒 Pages protégées

- **👤 Profil** (`/profile`) : Gestion du profil utilisateur avec :
  - Affichage des informations personnelles
  - Liste des formations suivies
  - Liste des feedbacks donnés
  - Export des données personnelles (RGPD)
  - Suppression de compte (RGPD)
  - Gestion des droits sur les données

### 🛡️ Panneau d'administration

- **🏠 Tableau de bord** (`/admin`)
- **📝 Articles** (`/admin/articles`)
- **📚 Formations** (`/admin/formations`) *(Personnel requis)*
- **👥 Formations utilisateurs** (`/admin/user-formations`) *(Personnel requis)*
- **🏷️ Genres** (`/admin/genres`)
- **💬 Messages** (`/admin/messages`)
- **⭐ Feedbacks** (`/admin/feedbacks`)

### 🎨 Fonctionnalités transversales

- **🌗 Thème Dark/Light** : Switch accessible dans le header, persistance dans localStorage, synchronisation via `class` et `data-theme`
- **🌐 Internationalisation** : Support FR/EN via `LanguageContext` et fichiers JSON dans `locales/`, synchronisation avec `lang` et `data-lang`
- **📱 Responsive Design** : Design mobile-first avec breakpoints Tailwind
- **⚡ Lazy Loading** : Chargement différé des composants avec `React.lazy()` et `Suspense`
- **🔄 Gestion CSRF** : Protection contre les attaques CSRF avec tokens automatiques, récupération automatique si manquant
- **🍪 Bannière de cookies** : Consentement RGPD (cookies requis/optionnels), persistance des préférences
- **📧 Newsletter** : Système d'abonnement avec consentement
- **🔒 Protection des routes** : Routes protégées avec vérification d'authentification et de rôles
- **⚡ Optimisations de build** : Code splitting manuel, minification ESBuild, noms de fichiers hashés

## 🔐 Authentification et rôles

### Système d'authentification

L'application utilise un système d'authentification basé sur des cookies avec protection CSRF. `AuthContext` centralise :

- **Connexion** (`login`) : Accepte email/username/identifier + password, pose les cookies, puis charge `/me`
- **Inscription** (`register`) : Création de compte puis connexion automatique
- **Déconnexion** (`logout`) : Suppression des tokens et nettoyage de l'état
- **Vérification de l'utilisateur** (`me`) : Récupération des informations de l'utilisateur connecté
- **Réinitialisation de mot de passe** : Demande et confirmation avec token

Le contexte initialise automatiquement la vérification de l'utilisateur avec un délai intelligent (idle callback ou timeout) pour optimiser les performances.

### Rôles et permissions

Le système de rôles est géré via `src/utils/roles.js` avec une détection flexible basée sur :
- Les groupes utilisateur (`groups`, `group_names`)
- Les rôles explicites (`roles`, `role`)
- Les flags booléens (`is_commercial`, `is_personnel`, `is_redacteur`)
- Les permissions explicites (fallback)

**Rôles disponibles :**
- **Staff/Superuser** : Accès complet à toutes les fonctionnalités (détecté via `is_staff` ou `is_superuser`)
- **Personnel** : Accès aux formations et aux formations utilisateurs
- **Commercial** : Accès aux fonctionnalités commerciales
- **Redacteur** : Accès à la rédaction d'articles

**Routes protégées :**
- `ProtectedRoute` : Vérifie uniquement l'authentification (admin + profil)
- `PersonnelRoute` : Vérifie le rôle Personnel (pages formations)
- `StaffRoute` : Helper prêt à l'usage (non utilisé dans les routes actuelles)

## 🧪 Tests

### Vitest (unitaires / composants)

```bash
npm test
```

- Environnement `jsdom`
- Configuration globale via `src/setupTests.js`
- Tests présents dans `src/**` (pages, composants UI, admin, etc.)

### Cypress (E2E)

```bash
npm run cypress:open
npm run cypress:run
```

**Fichiers de test disponibles :**
- `auth.cy.js` : Tests d'authentification (connexion, inscription)
- `navigation.cy.js` : Tests de navigation entre les pages
- `blog.cy.js` : Tests du blog (liste, détail, filtres)
- `formations.cy.js` : Tests des formations
- `contact.cy.js` : Tests du formulaire de contact
- `profile.cy.js` : Tests du profil utilisateur
- `cookies.cy.js` : Tests de la bannière de cookies
- `admin.cy.js` : Tests généraux de l'administration
- `admin-articles.cy.js` : Tests de gestion des articles
- `admin-post.cy.js` : Tests de création/modification d'articles et formations
- `smoke.cy.js` : Tests de smoke (vérification basique)

**Configuration Cypress :**
- Base URL : `http://localhost:5173`
- Viewport : 1280x720
- Vidéos désactivées, screenshots activés sur échec
- Configuration de tests de composants React prête (bundler Vite)

## 📘 Storybook

```bash
npm run storybook
```

Build statique :

```bash
npm run build-storybook
```

- Configuration dans `.storybook/`
- Mocks réseau centralisés dans `src/stories/storybook-mocks.js` et chargés par `.storybook/preview.jsx`
- Les tests Storybook sont intégrés à `vitest` (via `@storybook/addon-vitest`)

## 🐳 Docker

### Développement avec Docker Compose

Le fichier `docker-compose.yml` configure :
- Volume pour le code source (hot-reload)
- Port 5173 exposé (host:container)
- Variables d'environnement pour le file watching (`CHOKIDAR_USEPOLLING`, `WATCHPACK_POLLING`)
- Commande : `npm run dev -- --host 0.0.0.0 --port 5173`

**Note importante** : `docker-compose.yml` référence `Dockerfile.dev` mais le fichier s'appelle `Dockerfile`. Deux options :
- Renommer `Dockerfile` en `Dockerfile.dev`, ou
- Modifier `docker-compose.yml` pour utiliser `Dockerfile`

### Build Docker

```bash
# Construire l'image
docker build -t weeb-website .

# Lancer le conteneur
docker run -p 5173:5173 weeb-website
```

Le `Dockerfile` utilise Node.js 20 (bookworm) et configure l'environnement pour un file watching fiable dans Docker.

## 🚀 Déploiement

### Vercel

Le projet est configuré pour Vercel via `vercel.json` :

- Build command : `npm run build`
- Output directory : `dist`
- Rewrites SPA vers `/index.html`
- Rewrites `/api/*` vers `https://weebbackend.melissa-mangione.com/api/*`
- Headers CORS pour `/api/*`

### Build de production

```bash
npm run build
```

## 📚 Architecture et structure

### Contextes React

L'application utilise trois contextes principaux :

1. **AuthContext** (`src/context/AuthContext.jsx`) :
   - Gestion de l'état d'authentification
   - Méthodes : `login`, `register`, `logout`, `reload`
   - Initialisation intelligente avec idle callback
   - Gestion automatique du CSRF

2. **ThemeContext** (`src/context/ThemeContext.jsx`) :
   - Gestion du thème dark/light
   - Persistance dans localStorage
   - Synchronisation avec le DOM (`class` + `data-theme`)

3. **LanguageContext** (`src/context/LanguageContext.jsx`) :
   - Gestion de la langue (FR/EN)
   - Persistance dans localStorage
   - Synchronisation avec le DOM (`lang` + `data-lang`)

### Structure des composants

- **Composants réutilisables** : `Button`, `Pagination`, `Select`, `Pill`, `PageSizer`
- **Composants de page** : Organisés par fonctionnalité (Blog, Formations, Admin, etc.)
- **Layouts** : `AdminLayout` pour toutes les pages d'administration
- **Routes protégées** : `ProtectedRoute`, `PersonnelRoute`, `StaffRoute`

### Optimisations de build

Le `vite.config.js` configure :
- **Code splitting** : Séparation React vendor et Framer Motion
- **Minification** : ESBuild pour JS, CSS minifié
- **Cache** : Noms de fichiers avec hash pour cache optimal
- **Target** : ES2020 pour compatibilité navigateurs modernes
- **Chunk size warning** : Limite à 1000KB

### Gestion des erreurs

- Gestion des erreurs réseau dans `src/lib/api.js`
- Messages d'erreur structurés avec status et details
- Logs de debug en mode développement
- Gestion gracieuse des erreurs CSRF

## 🔧 Conventions Git et CI/CD

### 🌳 Branches

- `main` : branche stable de production
- `issueNumber-name` : branches de fonctionnalités (ex: `42-add-blog-page`)

### 📝 Commits

Utilisez des messages de commit conventionnels :

- `feat:` ajout d'une fonctionnalité
- `fix:` correction d'un bug
- `style:` modification de style sans impact fonctionnel
- `refactor:` refactorisation du code
- `test:` ajout/modif de tests
- `docs:` documentation
- `chore:` maintenance

### 🤖 CI/CD

Le projet inclut trois workflows GitHub Actions dans `.github/workflows/` :

#### 1. Workflow CI (`ci.yml`)

Exécuté automatiquement sur chaque `push` et `pull_request` :

- **Checkout** : Récupération du code
- **Setup Node.js** : Installation de Node.js v22 avec cache npm
- **Install dependencies** : Installation des dépendances avec `npm ci`
- **Build** : Vérification que le build de production fonctionne (`npm run build`)
- **Cypress E2E** : Exécution des tests end-to-end avec Cypress
  - Démarre le serveur de développement (`npm run dev -- --host`)
  - Attend que l'application soit disponible sur `http://localhost:5173`
  - Timeout de 120 secondes

#### 2. Workflow Auto Pull Request (`create-pr.yml`)

Exécuté automatiquement sur chaque `push` vers une branche qui n'est pas `main` ou `master` :

- **Création automatique de PR** : Crée une pull request si elle n'existe pas
- **Mise à jour automatique** : Met à jour la PR existante à chaque nouveau push
- **Description automatique** : Génère la description de la PR à partir des messages de commit
- **Détection de la branche de base** : Détecte automatiquement `main` ou `master` comme branche de base

**Permissions requises :**
- `contents: write`
- `pull-requests: write`

#### 3. Workflow Deploy Storybook (`deploy-storybook.yml`)

Exécuté automatiquement sur chaque `push` vers `main` :

- **Build Storybook** : `npm run build-storybook`
- **Déploiement** : Vercel via `amondnet/vercel-action@v25`

## 🐛 Dépannage

### Problèmes courants

**L'application ne se connecte pas à l'API :**
- Vérifiez que `VITE_API_URL` est correctement défini dans `.env`
- Vérifiez que le backend est accessible et que les CORS sont configurés
- En mode développement, l'URL par défaut est `https://weebbackend.melissa-mangione.com/api`

**Les cookies ne fonctionnent pas :**
- Vérifiez que vous êtes sur HTTPS en production (cookies Secure)
- Vérifiez la configuration SameSite des cookies côté backend
- Assurez-vous que le domaine du cookie correspond au domaine de l'application

**Le hot-reload ne fonctionne pas dans Docker :**
- Vérifiez que `CHOKIDAR_USEPOLLING` et `WATCHPACK_POLLING` sont définis
- Vérifiez que les volumes sont correctement montés dans `docker-compose.yml`

**Les tests Cypress échouent :**
- Assurez-vous que l'application est lancée sur `http://localhost:5173`
- Vérifiez que les fixtures correspondent aux endpoints de l'API
- En mode Cypress, un token CSRF de test est automatiquement créé

**Le build échoue :**
- Vérifiez que toutes les dépendances sont installées (`npm install`)
- Vérifiez les erreurs ESLint avec `npm run lint`
- Assurez-vous d'utiliser Node.js v20 ou supérieur

---

## 📄 Licence

Ce projet est privé et propriétaire de Weeb.

## 👥 Contribution

Pour contribuer au projet, veuillez suivre les conventions Git et créer une branche depuis `main` avec le format `issueNumber-description`.

## 📞 Support

Pour toute question ou problème, contactez l'équipe Weeb.

---

**Développé avec ❤️ par melissa98m**
