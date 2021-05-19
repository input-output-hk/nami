import { ERROR, STORAGE } from '../../config/config';
import provider from '../../config/provider';
import { POPUP_WINDOW } from '../../config/config';
import { mnemonicToEntropy } from 'bip39';
import cryptoRandomString from 'crypto-random-string';
import randomColor from 'randomcolor';
import Loader from '../loader';

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

const encryptWithPassword = async (password, rootKeyBytes) => {
  await Loader.load();
  const rootKeyHex = Buffer.from(rootKeyBytes, 'hex').toString('hex');
  const passwordHex = Buffer.from(password).toString('hex');
  const salt = cryptoRandomString({ length: 2 * 32 });
  const nonce = cryptoRandomString({ length: 2 * 12 });
  return Loader.Cardano.encrypt_with_password(
    passwordHex,
    salt,
    nonce,
    rootKeyHex
  );
};

const decryptWithPassword = async (password, encryptedKeyHex) => {
  await Loader.load();
  const passwordHex = Buffer.from(password).toString('hex');
  let decryptedHex;
  try {
    decryptedHex = Loader.Cardano.decrypt_with_password(
      passwordHex,
      encryptedKeyHex
    );
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

export const getCurrentAccountIndex = async () => {
  return await getStorage(STORAGE.currentAccount).then(
    (store) => store[STORAGE.currentAccount]
  );
};

export const getCurrentAccount = async () => {
  const currentAccountIndex = await getCurrentAccountIndex();
  const accounts = await getAccounts();
  return await accounts[currentAccountIndex];
};

export const getAccounts = async () => {
  return await getStorage(STORAGE.accounts).then(
    (store) => store[STORAGE.accounts]
  );
};

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

const extractKeyHash = async (address) => {
  await Loader.load();
  //TODO: implement for various address types
  const baseAddress = Loader.Cardano.BaseAddress.from_address(
    Loader.Cardano.Address.from_bech32(address)
  );
  return baseAddress.payment_cred().to_keyhash().to_bech32('hashp_');
};

/**
 * @param {string} address - Bech32
 * @param {string} data
 * @param {string} password
 * @returns
 */
export const signData = async (address, data, password) => {
  const currentAccountIndex = await getCurrentAccountIndex();
  const addressKeyHash = await extractKeyHash(address);
  let { paymentKey } = await requestAccountKey(password, currentAccountIndex);
  const publicKey = paymentKey.to_public().to_raw_key();
  if (addressKeyHash !== publicKey.hash().to_bech32('hashp_'))
    throw new Error('Key hashes do not match');
  const bytesData = new Uint8Array(Buffer.from(data));
  const signature = paymentKey.to_raw_key().sign(bytesData);
  paymentKey.free();
  paymentKey = null;
  return {
    signature: signature.to_hex(),
    publicKey: publicKey.to_bech32(),
  };
};

const requestAccountKey = async (password, accountIndex) => {
  await Loader.load();
  const encryptedRootKey = await getStorage(STORAGE.encryptedKey).then(
    (store) => store[STORAGE.encryptedKey]
  );
  const accountKey = Loader.Cardano.Bip32PrivateKey.from_bytes(
    Buffer.from(await decryptWithPassword(password, encryptedRootKey), 'hex')
  )
    .derive(harden(1852)) // purpose
    .derive(harden(1815)) // coin type;
    .derive(harden(accountIndex));

  return {
    paymentKey: accountKey.derive(0).derive(0),
    stakeKey: accountKey.derive(2).derive(0),
  };
};

export const createAccount = async (name, password) => {
  await Loader.load();

  const existingAccounts = await getAccounts();

  const accountIndex = existingAccounts
    ? Object.keys(existingAccounts).length
    : 0;

  let { paymentKey, stakeKey } = await requestAccountKey(
    password,
    accountIndex
  );

  const paymentKeyPub = paymentKey.to_public();
  const stakeKeyPub = stakeKey.to_public();

  paymentKey.free();
  stakeKey.free();
  paymentKey = null;
  stakeKey = null;

  const paymentAddr = Loader.Cardano.BaseAddress.new(
    Loader.Cardano.NetworkInfo.mainnet().network_id(),
    Loader.Cardano.StakeCredential.from_keyhash(
      paymentKeyPub.to_raw_key().hash()
    ),
    Loader.Cardano.StakeCredential.from_keyhash(stakeKeyPub.to_raw_key().hash())
  )
    .to_address()
    .to_bech32();

  const rewardAddr = Loader.Cardano.RewardAddress.new(
    Loader.Cardano.NetworkInfo.mainnet().network_id(),
    Loader.Cardano.StakeCredential.from_keyhash(stakeKeyPub.to_raw_key().hash())
  )
    .to_address()
    .to_bech32();

  const mood = ['shocked', 'happy', 'blissful', 'excited'][
    Math.floor(Math.random() * 4)
  ];

  const newAccount = {
    [accountIndex]: {
      index: accountIndex,
      paymentAddr,
      rewardAddr,
      name,
      avatar: { mood, color: randomColor() },
    },
  };

  return await setStorage({ [STORAGE.accounts]: newAccount });
};

export const createWallet = async (name, seedPhrase, password) => {
  await Loader.load();

  let entropy = mnemonicToEntropy(seedPhrase);
  let rootKey = Loader.Cardano.Bip32PrivateKey.from_bip39_entropy(
    Buffer.from(entropy, 'hex'),
    Buffer.from('')
  );
  entropy = null;
  seedPhrase = null;

  const encryptedRootKey = await encryptWithPassword(
    password,
    rootKey.as_bytes()
  );
  rootKey.free();
  rootKey = null;

  // const checkStore = await getStorage(STORAGE.encryptedKey).then(
  //   (store) => store[STORAGE.encryptedKey]
  // );
  // if (checkStore) throw new Error(ERROR.storeNotEmpty);
  await setStorage({ [STORAGE.encryptedKey]: encryptedRootKey });
  await setStorage({ [STORAGE.currentAccount]: 0 });

  await createAccount(name, password);
  password = null;

  return true;
};
