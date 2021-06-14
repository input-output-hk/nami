import {
  APIError,
  DataSignError,
  ERROR,
  EVENT,
  NETWORK_ID,
  NODE,
  SENDER,
  STORAGE,
  TARGET,
  TxSendError,
  TxSignError,
} from '../../config/config';
import provider from '../../config/provider';
import { POPUP_WINDOW } from '../../config/config';
import { mnemonicToEntropy } from 'bip39';
import cryptoRandomString from 'crypto-random-string';
import randomColor from 'randomcolor';
import Loader from '../loader';
import { createAvatar } from '@dicebear/avatars';
import * as style from '@dicebear/avatars-bottts-sprites';
import { assetsToValue, utxoToStructure, valueToAssets } from './wallet';
import { blockfrostRequest } from '../util';

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
  const result = await blockfrostRequest(
    `/accounts/${currentAccount.rewardAddr}`
  );
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
  await Loader.load();
  const currentAccount = await getCurrentAccount();
  const result = await blockfrostRequest(
    `/addresses/${currentAccount.paymentAddr}`
  );
  if (result.error) {
    if (result.status_code === 400) throw APIError.InvalidRequest;
    else if (result.status_code === 500) throw APIError.InternalError;
    else return Loader.Cardano.Value.new(Loader.Cardano.BigNum.from_str('0'));
  }
  const value = await assetsToValue(result.amount);
  return value;
};

export const getTransactions = async (paginate = 1) => {
  const currentAccount = await getCurrentAccount();
  const result = await blockfrostRequest(
    `/addresses/${currentAccount.paymentAddr}/txs?page=${paginate}&order=desc&count=10`
  );
  if (!result || result.error) return [];
  return result;
};

/**
 *
 * @param {string} amount - cbor value
 * @param {Object} paginate
 * @param {number} paginate.page
 * @param {number} paginate.limit
 * @returns
 */
export const getUtxos = async (amount = undefined, paginate = undefined) => {
  const currentAccount = await getCurrentAccount();
  let result = [];
  let page = paginate && paginate.page ? paginate.page + 1 : 1;
  const limit = paginate && paginate.limit ? `&count=${paginate.limit}` : '';
  while (true) {
    let pageResult = await blockfrostRequest(
      `/addresses/${currentAccount.paymentAddr}/utxos?page=${page}${limit}`
    );
    if (pageResult.error) {
      if (result.status_code === 400) throw APIError.InvalidRequest;
      else if (result.status_code === 500) throw APIError.InternalError;
      else {
        pageResult = [];
      }
    }
    result = result.concat(pageResult);
    if (pageResult.length <= 0 || paginate) break;
    page++;
  }
  const address = await getAddress();
  let converted = await Promise.all(
    result.map(async (utxo) => await utxoToStructure(utxo, address))
  );
  // filter utxos
  if (amount) {
    await Loader.load();
    let filterValue;
    try {
      filterValue = Loader.Cardano.Value.from_bytes(Buffer.from(amount, 'hex'));
    } catch (e) {
      throw APIError.InvalidRequest;
    }

    converted = converted.filter(
      (unspent) =>
        !unspent.output().amount().compare(filterValue) ||
        unspent.output().amount().compare(filterValue) !== -1
    );
  }
  return converted;
};

export const getAddress = async () => {
  await Loader.load();
  const currentAccount = await getCurrentAccount();
  const paymentAddr = Buffer.from(
    Loader.Cardano.Address.from_bech32(currentAccount.paymentAddr).to_bytes(),
    'hex'
  ).toString('hex');
  return paymentAddr;
};

export const getCurrentAccountIndex = async () => {
  return await getStorage(STORAGE.currentAccount).then(
    (store) => store[STORAGE.currentAccount]
  );
};

export const getNetwork = async () => {
  return await getStorage(STORAGE.network).then(
    (store) => store[STORAGE.network]
  );
};

export const switchNetwork = async () => {
  const network = await getNetwork();
  if (network.id === NETWORK_ID.mainnet) {
    await setStorage({
      [STORAGE.network]: { node: NODE.testnet, id: NETWORK_ID.testnet },
    });
    return NETWORK_ID.testnet;
  } else {
    await setStorage({
      [STORAGE.network]: { node: NODE.mainnet, id: NETWORK_ID.mainnet },
    });
    return NETWORK_ID.mainnet;
  }
};

