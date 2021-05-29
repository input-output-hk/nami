import { ERROR, EVENT, SENDER, STORAGE, TARGET } from '../../config/config';
import provider from '../../config/provider';
import { POPUP_WINDOW } from '../../config/config';
import { mnemonicToEntropy } from 'bip39';
import cryptoRandomString from 'crypto-random-string';
import randomColor from 'randomcolor';
import Loader from '../loader';
import { createAvatar } from '@dicebear/avatars';
import * as style from '@dicebear/avatars-bottts-sprites';

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

export const getDelegation = async () => {
  const currentAccount = await getCurrentAccount();
  const result = await fetch(
    provider.api.base + `/accounts/${currentAccount.rewardAddr}`,
    { headers: provider.api.key }
  ).then((res) => res.json());
  if (!result || result.error) return {};
  return {
    active: result.active,
    poolId: result.poolId,
    activeEpoch: result.active_epoch,
    availableRewards: result.withdrawable_amount,
    withdrawnRewards: result.withdrawal_sum,
  };
};

export const getBalance = async () => {
  const currentAccount = await getCurrentAccount();
  const result = await fetch(
    provider.api.base + `/addresses/${currentAccount.paymentAddr}`,
    { headers: provider.api.key }
  ).then((res) => res.json());
  if (!result || result.error) return [];
  return result.amount;
};

export const getTransactions = async (paginate = 1) => {
  const currentAccount = await getCurrentAccount();
  const result = await fetch(
    provider.api.base +
      `/addresses/${currentAccount.paymentAddr}/txs?page=${paginate}&order=desc&count=10`,
    { headers: provider.api.key }
  ).then((res) => res.json());
  if (!result || result.error) return [];
  return result;
};

export const getUtxos = async (paginate = undefined) => {
  const currentAccount = await getCurrentAccount();
  let result = [];
  let page = paginate || 1;
  while (true) {
    let pageResult = await fetch(
      provider.api.base +
        `/addresses/${currentAccount.paymentAddr}/utxos?page=${page}`,
      { headers: provider.api.key }
    ).then((res) => res.json());
    if (!result || result.error) pageResult = [];
    result = result.concat(pageResult);
    if (pageResult.length <= 0 || paginate) break;
    page++;
  }

  return result.map((utxo) => ({
    txHash: utxo.tx_hash,
    txId: utxo.output_index,
    amount: utxo.amount,
  }));
};

export const getAddresses = async () => {
  const currentAccount = await getCurrentAccount();
  return {
    paymentAddr: [currentAccount.paymentAddr],
    rewardAddr: currentAccount.rewardAddr,
  };
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
        res({
          url: new URL(tabs[0].url).origin,
          favicon: tabs[0].favIconUrl,
          tabId: tabs[0].id,
        });
      }
    );
  });

const harden = (num) => {
  return 0x80000000 + num;
};

const extractKeyHash = async (address) => {
  await Loader.load();
  //TODO: implement for various address types
  if (address.startsWith('addr')) {
    const baseAddr = Loader.Cardano.BaseAddress.from_address(
      Loader.Cardano.Address.from_bech32(address)
    );
    return baseAddr.payment_cred().to_keyhash().to_bech32('hbas_');
  } else if (address.startsWith('stake')) {
    const rewardAddr = Loader.Cardano.RewardAddress.from_address(
      Loader.Cardano.Address.from_bech32(address)
    );
    return rewardAddr.payment_cred().to_keyhash().to_bech32('hrew_');
  }
  throw new Error(ERROR.noKeyHash);
};

/**
 * @param {string} address - Bech32
 * @param {string} data
 * @param {string} password
 * @returns
 */
