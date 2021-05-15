import { STORAGE } from '../../config/config';
import provider from '../../config/provider';

const getStorage = async (key) =>
  new Promise((res, rej) =>
    chrome.storage.local.get(key, (result) => {
      if (chrome.runtime.lastError) rej(undefined);
      res(result);
    })
  );
const setStorage = async (item) =>
  new Promise((res, rej) =>
    chrome.storage.local.set(item, () => {
      if (chrome.runtime.lastError) rej(chrome.runtime.lastError);
      res(true);
    })
  );

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
