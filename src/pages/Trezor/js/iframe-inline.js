window.parent.postMessage({ event: 'UI_EVENT', type: 'iframe-bootstrap' }, '*');
const iframeScript = document.createElement('script');
iframeScript.setAttribute('type', 'text/javascript'),
  iframeScript.setAttribute('src', './js/iframe.d84c7fd7e19c8f2ec05e.js'),
  iframeScript.setAttribute('async', 'false'),
  document.body.appendChild(iframeScript);
