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
- **Authentification complète** : Connexion, inscription, OAuth Google, réinitialisation de mot de passe
- **Parcours de formation** : Suivi séquentiel modules → cours → QCM avec barre de progression
- **Profil utilisateur** : Tableau de bord personnel, progression formations, export RGPD, suppression de compte
- **Chat support** : Widget temps réel (WebSocket) accessible depuis toutes les pages
- **Panneau d'administration** : Interface complète
  - Analytics, exports CSV et PDF
  - Gestion des articles avec éditeur Tiptap, révisions, commentaires
  - Gestion des formations, modules et cours (M2M)
  - Tableau de bord commercial
  - Campagnes newsletter planifiées
  - Chat support admin
- **Fonctionnalités transversales** : Thème dark/light, internationalisation FR/EN, bannière de cookies RGPD, recherche globale (Ctrl+K)

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
│   │   └── chromatic.yml
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
│   │   ├── admin/
│   │   │   ├── AdminSidebar.jsx          # Navigation latérale admin
│   │   │   ├── FormationContentEditor.jsx # Éditeur modules/cours en glisser-déposer
│   │   │   ├── RichTextEditor.jsx        # Éditeur Tiptap réutilisable
│   │   │   ├── ExportCSVButton.jsx
│   │   │   └── AnalyticsCharts.jsx       # Graphiques recharts
│   │   ├── chat/
│   │   │   └── ChatWidget.jsx            # Widget chat support WebSocket
│   │   ├── Formations/
│   │   │   └── FormationModal.jsx        # Modal détail formation + progression
│   │   ├── profile/
│   │   │   └── TrainingItem.jsx          # Carte formation avec progression
│   │   ├── About/, Blog/, Contact/, Home/, Icon/, ui/
│   │   ├── CookieBanner.jsx
│   │   ├── Footer.jsx
│   │   ├── Header.jsx                    # Barre de recherche Ctrl+K
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   ├── AuthContext.jsx               # Auth JWT + OAuth Google
│   │   ├── ChatContext.jsx               # État global chat support
│   │   ├── ThemeContext.jsx              # Dark/light
│   │   └── LanguageContext.jsx           # FR/EN
│   ├── layouts/
│   │   └── AdminLayout.jsx
│   ├── lib/
│   │   ├── api.js                        # Client HTTP + CSRF
│   │   └── env.js
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminHome.jsx             # Analytics + exports CSV
│   │   │   ├── AdminChatPanel.jsx        # Gestion chat support
│   │   │   ├── AnalyticsPage.jsx
│   │   │   ├── ArticlesManager.jsx
│   │   │   ├── CommercialDashboard.jsx   # Tableau de bord commercial
│   │   │   ├── ContenuManager.jsx        # Gestion modules et cours (M2M)
│   │   │   ├── FormationsManager.jsx
│   │   │   ├── GenresManager.jsx
│   │   │   ├── NewsletterManager.jsx
│   │   │   └── PersonnelFormationAdmin.jsx
│   │   ├── About.jsx
│   │   ├── Blog.jsx
│   │   ├── BlogDetail.jsx               # Rendu HTML Tiptap + tracking lecture
│   │   ├── Contact.jsx
│   │   ├── Feedbacks.jsx
│   │   ├── FormationParcours.jsx         # Parcours séquentiel modules→cours→QCM
│   │   ├── Formations.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── Home.jsx
│   │   ├── Legal.jsx
│   │   ├── Login.jsx
│   │   ├── Messages.jsx
│   │   ├── Privacy.jsx
│   │   ├── Profile.jsx                  # Profil + tableau de bord + progression
│   │   ├── Register.jsx
│   │   ├── ResetPassword.jsx
│   │   └── SearchResults.jsx
│   ├── routes/
│   │   ├── PersonnelRoute.jsx
│   │   ├── RedactionRoute.jsx
│   │   └── StaffRoute.jsx
│   ├── utils/
│   │   └── roles.js                     # hasPersonnelRole, hasAnyStaffRole…
│   ├── App.jsx                          # Routing SPA complet
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── .env
├── cypress.config.js
├── docker-compose.yml
├── Dockerfile
├── eslint.config.js
├── index.html
├── package.json
├── vercel.json
└── vite.config.js
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
VITE_GOOGLE_CLIENT_ID=__votre_google_client_id__
VITE_OAUTH_GITHUB_URL=http://localhost:8000/api/auth/oauth/github/
```

- `VITE_API_URL` : URL du backend Django. **Si non défini**, l'app utilise par défaut `https://weebbackend.melissa-mangione.com/api`.
- `VITE_SENTRY_DSN` : DSN Sentry. **Si défini en production**, active le reporting d'erreurs et les traces/replays.
- `VITE_GOOGLE_CLIENT_ID` : Client ID Google OAuth. **Si défini**, le bouton Google apparaît sur `/login` et envoie un `id_token` au backend.
- `VITE_OAUTH_GITHUB_URL` : URL de démarrage OAuth GitHub. **Si définie**, un bouton GitHub apparaît sur `/login`.

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
- **📄 Détail article** (`/blog/:id`) : Rendu HTML Tiptap + tracking lecture + likes + commentaires
- **📚 Formations** (`/formations`) : Catalogue des formations disponibles avec modal de détail
- **🪟 Détail formation** (`/formation/:id`) : Modal formation — description, progression (si inscrit)
- **🔍 Résultats de recherche** (`/search?q=`) : Recherche globale articles + formations
- **🔐 Connexion** (`/login`) : Connexion identifiants ou OAuth Google
- **📝 Inscription** (`/register`) : Création de compte
- **🔑 Mot de passe oublié** (`/forgot-password`) : Demande de réinitialisation
- **🔄 Réinitialisation** (`/reset-password`) : Réinitialisation avec token
- **⚖️ Mentions légales** (`/legal-notices`)
- **🔒 Politique de confidentialité** (`/privacy-policy`)

