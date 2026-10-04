const path = require('path');

module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(config) {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          'react-native': 'react-native-web',
          '@campus/design-tokens': path.resolve(__dirname, '../../design-tokens/src/index.ts'),
          '@campus/config': path.resolve(__dirname, '../../config/src/index.ts'),
        },
      },
    };
  },
};
