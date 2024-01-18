module.exports = {
  moduleNameMapper: {
    // mock out the browser version of WASM bindings with the nodejs bindings
    '^(.*)../wasm/cardano_multiplatform_lib/cardano_multiplatform_lib.generated(.*)$':
      '$1../wasm/cardano_multiplatform_lib/nodejs/cardano_multiplatform_lib.generated$2',
    '^(.*)../wasm/cardano_message_signing/cardano_message_signing.generated(.*)$':
      '$1../wasm/cardano_message_signing/nodejs/cardano_message_signing.generated$2',
    // blockfrost keys
    secrets: '../../secrets.testing.js',
  },
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [`/node_modules/(?!crypto-random-string)`],
  setupFilesAfterEnv: ['./jest.setup.js'],
};
