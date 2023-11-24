module.exports = {
  presets: ['react-app'],
  plugins: ['@babel/transform-runtime'],
  env: {
    test: {
      presets: ['@babel/preset-env'],
    },
  },
};
