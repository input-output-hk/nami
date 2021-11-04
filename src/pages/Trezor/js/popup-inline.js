if (window.top) {
  window.top.postMessage({ type: 'popup-bootstrap' }, '*');
} else {
  window.postMessage({ type: 'popup-bootstrap' }, '*');
}

const popupScript = document.createElement('script');
popupScript.setAttribute('type', 'text/javascript');
popupScript.setAttribute('src', './js/popup.a60314503d60e2a4a859.js');
popupScript.setAttribute('async', 'false');
document.body.appendChild(popupScript);
