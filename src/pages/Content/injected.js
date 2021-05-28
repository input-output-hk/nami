import {
  enable,
  getAddresses,
  getBalance,
  getChangeAddress,
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
  signTx: (tx) => signTx(tx),
  submitTx: (tx) => submitTx(tx),
  getUtxos: (paginate = undefined) => getUtxos(paginate),
  getAddresses: () => getAddresses(),
  getChangeAddress: () => getChangeAddress(),
  onAccountChange: (callback) => onAccountChange(callback),
};
