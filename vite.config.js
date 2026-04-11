import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/', // User sites (username.github.io) are hosted at the root path
  plugins: [react(), tailwindcss()],
})
