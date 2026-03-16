import js from '@eslint/js'
import nextPlugin from '@next/eslint-plugin-next'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  // Base config for all files
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    plugins: {
      '@typescript-eslint': typescriptEslint,
      '@next/next': nextPlugin,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Add browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        // Add Node.js globals if needed
        process: 'readonly',
        __dirname: 'readonly',
      },
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',

      // Next.js rules
      '@next/next/no-img-element': 'warn', // Set to "off" if you want to disable
      '@next/next/google-font-display': 'warn',
      '@next/next/google-font-preconnect': 'warn',

      // General rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // IGNORE PATTERNS - Add this configuration object with ONLY ignores
  {
    // Note: This object should have no other properties besides ignores
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/out/**',
      '**/build/**',
      '**/dist/**',
      '**/coverage/**',

      // Ignore the entire scripts folder or specific dist folder
      'scripts/**',
      'scripts/appwrite-backup/dist/**',
      'scripts/appwrite-backup/**/*.js',

      // Environment files
      '**/.env',
      '**/.env.*',

      // Cache files
      '**/.eslintcache',
      '**/*.tsbuildinfo',

      // Generated files
      '**/next-env.d.ts',
    ],
  },

  // Override for TypeScript files (keep source files linted)
  {
    files: ['scripts/**/*.{ts,tsx}'],
    rules: {
      // Allow require in scripts if needed
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
])
