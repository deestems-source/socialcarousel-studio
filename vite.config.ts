import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import * as fs from 'fs';
import * as path from 'path';

// Custom plugin to copy static files from root to dist
const copyStaticFiles = () => {
  return {
    name: 'copy-static-files',
    closeBundle: async () => {
      const filesToCopy = ['manifest.json', 'sw.js'];
      // Fix: Use process.cwd() instead of __dirname which is not available in ESM modules
      const distDir = path.resolve((process as any).cwd(), 'dist');
      
      if (!fs.existsSync(distDir)) {
        return;
      }

      filesToCopy.forEach(file => {
        // Fix: Use process.cwd() instead of __dirname
        const src = path.resolve((process as any).cwd(), file);
        const dest = path.resolve(distDir, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
          console.log(`Copied ${file} to dist`);
        }
      });
    }
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [
      react(),
      copyStaticFiles() // Activate the file copier
    ],
    // Base must be './' for GitHub Pages to work in subdirectories
    base: './', 
    define: {
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY || env.API_KEY),
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false
    }
  };
});