import { POPUP_WINDOW } from '../config/config';

export const createPopup = (popup) =>
  new Promise((res, rej) =>
    chrome.tabs.create(
      {
        url: chrome.runtime.getURL(popup),
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
