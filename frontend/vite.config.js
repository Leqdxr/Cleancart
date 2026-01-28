/**
 * Vite Configuration
 * 
 * Build tool configuration for the React frontend
 * - Uses @vitejs/plugin-react for React support
 * - Hot module replacement (HMR) enabled
 * - Development server on default port (5173)
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
