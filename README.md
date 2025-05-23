# 🚀 Weeb Website

Ce dépôt contient la première phase du site internet de l’entreprise **Weeb**, comprenant la partie vitrine : pages **Home**, **Contact** et **Login**.

## 🗂 Table des matières

1. [📖 Présentation](#-présentation)  
2. [⚙️ Stack technique](#-stack-technique)  
3. [📁 Arborescence du projet](#-arborescence-du-projet)  
4. [💾 Installation](#-installation)  
5. [🛠 Scripts disponibles](#-scripts-disponibles)  
6. [✨ Fonctionnalités](#-fonctionnalités)  
7. [🔧 Conventions Git et CI/CD](#-conventions-git-et-cicd)  

---

## 📖 Présentation

Weeb est un site vitrine moderne développé en **React**. Cette phase couvre :  
- 🏠 **Home** (`/`)  
- 📨 **Contact** (`/contact`)  
- 🔐 **Login** (`/login`)  

Le design suit les maquettes fournies par l’équipe Weeb et est mis en forme avec **Tailwind CSS** (ou CSS standard).

## ⚙️ Stack technique

- ⚛️ **React** (v19.1.0)  
- 🏎 **Vite** (v6.3.5)  
- 🎨 **Tailwind CSS** (v4.1.7)  
- 🌐 **react-router-dom** (routing)  
- 🎬 **Framer Motion** (animations)  
- 📦 **React Icons** (icônes SVG)  
- 🔍 **ESLint & Prettier** (lint & format)  
- 🤖 **GitHub Actions** (CI/CD)  

## 📁 Arborescence du projet

```text
weeb-website/
├── .github/                # Workflows CI/CD
├── locales/                # Fichiers de traduction (fr, en)
├── public/                 # Ressources statiques (favicon, images)
├── src/
│   ├── assets/             # Logos, illustrations
│   ├── components/         # Composants UI réutilisables
│   ├── context/            # ThemeContext, LanguageContext
│   ├── pages/              # Home.jsx, Contact.jsx, Login.jsx
│   ├── App.jsx             # Layout & Routes
│   └── main.jsx            # Point d’entrée
├── .gitignore               # Fichiers ignorés par Git
├── index.html               # Template HTML
├── package.json             # Dépendances & scripts
├── postcss.config.js        # PostCSS + Tailwind
├── tailwind.config.js       # Config Tailwind
├── vite.config.js           # Config Vite
└── README.md                # Ce fichier
```
💾 Installation
    
    # Cloner le dépôt
    git clone https://github.com/<votre-org>/weeb-website.git
    cd weeb-website

    # Installer les dépendances
    npm install

🛠 Scripts disponibles
| Commande          | Description                                 |
| ----------------- | ------------------------------------------- |
| `npm run dev`     | 🔄 Lancer le serveur de développement (HMR) |
| `npm run build`   | 📦 Générer le build de production           |
| `npm run preview` | 👀 Prévisualiser le build local             |
| `npm run lint`    | 🔍 Exécuter ESLint et Prettier              |

✨ Fonctionnalités

    🚀 Navigation : Routes /, /contact, /login gérées par react-router-dom.

    📬 Formulaire de contact : validation côté client (regex) et messages d’erreur contextuels.

    🔒 Page de connexion : labels multilingues, validation manuelle, effet « shake » avec Framer Motion.

    🌗 Thème Dark/Light : switch accessible, persistance dans localStorage.

    🌐 Internationalisation : gestion FR/EN par context et fichiers JSON.

    📱 Responsive : design mobile-first avec breakpoints Tailwind.

🔧 Conventions Git et CI/CD

    🌳 Branches : main (stable), issueNumber-name pour les nouvelles fonctionnalités.

    📝 Commits :

        feat: ajout de fonctionnalité

        fix: correction de bug

        style: modification de style sans impact fonctionnel


    🤖 CI/CD : workflows GitHub Actions dans .github/workflows, exécutant lint et build sur chaque PR.
