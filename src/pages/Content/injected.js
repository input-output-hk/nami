import {
  enable,
  getAddresses,
  getBalance,
  getDelegation,
  getUtxos,
  isEnabled,
  onAccountChange,
  signData,
  signTx,
  submitTx,
} from '../../api/webpage';

window.cardano = {
  getBalance: () => getBalance(),
  getDelegation: () => getDelegation(),
  enable: () => enable(),
  isEnabled: () => isEnabled(),
  signData: (address, message) => signData(address, message),
  signTx: (txBody, keyHashes) => signTx(txBody, keyHashes),
  submitTx: (tx) => submitTx(tx),
  getUtxos: (paginate = undefined) => getUtxos(paginate),
  getAddresses: () => getAddresses(),
  onAccountChange: (callback) => onAccountChange(callback),
};
