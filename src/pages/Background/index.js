import {
  createPopup,
  getBalance,
  getCurrentWebpage,
  getWhitelisted,
  isWhitelisted,
  setWhitelisted,
} from '../../api/extension';
import { Messaging } from '../../api/messaging';
import { ERROR, METHOD, POPUP, SENDER, TARGET } from '../../config/config';

const app = Messaging.createBackgroundController();

/**
 * app.webpage listens to requests from the web context
 * app.extension listens to requests from the actual extension, like the popup
 */

app.add(METHOD.balance, async (request, sendResponse) => {
  const value = await getBalance();
  sendResponse({
    id: request.id,
    data: value,
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
      await setWhitelisted(currentWebpage.url);
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

app.listen();
