import { METHOD } from '../../config/config';
import { Messaging } from '../messaging';

export const getBalance = async () => {
  const result = await Messaging.sendToContent({ method: METHOD.getBalance });
  return result.data;
};

export const enable = async () => {
  const result = await Messaging.sendToContent({ method: METHOD.enable });
  return result.data;
};

export const isEnabled = async () => {
  const result = await Messaging.sendToContent({ method: METHOD.isEnabled });
  return result.data;
};

//deprecated soon
export const signData = async (address, payload) => {
  const result = await Messaging.sendToContent({
    method: METHOD.signData,
    data: { address, payload },
  });
  return result.data;
};

export const signDataCIP30 = async (address, payload) => {
  const result = await Messaging.sendToContent({
    method: METHOD.signData,
    data: { address, payload, CIP30: true },
  });
  return result.data;
};

export const signTx = async (tx, partialSign = false) => {
  const result = await Messaging.sendToContent({
    method: METHOD.signTx,
    data: { tx, partialSign },
  });
  return result.data;
};

export const getAddress = async () => {
  const result = await Messaging.sendToContent({
    method: METHOD.getAddress,
  });
  return result.data;
};

export const getRewardAddress = async () => {
  const result = await Messaging.sendToContent({
    method: METHOD.getRewardAddress,
  });
  return result.data;
};

export const getNetworkId = async () => {
  const result = await Messaging.sendToContent({
    method: METHOD.getNetworkId,
  });
  return result.data;
};

export const getUtxos = async (amount = undefined, paginate = undefined) => {
  const result = await Messaging.sendToContent({
    method: METHOD.getUtxos,
    data: { amount, paginate },
  });
  return result.data;
};

export const getCollateral = async () => {
  const result = await Messaging.sendToContent({
    method: METHOD.getCollateral,
  });
  return result.data;
};

export const submitTx = async (tx) => {
  const result = await Messaging.sendToContent({
    method: METHOD.submitTx,
    data: tx,
  });
  return result.data;
};

export { on, off } from './eventRegistration';

// CIP-95

export const getPubDRepKey = async () => {
  const result = await Messaging.sendToContent({ 
    method: METHOD.getPubDRepKey 
  });
  return result.data;
};

export const getRegisteredPubStakeKeys = async () => {
  const result = await Messaging.sendToContent({ 
    method: METHOD.getRegisteredPubStakeKeys 
  });
  return result.data;
};

export const getUnregisteredPubStakeKeys = async () => {
  const result = await Messaging.sendToContent({ 
    method: METHOD.getUnregisteredPubStakeKeys 
  });
  return result.data;
};