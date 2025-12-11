import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/portal-lider/', // <--- NOME DO SEU REPOSITÓRIO GITHUB
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Portal do Líder - CensoPet',
        short_name: 'Líder CensoPet',
        description: 'Sistema de Sincronização de Coletas',
        theme_color: '#0f172a', // Cor escura (slate-900)
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png', // Lembre de copiar os ícones para a pasta public
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        // Cache para o Tailwind CDN e Google Fonts
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.tailwindcss\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tailwind-cdn',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          }
        ]
      }
    })
  ]
});