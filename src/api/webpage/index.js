import { EVENT, METHOD, SENDER, TARGET } from '../../config/config';
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

export const signData = async (address, message) => {
  const result = await Messaging.sendToContent({
    method: METHOD.signData,
    data: { address, message },
  });
  return result.data;
};

export const signTx = async (tx) => {
  const result = await Messaging.sendToContent({
    method: METHOD.signTx,
    data: { tx },
  });
  return result.data;
};

export const getAddress = async () => {
  const result = await Messaging.sendToContent({
    method: METHOD.getAddress,
  });
  return result.data;
};

export const getChangeAddress = async () => {
  const result = await Messaging.sendToContent({
    method: METHOD.getAddress,
  });
  return result.data;
};

export const getUtxos = async (paginate = undefined) => {
  const result = await Messaging.sendToContent({
    method: METHOD.getUtxos,
    data: paginate,
  });
  return result.data;
};

export const submitTx = async (tx) => {
  const result = await Messaging.sendToContent({
    method: METHOD.submitTx,
    data: tx,
  });
  return {
    txHash: result.data,
    onConfirm: (callback) => {
      window.addEventListener('message', function responseHandler(e) {
        const response = e.data;
        if (
          typeof response !== 'object' ||
          response === null ||
          !response.target ||
          response.target !== TARGET ||
          !response.event ||
          response.event !== EVENT.txConfirmation ||
          !response.sender ||
          response.sender !== SENDER.extension ||
          !response.data.txHash ||
          response.data.txHash !== result.data
        )
          return;
        window.removeEventListener('message', responseHandler);
        callback(response.data);
      });
    },
  };
};

export const onAccountChange = (callback) => {
  window.addEventListener('message', function responseHandler(e) {
    const response = e.data;
    if (
      typeof response !== 'object' ||
      response === null ||
      !response.target ||
      response.target !== TARGET ||
      !response.event ||
      response.event !== EVENT.accountChange ||
      !response.sender ||
      response.sender !== SENDER.extension
    )
      return;
    // window.removeEventListener('message', responseHandler);
    callback(response.data);
  });
};
