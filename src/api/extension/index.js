import { ERROR, STORAGE } from '../../config/config';
import provider from '../../config/provider';
import { POPUP_WINDOW } from '../../config/config';
import { mnemonicToEntropy } from 'bip39';
import cryptoRandomString from 'crypto-random-string';
const {
  BaseAddress,
  decrypt_with_password,
  encrypt_with_password,
  NetworkInfo,
  RewardAddress,
  StakeCredential,
  Bip32PrivateKey,
} = await import('@emurgo/cardano-serialization-lib-browser');

const getStorage = (key) =>
  new Promise((res, rej) =>
    chrome.storage.local.get(key, (result) => {
      if (chrome.runtime.lastError) rej(undefined);
      res(result);
    })
  );
const setStorage = (item) =>
  new Promise((res, rej) =>
    chrome.storage.local.set(item, () => {
      if (chrome.runtime.lastError) rej(chrome.runtime.lastError);
      res(true);
    })
  );

const encryptWithPassword = (password, rootKeyBytes) => {
  const rootKeyHex = Buffer.from(rootKeyBytes, 'hex').toString('hex');
  const passwordHex = Buffer.from(password).toString('hex');
  const salt = cryptoRandomString({ length: 2 * 32 });
  const nonce = cryptoRandomString({ length: 2 * 12 });
  return encrypt_with_password(passwordHex, salt, nonce, rootKeyHex);
};

const decryptWithPassword = (password, encryptedKeyHex) => {
  const passwordHex = Buffer.from(password).toString('hex');
  let decryptedHex;
  try {
    decryptedHex = decrypt_with_password(passwordHex, encryptedKeyHex);
  } catch (err) {
    throw new Error(ERROR.wrongPassword);
  }
  return decryptedHex;
};

export const getWhitelisted = async () => {
  const store = await getStorage(STORAGE.whitelisted);
  const result = store[STORAGE.whitelisted];
  return result ? result : [];
};

export const isWhitelisted = async (_origin) => {
  const whitelisted = await getWhitelisted();
  let access = false;
  if (whitelisted.includes(_origin)) access = true;
  return access;
};

export const setWhitelisted = async (_location) => {
  const whitelisted = await getWhitelisted();
  whitelisted ? whitelisted.push(_location) : (whitelisted = [_location]);
  return await setStorage({ [STORAGE.whitelisted]: whitelisted });
};

export const getBalance = async () => {
  const result = await fetch(
    provider.api.base +
      `/addresses/${'addr1qx8n3d5f2q07gsx8eqvqwl8vsl0qs2h9jj0cm96vdea03ke5zt4ppwdaw7p2ymx9umc7p0nh09yznh0n59x548a5f8ls2l0lx3'}`,
    { headers: provider.api.key }
  ).then((res) => res.json());
  const value = {};
  result.amount.forEach((asset) => (value[asset.unit] = asset.quantity));
  return value;
};

export const getCurrentAccount = async () => {};

export const createPopup = (popup) =>
  new Promise((res, rej) =>
    chrome.tabs.create(
      {
        url: chrome.runtime.getURL(popup + '.html'),
        active: false,
      },
      function (tab) {
        chrome.windows.create(
          {
            tabId: tab.id,
            type: 'popup',
            focused: true,
            ...POPUP_WINDOW,
          },
          function () {
            res(tab);
          }
        );
      }
    )
  );

export const getCurrentWebpage = () =>
  new Promise((res, rej) => {
    chrome.tabs.query(
      {
        active: true,
        lastFocusedWindow: true,
        status: 'complete',
        windowType: 'normal',
      },
      function (tabs) {
        res({ url: new URL(tabs[0].url).origin, favicon: tabs[0].favIconUrl });
      }
    );
  });

const harden = (num) => {
  return 0x80000000 + num;
};

const requestRootKey = async (password) => {
  const encryptedRootKey = await getStorage(STORAGE.encryptedKey).then(
    (store) => store[STORAGE.encryptedKey]
  );
  return Bip32PrivateKey.from_bytes(
    Buffer.from(decryptWithPassword(password, encryptedRootKey), 'hex')
  );
};

export const createAccount = async (password) => {
  const existingAccount = await getStorage(STORAGE.accounts).then(
    (store) => store[STORAGE.accounts]
  );

  const accountIndex = existingAccount
    ? Object.keys(existingAccount).length
    : 0;

  let rootKey = await requestRootKey(password);

  const accountKey = rootKey
    .derive(harden(1852)) // purpose
    .derive(harden(1815)) // coin type
    .derive(harden(accountIndex)); // account

  rootKey.free();
  rootKey = null;

  const pubKey = accountKey
    .derive(0) // external
    .derive(0)
    .to_public();

  const stakeKey = accountKey
    .derive(2) // chimeric
    .derive(0)
    .to_public();

  const paymentAddr = BaseAddress.new(
    NetworkInfo.mainnet().network_id(),
    StakeCredential.from_keyhash(pubKey.to_raw_key().hash()),
    StakeCredential.from_keyhash(stakeKey.to_raw_key().hash())
  )
    .to_address()
    .to_bech32();

  const rewardAddr = RewardAddress.new(
    NetworkInfo.mainnet().network_id(),
    StakeCredential.from_keyhash(stakeKey.to_raw_key().hash())
  )
    .to_address()
    .to_bech32();

  const newAccount = {
    0: {
      paymentAddr,
      rewardAddr,
    },
  };

  return await setStorage({ [STORAGE.accounts]: newAccount });
};

export const createWallet = async (seedPhrase, password) => {
  let entropy = mnemonicToEntropy(seedPhrase);
  const rootKey = Bip32PrivateKey.from_bip39_entropy(
    Buffer.from(entropy, 'hex'),
    Buffer.from('')
  );
  entropy = null;
  seedPhrase = null;

  const encryptedRootKey = encryptWithPassword(password, rootKey.as_bytes());

  await setStorage({ [STORAGE.encryptedKey]: encryptedRootKey });

  await createAccount(password);
  password = null;

  return true;
};

// createWallet('sdf', 'sdfs');
