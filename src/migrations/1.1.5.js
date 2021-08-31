import { STORAGE, NETWORK_ID } from '../config/config';
import { getStorage, setStorage, updateBalance } from '../api/extension/index';
import { initTx } from '../api/extension/wallet';
import Loader from '../api/loader';
import { assetsToValue } from '../api/util';

const migration = {
  version: '1.1.5',
  up: async (pwd) => {
    await Loader.load();
    const protocolParameters = await initTx();
    const networks = Object.keys(NETWORK_ID);
    let storage = await getStorage(STORAGE.accounts);
    const accounts = Object.keys(storage);

    for (let i = 0; i < accounts.length; i++) {
      for (let j = 0; j < networks.length; j++) {
        if (storage[accounts[i]][networks[j]]) {
          const currentAccountNetwork = storage[accounts[i]][networks[j]];
          let assets = currentAccountNetwork.assets;
          if (assets.length > 0) {
            const amount = await assetsToValue(assets);
            const minAda = Loader.Cardano.min_ada_required(
              amount,
              Loader.Cardano.BigNum.from_str(protocolParameters.minUtxo)
            ).to_str();
            currentAccountNetwork.minAda = minAda;
          } else {
            currentAccountNetwork.minAda = 0;
          }
        }
      }
    }
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
  ],
  pwdRequired: false,
};

export default migration;
