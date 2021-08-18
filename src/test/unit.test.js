import {
  encryptWithPassword,
  decryptWithPassword,
} from '../api/extension/index';
import Loader from '../api/loader';

test('should encrypt/decrypt root key correctly', async () => {
  await Loader.load();
  const rootKey = Loader.Cardano.Bip32PrivateKey.generate_ed25519_bip32();
  const password = 'test123';
  const rootKeyBytes = rootKey.to_raw_key().as_bytes();
  const encryptedKey = await encryptWithPassword(password, rootKeyBytes);
  const decryptedKey = await decryptWithPassword(password, encryptedKey);
  expect(Buffer.from(rootKeyBytes, 'hex').toString('hex')).toBe(decryptedKey);
});
