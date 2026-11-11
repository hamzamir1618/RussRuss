import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // three.js (the 3D rabbit) is one ~500 kB chunk, loaded on its own after the opening; that's expected
  build: { chunkSizeWarningLimit: 600 },
});
