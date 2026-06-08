import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const basePath = process.env.VITE_BASE_PATH?.trim()
const base = basePath ? (basePath.endsWith('/') ? basePath : `${basePath}/`) : '/'

export default defineConfig({
  plugins: [react()],
  base,
})
