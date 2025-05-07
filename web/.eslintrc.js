module.exports = {
  extends: ['next/core-web-vitals'],
  ignorePatterns: [
    'src/hooks/useGameData.ts',
    'src/hooks/__tests__/openingPipeline.test.ts'
  ],
  rules: {
    // Disable unused vars warnings for specific files
    '@typescript-eslint/no-unused-vars': 'warn',
    // Allow @ts-nocheck in test files
    '@typescript-eslint/ban-ts-comment': ['error', {
      'ts-nocheck': 'allow-with-description',
    }],
    // Allow any type in test files
    '@typescript-eslint/no-explicit-any': 'warn',
    // Fix React hooks dependencies warning
    'react-hooks/exhaustive-deps': 'warn',
    'react/no-unescaped-entities': 'warn',
  },
  overrides: [
    {
      // Apply these rules only to test files
      files: ['**/__tests__/**/*'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      }
    },
    {
      // Explicitly ignore specific files
      files: [
        'src/hooks/useGameData.ts',
        'src/hooks/__tests__/openingPipeline.test.ts'
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        'react-hooks/exhaustive-deps': 'off',
      }
    }
  ]
}; 