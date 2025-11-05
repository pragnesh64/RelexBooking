import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

// Check if HTTPS certificates exist
const httpsConfig = (() => {
  try {
    const keyPath = path.resolve(__dirname, 'localhost-key.pem')
    const certPath = path.resolve(__dirname, 'localhost.pem')

    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      return {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      }
    }
  } catch (err) {
    console.log('HTTPS certificates not found, running in HTTP mode')
  }
  return undefined
})()

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    https: httpsConfig,
    host: true, // Listen on all addresses including network
  },
})
