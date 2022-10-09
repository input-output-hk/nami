"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _events = _interopRequireDefault(require("events"));

var POPUP = _interopRequireWildcard(require("../constants/popup"));

var IFRAME = _interopRequireWildcard(require("../constants/iframe"));

var UI = _interopRequireWildcard(require("../constants/ui"));

var _showPopupRequest = require("./showPopupRequest");

var _urlUtils = require("../utils/urlUtils");

var _deferred = require("../utils/deferred");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// const POPUP_REQUEST_TIMEOUT = 602;
var POPUP_REQUEST_TIMEOUT = 850;
var POPUP_CLOSE_INTERVAL = 500;
var POPUP_OPEN_TIMEOUT = 3000;

var PopupManager = /*#__PURE__*/function (_EventEmitter) {
  (0, _inheritsLoose2["default"])(PopupManager, _EventEmitter);

  // Window
  function PopupManager(settings) {
    var _this;

    _this = _EventEmitter.call(this) || this;
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "requestTimeout", 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "closeInterval", 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "extensionTabId", 0);
    _this.settings = settings;
    _this.origin = (0, _urlUtils.getOrigin)(settings.popupSrc);
    _this.handleMessage = _this.handleMessage.bind((0, _assertThisInitialized2["default"])(_this));
    _this.iframeHandshake = (0, _deferred.create)(IFRAME.LOADED);

    if (_this.settings.env === 'webextension' && false) {
      _this.handleExtensionConnect = _this.handleExtensionConnect.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleExtensionMessage = _this.handleExtensionMessage.bind((0, _assertThisInitialized2["default"])(_this)); // $FlowIssue chrome not declared outside

      chrome.runtime.onConnect.addListener(_this.handleExtensionConnect);
    }

    window.addEventListener('message', _this.handleMessage, false);
    return _this;
  }

  var _proto = PopupManager.prototype;

  _proto.request = function request(lazyLoad) {
    var _this2 = this;

    if (lazyLoad === void 0) {
      lazyLoad = false;
    }

    // popup request
    // TODO: ie - open immediately and hide it but post handshake after timeout
    // bring popup window to front
    if (this.locked) {
      if (this._window) {
        if (this.settings.env === 'webextension' && false) {
          // $FlowIssue chrome not declared outside
          chrome.tabs.update(this._window.id, {
            active: true
          });
        } else {
          this._window.focus();
        }
      }

      return;
    }

    var openFn = this.open.bind(this);
    this.locked = true;

    if (!this.settings.supportedBrowser) {
      openFn();
    } else {
      var timeout = lazyLoad || this.settings.env === 'webextension' && false ? 1 : POPUP_REQUEST_TIMEOUT;
      this.requestTimeout = window.setTimeout(function () {
        _this2.requestTimeout = 0;
        openFn(lazyLoad);
      }, timeout);
    }
  };

  _proto.cancel = function cancel() {
    this.close();
  };

  _proto.unlock = function unlock() {
    this.locked = false;
  };

  _proto.open = function open(lazyLoad) {
    var _this3 = this;

    var src = this.settings.popupSrc;

    if (!this.settings.supportedBrowser) {
      this.openWrapper(src + "#unsupported");
      return;
    }

    this.popupPromise = (0, _deferred.create)(POPUP.LOADED);
    this.openWrapper(lazyLoad ? src + "#loading" : src);
    this.closeInterval = window.setInterval(function () {
      if (!_this3._window) return;

      if (_this3.settings.env === 'webextension' && false) {
        // $FlowIssue chrome not declared outside
        chrome.tabs.get(_this3._window.id, function (tab) {
          if (!tab) {
            _this3.close();

            _this3.emit(POPUP.CLOSED);
          }
        });
      } else if (_this3._window.closed) {
        _this3.close();

        _this3.emit(POPUP.CLOSED);
      }
    }, POPUP_CLOSE_INTERVAL); // open timeout will be cancelled by POPUP.BOOTSTRAP message

    this.openTimeout = window.setTimeout(function () {
      _this3.close();

      (0, _showPopupRequest.showPopupRequest)(_this3.open.bind(_this3), function () {
        _this3.emit(POPUP.CLOSED);
      });
    }, POPUP_OPEN_TIMEOUT);
  };

  _proto.openWrapper = function openWrapper(url) {
    var _this4 = this;

    if (this.settings.env === 'webextension' && false) {
      // $FlowIssue chrome not declared outside
      chrome.windows.getCurrent(null, function (currentWindow) {
        // Request coming from extension popup,
        // create new window above instead of opening new tab
        if (currentWindow.type !== 'normal') {
          // $FlowIssue chrome not declared outside
          chrome.windows.create({
            url: url
          }, function (newWindow) {
            // $FlowIssue chrome not declared outside
            chrome.tabs.query({
              windowId: newWindow.id,
              active: true
            }, function (tabs) {
              // eslint-disable-next-line prefer-destructuring
              _this4._window = tabs[0];
            });
          });
        } else {
          // $FlowIssue chrome not declared outside
          chrome.tabs.query({
            currentWindow: true,
            active: true
          }, function (tabs) {
            _this4.extensionTabId = tabs[0].id; // $FlowIssue chrome not declared outside

            chrome.tabs.create({
              url: url,
              index: tabs[0].index + 1
            }, function (tab) {
              _this4._window = tab;
            });
          });
        }
      });
    } else if (this.settings.env === 'electron') {
      this._window = window.open(url, 'modal');
    } else {
      var f = document.getElementById('trezorPopupNami');
      f.src = url;
      this._window = f.contentWindow; // if (this._window) {
      //     this._window.location.href = url; // otherwise android/chrome loose window.opener reference
      // }
    }
  };

  _proto.handleExtensionConnect = function handleExtensionConnect(port) {
    if (port.name !== 'trezor-connect') return;

    if (!this._window || this._window && this._window.id !== port.sender.tab.id) {
      port.disconnect();
      return;
    } // since POPUP.BOOTSTRAP will not be handled by "handleMessage" we need to threat "content-script" connection as the same event
    // popup is opened properly, now wait for POPUP.LOADED message (in this case handled by "handleExtensionMessage")


    window.clearTimeout(this.openTimeout);
    this.extensionPort = port; // $FlowIssue need to update ChromePort definition

    this.extensionPort.onMessage.addListener(this.handleExtensionMessage);
  };

  _proto.handleExtensionMessage = function handleExtensionMessage(message) {
    var _this5 = this;

    if (!this.extensionPort) return;
    var port = this.extensionPort;
    var data = message.data;
    if (!data || typeof data !== 'object') return;

    if (data.type === POPUP.ERROR) {
      // handle popup error
      var errorMessage = data.payload && typeof data.payload.error === 'string' ? data.payload.error : null;
      this.emit(POPUP.CLOSED, errorMessage ? "Popup error: " + errorMessage : null);
      this.close();
    } else if (data.type === POPUP.LOADED) {
      if (this.popupPromise) {
        this.popupPromise.resolve();
      }

      this.iframeHandshake.promise.then(function (useBroadcastChannel) {
        port.postMessage({
          type: POPUP.INIT,
          payload: {
            settings: _this5.settings,
            useBroadcastChannel: useBroadcastChannel
          }
        });
      });
    } else if (data.type === POPUP.EXTENSION_USB_PERMISSIONS) {
      // $FlowIssue chrome not declared outside
      chrome.tabs.query({
        currentWindow: true,
        active: true
      }, function (tabs) {
        // $FlowIssue chrome not declared outside
        chrome.tabs.create({
          url: 'trezor-usb-permissions.html',
          index: tabs[0].index + 1
        }, function (_tab) {// do nothing
        });
      });
    } else if (data.type === POPUP.CLOSE_WINDOW) {
      this.emit(POPUP.CLOSED);
      this.close();
    }
  };

  _proto.handleMessage = function handleMessage(message) {
    var _this6 = this;

    // ignore messages from domain other then popup origin and without data
    // const data: CoreMessage = message.data;
    var data = message.data;
    if ((0, _urlUtils.getOrigin)(message.origin) !== this.origin || !data || typeof data !== 'object') return;

    if (data.type === IFRAME.LOADED) {
      var useBroadcastChannel = data.payload && typeof data.payload.useBroadcastChannel === 'boolean' ? data.payload.useBroadcastChannel : false;
      this.iframeHandshake.resolve(useBroadcastChannel);
    } else if (data.type === POPUP.BOOTSTRAP) {
      // popup is opened properly, now wait for POPUP.LOADED message
      window.clearTimeout(this.openTimeout);
    } else if (data.type === POPUP.ERROR && this._window) {
      var errorMessage = data.payload && typeof data.payload.error === 'string' ? data.payload.error : null;
      this.emit(POPUP.CLOSED, errorMessage ? "Popup error: " + errorMessage : null);
      this.close();
    } else if (data.type === POPUP.LOADED) {
      if (this.popupPromise) {
        this.popupPromise.resolve();
      } // popup is successfully loaded


      this.iframeHandshake.promise.then(function (useBroadcastChannel) {
        _this6._window.postMessage({
          type: POPUP.INIT,
          payload: {
            settings: _this6.settings,
            useBroadcastChannel: useBroadcastChannel
          }
        }, _this6.origin);
      }); // send ConnectSettings to popup
      // note this settings and iframe.ConnectSettings could be different (especially: origin, popup, webusb, debug)
      // now popup is able to load assets
    } else if (data.type === POPUP.CANCEL_POPUP_REQUEST || data.type === UI.CLOSE_UI_WINDOW) {
      this.close();
    }
  };

  _proto.close = function close() {
    this.locked = false;
    this.popupPromise = undefined;

    if (this.requestTimeout) {
      window.clearTimeout(this.requestTimeout);
      this.requestTimeout = 0;
    }

    if (this.openTimeout) {
      window.clearTimeout(this.openTimeout);
      this.openTimeout = 0;
    }

    if (this.closeInterval) {
      window.clearInterval(this.closeInterval);
      this.closeInterval = 0;
    }

    if (this.extensionPort) {
      this.extensionPort.disconnect();
      this.extensionPort = null;
    } // switch to previously focused tab


    if (this.extensionTabId) {
      // $FlowIssue chrome not declared outside
      chrome.tabs.update(this.extensionTabId, {
        active: true
      });
      this.extensionTabId = 0;
    }

    if (this._window) {
      if (this.settings.env === 'webextension' && false) {
        // eslint-disable-next-line no-unused-vars
        var _e = chrome.runtime.lastError; // $FlowIssue chrome not declared outside

        chrome.tabs.remove(this._window.id, function () {
          // eslint-disable-next-line no-unused-vars
          _e = chrome.runtime.lastError;
        });
      } else {
        this._window.close();
      }

      this._window = null;
    }
  };

  _proto.postMessage = /*#__PURE__*/function () {
    var _postMessage = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(message) {
      var _this7 = this;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!(!this._window && message.type !== UI.REQUEST_UI_WINDOW && this.openTimeout)) {
                _context.next = 4;
                break;
              }

              this.close();
              (0, _showPopupRequest.showPopupRequest)(this.open.bind(this), function () {
                _this7.emit(POPUP.CLOSED);
              });
              return _context.abrupt("return");

            case 4:
              if (!this.popupPromise) {
                _context.next = 7;
                break;
              }

              _context.next = 7;
              return this.popupPromise.promise;

            case 7:
              // post message to popup window
              if (this._window) {
                this._window.postMessage(message, this.origin);
              }

            case 8:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function postMessage(_x) {
      return _postMessage.apply(this, arguments);
    }

    return postMessage;
  }();

  return PopupManager;
}(_events["default"]);

exports["default"] = PopupManager;