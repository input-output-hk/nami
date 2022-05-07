import { App } from '@capacitor/app';
import { METHOD, SENDER, TARGET } from '../../config/config';
import DAppConnector from '../../plugins/DAppConnector';

App.addListener('backButton', ({ canGoBack }) => {
  if (!canGoBack) {
    App.exitApp();
  }
  else {
    window.history.back();
  }
})

const EXTRA_METHOD = {
  getUsedAddresses: 'getUsedAddresses',
  getUnusedAddresses: 'getUnusedAddresses',
  getChangeAddress: 'getChangeAddress',
  getRewardAddresses: 'getRewardAddresses',
}

DAppConnector.addListener('dApp', (req) => {
  const requestId = Math.random().toString(36).substr(2, 9);
  req.id = requestId;
  req.sender = SENDER.webpage;
  req.target = TARGET;
  let callback = handleResponse;

  switch (req.method) {
    case EXTRA_METHOD.getUsedAddresses:
      req.method = METHOD.getAddress;
      callback = (response) => {
        if (response.data) response.data = [response.data];
        handleResponse(response);
      };
      break;
    case EXTRA_METHOD.getUnusedAddresses:
      req.method = METHOD.isWhitelisted;
      callback = (response) => {
        if (response.data) response.data = [];
        handleResponse(response);
      };
      break;
    case EXTRA_METHOD.getChangeAddress:
      req.method = METHOD.getAddress;
      callback = handleResponse;
      break;
    case EXTRA_METHOD.getRewardAddresses:
      req.method = METHOD.getRewardAddress;
      callback = (response) => {
        if (response.data) response.data = [response.data];
        handleResponse(response);
      };
      break;
    default:
      break;
  }

  if (![METHOD.enable, METHOD.isEnabled].includes(req.method)) {
    const whitelistedReq = { method: METHOD.isWhitelisted, origin: req.origin, sender: SENDER.webpage };
    chrome.runtime.sendMessage(whitelistedReq, (res) => {
      if (!res.error) chrome.runtime.sendMessage(req, callback);
      else callback(res);
    });
  }
  else chrome.runtime.sendMessage(req, callback);
});

const handleResponse = (response) => {
  if (!response.error) {
    let data = response.data;
    DAppConnector.resolve({ data });
  }
  else {
    DAppConnector.reject({ ...response.error });
  }
}
