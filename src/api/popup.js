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

export const getCurrentWebpage = () =>
  new Promise((res, rej) => {
    chrome.tabs.query(
      {
        active: true, //fetch active tabs
        currentWindow: true, //fetch tabs in current window
        status: 'complete', //fetch completely loaded windows
        windowType: 'normal', //fetch normal windows
      },
      function (tabs) {
        res(tabs[0]); // Use this URL as needed
      }
    );
  });
