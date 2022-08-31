const { mergeConfig } = require('vite');

/** @type {import('@storybook/builder-vite').StorybookViteConfig} */
module.exports = {
  stories: ['../src/**/*.stories.svelte'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-svelte-csf',
  ],
  framework: '@storybook/svelte',
  core: { builder: '@storybook/builder-vite' },
  svelteOptions: async () => (await import('../svelte.config.js')).default,
  viteFinal: async (storybookConfig) => {
    const config = mergeConfig((await import('../vite.config.js')).commonConfig, storybookConfig);
    // Waiting for https://github.com/storybookjs/builder-vite/issues/419 to be fixed
    config.plugins = config.plugins.filter((plugin) => plugin.name !== 'svelte-docgen');
    return config;
  },
};
