import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  // maplibre-gl spawns its own worker; pre-bundling breaks the worker URL
  optimizeDeps: { exclude: ['maplibre-gl'] },
})
