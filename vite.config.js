import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync } from 'node:fs'
if (process.env.GITHUB_ACTIONS && existsSync('public/levantamiento')) throw new Error('El levantamiento privado no puede publicarse en Pages.')

// El board vive en https://alexpueblag.github.io/amalaya-board/
// (Pages de proyecto), por eso la base lleva el nombre del repo.
export default defineConfig({
  plugins: [react()],
  build: { rollupOptions: { input: { main: 'index.html', recorrido: 'preview-recorrido.html' } } },
  base: '/amalaya-board/',
})
