import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': '/src' },
  },
  define: {
    // Allow REACT_APP_ env vars for CRA compatibility
    'process.env': {},
  },
});
