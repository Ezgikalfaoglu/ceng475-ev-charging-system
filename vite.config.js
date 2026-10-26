import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The browser talks to the Express API through this proxy during development,
// so no CORS configuration is needed. In production Express serves dist/ itself.
const apiPort = process.env.PORT || 3001;

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': `http://localhost:${apiPort}`,
    },
  },
});
