"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.uiResponse = exports.requestLogin = exports.renderWebUSBButton = exports.manifest = exports.init = exports.getSettings = exports.eventEmitter = exports.dispose = exports.disableWebUSB = exports.customMessage = exports.cancel = exports.call = void 0;

var _events = _interopRequireDefault(require("events"));

var _constants = require("../../constants");

var empty = function empty(_params) {
  throw _constants.ERRORS.TypedError('Method_InvalidPackage');
};

var eventEmitter = new _events["default"]();
exports.eventEmitter = eventEmitter;
var manifest = empty;
exports.manifest = manifest;
var init = empty;
exports.init = init;
var call = empty;
exports.call = call;
var getSettings = empty;
exports.getSettings = getSettings;
var customMessage = empty;
exports.customMessage = customMessage;
var requestLogin = empty;
exports.requestLogin = requestLogin;
var uiResponse = empty;
exports.uiResponse = uiResponse;
var disableWebUSB = empty;
exports.disableWebUSB = disableWebUSB;
var renderWebUSBButton = empty;
exports.renderWebUSBButton = renderWebUSBButton;
var cancel = empty;
exports.cancel = cancel;
var dispose = empty;
exports.dispose = dispose;