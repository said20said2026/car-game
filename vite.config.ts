import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'serve-static-html-pages',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === '/googleba8a8f81976877d7.html') {
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              res.end('google-site-verification: googleba8a8f81976877d7.html\n');
              return;
            }
            const cleanUrl = req.url?.split('?')[0];
            const staticPages = ['/privacy', '/terms', '/about', '/contact', '/cars', '/instructions'];
            if (cleanUrl && staticPages.includes(cleanUrl)) {
              const filePath = path.resolve(__dirname, `public${cleanUrl}.html`);
              if (fs.existsSync(filePath)) {
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.end(fs.readFileSync(filePath));
                return;
              }
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
