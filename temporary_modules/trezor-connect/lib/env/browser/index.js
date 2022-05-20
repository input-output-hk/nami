"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.uiResponse = exports.requestLogin = exports.renderWebUSBButton = exports.manifest = exports.init = exports.getSettings = exports.eventEmitter = exports.dispose = exports.disableWebUSB = exports.customMessage = exports.cancel = exports.call = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _events = _interopRequireDefault(require("events"));

var _PopupManager = _interopRequireDefault(require("../../popup/PopupManager"));

var iframe = _interopRequireWildcard(require("../../iframe/builder"));

var _button = _interopRequireDefault(require("../../webusb/button"));

var _message = require("../../message");

var _builder2 = require("../../message/builder");

var _ConnectSettings = require("../../data/ConnectSettings");

var _debug = require("../../utils/debug");

var _constants = require("../../constants");

var $T = _interopRequireWildcard(require("../../types"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

var eventEmitter = new _events["default"]();
exports.eventEmitter = eventEmitter;

var _log = (0, _debug.initLog)('[trezor-connect.js]');

var _settings = (0, _ConnectSettings.parse)();

var _popupManager;

var initPopupManager = function initPopupManager() {
  var pm = new _PopupManager["default"](_settings);
  pm.on(_constants.POPUP.CLOSED, function (error) {
    iframe.postMessage({
      type: _constants.POPUP.CLOSED,
      payload: error ? {
        error: error
      } : null
    }, false);
  });
  return pm;
};

var manifest = function manifest(data) {
  _settings = (0, _ConnectSettings.parse)(_objectSpread(_objectSpread({}, _settings), {}, {
    manifest: data
  }));
};

exports.manifest = manifest;

var dispose = function dispose() {
  eventEmitter.removeAllListeners();
  iframe.dispose();
  _settings = (0, _ConnectSettings.parse)();

  if (_popupManager) {
    _popupManager.close();
  }
};

exports.dispose = dispose;

var cancel = function cancel(error) {
  if (_popupManager) {
    _popupManager.emit(_constants.POPUP.CLOSED, error);
  }
}; // handle message received from iframe


exports.cancel = cancel;

var handleMessage = function handleMessage(messageEvent) {
  // ignore messages from domain other then iframe origin
  if (messageEvent.origin !== iframe.origin) return;
  var message = (0, _message.parseMessage)(messageEvent.data);
  var event = message.event,
      type = message.type,
      payload = message.payload;
  var id = message.id || 0;

  _log.log('handleMessage', message);

  switch (event) {
    case _constants.RESPONSE_EVENT:
      if (iframe.messagePromises[id]) {
        // resolve message promise (send result of call method)
        iframe.messagePromises[id].resolve({
          id: id,
          success: message.success,
          payload: payload
        });
        delete iframe.messagePromises[id];
      } else {
        _log.warn("Unknown message id " + id);
      }

      break;

    case _constants.DEVICE_EVENT:
      // pass DEVICE event up to html
      eventEmitter.emit(event, message);
      eventEmitter.emit(type, payload); // DEVICE_EVENT also emit single events (connect/disconnect...)

      break;

    case _constants.TRANSPORT_EVENT:
      eventEmitter.emit(event, message);
      eventEmitter.emit(type, payload);
      break;

    case _constants.BLOCKCHAIN_EVENT:
      eventEmitter.emit(event, message);
      eventEmitter.emit(type, payload);
      break;

    case _constants.UI_EVENT:
      if (type === _constants.IFRAME.BOOTSTRAP) {
        iframe.clearTimeout();
        break;
      }

      if (type === _constants.IFRAME.LOADED) {
        iframe.initPromise.resolve();
      }

      if (type === _constants.IFRAME.ERROR) {
        iframe.initPromise.reject(payload.error);
      } // pass UI event up


      eventEmitter.emit(event, message);
      eventEmitter.emit(type, payload);
      break;

    default:
      _log.log('Undefined message', event, messageEvent);

  }
};

var init = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(settings) {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (settings === void 0) {
              settings = {};
            }

            if (!iframe.instance) {
              _context.next = 3;
              break;
            }

            throw _constants.ERRORS.TypedError('Init_AlreadyInitialized');

          case 3:
            _settings = (0, _ConnectSettings.parse)(_objectSpread(_objectSpread({}, _settings), settings));

            if (_settings.manifest) {
              _context.next = 6;
              break;
            }

            throw _constants.ERRORS.TypedError('Init_ManifestMissing');

          case 6:
            if (!_settings.lazyLoad) {
              _context.next = 9;
              break;
            }

            // reset "lazyLoad" after first use
            _settings.lazyLoad = false;
            return _context.abrupt("return");

          case 9:
            if (!_popupManager) {
              _popupManager = initPopupManager();
            }

            _log.enabled = !!_settings.debug;
            window.addEventListener('message', handleMessage);
            window.addEventListener('unload', dispose);
            _context.next = 15;
            return iframe.init(_settings);

          case 15:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function init(_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.init = init;

var call = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(params) {
    var response;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!(!iframe.instance && !iframe.timeout)) {
              _context2.next = 15;
              break;
            }

            // init popup with lazy loading before iframe initialization
            _settings = (0, _ConnectSettings.parse)(_settings);

            if (_settings.manifest) {
              _context2.next = 4;
              break;
            }

            return _context2.abrupt("return", (0, _message.errorMessage)(_constants.ERRORS.TypedError('Init_ManifestMissing')));

          case 4:
            if (!_popupManager) {
              _popupManager = initPopupManager();
            }

            _popupManager.request(true); // auto init with default settings


            _context2.prev = 6;
            _context2.next = 9;
            return init(_settings);

          case 9:
            _context2.next = 15;
            break;

          case 11:
            _context2.prev = 11;
            _context2.t0 = _context2["catch"](6);

            if (_popupManager) {
              // Catch fatal iframe errors (not loading)
              if (['Init_IframeBlocked', 'Init_IframeTimeout'].includes(_context2.t0.code)) {
                _popupManager.postMessage((0, _builder2.UiMessage)(_constants.UI.IFRAME_FAILURE));
              } else {
                _popupManager.close();
              }
            }

            return _context2.abrupt("return", (0, _message.errorMessage)(_context2.t0));

          case 15:
            if (!iframe.timeout) {
              _context2.next = 17;
              break;
            }

            return _context2.abrupt("return", (0, _message.errorMessage)(_constants.ERRORS.TypedError('Init_ManifestMissing')));

          case 17:
            if (!iframe.error) {
              _context2.next = 19;
              break;
            }

            return _context2.abrupt("return", (0, _message.errorMessage)(iframe.error));

          case 19:
            // request popup window it might be used in the future
            if (_settings.popup && _popupManager) {
              _popupManager.request();
            } // post message to iframe


            _context2.prev = 20;
            _context2.next = 23;
            return iframe.postMessage({
              type: _constants.IFRAME.CALL,
              payload: params
            });

          case 23:
            response = _context2.sent;

            if (!response) {
              _context2.next = 27;
              break;
            }

            if (!response.success && response.payload.code !== 'Device_CallInProgress' && _popupManager) {
              _popupManager.unlock();
            }

            return _context2.abrupt("return", response);

          case 27:
            if (_popupManager) {
              _popupManager.unlock();
            }

            return _context2.abrupt("return", (0, _message.errorMessage)(_constants.ERRORS.TypedError('Method_NoResponse')));

          case 31:
            _context2.prev = 31;
            _context2.t1 = _context2["catch"](20);

            _log.error('__call error', _context2.t1);

            if (_popupManager) {
              _popupManager.close();
            }

            return _context2.abrupt("return", (0, _message.errorMessage)(_context2.t1));

          case 36:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[6, 11], [20, 31]]);
  }));

  return function call(_x2) {
    return _ref2.apply(this, arguments);
  };
}();

