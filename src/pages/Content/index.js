import { Messaging } from '../../api/messaging';

const injectScript = () => {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('injected.bundle.js');
  script.onload = function () {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);
};

Messaging.createProxyController();
injectScript();
