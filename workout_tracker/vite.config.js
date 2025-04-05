// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // This tells Vite to listen on all local IPs (like 0.0.0.0)
    // OR you can use: host: '0.0.0.0',
    port: 5173 // Optional: You can explicitly set the port here too
  }
})