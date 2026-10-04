import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/storybook-static/**',
      '**/.expo/**',
      '.turbo/**',
      'backend/**',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': 'error',
    },
  },
  {
    files: [
      'packages/ui/src/**/*.ts',
      'packages/ui/src/**/*.tsx',
      'packages/features/**/*.ts',
      'packages/features/**/*.tsx',
      'apps/app/src/**/*.ts',
      'apps/app/src/**/*.tsx',
      'apps/app/app/**/*.ts',
      'apps/app/app/**/*.tsx',
    ],
    ignores: [
      '**/tokens/**',
      '**/design-tokens/**',
    ],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "Literal[value=/.*(#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|rgb\\(|hsl\\().*/]",
          message:
            'Raw color literals (hex 3, 4, 6, 8 digits, rgb, hsl) are prohibited in UI components. Use design tokens from @campus/design-tokens.',
        },
        {
          selector:
            "Property[key.name=/^(width|height|minWidth|minHeight|maxWidth|maxHeight|padding|paddingTop|paddingBottom|paddingLeft|paddingRight|paddingHorizontal|paddingVertical|margin|marginTop|marginBottom|marginLeft|marginRight|marginHorizontal|marginVertical|fontSize|borderRadius|gap|top|bottom|left|right)$/][value.type='Literal'][value.raw=/^[0-9]+$/]",
          message:
            'Raw numeric size values are prohibited in UI components. Use spacing, typography, radius, or layout tokens from @campus/design-tokens.',
        },
      ],
    },
  },
  {
    files: [
      'packages/ui/tests/fixtures/**/*.ts',
      'packages/ui/tests/fixtures/**/*.tsx',
    ],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "Literal[value=/.*(#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|rgb\\(|hsl\\().*/]",
          message:
            'Raw color literals (hex 3, 4, 6, 8 digits, rgb, hsl) are prohibited in UI components. Use design tokens from @campus/design-tokens.',
        },
        {
          selector:
            "Property[key.name=/^(width|height|minWidth|minHeight|maxWidth|maxHeight|padding|paddingTop|paddingBottom|paddingLeft|paddingRight|paddingHorizontal|paddingVertical|margin|marginTop|marginBottom|marginLeft|marginRight|marginHorizontal|marginVertical|fontSize|borderRadius|gap|top|bottom|left|right)$/][value.type='Literal'][value.raw=/^[0-9]+$/]",
          message:
            'Raw numeric size values are prohibited in UI components. Use spacing, typography, radius, or layout tokens from @campus/design-tokens.',
        },
      ],
    },
  },
];
