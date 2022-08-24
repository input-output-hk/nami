import { NETWORK_ID, STORAGE } from '../config/config';
import { getStorage, setStorage } from '../api/extension/index';
import Loader from '../api/loader';

const migration = {
  version: '3.3.0',
  up: async (pwd) => {
    const networkDefault = {
      lovelace: null,
      minAda: 0,
      assets: [],
      history: { confirmed: [], details: {} },
    };

    await Loader.load();
    const storage = await getStorage(STORAGE.accounts);
    const accounts = Object.keys(storage);

    for (let i = 0; i < accounts.length; i++) {
      const currentAccount = storage[accounts[i]];
      const paymentKeyHash = Loader.Cardano.Ed25519KeyHash.from_bytes(
        Buffer.from(currentAccount.paymentKeyHash, 'hex')
      );
      const paymentKeyHashBech32 = paymentKeyHash.to_bech32('addr_vkh');
      currentAccount.paymentKeyHashBech32 = paymentKeyHashBech32;

      currentAccount[NETWORK_ID.preview] = {
        ...networkDefault,
        paymentAddr: currentAccount[NETWORK_ID.testnet].paymentAddr,
        rewardAddr: currentAccount[NETWORK_ID.testnet].rewardAddr,
      };

      currentAccount[NETWORK_ID.preview] = {
        ...networkDefault,
        paymentAddr: currentAccount[NETWORK_ID.testnet].paymentAddr,
        rewardAddr: currentAccount[NETWORK_ID.testnet].rewardAddr,
      };
    }

    await setStorage({ [STORAGE.accounts]: storage });
  },
  down: async (pwd) => {
    const storage = await getStorage(STORAGE.accounts);
    const accounts = Object.keys(storage);

    for (let i = 0; i < accounts.length; i++) {
      const currentAccount = storage[accounts[i]];
      delete currentAccount.paymentKeyHashBech32;

      delete currentAccount[NETWORK_ID.preview];
      delete currentAccount[NETWORK_ID.preprod];
    }

    await setStorage({ [STORAGE.accounts]: storage });
  },
  info: [
    { title: 'Vasil support' },
    { title: 'Support for new testnets: Preview and Preprod' },
    { title: 'Bug fixing' },
  ],
  pwdRequired: false,
};

export default migration;