exports.call = call;

var customMessageResponse = function customMessageResponse(payload) {
  iframe.postMessage({
    event: _constants.UI_EVENT,
    type: _constants.UI.CUSTOM_MESSAGE_RESPONSE,
    payload: payload
  });
};

var uiResponse = function uiResponse(response) {
  if (!iframe.instance) {
    throw _constants.ERRORS.TypedError('Init_NotInitialized');
  }

  var type = response.type,
      payload = response.payload;
  iframe.postMessage({
    event: _constants.UI_EVENT,
    type: type,
    payload: payload
  });
};

exports.uiResponse = uiResponse;

var renderWebUSBButton = function renderWebUSBButton(className) {
  (0, _button["default"])(className, _settings.webusbSrc, iframe.origin);
};

exports.renderWebUSBButton = renderWebUSBButton;

var getSettings = function getSettings() {
  if (!iframe.instance) {
    return Promise.resolve((0, _message.errorMessage)(_constants.ERRORS.TypedError('Init_NotInitialized')));
  }

  return call({
    method: 'getSettings'
  });
};

exports.getSettings = getSettings;

var customMessage = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(params) {
    var callback, customMessageListener, response;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            if (iframe.instance) {
              _context4.next = 2;
              break;
            }

            throw _constants.ERRORS.TypedError('Init_NotInitialized');

          case 2:
            if (!(typeof params.callback !== 'function')) {
              _context4.next = 4;
              break;
            }

            return _context4.abrupt("return", (0, _message.errorMessage)(_constants.ERRORS.TypedError('Method_CustomMessage_Callback')));

          case 4:
            // TODO: set message listener only if iframe is loaded correctly
            callback = params.callback;

            customMessageListener = /*#__PURE__*/function () {
              var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(event) {
                var data, payload;
                return _regenerator["default"].wrap(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        data = event.data;

                        if (!(data && data.type === _constants.UI.CUSTOM_MESSAGE_REQUEST)) {
                          _context3.next = 6;
                          break;
                        }

                        _context3.next = 4;
                        return callback(data.payload);

                      case 4:
                        payload = _context3.sent;

                        if (payload) {
                          customMessageResponse(payload);
                        } else {
                          customMessageResponse({
                            message: 'release'
                          });
                        }

                      case 6:
                      case "end":
                        return _context3.stop();
                    }
                  }
                }, _callee3);
              }));

              return function customMessageListener(_x4) {
                return _ref4.apply(this, arguments);
              };
            }();

            window.addEventListener('message', customMessageListener, false);
            _context4.next = 9;
            return call(_objectSpread(_objectSpread({
              method: 'customMessage'
            }, params), {}, {
              callback: null
            }));

          case 9:
            response = _context4.sent;
            window.removeEventListener('message', customMessageListener);
            return _context4.abrupt("return", response);

          case 12:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function customMessage(_x3) {
    return _ref3.apply(this, arguments);
  };
}();

