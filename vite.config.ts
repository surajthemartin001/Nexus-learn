import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { viteApiPlugin } from './src/server/viteApiPlugin';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      viteApiPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg', 'manifest.webmanifest'],
        manifest: {
          id: '/',
          name: 'NEXUS Learn - AI Study & Learning Hub',
          short_name: 'NEXUS Learn',
          description: 'Personalized AI-powered institute-grade learning ecosystem, digital notebook, practice platform, and mastery tracker.',
          theme_color: '#090d16',
          background_color: '#090d16',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/icon.svg',
              sizes: '192x192 512x512',
              type: 'image/svg+xml',
              purpose: 'any',
            },
          ],
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
