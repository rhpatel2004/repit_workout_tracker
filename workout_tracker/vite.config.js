// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'; // Import the plugin

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({ // Add the VitePWA plugin configuration
      registerType: 'autoUpdate', // Automatically update the service worker
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'], // Add other static assets you want cached
      manifest: {
        // --- Essential Manifest Properties ---
        name: 'RepIt Workout Tracker', // Full name of your app
        short_name: 'RepIt', // Short name for home screen icon
        description: 'Your ultimate workout tracking companion.', // App description
        theme_color: '#0D47A1', // Your main theme color (dark blue)
        background_color: '#ffffff', // Background color for splash screen (white)
        display: 'standalone', // Makes it feel like a native app (no browser UI)
        scope: '/', // The scope of URLs the PWA controls
        start_url: '/workout', // The page that opens when the app is launched

        // --- Icons ---
        // You NEED to create these icon files and place them in the 'public' folder
        icons: [
          {
            src: 'repit-icon-192.jpg', // Path relative to the 'public' folder
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable' // 'any' or 'maskable' or both
          },
          {
            src: 'repit-icon-512.jpg',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          // Add more sizes if needed (e.g., 64x64, 144x144)
        ],
      },
      // Optional: Service Worker configuration (for offline, etc.)
      // workbox: {
      //   globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      // }
    })
  ],
  // ... your existing server proxy config (if you added it back) ...
  // server: {
  //   proxy: {
  //     '/api': {
  //       target: 'http://localhost:3001',
  //       changeOrigin: true,
  //     },
  //   },
  // },
});