module.exports = {
  presets: ['react-app'],
  plugins: ['react-hot-loader/babel', '@babel/transform-runtime'],
  env: {
    test: {
      presets: ['@babel/preset-env'],
    },
  },
};
