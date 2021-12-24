import { APIError, METHOD, SENDER, TARGET } from '../config/config';

/**
 * Message Object
 * {
 *  ?method: METHOD,
 *  ?data: DATA,
 *  ?error: ERROR,
 *  sender: SENDER (extension || webpage),
 *  target: TARGET,
 *  ?id: requestId,
 *  ?origin: window.origin
 *  ?event: EVENT
 * }
 */

class InternalController {
  constructor() {
    this.port = chrome.runtime.connect({
      name: 'internal-background-popup-communication',
    });
    this.tabId = new Promise((_res, _rej) =>
      chrome.tabs.getCurrent((tab) => _res(tab.id))
    );
  }
  requestData = () =>
    new Promise(async (res, rej) => {
      this.tabId = await new Promise((_res, _rej) =>
        chrome.tabs.getCurrent((tab) => _res(tab.id))
      );
      const self = this;
      this.port.onMessage.addListener(function messageHandler(response) {
        self.port.onMessage.removeListener(messageHandler);
        res(response);
      });
      this.port.postMessage({
        tabId: await this.tabId,
        method: METHOD.requestData,
      });
    });

  returnData = async ({ data, error }) => {
    this.port.postMessage({
      data,
      error,
      method: METHOD.returnData,
      tabId: await this.tabId,
    });
  };
}

class BackgroundController {
  constructor() {
    /**
     * @private
     */
    this._methodList = {};
  }

  /**
   * @callback methodCallback
   * @param {object} request
   * @param {function} sendResponse
   */
  /**

  /**
   * @param {string} method
   * @param {methodCallback} func
   */
  add = (method, func) => {
    this._methodList[method] = func;
  };

  listen = () => {
    chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
      if (request.sender === SENDER.webpage) {
        this._methodList[request.method](request, sendResponse);
      }
      return true;
    });
  };
}

export const Messaging = {
  sendToBackground: async function (request) {
    return new Promise((res, rej) =>
      chrome.runtime.sendMessage(
        { ...request, target: TARGET, sender: SENDER.webpage },
        (response) => res(response)
      )
    );
  },
  sendToContent: function ({ method, data }) {
    return new Promise((res, rej) => {
      const requestId = Math.random().toString(36).substr(2, 9);
      window.addEventListener('message', function responseHandler(e) {
        const response = e.data;
        if (
          typeof response !== 'object' ||
          response === null ||
          !response.target ||
          response.target !== TARGET ||
          !response.id ||
          response.id !== requestId ||
          !response.sender ||
          response.sender !== SENDER.extension
        )
          return;
        window.removeEventListener('message', responseHandler);
        if (response.error) rej(response.error);
        else res(response);
      });
      window.postMessage(
        {
          method,
          data,
          target: TARGET,
          sender: SENDER.webpage,
          id: requestId,
        },
        window.origin
      );
    });
  },
  sendToPopupInternal: function (tab, request) {
    return new Promise((res, rej) => {
      chrome.runtime.onConnect.addListener(function connetionHandler(port) {
        port.onMessage.addListener(function messageHandler(response) {
          if (response.tabId !== tab.id) return;
          if (response.method === METHOD.requestData) {
            port.postMessage(request);
          }
          if (response.method === METHOD.returnData) {
            res(response);
          }
          chrome.tabs.onRemoved.addListener(function tabsHandler(tabId) {
            if (tab.id !== tabId) return;
            res({
              target: TARGET,
              sender: SENDER.extension,
              error: APIError.Refused,
            });
            chrome.runtime.onConnect.removeListener(connetionHandler);
            port.onMessage.removeListener(messageHandler);
            chrome.tabs.onRemoved.removeListener(tabsHandler);
          });
        });
      });
    });
  },
  createInternalController: () => new InternalController(),
  createProxyController: () => {
    //listen to events from background
    chrome.runtime.onMessage.addListener(async (response) => {
      if (
        typeof response !== 'object' ||
        response === null ||
        !response.target ||
        response.target !== TARGET ||
        !response.sender ||
        response.sender !== SENDER.extension ||
        !response.event
      )
        return;

      const whitelisted = await Messaging.sendToBackground({
        method: METHOD.isWhitelisted,
        origin: window.origin,
      });
      // protect background by not allowing not whitelisted
      if (!whitelisted || whitelisted.error) return;

      const event = new CustomEvent(`${TARGET}${response.event}`, {
        detail: response.data,
      });

      window.dispatchEvent(event);
    });
    //listen to function calls from webpage
    window.addEventListener('message', async function (e) {
      const request = e.data;
      if (
        typeof request !== 'object' ||
        request === null ||
        !request.target ||
        request.target !== TARGET ||
        !request.sender ||
        request.sender !== SENDER.webpage
      )
        return;
      request.origin = window.origin;
      //only allow enable function, before checking for whitelisted
      if (
        request.method === METHOD.enable ||
        request.method === METHOD.isEnabled
      ) {
        Messaging.sendToBackground({
          ...request,
        }).then((response) => window.postMessage(response));
        return;
      }

      const whitelisted = await Messaging.sendToBackground({
        method: METHOD.isWhitelisted,
        origin: window.origin,
      });

      // protect background by not allowing not whitelisted
      if (!whitelisted || whitelisted.error) {
        window.postMessage({ ...whitelisted, id: request.id });
        return;
      }
      await Messaging.sendToBackground(request).then((response) => {
        window.postMessage(response);
      });
    });
  },
  createBackgroundController: () => new BackgroundController(),
};
