"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.timeout = exports.postMessage = exports.origin = exports.messagePromises = exports.instance = exports.initPromise = exports.init = exports.error = exports.dispose = exports.clearTimeout = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _deferred = require("../utils/deferred");

var _constants = require("../constants");

var _urlUtils = require("../utils/urlUtils");

var _inlineStyles = _interopRequireDefault(require("./inline-styles"));

/* eslint-disable import/no-mutable-exports */
var instance;
exports.instance = instance;
var origin;
exports.origin = origin;
var initPromise = (0, _deferred.create)();
exports.initPromise = initPromise;
var timeout = 0;
exports.timeout = timeout;
var error;
/* eslint-enable import/no-mutable-exports */

exports.error = error;
var _messageID = 0; // every postMessage to iframe has its own promise to resolve

var messagePromises = {};
exports.messagePromises = messagePromises;

var init = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(settings) {
    var existedFrame, src, manifestString, manifest, onLoad;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            exports.initPromise = initPromise = (0, _deferred.create)();
            existedFrame = document.getElementById('trezorconnect');

            if (existedFrame) {
              exports.instance = instance = existedFrame;
            } else {
              exports.instance = instance = document.createElement('iframe');
              instance.frameBorder = '0';
              instance.width = '0px';
              instance.height = '0px';
              instance.style.position = 'absolute';
              instance.style.display = 'none';
              instance.style.border = '0px';
              instance.style.width = '0px';
              instance.style.height = '0px';
              instance.id = 'trezorconnect';
            }

            if (settings.env === 'web') {
              manifestString = settings.manifest ? JSON.stringify(settings.manifest) : 'undefined'; // note: btoa(undefined) === btoa('undefined') === "dW5kZWZpbmVk"

              manifest = "version=" + settings.version + "&manifest=" + encodeURIComponent(btoa(JSON.stringify(manifestString)));
              src = settings.iframeSrc + "?" + manifest;
            } else {
              src = settings.iframeSrc;
            }

            instance.setAttribute('src', src);

            if (settings.webusb) {
              instance.setAttribute('allow', 'usb');
            }

            exports.origin = origin = (0, _urlUtils.getOrigin)(instance.src);
            exports.timeout = timeout = window.setTimeout(function () {
              initPromise.reject(_constants.ERRORS.TypedError('Init_IframeTimeout'));
            }, 10000);

            onLoad = function onLoad() {
              if (!instance) {
                initPromise.reject(_constants.ERRORS.TypedError('Init_IframeBlocked'));
                return;
              }

              try {
                // if hosting page is able to access cross-origin location it means that the iframe is not loaded
                var iframeOrigin = instance.contentWindow.location.origin;

                if (!iframeOrigin || iframeOrigin === 'null') {
                  // eslint-disable-next-line no-use-before-define
                  handleIframeBlocked();
                  return;
                }
              } catch (e) {// empty
              }

              var extension; // $FlowIssue chrome is not declared outside

              if (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.onConnect !== 'undefined') {
                chrome.runtime.onConnect.addListener(function () {});
                extension = chrome.runtime.id;
              }

              instance.contentWindow.postMessage({
                type: _constants.IFRAME.INIT,
                payload: {
                  settings: settings,
                  extension: extension
                }
              }, origin);
              instance.onload = undefined;
            }; // IE hack


            if (instance.attachEvent) {
              instance.attachEvent('onload', onLoad);
            } else {
              instance.onload = onLoad;
            } // inject iframe into host document body


            if (document.body) {
              document.body.appendChild(instance); // eslint-disable-next-line no-use-before-define

              injectStyleSheet();
            }

            _context.prev = 11;
            _context.next = 14;
            return initPromise.promise;

          case 14:
            _context.next = 20;
            break;

          case 16:
            _context.prev = 16;
            _context.t0 = _context["catch"](11);

            // reset state to allow initialization again
            if (instance) {
              if (instance.parentNode) {
                instance.parentNode.removeChild(instance);
              }

              exports.instance = instance = null;
            }

            throw _context.t0;

          case 20:
            _context.prev = 20;
            window.clearTimeout(timeout);
            exports.timeout = timeout = 0;
            return _context.finish(20);

          case 24:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[11, 16, 20, 24]]);
  }));

  return function init(_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.init = init;

var injectStyleSheet = function injectStyleSheet() {
  if (!instance) {
    throw _constants.ERRORS.TypedError('Init_IframeBlocked');
  }

  var doc = instance.ownerDocument;
  var head = doc.head || doc.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.setAttribute('type', 'text/css');
  style.setAttribute('id', 'TrezorConnectStylesheet'); // $FlowIssue

  if (style.styleSheet) {
    // IE
    // $FlowIssue
    style.styleSheet.cssText = _inlineStyles["default"];
    head.appendChild(style);
  } else {
    style.appendChild(document.createTextNode(_inlineStyles["default"]));
    head.append(style);
  }
};

var handleIframeBlocked = function handleIframeBlocked() {
  window.clearTimeout(timeout);
  exports.error = error = _constants.ERRORS.TypedError('Init_IframeBlocked'); // eslint-disable-next-line no-use-before-define

  dispose();
  initPromise.reject(error);
}; // post messages to iframe


var postMessage = function postMessage(message, usePromise) {
  if (usePromise === void 0) {
    usePromise = true;
  }

  if (!instance) {
    throw _constants.ERRORS.TypedError('Init_IframeBlocked');
  }

  if (usePromise) {
    _messageID++;
    message.id = _messageID;
    messagePromises[_messageID] = (0, _deferred.create)();
    var promise = messagePromises[_messageID].promise;
    instance.contentWindow.postMessage(message, origin);
    return promise;
  }

  instance.contentWindow.postMessage(message, origin);
  return null;
};

exports.postMessage = postMessage;

var dispose = function dispose() {
  if (instance && instance.parentNode) {
    try {
      instance.parentNode.removeChild(instance);
    } catch (e) {// do nothing
    }
  }

  exports.instance = instance = null;
  exports.timeout = timeout = 0;
};

exports.dispose = dispose;

var clearTimeout = function clearTimeout() {
  window.clearTimeout(timeout);
};

exports.clearTimeout = clearTimeout;