export const signData = async (address, data, password, accountIndex) => {
  const keyHash = await extractKeyHash(address);
  const prefix = keyHash.slice(0, 5);
  let { paymentKey, stakeKey } = await requestAccountKey(
    password,
    accountIndex
  );
  const accountKey = prefix === 'hbas_' ? paymentKey : stakeKey;

  const publicKey = accountKey.to_public();
  if (keyHash !== publicKey.hash().to_bech32(prefix))
    throw new Error('Key hashes do not match');
  const bytesData = new Uint8Array(Buffer.from(data));
  const signature = accountKey.sign(bytesData);

  stakeKey.free();
  stakeKey = null;
  paymentKey.free();
  paymentKey = null;

  return {
    signature: signature.to_hex(),
    publicKey: publicKey.to_bech32(),
  };
};

/**
 *
 * @param {string} tx - cbor hex string
 * @param {Array<string>} keyHashes
 * @param {string} password
 * @returns {string} witness set as hex string
 */
export const signTx = async (tx, keyHashes, password, accountIndex) => {
  await Loader.load();
  let { paymentKey, stakeKey } = await requestAccountKey(
    password,
    accountIndex
  );
  const paymentKeyHash = Buffer.from(
    paymentKey.to_public().hash().to_bytes(),
    'hex'
  ).toString('hex');
  const stakeKeyHash = Buffer.from(
    stakeKey.to_public().hash().to_bytes(),
    'hex'
  ).toString('hex');

  const rawTx = Loader.Cardano.Transaction.from_bytes(Buffer.from(tx, 'hex'));

  const txWitnessSet = Loader.Cardano.TransactionWitnessSet.new();
  const vkeyWitnesses = Loader.Cardano.Vkeywitnesses.new();
  const txHash = Loader.Cardano.hash_transaction(rawTx.body());
  keyHashes.forEach((keyHash) => {
    let signingKey;
    if (keyHash === paymentKeyHash) signingKey = paymentKey;
    else if (keyHash === stakeKeyHash) signingKey = stakeKey;
    else throw new Error(ERROR.noKeyHash);
    const vkey = Loader.Cardano.make_vkey_witness(txHash, signingKey);
    vkeyWitnesses.add(vkey);
  });
  txWitnessSet.set_vkeys(vkeyWitnesses);
  const signedTx = Loader.Cardano.Transaction.new(
    rawTx.body(),
    txWitnessSet,
    rawTx.metadata()
  );
  return Buffer.from(signedTx.to_bytes(), 'hex').toString('hex');
};

/**
 *
 * @param {string} tx - cbor hex string
 * @returns
 */

export const submitTx = async (tx) => {
  const txHash = await fetch(provider.api.base + `/tx/submit`, {
    headers: { ...provider.api.key, 'Content-Type': 'application/cbor' },
    method: 'POST',
    body: Buffer.from(tx, 'hex'),
  }).then((res) => res.json());
  if (!txHash || txHash.error) return txHash;
  emitTxConfirmation(txHash);
  return txHash;
};

const emitTxConfirmation = async (txHash) => {
  const result = await fetch(provider.api.base + `/txs/${txHash}`, {
    headers: provider.api.key,
  }).then((res) => res.json());

  if (!result || result.error)
    return setTimeout(() => emitTxConfirmation(txHash), 5000);
  //to webpage
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) =>
      chrome.tabs.sendMessage(tab.id, {
        data: { ...result, txHash },
        target: TARGET,
        sender: SENDER.extension,
        event: EVENT.txConfirmation,
      })
    );
  });
  return;
};

const emitAccountChange = async (addresses) => {
  //to extenstion itself
  if (typeof window !== 'undefined') {
    window.postMessage({
      data: addresses,
      target: TARGET,
      sender: SENDER.extension,
      event: EVENT.accountChange,
    });
  }
  //to webpage
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) =>
      chrome.tabs.sendMessage(tab.id, {
        data: addresses,
        target: TARGET,
        sender: SENDER.extension,
        event: EVENT.accountChange,
      })
    );
  });
};

