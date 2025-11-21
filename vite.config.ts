import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // This defines a global 'process' object in the browser.
      // It prioritizes process.env.API_KEY (System/Render) over env.API_KEY (.env file)
      'process': JSON.stringify({
        env: {
          API_KEY: process.env.API_KEY || env.API_KEY || ''
        }
      })
    }
  };
});