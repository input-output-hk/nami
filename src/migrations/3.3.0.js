import { STORAGE } from '../config/config';
import { getStorage, setStorage } from '../api/extension/index';
import Loader from '../api/loader';

const migration = {
  version: '3.2.0',
  up: async (pwd) => {
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
    }

    await setStorage({ [STORAGE.accounts]: storage });
  },
  down: async (pwd) => {
    const storage = await getStorage(STORAGE.accounts);
    const accounts = Object.keys(storage);

    for (let i = 0; i < accounts.length; i++) {
      const currentAccount = storage[accounts[i]];
      delete currentAccount.paymentKeyHashBech32;
    }

    await setStorage({ [STORAGE.accounts]: storage });
  },
  info: [{ title: 'Vasil support' }, { title: 'Bug fixing' }],
  pwdRequired: false,
};

export default migration;
