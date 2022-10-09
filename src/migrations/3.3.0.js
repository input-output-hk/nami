import { NETWORK_ID, STORAGE } from '../config/config';
import { getStorage, setStorage } from '../api/extension/index';
import Loader from '../api/loader';
import { initTx } from '../api/extension/wallet';
import { assetsToValue } from '../api/util';

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
    const networks = Object.keys(NETWORK_ID);
    const protocolParameters = await initTx();

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

      currentAccount[NETWORK_ID.preprod] = {
        ...networkDefault,
        paymentAddr: currentAccount[NETWORK_ID.testnet].paymentAddr,
        rewardAddr: currentAccount[NETWORK_ID.testnet].rewardAddr,
      };
    }

    // add minAda
    for (let i = 0; i < accounts.length; i++) {
      for (let j = 0; j < networks.length; j++) {
        if (storage[accounts[i]][networks[j]]) {
          const currentAccountNetwork = storage[accounts[i]][networks[j]];
          let assets = currentAccountNetwork.assets;
          if (assets.length > 0) {
            const amount = await assetsToValue(assets);
            const checkOutput = Loader.Cardano.TransactionOutput.new(
              Loader.Cardano.Address.from_bech32(
                currentAccountNetwork.paymentAddr
              ),
              amount
            );
            currentAccountNetwork.minAda = Loader.Cardano.min_ada_required(
              checkOutput,
              Loader.Cardano.BigNum.from_str(
                // protocolParameters.coinsPerUtxoWord
                (4310).toString() // We hardcode this, since we don't know if Blockfrost switches PP quickly during the epoch transition
              )
            ).to_str();
          } else {
            currentAccountNetwork.minAda = 0;
          }
        }
      }
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
    { title: 'Support: Vasil era' },
    {
      title: 'Support: Mangled addresses',
      detail:
        'Nami keeps track now of all addresses with the same payment credential.',
    },
    { title: 'Support: Preview and Preprod network' },
    { title: 'Bug fixing' },
  ],
  pwdRequired: false,
};

export default migration;
