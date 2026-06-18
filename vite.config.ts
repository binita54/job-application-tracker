import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/applications': 'http://localhost:4000',
      '/health': 'http://localhost:4000'
    }
  },
  build: {
    outDir: 'dist-client'
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts'
  }
});
