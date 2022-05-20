"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
var _exportNames = {};
exports["default"] = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _constants = require("./constants");

Object.keys(_constants).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _constants[key]) return;
  exports[key] = _constants[key];
});

var _node = require("./env/node");

var _types = require("./types");

Object.keys(_types).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _types[key]) return;
  exports[key] = _types[key];
});

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

var TrezorConnect = {
  manifest: _node.manifest,
  init: _node.init,
  getSettings: _node.getSettings,
  on: function on(type, fn) {
    _node.eventEmitter.on(type, fn);
  },
  off: function off(type, fn) {
    _node.eventEmitter.removeListener(type, fn);
  },
  removeAllListeners: function removeAllListeners() {
    _node.eventEmitter.removeAllListeners();
  },
  uiResponse: _node.uiResponse,
  // methods
  blockchainGetAccountBalanceHistory: function blockchainGetAccountBalanceHistory(params) {
    return (0, _node.call)(_objectSpread({
      method: 'blockchainGetAccountBalanceHistory'
    }, params));
  },
  blockchainGetCurrentFiatRates: function blockchainGetCurrentFiatRates(params) {
    return (0, _node.call)(_objectSpread({
      method: 'blockchainGetCurrentFiatRates'
    }, params));
  },
  blockchainGetFiatRatesForTimestamps: function blockchainGetFiatRatesForTimestamps(params) {
    return (0, _node.call)(_objectSpread({
      method: 'blockchainGetFiatRatesForTimestamps'
    }, params));
  },
  blockchainDisconnect: function blockchainDisconnect(params) {
    return (0, _node.call)(_objectSpread({
      method: 'blockchainDisconnect'
    }, params));
  },
  blockchainEstimateFee: function blockchainEstimateFee(params) {
    return (0, _node.call)(_objectSpread({
      method: 'blockchainEstimateFee'
    }, params));
  },
  blockchainGetTransactions: function blockchainGetTransactions(params) {
    return (0, _node.call)(_objectSpread({
      method: 'blockchainGetTransactions'
    }, params));
  },
  blockchainSetCustomBackend: function blockchainSetCustomBackend(params) {
    return (0, _node.call)(_objectSpread({
      method: 'blockchainSetCustomBackend'
    }, params));
  },
  blockchainSubscribe: function blockchainSubscribe(params) {
    return (0, _node.call)(_objectSpread({
      method: 'blockchainSubscribe'
    }, params));
  },
  blockchainSubscribeFiatRates: function blockchainSubscribeFiatRates(params) {
    return (0, _node.call)(_objectSpread({
      method: 'blockchainSubscribeFiatRates'
    }, params));
  },
  blockchainUnsubscribe: function blockchainUnsubscribe(params) {
    return (0, _node.call)(_objectSpread({
      method: 'blockchainUnsubscribe'
    }, params));
  },
  blockchainUnsubscribeFiatRates: function blockchainUnsubscribeFiatRates(params) {
    return (0, _node.call)(_objectSpread({
      method: 'blockchainUnsubscribeFiatRates'
    }, params));
  },
  customMessage: function customMessage(params) {
    return (0, _node.customMessage)(params);
  },
  requestLogin: function requestLogin(params) {
    return (0, _node.requestLogin)(params);
  },
  cardanoGetAddress: function cardanoGetAddress(params) {
    var useEventListener = _node.eventEmitter.listenerCount(_constants.UI.ADDRESS_VALIDATION) > 0;
    return (0, _node.call)(_objectSpread(_objectSpread({
      method: 'cardanoGetAddress'
    }, params), {}, {
      useEventListener: useEventListener
    }));
  },
  cardanoGetNativeScriptHash: function cardanoGetNativeScriptHash(params) {
    return (0, _node.call)(_objectSpread({
      method: 'cardanoGetNativeScriptHash'
    }, params));
  },
  cardanoGetPublicKey: function cardanoGetPublicKey(params) {
    return (0, _node.call)(_objectSpread({
      method: 'cardanoGetPublicKey'
    }, params));
  },
  cardanoSignTransaction: function cardanoSignTransaction(params) {
    return (0, _node.call)(_objectSpread({
      method: 'cardanoSignTransaction'
    }, params));
  },
  cipherKeyValue: function cipherKeyValue(params) {
    return (0, _node.call)(_objectSpread({
      method: 'cipherKeyValue'
    }, params));
  },
  composeTransaction: function composeTransaction(params) {
    return (0, _node.call)(_objectSpread({
      method: 'composeTransaction'
    }, params));
  },
  ethereumGetAddress: function ethereumGetAddress(params) {
    var useEventListener = _node.eventEmitter.listenerCount(_constants.UI.ADDRESS_VALIDATION) > 0;
    return (0, _node.call)(_objectSpread(_objectSpread({
      method: 'ethereumGetAddress'
    }, params), {}, {
      useEventListener: useEventListener
    }));
  },
  ethereumGetPublicKey: function ethereumGetPublicKey(params) {
    return (0, _node.call)(_objectSpread({
      method: 'ethereumGetPublicKey'
    }, params));
  },
  ethereumSignMessage: function ethereumSignMessage(params) {
    return (0, _node.call)(_objectSpread({
      method: 'ethereumSignMessage'
    }, params));
  },
  ethereumSignTransaction: function ethereumSignTransaction(params) {
    return (0, _node.call)(_objectSpread({
      method: 'ethereumSignTransaction'
    }, params));
  },
  ethereumSignTypedData: function ethereumSignTypedData(params) {
    return (0, _node.call)(_objectSpread({
      method: 'ethereumSignTypedData'
    }, params));
  },
  ethereumVerifyMessage: function ethereumVerifyMessage(params) {
    return (0, _node.call)(_objectSpread({
      method: 'ethereumVerifyMessage'
    }, params));
  },
  getAccountInfo: function getAccountInfo(params) {
    return (0, _node.call)(_objectSpread({
      method: 'getAccountInfo'
    }, params));
  },
  getAddress: function getAddress(params) {
    var useEventListener = _node.eventEmitter.listenerCount(_constants.UI.ADDRESS_VALIDATION) > 0;
    return (0, _node.call)(_objectSpread(_objectSpread({
      method: 'getAddress'
    }, params), {}, {
      useEventListener: useEventListener
    }));
  },
  getDeviceState: function getDeviceState(params) {
    return (0, _node.call)(_objectSpread({
      method: 'getDeviceState'
    }, params));
  },
  getFeatures: function getFeatures(params) {
    return (0, _node.call)(_objectSpread({
      method: 'getFeatures'
    }, params));
  },
  getPublicKey: function getPublicKey(params) {
    return (0, _node.call)(_objectSpread({
      method: 'getPublicKey'
    }, params));
  },
  liskGetAddress: function liskGetAddress() {
    return (0, _node.call)({
      method: 'liskDeprecated'
    });
  },
  liskGetPublicKey: function liskGetPublicKey() {
    return (0, _node.call)({
      method: 'liskDeprecated'
    });
  },
  liskSignMessage: function liskSignMessage() {
    return (0, _node.call)({
      method: 'liskDeprecated'
    });
  },
  liskSignTransaction: function liskSignTransaction() {
    return (0, _node.call)({
      method: 'liskDeprecated'
    });
  },
  liskVerifyMessage: function liskVerifyMessage() {
    return (0, _node.call)({
      method: 'liskDeprecated'
    });
  },
  nemGetAddress: function nemGetAddress(params) {
    var useEventListener = _node.eventEmitter.listenerCount(_constants.UI.ADDRESS_VALIDATION) > 0;
    return (0, _node.call)(_objectSpread(_objectSpread({
      method: 'nemGetAddress'
    }, params), {}, {
      useEventListener: useEventListener
    }));
  },
  nemSignTransaction: function nemSignTransaction(params) {
    return (0, _node.call)(_objectSpread({
      method: 'nemSignTransaction'
    }, params));
  },
  pushTransaction: function pushTransaction(params) {
    return (0, _node.call)(_objectSpread({
      method: 'pushTransaction'
    }, params));
  },
  rippleGetAddress: function rippleGetAddress(params) {
    var useEventListener = _node.eventEmitter.listenerCount(_constants.UI.ADDRESS_VALIDATION) > 0;
    return (0, _node.call)(_objectSpread(_objectSpread({
      method: 'rippleGetAddress'
    }, params), {}, {
      useEventListener: useEventListener
    }));
  },
  rippleSignTransaction: function rippleSignTransaction(params) {
    return (0, _node.call)(_objectSpread({
      method: 'rippleSignTransaction'
    }, params));
  },
  signMessage: function signMessage(params) {
    return (0, _node.call)(_objectSpread({
      method: 'signMessage'
    }, params));
  },
  signTransaction: function signTransaction(params) {
    return (0, _node.call)(_objectSpread({
      method: 'signTransaction'
    }, params));
  },
  stellarGetAddress: function stellarGetAddress(params) {
    var useEventListener = _node.eventEmitter.listenerCount(_constants.UI.ADDRESS_VALIDATION) > 0;
    return (0, _node.call)(_objectSpread(_objectSpread({
      method: 'stellarGetAddress'
    }, params), {}, {
      useEventListener: useEventListener
    }));
  },
  stellarSignTransaction: function stellarSignTransaction(params) {
    return (0, _node.call)(_objectSpread({
      method: 'stellarSignTransaction'
    }, params));
  },
  tezosGetAddress: function tezosGetAddress(params) {
    var useEventListener = _node.eventEmitter.listenerCount(_constants.UI.ADDRESS_VALIDATION) > 0;
    return (0, _node.call)(_objectSpread(_objectSpread({
      method: 'tezosGetAddress'
    }, params), {}, {
      useEventListener: useEventListener
    }));
  },
  tezosGetPublicKey: function tezosGetPublicKey(params) {
    return (0, _node.call)(_objectSpread({
      method: 'tezosGetPublicKey'
    }, params));
  },
  tezosSignTransaction: function tezosSignTransaction(params) {
    return (0, _node.call)(_objectSpread({
      method: 'tezosSignTransaction'
    }, params));
  },
  eosGetPublicKey: function eosGetPublicKey(params) {
    return (0, _node.call)(_objectSpread({
      method: 'eosGetPublicKey'
    }, params));
  },
  eosSignTransaction: function eosSignTransaction(params) {
    return (0, _node.call)(_objectSpread({
      method: 'eosSignTransaction'
    }, params));
  },
  binanceGetAddress: function binanceGetAddress(params) {
    var useEventListener = _node.eventEmitter.listenerCount(_constants.UI.ADDRESS_VALIDATION) > 0;
    return (0, _node.call)(_objectSpread(_objectSpread({
      method: 'binanceGetAddress'
    }, params), {}, {
      useEventListener: useEventListener
    }));
  },
  binanceGetPublicKey: function binanceGetPublicKey(params) {
    return (0, _node.call)(_objectSpread({
      method: 'binanceGetPublicKey'
    }, params));
  },
  binanceSignTransaction: function binanceSignTransaction(params) {
    return (0, _node.call)(_objectSpread({
      method: 'binanceSignTransaction'
    }, params));
  },
  verifyMessage: function verifyMessage(params) {
    return (0, _node.call)(_objectSpread({
      method: 'verifyMessage'
    }, params));
  },
  resetDevice: function resetDevice(params) {
    return (0, _node.call)(_objectSpread({
      method: 'resetDevice'
    }, params));
  },
  wipeDevice: function wipeDevice(params) {
    return (0, _node.call)(_objectSpread({
      method: 'wipeDevice'
    }, params));
  },
  applyFlags: function applyFlags(params) {
    return (0, _node.call)(_objectSpread({
      method: 'applyFlags'
    }, params));
  },
  applySettings: function applySettings(params) {
    return (0, _node.call)(_objectSpread({
      method: 'applySettings'
    }, params));
  },
  backupDevice: function backupDevice(params) {
    return (0, _node.call)(_objectSpread({
      method: 'backupDevice'
    }, params));
  },
  changePin: function changePin(params) {
    return (0, _node.call)(_objectSpread({
      method: 'changePin'
    }, params));
  },
  firmwareUpdate: function firmwareUpdate(params) {
    return (0, _node.call)(_objectSpread({
      method: 'firmwareUpdate'
    }, params));
  },
  recoveryDevice: function recoveryDevice(params) {
    return (0, _node.call)(_objectSpread({
      method: 'recoveryDevice'
    }, params));
  },
  getCoinInfo: function getCoinInfo(params) {
    return (0, _node.call)(_objectSpread({
      method: 'getCoinInfo'
    }, params));
  },
  rebootToBootloader: function rebootToBootloader(params) {
    return (0, _node.call)(_objectSpread({
      method: 'rebootToBootloader'
    }, params));
  },
  setProxy: function setProxy(params) {
    return (0, _node.call)(_objectSpread({
      method: 'setProxy'
    }, params));
  },
  dispose: _node.dispose,
  cancel: _node.cancel,
  renderWebUSBButton: _node.renderWebUSBButton,
  disableWebUSB: _node.disableWebUSB
};
var _default = TrezorConnect;
exports["default"] = _default;