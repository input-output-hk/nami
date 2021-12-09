import { NETWORK_ID, STORAGE } from '../config/config';
import { getStorage, setStorage } from '../api/extension/index';
import Loader from '../api/loader';

const migration = {
  version: '2.3.3',
  up: async (pwd) => {
    await Loader.load();
    const networks = Object.keys(NETWORK_ID);
    const storage = await getStorage(STORAGE.accounts);
    const accounts = Object.keys(storage);

    for (let i = 0; i < accounts.length; i++) {
      for (let j = 0; j < networks.length; j++) {
        if (storage[accounts[i]][networks[j]]) {
          const currentAccount = storage[accounts[i]];
          const network = networks[j];
          const currentAccountNetwork = currentAccount[network];
          const paymentKeyHash = Loader.Cardano.Ed25519KeyHash.from_bytes(
            Buffer.from(currentAccount.paymentKeyHash, 'hex')
          );
          const stakeKeyHash = Loader.Cardano.Ed25519KeyHash.from_bytes(
            Buffer.from(currentAccount.stakeKeyHash, 'hex')
          );
          const paymentAddr = Loader.Cardano.BaseAddress.new(
            network === NETWORK_ID.mainnet
              ? Loader.Cardano.NetworkInfo.mainnet().network_id()
              : Loader.Cardano.NetworkInfo.testnet().network_id(),
            Loader.Cardano.StakeCredential.from_keyhash(paymentKeyHash),
            Loader.Cardano.StakeCredential.from_keyhash(stakeKeyHash)
          )
            .to_address()
            .to_bech32();

          const rewardAddr = Loader.Cardano.RewardAddress.new(
            network === NETWORK_ID.mainnet
              ? Loader.Cardano.NetworkInfo.mainnet().network_id()
              : Loader.Cardano.NetworkInfo.testnet().network_id(),
            Loader.Cardano.StakeCredential.from_keyhash(stakeKeyHash)
          )
            .to_address()
            .to_bech32();

          currentAccountNetwork.paymentAddr = paymentAddr;
          currentAccountNetwork.rewardAddr = rewardAddr;
        }
      }
    }

    await setStorage({ [STORAGE.accounts]: storage });
  },
  down: async (pwd) => {
    const networks = Object.keys(NETWORK_ID);
    const storage = await getStorage(STORAGE.accounts);
    const accounts = Object.keys(storage);

    for (let i = 0; i < accounts.length; i++) {
      for (let j = 0; j < networks.length; j++) {
        if (storage[accounts[i]][networks[j]]) {
          const currentAccount = storage[accounts[i]];
          const network = networks[j];
          const currentAccountNetwork = currentAccount[network];

          delete currentAccountNetwork.paymentAddr;
          delete currentAccountNetwork.rewardAddr;
        }
      }
    }

    await setStorage({ [STORAGE.accounts]: storage });
  },
  info: [
    { title: 'Improved Coin selection' },
    { title: 'Collateral bug fixing' },
  ],
  pwdRequired: false,
};

export default migration;
