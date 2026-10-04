module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [],
  moduleNameMapper: {
    '^react$': '<rootDir>/../../node_modules/react',
    '^react-native$': '<rootDir>/../../node_modules/react-native',
    '^@campus/api-client$': '<rootDir>/../../packages/api-client/src/index',
    '^@campus/config$': '<rootDir>/../../packages/config/src/index',
    '^@campus/design-tokens$': '<rootDir>/../../packages/design-tokens/src/index',
    '^@campus/i18n$': '<rootDir>/../../packages/i18n/src/index',
    '^@campus/logger$': '<rootDir>/../../packages/logger/src/index',
    '^@campus/ui$': '<rootDir>/../../packages/ui/src/index',
    '^@campus/features$': '<rootDir>/../../packages/features/src/index',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['<rootDir>/tests/**/*.test.ts', '<rootDir>/tests/**/*.test.tsx'],
  testPathIgnorePatterns: ['/node_modules/', '[\\\\/]tests[\\\\/]e2e[\\\\/]'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};
