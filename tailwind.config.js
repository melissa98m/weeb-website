/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Tokens dark mode — correspondent aux valeurs hardcodées dans le code existant.
        // Usage : bg-surface-dark, border-dark, etc.
        // Les pages existantes utilisent encore les valeurs hex directement ;
        // ces tokens sont disponibles pour tout nouveau code.
        "bg-dark":       "#121212",   // fond général dark
        "surface-dark":  "#1c1c1c",   // cartes dark
        "surface2-dark": "#262626",   // cartes admin dark
        "surface3-dark": "#2a2a2a",   // hover état dark
        "border-dark":   "#333333",   // bordures dark
        "border2-dark":  "#444444",   // bordures secondaires dark
        // Tokens light mode
        "bg-light":      "#ffffff",
        "border-light":  "#e5e7eb",   // gray-200
      },
    },
  },
  plugins: [],
}