### 🔒 Pages protégées (IsAuthenticated)

- **👤 Profil** (`/profile`) :
  - Informations personnelles, formations suivies avec progression %
  - Bouton "Continuer →" par formation, feedback post-formation (100% requis)
  - Export données RGPD, suppression de compte
- **🎓 Parcours de formation** (`/formation/:id/learn`) :
  - Navigation séquentielle modules → cours → QCM
  - Sidebar de navigation, barre de progression globale
  - Validation QCM requise pour débloquer le module suivant

### 🛡️ Panneau d'administration

- **🏠 Tableau de bord** (`/admin`) : Analytics recharts + exports CSV *(ProtectedRoute)*
- **📝 Articles** (`/admin/articles`) : CRUD Tiptap, révisions, modération *(Redaction)*
- **🏷️ Genres** (`/admin/genres`) *(Redaction)*
- **📚 Formations** (`/admin/formations`) : CRUD + éditeur de contenu inline *(Personnel)*
- **📖 Contenu** (`/admin/content`) : Gestion globale modules et cours M2M *(Personnel)*
- **👥 Formations utilisateurs** (`/admin/user-formations`) *(Personnel)*
- **💼 Commercial** (`/admin/commercial`) : KPIs, revenus, conversion *(Staff)*
- **💬 Messages** (`/admin/messages`) *(Staff)*
- **⭐ Feedbacks** (`/admin/feedbacks`) *(Staff)*
- **📊 Analytiques** (`/admin/analytics`) *(Staff)*
- **📧 Newsletter** (`/admin/newsletter`) : Campagnes planifiées (Celery Beat) *(Staff)*
- **💬 Chat support** (`/admin/chat`) : Panel agent, historique salles *(Staff)*

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
- **🔍 Recherche globale** : Barre de recherche `SearchBar` (raccourci Ctrl+K sur desktop), résultats articles + formations en temps réel
- **📊 Tableau de bord personnel** : Section "Mon tableau de bord" dans `/profile` avec stats de lecture et timeline des formations (`DashboardStats`)
- **📤 Exports CSV** : Export des inscrits, feedbacks et messages depuis l'admin (`ExportCSVButton`)
- **📈 Analytics admin** : Graphiques recharts (BarChart + PieChart) dans `AdminHome` via `AnalyticsCharts`

## 🔐 Authentification et rôles

### Système d'authentification

L'application utilise un système d'authentification basé sur des cookies avec protection CSRF. `AuthContext` centralise :

- **Connexion** (`login`) : Accepte email/username/identifier + password, pose les cookies, puis charge `/me`
- **Connexion OAuth Google** : Optionnelle via Google Identity, puis appel backend `POST /auth/oauth/google/` avec `id_token`
- **Connexion OAuth GitHub** : Optionnelle via URL provider configurée dans les variables d'environnement
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
- `ProtectedRoute` : Authentification uniquement (profil, parcours formation, admin)
- `PersonnelRoute` : Rôle Personnel (formations, contenu, user-formations)
- `RedactionRoute` : Rôle Rédacteur (articles, genres)
- `StaffRoute` : Tout rôle staff (feedbacks, messages, analytics, commercial, newsletter, chat)

## 🧪 Tests

### Vitest (unitaires / composants)

```bash
npm test
```

- Environnement `jsdom`
- Configuration globale via `src/setupTests.js`
- Tests présents dans `src/**` (pages, composants UI, admin, etc.)
 - Projets Vitest :
   - `unit` : tests unitaires / composants
   - `storybook` : tests de stories (Playwright headless)

Lancer un projet précis :

```bash
# Uniquement les tests unitaires / composants
npm test -- --run --project unit

# Uniquement les tests Storybook
npm test -- --run --project storybook
```

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
- Accès Storybook via Chromatic : [ouvrir le Storybook](https://www.chromatic.com/start?inviteToken=chpi_7ebbdf44267c454586cd6765a5d5d914&appId=698af9b0621aabc16621b40c)

## 🐳 Docker

### Développement avec Docker Compose

Le fichier `docker-compose.yml` configure :
- Volume pour le code source (hot-reload)
- Port 5173 exposé (host:container)
- Variables d'environnement pour le file watching (`CHOKIDAR_USEPOLLING`, `WATCHPACK_POLLING`)
- Commande : `npm run dev -- --host 0.0.0.0 --port 5173`

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

L'application utilise quatre contextes principaux :

1. **AuthContext** (`src/context/AuthContext.jsx`) :
   - Gestion de l'état d'authentification JWT HttpOnly
   - Méthodes : `login`, `register`, `logout`, `reload`
   - OAuth Google (`id_token` → backend `POST /auth/oauth/google/`)
   - Initialisation intelligente avec idle callback

2. **ChatContext** (`src/context/ChatContext.jsx`) :
   - Connexion WebSocket au chat support
   - État des messages non lus, salle active
   - `ChatWidget` disponible sur toutes les pages via `App.jsx`

3. **ThemeContext** (`src/context/ThemeContext.jsx`) :
   - Thème dark/light avec persistance localStorage
   - Synchronisation DOM (`class` + `data-theme`)

4. **LanguageContext** (`src/context/LanguageContext.jsx`) :
   - Langue FR/EN avec persistance localStorage
   - Synchronisation DOM (`lang` + `data-lang`)

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

#### 3. Workflow Chromatic (`chromatic.yml`)

Exécuté automatiquement sur chaque `push` :

- **Build + déploiement Storybook** : via Chromatic (action `chromaui/action`)

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
