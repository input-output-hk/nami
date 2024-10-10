module.exports = {
  moduleNameMapper: {
    // mock out the browser version of WASM bindings with the nodejs bindings
    '@dcspark/cardano-multiplatform-lib-browser':
      '@dcspark/cardano-multiplatform-lib-nodejs',
    '^(.*)../wasm/cardano_message_signing/cardano_message_signing.generated(.*)$':
      '$1../wasm/cardano_message_signing/nodejs/cardano_message_signing.generated$2',
    // blockfrost keys
    secrets: '../../secrets.testing.js',
  },
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    `/node_modules/(?!crypto-random-string)`
  ],
  setupFilesAfterEnv: ['./jest.setup.js'],
};
