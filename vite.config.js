/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt"],
      manifest: {
        name: "Weeb",
        short_name: "Weeb",
        description: "Plateforme de formations et articles Weeb",
        theme_color: "#1c1c1c",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        // Exclure les assets Storybook du précache (trop lourds + inutiles en prod)
        globIgnores: ['sb-manager/**', 'sb-preview/**', '**/@storybook/**'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4 MiB fallback
        // Articles : StaleWhileRevalidate (cache + refresh en arrière-plan)
        runtimeCaching: [
          {
            urlPattern: /\/api\/articles\//,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "articles-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          // Formations : StaleWhileRevalidate
          {
            urlPattern: /\/api\/formations\//,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "formations-cache",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          // Auth / POST / WebSocket → jamais mis en cache
          {
            urlPattern: /\/api\/auth\//,
            handler: "NetworkOnly",
          },
        ],
        // Ne jamais mettre en cache les WebSockets
        navigateFallbackDenylist: [/^\/ws\//],
      },
    }),
  ],
  resolve: {
    alias: {}
  },
  optimizeDeps: {
    include: [
      '@storybook/addon-a11y/preview',
      '@storybook/react-vite',
      'storybook/test',
      'react-router-dom',
      'prop-types',
      'framer-motion'
    ]
  },
  test: {
    // Rend les API de Vitest (describe, it, expect) globales comme dans Jest
    globals: true,
    // Définit l'environnement de test pour simuler un DOM
    environment: 'jsdom',
    // Fichier à exécuter avant chaque fichier de test pour la configuration
    setupFiles: './src/setupTests.js',
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
        },
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
          setupFiles: ['.storybook/vitest.setup.js'],
        },
      },
    ],
  },
  build: {
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    // Désactiver les source maps en production pour réduire la taille
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor React — stable, long cache
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'react-vendor';
          }
          // Framer Motion — gros, rarement mis à jour
          if (id.includes('node_modules/framer-motion')) {
            return 'framer-motion';
          }
          // Recharts — admin uniquement, long cache séparé
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-') || id.includes('node_modules/victory-vendor')) {
            return 'recharts-vendor';
          }
          // Tiptap + prosemirror — admin uniquement
          if (id.includes('node_modules/@tiptap') || id.includes('node_modules/prosemirror')) {
            return 'tiptap-vendor';
          }
          // Pages et composants admin — chunk séparé (non chargé par les visiteurs)
          if (id.includes('/src/pages/admin/') || id.includes('/src/components/admin/') || id.includes('/src/layouts/AdminLayout')) {
            return 'admin';
          }
        },
        // Optimiser les noms de fichiers pour le cache
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 1000,
    // Optimisations supplémentaires
    // Cible plus moderne pour éviter transpilation/polyfills inutiles (Lighthouse Legacy JS)
    target: 'es2020',
    reportCompressedSize: false // Accélère le build
  }
});
