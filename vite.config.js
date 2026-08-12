import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// El board vive en https://alexpueblag.github.io/amalaya-board/
// (Pages de proyecto), por eso la base lleva el nombre del repo.
export default defineConfig({
  plugins: [react()],
  base: '/amalaya-board/',
})
