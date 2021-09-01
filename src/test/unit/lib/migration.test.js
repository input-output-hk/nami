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

describe('make migration from 1.1.3 to 1.2.0', () => {
  test('accounts are initilized correctly in 1.1.3', async () => {
    const store = await getStorage();
    const account = store.accounts[store.currentAccount];
    expect(account).toHaveProperty('avatar');
    expect(account).toHaveProperty('name');
    expect(account).toHaveProperty('index');
    expect(account).toHaveProperty('paymentKeyHash');
    expect(account).toHaveProperty('stakeKeyHash');
    expect(account).toHaveProperty('mainnet');
    expect(account).toHaveProperty('testnet');
    expect(Object.keys(account).length).toBe(7);
  });

  test('should migrate correctly to 1.1.5 - adding minAda', async () => {
    const protocolParameters = await initTx();
    const networks = Object.keys(NETWORK_ID);
    const storage = await getStorage(STORAGE.accounts);
    const storageOld = JSON.parse(JSON.stringify(storage));
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
    const newStorage = await getStorage(STORAGE.accounts);
    for (const accountIndex in newStorage) {
      const oldAccount = storageOld[accountIndex];
      const account = newStorage[accountIndex];
      expect(oldAccount.mainnet).not.toHaveProperty('minAda');
      expect(oldAccount.testnet).not.toHaveProperty('minAda');
      expect(account.mainnet).toHaveProperty('minAda');
      expect(account.testnet).toHaveProperty('minAda');
      expect(oldAccount.mainnet.lovelace).toBe(account.mainnet.lovelace);
      expect(oldAccount.testnet.lovelace).toBe(account.testnet.lovelace);
      expect(JSON.stringify(oldAccount.mainnet.assets)).toEqual(
        JSON.stringify(account.mainnet.assets)
      );
      expect(JSON.stringify(oldAccount.testnet.assets)).toEqual(
        JSON.stringify(account.testnet.assets)
      );
    }
  });

  test('should migrate correctly to 1.1.5 - adding publicKey', async () => {
    await createAccount('Wallet 2', 'password123');
    await createAccount('Wallet 3', 'password123');
    const store = await getStorage();
    const encryptedKey = store.encryptedKey;
    const decryptedKey = await decryptWithPassword('password123', encryptedKey);
    const privateKey = Loader.Cardano.Bip32PrivateKey.from_bytes(
      Buffer.from(decryptedKey, 'hex')
    );

    Object.keys(store.accounts).forEach(async (index) => {
      const account = store.accounts[index];
      account.publicKey = Buffer.from(
        privateKey
          .derive(harden(1852))
          .derive(harden(1815))
          .derive(harden(parseInt(account.index)))
          .to_public()
          .as_bytes()
      ).toString('hex');
    });
    await setStorage({ [STORAGE.accounts]: store.accounts });
    const newStore = await getStorage();
    Object.keys(newStore.accounts).forEach((index) => {
      expect(newStore.accounts[index]).toHaveProperty('publicKey');
      expect(typeof newStore.accounts[index].publicKey).toBe('string');
      expect(Object.keys(newStore.accounts[index]).length).toBe(8);
    });
  });
});
