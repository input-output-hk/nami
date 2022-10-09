"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.UiMessage = exports.TransportMessage = exports.ResponseMessage = exports.DeviceMessage = exports.BlockchainMessage = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _constants = require("../constants");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

var UiMessage = function UiMessage(type, payload) {
  return {
    event: _constants.UI_EVENT,
    type: type,
    payload: payload
  };
};

exports.UiMessage = UiMessage;

var DeviceMessage = function DeviceMessage(type, payload) {
  return {
    event: _constants.DEVICE_EVENT,
    type: type,
    payload: payload
  };
};

exports.DeviceMessage = DeviceMessage;

var TransportMessage = function TransportMessage(type, payload) {
  return {
    event: _constants.TRANSPORT_EVENT,
    type: type,
    // convert Error/TypeError object into payload error type (Error object/class is converted to string while sent via postMessage)
    payload: payload.error ? _objectSpread(_objectSpread({}, payload), {}, {
      error: payload.error.message,
      code: payload.error.code
    }) : payload
  };
};

exports.TransportMessage = TransportMessage;

var ResponseMessage = function ResponseMessage(id, success, payload) {
  if (payload === void 0) {
    payload = null;
  }

  return {
    event: _constants.RESPONSE_EVENT,
    type: _constants.RESPONSE_EVENT,
    id: id,
    success: success,
    // convert Error/TypeError object into payload error type (Error object/class is converted to string while sent via postMessage)
    payload: success ? payload : {
      error: payload.error.message,
      code: payload.error.code
    }
  };
};

exports.ResponseMessage = ResponseMessage;

var BlockchainMessage = function BlockchainMessage(type, payload) {
  return {
    event: _constants.BLOCKCHAIN_EVENT,
    type: type,
    payload: payload
  };
};

exports.BlockchainMessage = BlockchainMessage;