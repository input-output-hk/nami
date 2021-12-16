import {
  getStorage,
  decryptWithPassword,
  setStorage,
  createWallet,
  createAccount,
} from '../../../api/extension';
import { initTx } from '../../../api/extension/wallet';
import Loader from '../../../api/loader';
import { assetsToValue } from '../../../api/util';
import { ERROR, NETWORK_ID, NODE, STORAGE } from '../../../config/config';

const harden = (num) => {
  return 0x80000000 + num;
};

beforeAll(async () => {
  const seed =
    'midnight draft salt dirt woman tragic cause immense dad later jaguar finger nerve nerve sign job erase citizen cube neglect token bracket orient narrow';
  const name = 'Wallet 1';
  const password = 'password123';
  await Loader.load();
  await createWallet(name, seed, password);
  await createAccount('Wallet 2', password);
  await createAccount('Wallet 3', password);
  let accounts = await getStorage(STORAGE.accounts);
  for (const accountIndex in accounts) {
    const account = accounts[accountIndex];
    account.mainnet = {
      ...account.mainnet,
      lovelace: Math.floor(Math.random() * 10000000).toString(),
      assets: [
        {
          unit: '0996b4e1e1fef04e29d9ea3c4282e011ddb1263513c7bd2ddac2fff9012',
          quantity: Math.floor(Math.random() * 1000).toString(),
        },
      ],
    };
    //test account function from 1.1.4 without minAda
    delete account.mainnet.minAda;
    delete account.testnet.minAda;
  }
  await setStorage({ [STORAGE.accounts]: accounts });
});

describe('no migration', () => {
  test('no migration', () => {});
});
