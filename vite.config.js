import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Public visual release authorized on 2026-09-30; business data retains its existing access controls.

// El board vive en https://alexpueblag.github.io/amalaya-board/
// (Pages de proyecto), por eso la base lleva el nombre del repo.
export default defineConfig({
  plugins: [react()],
  build: { rollupOptions: { input: { main: 'index.html', recorrido: 'preview-recorrido.html', explorar: 'explorar.html' } } },
  base: '/amalaya-board/',
})
