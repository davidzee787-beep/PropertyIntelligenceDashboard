import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base` matches the GitHub Pages path (repo name) only in production builds.
// Dev still runs at `/` so http://localhost:5173 keeps working.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/PropertyIntelligenceDashboard/' : '/',
}))
