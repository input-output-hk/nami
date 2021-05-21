export const TARGET = 'cardano-wallet';
export const SENDER = { extension: 'extension', webpage: 'webpage' };
export const METHOD = {
  isWhitelisted: 'isWhitelisted',
  enable: 'enable',
  isEnabled: 'isEnabled',
  currentWebpage: 'currentWebpage',
  getBalance: 'getBalance',
  getDelegation: 'getDelegation',
  getUtxos: 'getUtxos',
  getAddresses: 'getAddresses',
  signData: 'signData',
  signTx: 'signTx',
  submitTx: 'submitTx',
  //internal
  requestData: 'requestData',
  returnData: 'returnData',
};

export const STORAGE = {
  whitelisted: 'whitelisted',
  encryptedKey: 'encryptedKey',
  accounts: 'accounts',
  currentAccount: 'currentAccount',
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
  signatureDenied: 'Signature denied',
  storeNotEmpty: 'Storage key is already set',
  noKeyHash: 'No key hash could be generated',
  txFailed: 'Tx failed',
};

export const ROUTE = {
  wallet: '/wallet',
  welcome: '/welcome',
  createWallet: '/createWallet',
  signData: '/signData',
  signTx: '/signTx',
  enable: '/enable',
};

export const EVENT = {
  txConfirmation: 'txConfirmation',
  accountChange: 'accountChange',
};
