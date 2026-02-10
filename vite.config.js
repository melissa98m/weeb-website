/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react()],
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
    projects: [{
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        },
        setupFiles: ['.storybook/vitest.setup.js']
      }
    }]
  },
  build: {
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    // Désactiver les source maps en production pour réduire la taille
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'framer-motion': ['framer-motion']
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
