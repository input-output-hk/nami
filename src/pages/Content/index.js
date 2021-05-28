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

function shouldInject() {
  const documentElement = document.documentElement.nodeName;
  const docElemCheck = documentElement
    ? documentElement.toLowerCase() === 'html'
    : true;
  const { docType } = window.document;
  const docTypeCheck = docType ? docType.name === 'html' : true;
  return docElemCheck && docTypeCheck;
}

if (shouldInject) {
  injectScript();
  Messaging.createProxyController();
}
