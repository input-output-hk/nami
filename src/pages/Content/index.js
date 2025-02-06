import { Messaging } from '../../api/messaging';

const injectScript = () => {
  const script = document.createElement('script');
  script.async = false;
  script.src = chrome.runtime.getURL('injected.bundle.js');
  script.onload = function () {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);
};

async function shouldInject() {
  // do not inject since the migration is not dismissible anymore
  return false
}

if (await shouldInject()) {
  injectScript();
  Messaging.createProxyController();
}
