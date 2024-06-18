const config = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-webpack5-compiler-swc',
    '@storybook/addon-onboarding',
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@chromatic-com/storybook',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  webpackFinal: webPackconfig => {
    const fileLoaderRule = webPackconfig.module.rules.find(rule =>
      rule.test?.test('.svg'),
    );
    fileLoaderRule.exclude = /\.svg$/;
    webPackconfig.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            icon: true,
            exportType: 'named',
          },
        },
      ],
    });
    webPackconfig.resolve.extensions.push('.svg');
    return webPackconfig;
  },
};
export default config;