export const switchAccount = async (accountIndex) => {
  await setStorage({ [STORAGE.currentAccount]: accountIndex });
  const currentAccount = await getCurrentAccount();
  emitAccountChange({
    paymentAddr: [currentAccount.paymentAddr],
    rewardAddr: currentAccount.paymentAddr,
  });
  return true;
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
    .derive(harden(parseInt(accountIndex)));

  return {
    paymentKey: accountKey.derive(0).derive(0).to_raw_key(),
    stakeKey: accountKey.derive(2).derive(0).to_raw_key(),
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
    Loader.Cardano.StakeCredential.from_keyhash(paymentKeyPub.hash()),
    Loader.Cardano.StakeCredential.from_keyhash(stakeKeyPub.hash())
  )
    .to_address()
    .to_bech32();

  const rewardAddr = Loader.Cardano.RewardAddress.new(
    Loader.Cardano.NetworkInfo.mainnet().network_id(),
    Loader.Cardano.StakeCredential.from_keyhash(stakeKeyPub.hash())
  )
    .to_address()
    .to_bech32();

  const newAccount = {
    [accountIndex]: {
      index: accountIndex,
      paymentAddr,
      rewardAddr,
      name,
      lovelace: 0,
      assets: [],
      history: { confirmed: [], details: {} },
      avatar: Math.random().toString(),
    },
  };

  await setStorage({
    [STORAGE.accounts]: { ...existingAccounts, ...newAccount },
  });
  await switchAccount(accountIndex);
  return true;
};

export const deleteAccount = async () => {
  const accounts = await getAccounts();
  if (Object.keys(accounts).length <= 1) throw new Error(ERROR.onlyOneAccount);
  delete accounts[Object.keys(accounts).length - 1];
  await setStorage({ [STORAGE.accounts]: accounts });
  return true;
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

  const checkStore = await getStorage(STORAGE.encryptedKey).then(
    (store) => store[STORAGE.encryptedKey]
  );
  if (checkStore) throw new Error(ERROR.storeNotEmpty);
  await setStorage({ [STORAGE.encryptedKey]: encryptedRootKey });

  await createAccount(name, password);
  password = null;

  return true;
};

export const mnemonicToObject = (mnemonic) => {
  const mnemonicMap = {};
  mnemonic.split(' ').forEach((word, index) => (mnemonicMap[index + 1] = word));
  return mnemonicMap;
};

export const mnemonicFromObject = (mnemonicMap) => {
  return Object.keys(mnemonicMap).reduce(
    (acc, key) => (acc ? acc + ' ' + mnemonicMap[key] : acc + mnemonicMap[key]),
    ''
  );
};

export const avatarToImage = (avatar) => {
  const blob = new Blob(
    [
      createAvatar(style, {
        seed: avatar,
      }),
    ],
    { type: 'image/svg+xml' }
  );
  return URL.createObjectURL(blob);
};

const updateBalance = async (currentAccount) => {
  const amount = await getBalance();
  if (amount.length > 0) {
    currentAccount.lovelace = amount.find(
      (am) => am.unit === 'lovelace'
    ).quantity;
    currentAccount.assets = amount.filter((am) => am.unit !== 'lovelace');
  } else {
    currentAccount.lovelace = 0;
    currentAccount.assets = [];
  }
};

const updateTransactions = async (currentAccount) => {
  const transactions = await getTransactions();
  transactions.concat(currentAccount.history.confirmed);
  const txSet = new Set(transactions);
  currentAccount.history.confirmed = Array.from(txSet);
};

export const setTransactions = async (txs) => {
  const currentAccount = await getCurrentAccount();
  const accounts = await getAccounts();
  currentAccount.history.confirmed = txs;
  await setStorage({
    [STORAGE.accounts]: {
      ...accounts,
      ...{ [currentAccount.index]: currentAccount },
    },
  });
  return true;
};

export const updateAccount = async () => {
  const currentAccount = await getCurrentAccount();
  const accounts = await getAccounts();
  await updateBalance(currentAccount);
  await updateTransactions(currentAccount);
  await setStorage({
    [STORAGE.accounts]: {
      ...accounts,
      ...{ [currentAccount.index]: currentAccount },
    },
  });
  return true;
};

export const displayUnit = (quantity, decimals = 6) =>
  parseInt(quantity) / (1 * 10 ** decimals);
