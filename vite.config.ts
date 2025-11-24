import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 1. Load standard .env files if present
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // 2. Determine API Key with priority:
  // System Env (Render Env Vars) -> .env file -> Render Secret File
  let apiKey = process.env.API_KEY || env.API_KEY || '';

  // 3. Try reading from Render Secret Files mount point (/etc/secrets/)
  if (!apiKey) {
    try {
      // Case A: User uploaded a file named "API_KEY" containing just the key
      if (fs.existsSync('/etc/secrets/API_KEY')) {
        apiKey = fs.readFileSync('/etc/secrets/API_KEY', 'utf8').trim();
        console.log('Loaded API_KEY from /etc/secrets/API_KEY');
      } 
      // Case B: User uploaded a file named ".env" containing API_KEY=...
      else if (fs.existsSync('/etc/secrets/.env')) {
        const secretEnvContent = fs.readFileSync('/etc/secrets/.env', 'utf8');
        const match = secretEnvContent.match(/API_KEY=(.*)/);
        if (match && match[1]) {
          apiKey = match[1].trim();
          console.log('Loaded API_KEY from /etc/secrets/.env');
        }
      }
    } catch (e) {
      console.warn('Could not read secrets file:', e);
    }
  }

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    define: {
      'process.env.API_KEY': JSON.stringify(apiKey),
    }
  };
});