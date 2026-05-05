import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base` defaults to `/` (works for Netlify, Vercel, root-domain hosting).
// The GitHub Pages workflow overrides it via the VITE_BASE_PATH env var
// to `/PropertyIntelligenceDashboard/` so assets resolve under the repo subpath.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? (process.env.VITE_BASE_PATH || '/') : '/',
}))
