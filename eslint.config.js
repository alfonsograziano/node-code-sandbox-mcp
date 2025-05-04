// eslint.config.js

import js from '@eslint/js'; // for built‑in configs
import { FlatCompat } from '@eslint/eslintrc'; // to translate shareables
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import prettierPlugin from 'eslint-plugin-prettier';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// reproduce __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Tell FlatCompat about eslint:recommended (and eslint:all, if you ever need it)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  // --- ignore patterns ---
  {
    ignores: [
      'node_modules',
      'dist',
      '*.log',
      'coverage',
      '.env',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
      'examples',
    ],
  },

  // bring in eslint:recommended, plugin:@typescript-eslint/recommended & prettier
  ...compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ),

  // our overrides for TypeScript files
  {
    files: ['*.ts', '*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
      },
      env: {
        node: true,
        es2021: true,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
];
