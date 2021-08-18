module.exports = {
  moduleNameMapper: {
    // mock out the browser version of WASM bindings with the nodejs bindings
    '@emurgo/cardano-serialization-lib-browser':
      '@emurgo/cardano-serialization-lib-nodejs',
    '../../temporary_modules/@emurgo/cardano-message-signing-browser/emurgo_message_signing':
      '../../temporary_modules/@emurgo/cardano-message-signing-nodejs/emurgo_message_signing',
    // blockfrost keys
    secrets: '../../secrets.development.js',
  },
  modulePathIgnorePatterns: ['<rootDir>/temporary_modules'],
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [`/node_modules/(?!crypto-random-string)`],
  setupFilesAfterEnv: ['./jest.setup.js'],
};
