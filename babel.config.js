module.exports = {
  presets: ['react-app'],
  plugins: [
    '@babel/transform-runtime',
    ['@babel/plugin-transform-private-methods', { loose: true }],
    ['@babel/plugin-transform-class-properties', { loose: true }],
    ['@babel/plugin-transform-private-property-in-object', { loose: true }],
  ],
  env: {
    test: {
      presets: ['@babel/preset-env'],
    },
  },
};
