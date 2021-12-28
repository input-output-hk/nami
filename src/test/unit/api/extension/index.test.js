import {
  getStorage,
  encryptWithPassword,
  decryptWithPassword,
  createWallet,
  switchAccount,
  createAccount,
  setWhitelisted,
  getWhitelisted,
  getNetwork,
  setNetwork,
  getCurrentAccount,
} from '../../../../api/extension';
import Loader from '../../../../api/loader';
import { ERROR, NODE, STORAGE } from '../../../../config/config';

beforeAll(async () => {
  const seed =
    'midnight draft salt dirt woman tragic cause immense dad later jaguar finger nerve nerve sign job erase citizen cube neglect token bracket orient narrow';
  const name = 'Wallet 1';
  const password = 'password123';
  await Loader.load();
  await createWallet(name, seed, password);
});

test('storage initialized correctly', async () => {
  const store = await getStorage();
  expect(store).toHaveProperty(STORAGE.accounts);
  expect(store).toHaveProperty(STORAGE.currency);
  expect(store).toHaveProperty(STORAGE.encryptedKey);
  expect(store).toHaveProperty(STORAGE.currentAccount);
  expect(store).toHaveProperty(STORAGE.network);
  expect(Object.keys(store).length).toBe(5);
});

test('should have whitelist', async () => {
  await setWhitelisted('https://namiwallet.io');
  const store = await getStorage();
  expect(store).toHaveProperty(STORAGE.whitelisted);
  const whitelisted = await getWhitelisted();
  expect(whitelisted).toEqual(['https://namiwallet.io']);
  expect(Object.keys(store).length).toBe(6);
});

test('account structure is correct', async () => {
  const store = await getStorage();
  const account = store.accounts[store.currentAccount];
  expect(account).toHaveProperty('avatar');
  expect(account).toHaveProperty('name');
  expect(account).toHaveProperty('index');
  expect(account).toHaveProperty('paymentKeyHash');
  expect(account).toHaveProperty('stakeKeyHash');
  expect(account).toHaveProperty('mainnet');
  expect(account).toHaveProperty('testnet');
  expect(account.mainnet).toHaveProperty('lovelace');
  expect(account.mainnet).toHaveProperty('assets');
  expect(account.mainnet).toHaveProperty('history');
  expect(account.mainnet.history).toHaveProperty('confirmed');
  expect(account.mainnet.history).toHaveProperty('details');
});

test('current account should be 0', async () => {
  const currentAccount = await getStorage('currentAccount');
  expect(currentAccount).toBe(0);
});

test('current account should be 1', async () => {
  const name = 'Wallet 2';
  const password = 'password123';
  await createAccount(name, password);
  await switchAccount(1);
  const currentAccount = await getStorage('currentAccount');
  expect(currentAccount).toBe(1);
});

test('expect error because of wrong password', async () => {
  const name = 'Wallet 3';
  const password = 'password456';
  expect.assertions(1);
  try {
    const index = await createAccount(name, password);
    await switchAccount(index);
  } catch (e) {
    expect(e).toBe(ERROR.wrongPassword);
  }
});

test('expect mainnet', async () => {
  const network = await getNetwork();
  expect(network.id).toBe('mainnet');
});

test('expect testnet address', async () => {
  await setNetwork({ id: 'testnet', node: NODE.testnet });
  const account = await getCurrentAccount();
  expect(account.paymentAddr).toContain('addr_');
});

test('should encrypt/decrypt root key correctly', async () => {
  const rootKey = Loader.Cardano.Bip32PrivateKey.generate_ed25519_bip32();
  const password = 'test123';
  const rootKeyBytes = rootKey.to_raw_key().as_bytes();
  const encryptedKey = await encryptWithPassword(password, rootKeyBytes);
  expect(Buffer.from(rootKeyBytes, 'hex').toString('hex')).not.toBe(
    encryptedKey
  );
  const decryptedKey = await decryptWithPassword(password, encryptedKey);
  expect(Buffer.from(rootKeyBytes, 'hex').toString('hex')).toBe(decryptedKey);
});
