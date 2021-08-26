export const TARGET = 'nami-wallet';
export const SENDER = { extension: 'extension', webpage: 'webpage' };
export const METHOD = {
  isWhitelisted: 'isWhitelisted',
  enable: 'enable',
  isEnabled: 'isEnabled',
  currentWebpage: 'currentWebpage',
  getNetworkId: 'getNetworkId',
  getBalance: 'getBalance',
  getDelegation: 'getDelegation',
  getUtxos: 'getUtxos',
  getRewardAddress: 'getRewardAddress',
  getAddress: 'getAddress',
  signData: 'signData',
  signTx: 'signTx',
  submitTx: 'submitTx',
  //internal
  requestData: 'requestData',
  returnData: 'returnData',
};

/*

localStorage = {
  whitelisted: [string],
  encryptedKey: encrypted string
  accounts: {
     [accountIndex]: {
      index: accountIndex,
      paymentKeyHash: cbor string,
      stakeKeyHash cbor string,
      name: string,
      mainnet: {
            lovelace: 0,
            assets: [],
            history: {},
          },
      testnet: {
            lovelace: 0,
            assets: [],
            history: {},
          },
      avatar: Math.random().toString(),
    },
  },
  currentAccount: accountIndex,
  network: {id: "mainnet" | "testnet", node: "https://blockfrost..."}
}
*/

export const STORAGE = {
  whitelisted: 'whitelisted',
  encryptedKey: 'encryptedKey',
  accounts: 'accounts',
  currentAccount: 'currentAccount',
  network: 'network',
  currency: 'currency',
  migration: 'migration',
};

export const NODE = {
  mainnet: 'https://cardano-mainnet.blockfrost.io/api/v0',
  testnet: 'https://cardano-testnet.blockfrost.io/api/v0',
};

export const NETWORK_ID = {
  mainnet: 'mainnet',
  testnet: 'testnet',
};

export const POPUP = {
  main: 'mainPopup',
  internal: 'internalPopup',
};

export const POPUP_WINDOW = {
  top: 50,
  left: 100,
  width: 400,
  height: 600,
};

export const ERROR = {
  accessDenied: 'Access denied',
  wrongPassword: 'Wrong password',
  txTooBig: 'Transaction too big',
  txNotPossible: 'Transaction not possible',
  storeNotEmpty: 'Storage key is already set',
  onlyOneAccount: 'Only one account exist in the wallet',
};

export const TX = {
  invalid_hereafter: 3600 * 2, //2h from current slot
};

export const EVENT = {
  accountChange: 'accountChange',
  networkChange: 'networkChange',
};

// Errors dApp Connector
export const APIError = {
  InvalidRequest: {
    code: -1,
    info: 'Inputs do not conform to this spec or are otherwise invalid.',
  },
  InternalError: {
    code: -2,
    info: 'An error occurred during execution of this API call.',
  },
  Refused: {
    code: -3,
    info: 'The request was refused due to lack of access - e.g. wallet disconnects.',
  },
};

export const DataSignError = {
  ProofGeneration: {
    code: 1,
    info: 'Wallet could not sign the data (e.g. does not have the secret key associated with the address).',
  },
  AddressNotPK: {
    code: 2,
    info: 'Address was not a P2PK address or Reward address and thus had no SK associated with it.',
  },
  UserDeclined: { code: 3, info: 'User declined to sign the data.' },
  InvalidFormat: {
    code: 4,
    info: 'If a wallet enforces data format requirements, this error signifies that the data did not conform to valid formats.',
  },
};

export const TxSendError = {
  Refused: {
    code: 1,
    info: 'Wallet refuses to send the tx (could be rate limiting).',
  },
  Failure: { code: 2, info: 'Wallet could not send the tx.' },
};

export const TxSignError = {
  ProofGeneration: {
    code: 1,
    info: 'User has accepted the transaction sign, but the wallet was unable to sign the transaction (e.g. not having some of the private keys).',
  },
  UserDeclined: { code: 2, info: 'User declined to sign the transaction.' },
};
