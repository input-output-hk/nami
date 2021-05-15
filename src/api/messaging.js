import { METHOD, SENDER, TARGET } from '../config/config';

/**
 * Message Object
 * {
 *  ?method: METHOD,
 *  ?data: DATA,
 *  ?error: ERROR,
 *  sender: SENDER (extension || webpage),
 *  target: TARGET,
 *  ?id: requestId
 * }
 */

class InternalController {
  requestData = async () =>
    await new Promise(async (res, rej) => {
      this.port = chrome.runtime.connect({
        name: 'internal-background-popup-communication',
      });

      this.tabId = await new Promise((res, rej) =>
        chrome.tabs.getCurrent((tab) => res(tab.id))
      );
      const self = this;
      this.port.onMessage.addListener(function messageHandler(response) {
        self.port.onMessage.removeListener(messageHandler);
        res(response);
      });
      this.port.postMessage({ tabId: this.tabId, method: METHOD.requestData });
    });

  returnData = (data) => {
    this.port.postMessage({
      data,
      method: METHOD.returnData,
      tabId: this.tabId,
    });
  };
}

class BackgroundController {
  constructor() {
    /**
     * @private
     */
    this._webpageMethods = {};
    /**
     * @private
     */
    this._extensionMethods = {};
  }

  /**
   * @callback methodCallback
   * @param {object} request
   * @param {function} sendResponse
   */
  /**
   * @param {string} method
   * @param {methodCallback} func
   */
  extension = (method, func) => {
    this._extensionMethods[method] = func;
  };

  /**
   * @param {string} method
   * @param {methodCallback} func
   */
  webpage = (method, func) => {
    this._webpageMethods[method] = func;
  };

  listen = () => {
    chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
      if (request.sender === SENDER.extension) {
        this._extensionMethods[request.method](request, sendResponse);
      } else if (request.sender === SENDER.webpage) {
        this._webpageMethods[request.method](request, sendResponse);
      }
      return true;
    });
  };
}

export const Messaging = {
  sendToBackground: async function (content) {
    return new Promise((res, rej) =>
      chrome.runtime.sendMessage({ ...content, target: TARGET }, (response) =>
        res(response)
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
  sendToPopupInternal: function (tab, content) {
    return new Promise((res, rej) => {
      chrome.runtime.onConnect.addListener(function connetionHandler(port) {
        console.log('Connected .....');
        port.onMessage.addListener(function messageHandler(response) {
          if (response.tabId !== tab.id) return;
          if (response.method === METHOD.requestData) {
            port.postMessage({ method: content.method, data: content.data });
          }
          if (response.method === METHOD.returnData) {
            res({
              target: TARGET,
              sender: SENDER.extension,
              id: response.id,
              data: response.data,
            });
          }
          chrome.tabs.onRemoved.addListener(function tabsHandler(tabId) {
            if (tab.id !== tabId) return;
            res({
              target: TARGET,
              sender: SENDER.extension,
              id: response.id,
              error: 'window unexpectedly closed',
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
  createProxyController: () =>
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
      //only allow enable function, before checking for whitelisted
      if (
        request.method === METHOD.enable ||
        request.method === METHOD.isEnabled
      ) {
        Messaging.sendToBackground({
          ...request,
          data: window.origin,
        }).then((response) => window.postMessage(response));
        return;
      }

      const whitelisted = await Messaging.sendToBackground({
        method: METHOD.isWhitelisted,
        sender: SENDER.extension,
        data: window.origin,
      });

      // protect background by not allowing not whitelisted
      if (whitelisted.error) {
        window.postMessage({ ...whitelisted, id: request.id });
        return;
      }

      await Messaging.sendToBackground(request).then((response) =>
        window.postMessage(response)
      );
    }),
  createBackgroundController: () => new BackgroundController(),
};