export const getCurrentAccount = async () => {
  await Loader.load();
  const currentAccountIndex = await getCurrentAccountIndex();
  const accounts = await getAccounts();
  const network = await getNetwork();
  const currentAccount = await accounts[currentAccountIndex];
  const paymentKeyHash = Loader.Cardano.Ed25519KeyHash.from_bytes(
    Buffer.from(currentAccount.paymentKeyHash, 'hex')
  );
  const stakeKeyHash = Loader.Cardano.Ed25519KeyHash.from_bytes(
    Buffer.from(currentAccount.stakeKeyHash, 'hex')
  );
  const paymentAddr = Loader.Cardano.BaseAddress.new(
    network.id === NETWORK_ID.mainnet
      ? Loader.Cardano.NetworkInfo.mainnet().network_id()
      : Loader.Cardano.NetworkInfo.testnet().network_id(),
    Loader.Cardano.StakeCredential.from_keyhash(paymentKeyHash),
    Loader.Cardano.StakeCredential.from_keyhash(stakeKeyHash)
  )
    .to_address()
    .to_bech32();

  const rewardAddr = Loader.Cardano.RewardAddress.new(
    network.id === NETWORK_ID.mainnet
      ? Loader.Cardano.NetworkInfo.mainnet().network_id()
      : Loader.Cardano.NetworkInfo.testnet().network_id(),
    Loader.Cardano.StakeCredential.from_keyhash(stakeKeyHash)
  )
    .to_address()
    .to_bech32();

  const assets = currentAccount[network.id].assets;
  const lovelace = currentAccount[network.id].lovelace;
  const history = currentAccount[network.id].history;

  return {
    ...currentAccount,
    paymentAddr,
    rewardAddr,
    assets,
    lovelace,
    history,
  };
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

export const isValidAddress = async (address) => {
  await Loader.load();
  const network = await getNetwork();
  try {
    const addr = Loader.Cardano.Address.from_bech32(address);
    if (
      (addr.network_id() === 1 && network.id === NETWORK_ID.mainnet) ||
      (addr.network_id() === 0 && network.id === NETWORK_ID.testnet)
    )
      return true;
    return false;
  } catch (e) {}
  try {
    const addr = Loader.Cardano.ByronAddress.from_base58(address);
    if (
      (addr.network_id() === 1 && network.id === NETWORK_ID.mainnet) ||
      (addr.network_id() === 0 && network.id === NETWORK_ID.testnet)
    )
      return true;
    return false;
  } catch (e) {}
  return false;
};

export const extractKeyHash = async (address) => {
  await Loader.load();
  //TODO: implement for various address types
  try {
    const baseAddr = Loader.Cardano.BaseAddress.from_address(
      Loader.Cardano.Address.from_bytes(Buffer.from(address, 'hex'))
    );
    return baseAddr.payment_cred().to_keyhash().to_bech32('hbas_');
  } catch (e) {}
  try {
    const rewardAddr = Loader.Cardano.RewardAddress.from_address(
      Loader.Cardano.Address.from_bytes(Buffer.from(address, 'hex'))
    );
    return rewardAddr.payment_cred().to_keyhash().to_bech32('hrew_');
  } catch (e) {}
  throw DataSignError.AddressNotPK;
};

export const verifySigStructure = async (sigStructure) => {
  await Loader.load();
  try {
    Loader.Message.SigStructure.from_bytes(Buffer.from(sigStructure, 'hex'));
  } catch (e) {
    throw DataSignError.InvalidFormat;
  }
};

export const verifyTx = async (tx) => {
  await Loader.load();
  try {
    Loader.Cardano.Transaction.from_bytes(Buffer.from(tx, 'hex'));
  } catch (e) {
    throw APIError.InvalidRequest;
  }
};

/**
 * @param {string} address - cbor
 * @param {string} sigStructure - CIP-0008 SigStructure
 * @param {string} password
 * @param {number} accountIndex
 * @returns
 */

export const signData = async (
  address,
  sigStructure,
  password,
  accountIndex
) => {
  await Loader.load();
  const keyHash = await extractKeyHash(address);
  const prefix = keyHash.slice(0, 5);
  let { paymentKey, stakeKey } = await requestAccountKey(
    password,
    accountIndex
  );
  const accountKey = prefix === 'hbas_' ? paymentKey : stakeKey;

  const publicKey = accountKey.to_public();
  if (keyHash !== publicKey.hash().to_bech32(prefix))
    throw DataSignError.ProofGeneration;

  const signature = accountKey.sign(Buffer.from(sigStructure, 'hex'));

  stakeKey.free();
  stakeKey = null;
  paymentKey.free();
  paymentKey = null;

  return Buffer.from(
    Loader.Cardano.Vkeywitness.new(
      Loader.Cardano.Vkey.new(publicKey),
      signature
    ).to_bytes(),
    'hex'
  ).toString('hex');
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

  const txWitnessSet = rawTx.witness_set();
  const vkeyWitnesses = Loader.Cardano.Vkeywitnesses.new();
  const txHash = Loader.Cardano.hash_transaction(rawTx.body());
  keyHashes.forEach((keyHash) => {
    let signingKey;
    if (keyHash === paymentKeyHash) signingKey = paymentKey;
    else if (keyHash === stakeKeyHash) signingKey = stakeKey;
    else throw TxSignError.ProofGeneration;
    const vkey = Loader.Cardano.make_vkey_witness(txHash, signingKey);
    vkeyWitnesses.add(vkey);
  });

  stakeKey.free();
  stakeKey = null;
  paymentKey.free();
  paymentKey = null;

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
  const result = await blockfrostRequest(
    `/tx/submit`,
    { 'Content-Type': 'application/cbor' },
    Buffer.from(tx, 'hex')
  );
  console.log(result);
  if (result.error) {
    if (result.status_code === 400) throw TxSendError.Failure;
    else if (result.status_code === 500) throw APIError.InternalError;
    else if (result.status_code === 429) throw TxSendError.Refused;
    else throw APIError.InvalidRequest;
  }
  return result;
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
  const address = await getAddress();
  emitAccountChange([address]);
  return true;
};

const requestAccountKey = async (password, accountIndex) => {
  await Loader.load();
  const encryptedRootKey = await getStorage(STORAGE.encryptedKey).then(
    (store) => store[STORAGE.encryptedKey]
  );
  let accountKey;
  try {
    accountKey = Loader.Cardano.Bip32PrivateKey.from_bytes(
      Buffer.from(await decryptWithPassword(password, encryptedRootKey), 'hex')
    )
      .derive(harden(1852)) // purpose
      .derive(harden(1815)) // coin type;
      .derive(harden(parseInt(accountIndex)));
  } catch (e) {
    throw ERROR.wrongPassword;
  }

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

  const paymentKeyHash = Buffer.from(
    paymentKeyPub.hash().to_bytes(),
    'hex'
  ).toString('hex');
  const stakeKeyHash = Buffer.from(
    stakeKeyPub.hash().to_bytes(),
    'hex'
  ).toString('hex');

  const networkDefault = {
    lovelace: 0,
    assets: [],
    history: {},
  };

  const newAccount = {
    [accountIndex]: {
      index: accountIndex,
      paymentKeyHash,
      stakeKeyHash,
      name,
      [NETWORK_ID.mainnet]: networkDefault,
      [NETWORK_ID.testnet]: networkDefault,
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
  await setStorage({
    [STORAGE.network]: { id: NETWORK_ID.mainnet, node: NODE.mainnet },
  });

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

const updateBalance = async (currentAccount, network) => {
  let amount = await getBalance();
  amount = await valueToAssets(amount);

  if (amount.length > 0) {
    currentAccount[network.id].lovelace = amount.find(
      (am) => am.unit === 'lovelace'
    ).quantity;
    currentAccount[network.id].assets = amount.filter(
      (am) => am.unit !== 'lovelace'
    );
  } else {
    currentAccount[network.id].lovelace = 0;
    currentAccount[network.id].assets = [];
  }
};

const updateTransactions = async (currentAccount, network) => {
  const transactions = await getTransactions();
  transactions.concat(currentAccount.history.confirmed);
  const txSet = new Set(transactions);
  currentAccount[network.id].history.confirmed = Array.from(txSet);
};

export const setTransactions = async (txs) => {
  const currentAccount = await getCurrentAccount();
  const network = await getNetwork();
  const accounts = await getAccounts();
  currentAccount[network.id].history.confirmed = txs;
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
  const network = await getNetwork();
  await updateBalance(currentAccount, network);
  await updateTransactions(currentAccount, network);
  await setStorage({
    [STORAGE.accounts]: {
      ...accounts,
      ...{ [currentAccount.index]: currentAccount },
    },
  });
  return true;
};

export const displayUnit = (quantity, decimals = 6) => {
  return parseInt(quantity) / 10 ** decimals;
};

export const toUnit = (amount, decimals = 6) => {
  return parseFloat(amount.replace(/[,\s]/g, ''))
    .toLocaleString('en-EN', { minimumFractionDigits: decimals })
    .replace(/[.,\s]/g, '');
};
