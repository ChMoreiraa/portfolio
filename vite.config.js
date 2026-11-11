import { defineConfig } from 'vite';

export default defineConfig({
  // O Three.js vem num pedaço próprio, carregado só para a cena do topo.
  build: { chunkSizeWarningLimit: 700 },
});
