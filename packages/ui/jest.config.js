module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [],
  moduleNameMapper: {
    '^react$': '<rootDir>/../../node_modules/react',
    '^react-native$': '<rootDir>/../../node_modules/react-native',
    '^@campus/design-tokens$': '<rootDir>/../design-tokens/src/index',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/dist/'],
};
