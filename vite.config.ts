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
            res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
            res.setHeader('X-Frame-Options', 'SAMEORIGIN');
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
            res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
            res.setHeader(
              'Content-Security-Policy',
              "default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.google.com https://*.google-analytics.com https://*.doubleclick.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' https: data: blob:; connect-src 'self' https: wss:; frame-src 'self' https://googleads.g.doubleclick.net https://*.googlesyndication.com https://*.google.com; object-src 'none'; base-uri 'self';"
            );

            if (req.url === '/googleba8a8f81976877d7.html') {
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              res.end('google-site-verification: googleba8a8f81976877d7.html\n');
              return;
            }
            const cleanUrl = req.url?.split('?')[0];
            if (cleanUrl && cleanUrl !== '/') {
              const staticPages = ['/privacy', '/terms', '/about', '/contact', '/cars', '/instructions'];
              if (staticPages.includes(cleanUrl)) {
                const filePath = path.resolve(__dirname, `public${cleanUrl}.html`);
                if (fs.existsSync(filePath)) {
                  res.setHeader('Content-Type', 'text/html; charset=utf-8');
                  res.end(fs.readFileSync(filePath));
                  return;
                }
              }
              const publicFilePath = path.resolve(__dirname, `public${cleanUrl}`);
              if (fs.existsSync(publicFilePath) && fs.statSync(publicFilePath).isFile()) {
                const ext = path.extname(publicFilePath).toLowerCase();
                const mimes: Record<string, string> = {
                  '.jpg': 'image/jpeg',
                  '.jpeg': 'image/jpeg',
                  '.png': 'image/png',
                  '.svg': 'image/svg+xml',
                  '.ico': 'image/x-icon',
                  '.xml': 'application/xml; charset=utf-8',
                  '.txt': 'text/plain; charset=utf-8',
                  '.json': 'application/json; charset=utf-8',
                  '.html': 'text/html; charset=utf-8',
                };
                if (mimes[ext]) {
                  res.setHeader('Content-Type', mimes[ext]);
                  res.end(fs.readFileSync(publicFilePath));
                  return;
                }
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
