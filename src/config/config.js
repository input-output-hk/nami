export const TARGET = 'cardano-wallet';
export const SENDER = { extension: 'extension', webpage: 'webpage' };
export const METHOD = {
  isWhitelisted: 'isWhitelisted',
  enable: 'enable',
  isEnabled: 'isEnabled',
  balance: 'balance',
  signTx: 'signTx',
  submitTx: 'submitTx',
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
  main: 'popup.html',
  secondary: 'popup.html',
};

export const POPUP_WINDOW = {
  top: 50,
  left: 100,
  width: 400,
  height: 700,
};

export const ERROR = {
  accessDenied: 'access denied',
};
