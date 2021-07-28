import {
  enable,
  getAddress,
  getBalance,
  getNetworkId,
  getRewardAddress,
  getUtxos,
  isEnabled,
  onAccountChange,
  onNetworkChange,
  signData,
  signTx,
  submitTx,
} from '../../api/webpage';

//dApp connector API follows https://github.com/cardano-foundation/CIPs/pull/88

// ORIGINAL

// window.cardano = {
//   cardano_request_read_access: () => enable(),
//   cardano_check_read_access: () => isEnabled(),
//   get_balance: () => getBalance(),
//   sign_data: (address, sigStructure) => signData(address, sigStructure),
//   sign_tx: (tx) => signTx(tx),
//   submit_tx: (tx) => submitTx(tx),
//   get_utxos: (amount, paginate) => getUtxos(amount, paginate),
//   get_used_addresses: async () => [await getAddress()],
//   get_unused_addresses: () => [],
//   get_change_address: () => getAddress(),
//   on_account_change: (callback) => onAccountChange(callback),
// };

//PROPOSED

window.cardano = {
  enable: () => enable(),
  isEnabled: () => isEnabled(),
  getBalance: () => getBalance(),
  signData: (address, payload) => signData(address, payload),
  signTx: (tx, partialSign) => signTx(tx, partialSign),
  submitTx: (tx) => submitTx(tx),
  getUtxos: (amount, paginate) => getUtxos(amount, paginate),
  getUsedAddresses: async () => [await getAddress()],
  getUnusedAddresses: async () => [],
  getChangeAddress: () => getAddress(),
  getRewardAddress: () => getRewardAddress(),
  getNetworkId: () => getNetworkId(),
  onAccountChange: (callback) => onAccountChange(callback),
  onNetworkChange: (callback) => onNetworkChange(callback),
};
