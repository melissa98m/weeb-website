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
12. [🔧 Conventions Git et CI/CD](#-conventions-git-et-cicd)

---

## 📖 Présentation

Weeb est une plateforme web moderne offrant :

- **Pages publiques** : Accueil, À propos, Contact, Blog, Formations, Mentions légales, Politique de confidentialité
- **Authentification** : Connexion, inscription, mot de passe oublié, réinitialisation
- **Profil utilisateur** : Gestion du profil personnel (route protégée)
- **Panneau d'administration** : Gestion des contenus (articles, formations, genres, messages, feedbacks)

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
- 🔍 **ESLint** (v9.25.0)

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
│   │   ├── Register.jsx
│   │   └── ResetPassword.jsx
│   ├── routes/              # Guards de routes (Personnel/Staff)
│   ├── utils/               # Rôles et permissions
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── .env.development
├── .env.production
├── docker-compose.yml
├── Dockerfile
├── cypress.config.js
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vercel.json
└── vite.config.js
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

- **🏠 Accueil** (`/`)
- **📖 À propos** (`/about-us`)
- **📨 Contact** (`/contact`)
- **📝 Blog** (`/blog`) + détail (`/blog/:id`)
- **📚 Formations** (`/formations`) + détail (`/formation/:id`)
- **🔐 Connexion** (`/login`) / **Inscription** (`/register`)
- **🔑 Mot de passe oublié** (`/forgot-password`) / **Reset** (`/reset-password`)
- **⚖️ Mentions légales** (`/mentions-legales`)
- **🔒 Politique de confidentialité** (`/politique-confidentialite`)

### 🔒 Pages protégées

- **👤 Profil** (`/profile`)

### 🛡️ Panneau d'administration

- **🏠 Tableau de bord** (`/admin`)
- **📝 Articles** (`/admin/articles`)
- **📚 Formations** (`/admin/formations`)
- **👥 Formations utilisateurs** (`/admin/user-formations`)
- **🏷️ Genres** (`/admin/genres`)
- **💬 Messages** (`/admin/messages`)
- **⭐ Feedbacks** (`/admin/feedbacks`)

### 🎨 Fonctionnalités transversales

- **🌗 Thème Dark/Light** (persisté en localStorage)
- **🌐 Internationalisation** (FR/EN via `locales/`)
- **📱 Responsive Design** (mobile-first)
- **⚡ Lazy Loading** (routes en `React.lazy`)
- **🔄 CSRF & cookies** (authentification via cookies)
- **🍪 Banner cookies** (consentement)

## 🔐 Authentification et rôles

### Système d'authentification

L'application utilise un système d'authentification basé sur des cookies avec protection CSRF. `AuthContext` centralise :

- Connexion (`login`)
- Inscription (`register`)
- Déconnexion (`logout`)
- Utilisateur courant (`me`)
- Mot de passe oublié / reset

### Rôles et permissions

Le système de rôles est géré via `src/utils/roles.js` :

- **Personnel** : accès aux pages formations & formations utilisateurs
- **Commercial** : accès aux pages de type staff
- **Redacteur** : accès aux pages de rédaction (articles/genres)
- **Staff/Superuser** : accès étendu (fallback côté back)

Les routes utilisent :
- `ProtectedRoute` : vérifie l'authentification
- `PersonnelRoute` : vérifie le rôle Personnel
- `StaffRoute` : disponible pour protéger des routes staff (non câblé par défaut)

Certaines pages admin appliquent en plus des contrôles de rôle côté UI.

## 🌐 Configuration

### API Backend

Le client API utilise `VITE_API_URL` si défini, sinon `http://localhost:8000/api`.

L'authentification et les actions sensibles utilisent un token CSRF récupéré via les endpoints `/auth/csrf/` ou `/csrf/`.

### Internationalisation

Les traductions sont stockées dans `locales/` avec des fichiers JSON par langue et par section.

### Thème

Le thème est géré via `ThemeContext` et persiste dans `localStorage`.

## 🐳 Docker

### Développement avec Docker

Le fichier `docker-compose.yml` référence actuellement `Dockerfile.dev` (non présent). Deux options :

- Mettre à jour `docker-compose.yml` pour utiliser `Dockerfile`
- Ou créer un `Dockerfile.dev` basé sur `Dockerfile`

### Build Docker

```bash
# Construire l'image
docker build -t weeb-website .

# Lancer le conteneur
docker run -p 5173:5173 weeb-website
```

## 🧪 Tests

### Tests Cypress

```bash
npm run cypress:open
npm run cypress:run
```

Configuration par défaut : `baseUrl` = `http://localhost:5173` (voir `cypress.config.js`).

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

Les workflows GitHub Actions dans `.github/workflows/` exécutent :

- **CI (`ci.yml`)** : build + tests Cypress
- **create-pr.yml** : création de PR

---

## 📄 Licence

Ce projet est privé et propriétaire de Weeb.

## 👥 Contribution

Pour contribuer au projet, veuillez suivre les conventions Git et créer une branche depuis `main` avec le format `issueNumber-description`.

---

**Développé avec ❤️ par melissa98m**
