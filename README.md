# 🚀 Weeb Website

Site web complet de l'entreprise **Weeb**, développé en React avec authentification, panneau d'administration, blog, formations et pages légales.

## 🗂 Table des matières

1. [📖 Présentation](#-présentation)
2. [⚙️ Stack technique](#️-stack-technique)
3. [📁 Arborescence du projet](#-arborescence-du-projet)
4. [💾 Installation](#-installation)
5. [🛠 Scripts disponibles](#-scripts-disponibles)
6. [✨ Fonctionnalités](#-fonctionnalités)
7. [🔐 Authentification et rôles](#-authentification-et-rôles)
8. [🌐 Configuration](#-configuration)
9. [🐳 Docker](#-docker)
10. [🧪 Tests](#-tests)
11. [🚀 Déploiement](#-déploiement)
12. [📚 Architecture et structure](#-architecture-et-structure)
13. [🔧 Conventions Git et CI/CD](#-conventions-git-et-cicd)

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

### UI & Animations
- 🎬 **Framer Motion** (v12.12.1)
- 📦 **React Icons** (v5.5.0)

### Qualité de code
- 🔍 **ESLint** (v9.25.0) - Linting avec règles React Hooks et React Refresh
- 🎨 **Prettier** - Formatage automatique (recommandé)

### Tests
- 🧪 **Cypress** (v14.5.4)

### DevOps
- 🤖 **GitHub Actions**
- 🐳 **Docker**
- ☁️ **Vercel**

## 📁 Arborescence du projet

```text
weeb-website/
├── .github/
│   ├── workflows/          # CI/CD GitHub Actions
│   │   ├── ci.yml
│   │   └── create-pr.yml
│   └── PULL_REQUEST_TEMPLATE.md
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
│   ├── lib/                 # Client API + cookies
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
├── .gitignore
├── cypress.config.js       # Configuration Cypress
├── docker-compose.yml      # Configuration Docker Compose
├── Dockerfile              # Image Docker pour développement (référencé comme Dockerfile.dev dans docker-compose.yml)
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

- **Node.js** (v20 ou supérieur recommandé, CI en v22)
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

### Variables d'environnement

Créez un fichier `.env` à la racine du projet avec la variable suivante :

```env
VITE_API_URL=http://localhost:8000/api
```

Si `VITE_API_URL` n'est pas défini, l'application utilise `http://localhost:8000/api` par défaut.

## 🛠 Scripts disponibles

| Commande               | Description                                       |
| ---------------------- | ------------------------------------------------- |
| `npm run dev`          | 🔄 Lancer le serveur de développement (HMR)       |
| `npm run build`        | 📦 Générer le build de production                 |
| `npm run preview`      | 👀 Prévisualiser le build local                   |
| `npm run lint`         | 🔍 Exécuter ESLint                                |
| `npm run cypress:open` | 🧪 Ouvrir l'interface Cypress                     |
| `npm run cypress:run`  | 🧪 Exécuter les tests Cypress (headless)          |

## ✨ Fonctionnalités

### 🌐 Pages publiques

- **🏠 Accueil** (`/`) : Page d'accueil avec sections Hero, TrustedBy, Learning et Trends
- **📖 À propos** (`/about-us`) : Page de présentation de l'entreprise
- **📨 Contact** (`/contact`) : Formulaire de contact avec validation et envoi de messages
- **📝 Blog** (`/blog`) : Liste des articles de blog avec pagination et filtres par genre
- **📄 Détail article** (`/blog/:id`) : Page de détail d'un article avec contenu complet
- **📚 Formations** (`/formations`) : Catalogue des formations disponibles avec modal de détail
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
- **📚 Formations** (`/admin/formations`)
- **👥 Formations utilisateurs** (`/admin/user-formations`)
- **🏷️ Genres** (`/admin/genres`)
- **💬 Messages** (`/admin/messages`)
- **⭐ Feedbacks** (`/admin/feedbacks`)

### 🎨 Fonctionnalités transversales

- **🌗 Thème Dark/Light** : Switch accessible dans le header, persistance dans localStorage, synchronisation avec l'attribut `data-theme` du DOM
- **🌐 Internationalisation** : Support FR/EN via `LanguageContext` et fichiers JSON dans `locales/`, synchronisation avec l'attribut `lang` du DOM
- **📱 Responsive Design** : Design mobile-first avec breakpoints Tailwind, optimisé pour tous les écrans
- **⚡ Lazy Loading** : Chargement différé des composants avec `React.lazy()` et `Suspense` pour optimiser les performances
- **🔄 Gestion CSRF** : Protection contre les attaques CSRF avec tokens automatiques, récupération automatique si manquant
- **🍪 Bannière de cookies** : Bannière RGPD avec gestion du consentement (cookies requis/optionnels), persistance des préférences
- **📧 Newsletter** : Système d'abonnement à la newsletter avec consentement
- **🔒 Protection des routes** : Routes protégées avec vérification d'authentification et de rôles
- **⚡ Optimisations de build** : Code splitting automatique (React vendor, Framer Motion), minification ESBuild, optimisations de cache

## 🔐 Authentification et rôles

### Système d'authentification

L'application utilise un système d'authentification basé sur des cookies avec protection CSRF. `AuthContext` centralise :

- **Connexion** (`login`) : Accepte email/username/identifier + password, pose les cookies, puis charge `/me`
- **Inscription** (`register`) : Création de compte puis connexion automatique
- **Déconnexion** (`logout`) : Suppression des tokens et nettoyage de l'état
- **Vérification de l'utilisateur** (`me`) : Récupération des informations de l'utilisateur connecté
- **Export de données** (`exportData`) : Export des données personnelles au format JSON
- **Suppression de compte** (`deleteAccount`) : Suppression définitive du compte utilisateur
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
- **Personnel** : Accès aux formations et aux formations utilisateurs (détecté via rôle "Personnel" ou permissions `api.view_userformation`, etc.)
- **Commercial** : Accès aux fonctionnalités commerciales (détecté via `is_commercial` ou rôle "Commercial")
- **Redacteur** : Accès à la rédaction d'articles (détecté via `is_redacteur` ou rôle "Redacteur")

**Routes protégées :**
- `ProtectedRoute` : Vérifie uniquement l'authentification (toutes les pages admin sauf formations)
- `PersonnelRoute` : Vérifie le rôle Personnel (pages `/admin/formations` et `/admin/user-formations`)
- `StaffRoute` : Vérifie les rôles Staff (disponible pour futures fonctionnalités)

## 🌐 Configuration

### API Backend

L'application se connecte à une API backend Django. La configuration de l'URL de l'API se fait automatiquement selon l'environnement via `src/lib/api.js` :

1. **Variables d'environnement explicites** (`VITE_API_URL`) : Priorité absolue si définie
2. **Fallback par défaut** : `https://weebbackend.melissa-mangione.com/api` si aucune variable n'est définie

**Endpoints principaux :**
- `/api/auth/*` : Authentification (login, register, logout, me, etc.)
- `/api/*` : Autres endpoints (articles, formations, messages, etc.)

**Fonctionnalités API :**
- Gestion automatique du CSRF avec récupération du token si manquant
- Support des cookies avec `credentials: "include"`
- Gestion des erreurs réseau et HTTP
- Support FormData pour les uploads
- Headers automatiques (Content-Type, X-CSRFToken)

### Internationalisation

Les traductions sont stockées dans `locales/` avec des fichiers JSON séparés par langue (fr/en) et par section :
- `home.json`, `blog.json`, `contact.json`, `formations.json`
- `header.json`, `footer.json`, `login.json`, `register.json`
- `profile.json`, `feedback.json`, `cookies.json`
- `forgot_password.json`, `reset_password.json`
- `legal.json`, `privacy.json`, `about.json`

Le `LanguageContext` gère la langue active et synchronise l'attribut `lang` du DOM. La langue par défaut est le français.

### Thème

Le thème est géré via `ThemeContext` et persiste dans `localStorage`. Les classes Tailwind s'adaptent automatiquement selon le thème sélectionné. Le thème par défaut est "dark". Le contexte synchronise l'attribut `data-theme` du DOM pour permettre des styles CSS personnalisés.

### Cookies et RGPD

La bannière de cookies (`CookieBanner`) gère le consentement RGPD avec :
- Cookies requis (toujours activés) : Authentification, sécurité
- Cookies optionnels : Analytics, préférences utilisateur
- Persistance des préférences dans un cookie avec durée de 180 jours
- Bouton de gestion accessible depuis n'importe quelle page

## 🐳 Docker

### Développement avec Docker

Le fichier `docker-compose.yml` référence actuellement `Dockerfile.dev` (non présent). Deux options :

Le fichier `docker-compose.yml` configure :
- Volume pour le code source (hot-reload avec `--watch`)
- Port 5173 exposé (host:container)
- Variables d'environnement pour le file watching (`CHOKIDAR_USEPOLLING`, `WATCHPACK_POLLING`)
- Commande : `npm run dev -- --host 0.0.0.0 --port 5173` pour exposer sur toutes les interfaces

**Note** : Le `docker-compose.yml` référence `Dockerfile.dev` mais le fichier s'appelle `Dockerfile`. Vous devrez soit :
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

## 🧪 Tests

### Tests Cypress

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
- `admin-post.cy.js` : Tests de création/modification d'articles
- `smoke.cy.js` : Tests de smoke (vérification basique des fonctionnalités principales)

**Configuration Cypress :**
- Base URL : `http://localhost:5173`
- Viewport : 1280x720
- Vidéos désactivées, screenshots activés sur échec
- Support des tests de composants React

Les fixtures de test sont dans `cypress/fixtures/` avec des données mockées pour tous les endpoints.

## 🚀 Déploiement

### Vercel

Le projet est configuré pour Vercel :

- Build command : `npm run build`
- Output directory : `dist`
- Rewrites SPA vers `/index.html`
- Rewrites `/api/*` vers `http://localhost:8000/api/*` (à ajuster pour un backend distant)

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
   - Synchronisation avec le DOM (`data-theme`)

3. **LanguageContext** (`src/context/LanguageContext.jsx`) :
   - Gestion de la langue (FR/EN)
   - Persistance dans localStorage
   - Synchronisation avec le DOM (`lang`)

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
- **Target** : ES2015 pour compatibilité navigateurs modernes
- **Chunk size warning** : Limite à 1000KB

### Gestion des erreurs

- Gestion des erreurs réseau dans `api.js`
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

Le projet inclut deux workflows GitHub Actions dans `.github/workflows/` :

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

**Configuration :**
- Utilise `cypress-io/github-action@v6`
- Node.js version 22
- Cache npm activé pour accélérer les builds

#### 2. Workflow Auto Pull Request (`create-pr.yml`)

Exécuté automatiquement sur chaque `push` vers une branche qui n'est pas `main` ou `master` :

- **Création automatique de PR** : Crée une pull request si elle n'existe pas
- **Mise à jour automatique** : Met à jour la PR existante à chaque nouveau push
- **Description automatique** : Génère la description de la PR à partir des messages de commit
- **Détection de la branche de base** : Détecte automatiquement `main` ou `master` comme branche de base

**Fonctionnalités :**
- Collecte tous les messages de commit depuis la branche de base
- Format la description avec les messages de commit
- Gère les cas où aucun commit n'est trouvé
- Utilise l'API GitHub pour créer/mettre à jour les PR

**Permissions requises :**
- `contents: write` : Pour lire le code
- `pull-requests: write` : Pour créer et mettre à jour les PR

#### Template de Pull Request

Le projet inclut un template de PR dans `.github/PULL_REQUEST_TEMPLATE.md` pour standardiser les descriptions de pull request.

---

## 🐛 Dépannage

### Problèmes courants

**L'application ne se connecte pas à l'API :**
- Vérifiez que `VITE_API_URL` est correctement défini dans `.env`
- Vérifiez que le backend est accessible et que les CORS sont configurés
- En mode développement, l'URL par défaut est `http://localhost:8000/api`

**Les cookies ne fonctionnent pas :**
- Vérifiez que vous êtes sur HTTPS en production (cookies Secure)
- Vérifiez la configuration SameSite des cookies côté backend
- Assurez-vous que le domaine du cookie correspond au domaine de l'application

**Le hot-reload ne fonctionne pas dans Docker :**
- Vérifiez que les variables `CHOKIDAR_USEPOLLING` et `WATCHPACK_POLLING` sont définies
- Vérifiez que les volumes sont correctement montés dans `docker-compose.yml`

**Les tests Cypress échouent :**
- Assurez-vous que l'application est lancée sur `http://localhost:5173`
- Vérifiez que les fixtures correspondent aux endpoints de l'API
- En mode Cypress, un token CSRF de test est automatiquement créé

**Le build échoue :**
- Vérifiez que toutes les dépendances sont installées (`npm install`)
- Vérifiez les erreurs ESLint avec `npm run lint`
- Assurez-vous d'utiliser Node.js v20 ou supérieur

## 📄 Licence

Ce projet est privé et propriétaire de Weeb.

## 👥 Contribution

Pour contribuer au projet, veuillez suivre les conventions Git et créer une branche depuis `main` avec le format `issueNumber-description`.

## 📞 Support

Pour toute question ou problème, contactez l'équipe Weeb.

---

**Développé avec ❤️ par melissa98m**
