import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // This defines a global 'process' object in the browser with the env vars we need.
      // This fixes "Uncaught ReferenceError: process is not defined".
      'process': JSON.stringify({
        env: {
          API_KEY: env.API_KEY || ''
        }
      })
    }
  };
});