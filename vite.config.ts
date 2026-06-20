import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'logo-icon.svg', 'logo-wichian.svg', 'icons.svg'],
      manifest: {
        name: 'วิเชียร QSC Audit & Franchise Standard',
        short_name: 'Wichian Audit',
        description: 'ระบบตรวจประเมินมาตรฐานคุณภาพ QSC แฟรนไชส์วิเชียรซาลาเปาและขนมจีบ',
        theme_color: '#0E5C4A',
        background_color: '#F5F1E8',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'logo-icon.svg',
            sizes: '160x160',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'logo-icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'logo-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      }
    })
  ]
})
