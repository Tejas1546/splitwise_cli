import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default [
  {
    // Ignore these directories
    ignores: [
      'node_modules',
      'coverage',
      '.husky',
      'playwright-report',
      'test-results',
      'assets',
      'dist',
      'src/core/storage',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // You can add overrides here if the linter is too strict
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
];
