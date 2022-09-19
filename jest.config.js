module.exports = {
  moduleNameMapper: {
    // mock out the browser version of WASM bindings with the nodejs bindings
    '^(.*)@emurgo/cardano-multiplatform-lib-browser(.*)$':
      '$1@emurgo/cardano-multiplatform-lib-nodejs$2',
    '^(.*)@emurgo/cardano-message-signing-browser(.*)$':
      '$1@emurgo/cardano-message-signing-nodejs$2',
    // blockfrost keys
    secrets: '../../secrets.testing.js',
  },
  modulePathIgnorePatterns: ['<rootDir>/temporary_modules'],
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [`/node_modules/(?!crypto-random-string)`],
  setupFilesAfterEnv: ['./jest.setup.js'],
};