exports.customMessage = customMessage;

var requestLogin = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(params) {
    var callback, loginChallengeListener, response;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            if (iframe.instance) {
              _context6.next = 2;
              break;
            }

            throw _constants.ERRORS.TypedError('Init_NotInitialized');

          case 2:
            if (!(typeof params.callback === 'function')) {
              _context6.next = 11;
              break;
            }

            callback = params.callback; // TODO: set message listener only if iframe is loaded correctly

            loginChallengeListener = /*#__PURE__*/function () {
              var _ref6 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(event) {
                var data, payload;
                return _regenerator["default"].wrap(function _callee5$(_context5) {
                  while (1) {
                    switch (_context5.prev = _context5.next) {
                      case 0:
                        data = event.data;

                        if (!(data && data.type === _constants.UI.LOGIN_CHALLENGE_REQUEST)) {
                          _context5.next = 12;
                          break;
                        }

                        _context5.prev = 2;
                        _context5.next = 5;
                        return callback();

                      case 5:
                        payload = _context5.sent;
                        iframe.postMessage({
                          event: _constants.UI_EVENT,
                          type: _constants.UI.LOGIN_CHALLENGE_RESPONSE,
                          payload: payload
                        });
                        _context5.next = 12;
                        break;

                      case 9:
                        _context5.prev = 9;
                        _context5.t0 = _context5["catch"](2);
                        iframe.postMessage({
                          event: _constants.UI_EVENT,
                          type: _constants.UI.LOGIN_CHALLENGE_RESPONSE,
                          payload: _context5.t0.message
                        });

                      case 12:
                      case "end":
                        return _context5.stop();
                    }
                  }
                }, _callee5, null, [[2, 9]]);
              }));

              return function loginChallengeListener(_x6) {
                return _ref6.apply(this, arguments);
              };
            }();

            window.addEventListener('message', loginChallengeListener, false);
            _context6.next = 8;
            return call(_objectSpread(_objectSpread({
              method: 'requestLogin'
            }, params), {}, {
              asyncChallenge: true,
              callback: null
            }));

          case 8:
            response = _context6.sent;
            window.removeEventListener('message', loginChallengeListener);
            return _context6.abrupt("return", response);

          case 11:
            return _context6.abrupt("return", call(_objectSpread({
              method: 'requestLogin'
            }, params)));

          case 12:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function requestLogin(_x5) {
    return _ref5.apply(this, arguments);
  };
}();

exports.requestLogin = requestLogin;

var disableWebUSB = function disableWebUSB() {
  if (!iframe.instance) {
    throw _constants.ERRORS.TypedError('Init_NotInitialized');
  }

  iframe.postMessage({
    event: _constants.UI_EVENT,
    type: _constants.TRANSPORT.DISABLE_WEBUSB
  });
};

exports.disableWebUSB = disableWebUSB;