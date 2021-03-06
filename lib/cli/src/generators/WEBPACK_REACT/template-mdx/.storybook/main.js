module.exports = {
  stories: ['../stories/**/*.stories.(js|mdx)'],
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-links',
    {
      name: '@storybook/addon-docs',
      options: { configureJSX: true },
    },
  ],
  webpackFinal: async (config) => {
    // do mutation to the config

    return config;
  },
};
