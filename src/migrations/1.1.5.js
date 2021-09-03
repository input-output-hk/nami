import { NETWORK_ID, STORAGE } from '../config/config';
import {
  decryptWithPassword,
  getStorage,
  setStorage,
} from '../api/extension/index';
import { initTx } from '../api/extension/wallet';
import Loader from '../api/loader';
import { assetsToValue } from '../api/util';

const harden = (num) => {
  return 0x80000000 + num;
};

const migration = {
  version: '1.1.5',
  up: async (pwd) => {
    await Loader.load();
    const protocolParameters = await initTx();
    const networks = Object.keys(NETWORK_ID);
    const storage = await getStorage(STORAGE.accounts);
    const accounts = Object.keys(storage);

    // add minAda
    for (let i = 0; i < accounts.length; i++) {
      for (let j = 0; j < networks.length; j++) {
        if (storage[accounts[i]][networks[j]]) {
          const currentAccountNetwork = storage[accounts[i]][networks[j]];
          let assets = currentAccountNetwork.assets;
          if (assets.length > 0) {
            const amount = await assetsToValue(assets);
            currentAccountNetwork.minAda = Loader.Cardano.min_ada_required(
              amount,
              Loader.Cardano.BigNum.from_str(protocolParameters.minUtxo)
            ).to_str();
          } else {
            currentAccountNetwork.minAda = 0;
          }
        }
      }
    }

    //add public key
    const encryptedKey = await getStorage(STORAGE.encryptedKey);
    const decryptedKey = await decryptWithPassword(pwd, encryptedKey);
    let privateKey = Loader.Cardano.Bip32PrivateKey.from_bytes(
      Buffer.from(decryptedKey, 'hex')
    );

    Object.keys(storage).forEach(async (index) => {
      const account = storage[index];
      account.publicKey = Buffer.from(
        privateKey
          .derive(harden(1852))
          .derive(harden(1815))
          .derive(harden(parseInt(account.index)))
          .to_public()
          .as_bytes()
      ).toString('hex');
    });

    privateKey.free();
    privateKey = null;

    await setStorage({ [STORAGE.accounts]: storage });
  },
  down: async (pwd) => {
    const networks = Object.keys(NETWORK_ID);
    let storage = await getStorage(STORAGE.accounts);
    const accounts = Object.keys(storage);

    for (let i = 0; i < accounts.length; i++) {
      for (let j = 0; j < networks.length; j++) {
        if (
          storage[accounts[i]][networks[j]] &&
          storage[accounts[i]][networks[j]].minAda
        ) {
          delete storage[accounts[i]][networks[j]].minAda;
        }
      }
    }
    await setStorage({ [STORAGE.accounts]: storage });
  },
  info: [
    {
      title: 'Show only spendable Ada',
      detail:
        'In previous version, the wallet was showing the complete Ada balance. This lead the user to think that all Ada were available for spending. Native Assets (ie: NFT) require a small amount of Ada to be locked with them at all time. Locked Ada are now hidden.',
    },
    {
      title: 'Bug fix: Inconsistent Balance',
      detail:
        'Balance was reported many times to be out of sync. The wallet now tries to fetch the balance until it succeeds.',
    },
    {
      title: 'Bug fix: CoinSelection',
      detail:
        'The underlying algorithm managing UTxO set was behaving inconsistently, making it impossible to send out certain asset amounts.',
    },
  ],
  pwdRequired: true,
};

export default migration;
