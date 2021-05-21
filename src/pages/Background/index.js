import {
  createPopup,
  getAddresses,
  getBalance,
  getCurrentWebpage,
  getDelegation,
  getUtxos,
  isWhitelisted,
  submitTx,
} from '../../api/extension';
import { Messaging } from '../../api/messaging';
import { ERROR, METHOD, POPUP, SENDER, TARGET } from '../../config/config';

const app = Messaging.createBackgroundController();

/**
 * listens to requests from the web context
 */

app.add(METHOD.getBalance, async (request, sendResponse) => {
  const value = await getBalance();
  sendResponse({
    id: request.id,
    data: value,
    target: TARGET,
    sender: SENDER.extension,
  });
});

app.add(METHOD.getDelegation, async (request, sendResponse) => {
  const delegation = await getDelegation();
  sendResponse({
    id: request.id,
    data: delegation,
    target: TARGET,
    sender: SENDER.extension,
  });
});

app.add(METHOD.enable, async (request, sendResponse) => {
  const currentWebpage = await getCurrentWebpage();
  const whitelisted = await isWhitelisted(currentWebpage.url);
  if (whitelisted) {
    sendResponse({
      id: request.id,
      data: true,
      target: TARGET,
      sender: SENDER.extension,
    });
  } else {
    const response = await createPopup(POPUP.internal)
      .then((tab) =>
        Messaging.sendToPopupInternal(tab, { ...request, currentWebpage })
      )
      .then((response) => response);
    if (response.data === true) {
      sendResponse({
        id: request.id,
        data: true,
        target: TARGET,
        sender: SENDER.extension,
      });
    } else {
      sendResponse({
        id: request.id,
        error: ERROR.accessDenied,
        target: TARGET,
        sender: SENDER.extension,
      });
    }
  }
});

app.add(METHOD.isEnabled, async (request, sendResponse) => {
  const currentWebpage = await getCurrentWebpage();
  const whitelisted = await isWhitelisted(currentWebpage.url);
  sendResponse({
    id: request.id,
    data: whitelisted,
    target: TARGET,
    sender: SENDER.extension,
  });
});

app.add(METHOD.getAddresses, async (request, sendResponse) => {
  const addresses = await getAddresses();
  sendResponse({
    id: request.id,
    data: addresses,
    target: TARGET,
    sender: SENDER.extension,
  });
});

app.add(METHOD.getUtxos, async (request, sendResponse) => {
  const utxos = await getUtxos();
  sendResponse({
    id: request.id,
    data: utxos,
    target: TARGET,
    sender: SENDER.extension,
  });
});

app.add(METHOD.submitTx, async (request, sendResponse) => {
  const txHash = await submitTx(request.data);
  if (txHash.error)
    sendResponse({
      id: request.id,
      target: TARGET,
      error: ERROR.txFailed,
      sender: SENDER.extension,
    });
  else
    sendResponse({
      id: request.id,
      data: txHash,
      target: TARGET,
      sender: SENDER.extension,
    });
});

app.add(METHOD.isWhitelisted, async (request, sendResponse) => {
  const currentWebpage = await getCurrentWebpage();
  const whitelisted = await isWhitelisted(currentWebpage.url);
  if (whitelisted) {
    sendResponse({
      data: whitelisted,
      target: TARGET,
      sender: SENDER.extension,
    });
  } else {
    sendResponse({
      error: ERROR.accessDenied,
      target: TARGET,
      sender: SENDER.extension,
    });
  }
});

app.add(METHOD.signData, async (request, sendResponse) => {
  const currentWebpage = await getCurrentWebpage();

  const response = await createPopup(POPUP.internal)
    .then((tab) =>
      Messaging.sendToPopupInternal(tab, { ...request, currentWebpage })
    )
    .then((response) => response);

  if (response.data) {
    sendResponse({
      id: request.id,
      data: response.data,
      target: TARGET,
      sender: SENDER.extension,
    });
  } else {
    sendResponse({
      id: request.id,
      error: ERROR.signatureDenied,
      target: TARGET,
      sender: SENDER.extension,
    });
  }
});

app.add(METHOD.signTx, async (request, sendResponse) => {
  const currentWebpage = await getCurrentWebpage();

  const response = await createPopup(POPUP.internal)
    .then((tab) =>
      Messaging.sendToPopupInternal(tab, { ...request, currentWebpage })
    )
    .then((response) => response);

  if (response.data) {
    sendResponse({
      id: request.id,
      data: response.data,
      target: TARGET,
      sender: SENDER.extension,
    });
  } else {
    sendResponse({
      id: request.id,
      error: ERROR.signatureDenied,
      target: TARGET,
      sender: SENDER.extension,
    });
  }
});

app.listen();
