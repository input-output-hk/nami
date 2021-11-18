import { getStorage, setStorage } from '../api/extension';
import { NETWORK_ID, STORAGE } from '../config/config';

const migration = {
  version: '2.3.0',
  up: async () => {
    const accounts = await getStorage(STORAGE.accounts);
    Object.keys(accounts).forEach((accountIndex) => {
      accounts[accountIndex][NETWORK_ID.mainnet].forceUpdate = true;
      accounts[accountIndex][NETWORK_ID.testnet].forceUpdate = true;
    });
    await setStorage({ [STORAGE.accounts]: accounts });
  },
  down: async () => {},
  info: [
    {
      title: 'Seperated assets view',
      detail: 'Nami now separates collectibles/NFTs and normal assets (FTs)',
    },
    {
      title: 'Improved Coin selection',
    },
    {
      title: 'Small bug fixing',
    },
    {
      title: 'Customizable avatar for account',
    },
  ],
  pwdRequired: false,
};

export default migration;
