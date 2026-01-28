/**
 * ESLint Configuration
 * 
 * Linting rules for JavaScript and JSX files
 * - Uses recommended JS rules
 * - React Hooks linting for proper hook usage
 * - React Refresh plugin for Vite HMR
 * - Ignores dist folder (build output)
 * - Custom rule: Allow unused vars starting with uppercase or underscore
 */

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']), // Ignore build output
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Allow unused variables that start with uppercase (e.g., React, Component names)
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
