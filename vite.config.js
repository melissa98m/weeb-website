import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react()
  ],
  build: {
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false, // Désactiver les source maps en production pour réduire la taille
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'framer-motion': ['framer-motion'],
        },
        // Optimiser les noms de fichiers pour le cache
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 1000,
    // Optimisations supplémentaires
    // Cible plus moderne pour éviter transpilation/polyfills inutiles (Lighthouse Legacy JS)
    target: 'es2020',
    reportCompressedSize: false, // Accélère le build
  },
})
