import {
  enable,
  getAddress,
  getBalance,
  getUtxos,
  isEnabled,
  onAccountChange,
  signData,
  signTx,
  submitTx,
} from '../../api/webpage';

window.cardano_request_read_access = async () => {
  if (await enable()) {
    window.cardano = {
      get_balance: () => getBalance(),
      sign_data: (address, sigStructure) => signData(address, sigStructure),
      sign_tx: (tx) => signTx(tx),
      submit_tx: (tx) => submitTx(tx),
      get_utxos: (amount, paginate) => getUtxos(amount, paginate),
      get_used_addresses: async () => [await getAddress()],
      get_unused_addresses: () => [],
      get_change_address: async () => [await getAddress()],
      on_account_change: (callback) => onAccountChange(callback),
    };
    return true;
  }
  return false;
};

window.cardano_check_read_access = () => isEnabled();
