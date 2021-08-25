import { TransactionUnspentOutput } from '@emurgo/cardano-serialization-lib-browser';
import {
  getStorage,
  encryptWithPassword,
  decryptWithPassword,
  setStorage,
  createWallet,
  createAccount,
} from '../../../api/extension';
import Loader from '../../../api/loader';
import { ERROR, NODE, STORAGE } from '../../../config/config';

const harden = (num) => {
  return 0x80000000 + num;
};

beforeAll(() => {
  const seed =
    'midnight draft salt dirt woman tragic cause immense dad later jaguar finger nerve nerve sign job erase citizen cube neglect token bracket orient narrow';
  const name = 'Wallet 1';
  const password = 'password123';
  Loader.load();
  createWallet(name, seed, password);
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
  test('should migrate correctly to 1.2.0', async () => {
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
