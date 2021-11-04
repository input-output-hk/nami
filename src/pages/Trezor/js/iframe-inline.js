window.parent.postMessage(
  {
    event: 'UI_EVENT',
    type: 'iframe-bootstrap',
  },
  '*'
);

const iframeScript = document.createElement('script');
iframeScript.setAttribute('type', 'text/javascript');
iframeScript.setAttribute('src', './js/iframe.ab387967c9f99116789b.js');
iframeScript.setAttribute('async', 'false');
document.body.appendChild(iframeScript);
