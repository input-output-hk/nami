import {
  getBalance,
  getWhitelisted,
  isWhitelisted,
  setWhitelisted,
} from '../../api/background';
import { Messaging } from '../../api/messaging';
import { createPopup, getCurrentWebpage } from '../../api/popup';
import { ERROR, METHOD, POPUP, SENDER, TARGET } from '../../config/config';

const app = Messaging.createBackgroundController();

/**
 * app.webpage listens to requests from the web context
 * app.extension listens to requests from the actual extension, like the popup
 */

app.webpage(METHOD.balance, async (request, sendResponse) => {
  const value = await getBalance();
  sendResponse({
    id: request.id,
    data: value,
    target: TARGET,
    sender: SENDER.extension,
  });
});

app.webpage(METHOD.enable, async (request, sendResponse) => {
  const whitelisted = await isWhitelisted(request.data);
  if (whitelisted) {
    sendResponse({
      id: request.id,
      data: true,
      target: TARGET,
      sender: SENDER.extension,
    });
  } else {
    const currentWebpage = await getCurrentWebpage();
    const response = await createPopup(POPUP.secondary)
      .then((tab) =>
        Messaging.sendToPopupInternal(tab, { request, currentWebpage })
      )
      .then((response) => response);
    if (response.data === true) {
      await setWhitelisted(request.data);
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

app.webpage(METHOD.isEnabled, async (request, sendResponse) => {
  const whitelisted = await isWhitelisted(request.data);
  sendResponse({
    id: request.id,
    data: whitelisted,
    target: TARGET,
    sender: SENDER.extension,
  });
});

app.extension(METHOD.isWhitelisted, async (request, sendResponse) => {
  const whitelisted = await isWhitelisted(request.data);
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

// createPopup(POPUP.secondary)
//   .then((tab) => Messaging.sendToPopupInternal(tab, request))
//   .then((response) =>
//     sendResponse({
//       id: request.id,
//       data: response.data,
//       target: TARGET,
//       sender: SENDER.extension,
//     })
//   );

app.listen();
