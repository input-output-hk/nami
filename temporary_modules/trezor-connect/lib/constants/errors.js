"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.WRONG_PREVIOUS_SESSION_ERROR_MESSAGE = exports.WEBUSB_ERROR_MESSAGE = exports.TypedError = exports.TrezorError = exports.LIBUSB_ERROR_MESSAGE = exports.INVALID_PIN_ERROR_MESSAGE = exports.ERROR_CODES = void 0;

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _wrapNativeSuper2 = _interopRequireDefault(require("@babel/runtime/helpers/wrapNativeSuper"));

var ERROR_CODES = {
  Init_NotInitialized: 'TrezorConnect not yet initialized',
  // race condition: call on not initialized Core (usually hot-reloading)
  Init_AlreadyInitialized: 'TrezorConnect has been already initialized',
  // thrown by .init called multiple times
  Init_IframeBlocked: 'Iframe blocked',
  // iframe injection blocked (ad-blocker)
  Init_IframeTimeout: 'Iframe timeout',
  // iframe didn't load in specified time
  Init_ManifestMissing: 'Manifest not set. Read more at https://github.com/trezor/connect/blob/develop/docs/index.md',
  // manifest is not set
  Popup_ConnectionMissing: 'Unable to establish connection with iframe',
  // thrown by popup
  Transport_Missing: 'Transport is missing',
  // no transport available
  Transport_InvalidProtobuf: '',
  // generic error from transport layer (trezor-link)
  Method_InvalidPackage: 'This version of trezor-connect is not suitable to work without browser. Use trezor-connect@extended package instead',
  // thrown by node and react-native env while using regular 'web' package
  Method_InvalidParameter: '',
  // replaced by generic text
  Method_NotAllowed: 'Method not allowed for this configuration',
  // example: device management in popup mode
  Method_PermissionsNotGranted: 'Permissions not granted',
  // permission/confirmation not granted in popup
  Method_Cancel: 'Cancelled',
  // permission/confirmation not granted in popup OR .cancel() custom error
  Method_Interrupted: 'Popup closed',
  // interruption: popup closed
  Method_UnknownCoin: 'Coin not found',
  // coin definition not found
  Method_AddressNotMatch: 'Addresses do not match',
  // thrown by all getAddress methods with custom UI validation
  Method_FirmwareUpdate_DownloadFailed: 'Failed to download firmware binary',
  // thrown by FirmwareUpdate method
  Method_CustomMessage_Callback: 'Parameter "callback" is not a function',
  // thrown by CustomMessage method
  Method_Discovery_BundleException: '',
  // thrown by getAccountInfo method
  Method_Override: 'override',
  // inner "error", it's more like a interruption
  Method_NoResponse: 'Call resolved without response',
  // thrown by npm index(es), call to Core resolved without response, should not happen
  Backend_NotSupported: 'BlockchainLink settings not found in coins.json',
  // thrown by methods which using backends, blockchainLink not defined for this coin
  Backend_WorkerMissing: '',
  // thrown by BlockchainLink class, worker not specified
  Backend_Disconnected: 'Backend disconnected',
  // thrown by BlockchainLink class
  Backend_Invalid: 'Invalid backend',
  // thrown by BlockchainLink class, invalid backend (ie: backend for wrong coin set)
  Backend_Error: '',
  // thrown by BlockchainLink class, generic message from 'blockchain-link'
  Runtime: '',
  // thrown from several places, this shouldn't ever happen tho
  Device_NotFound: 'Device not found',
  Device_InitializeFailed: '',
  // generic error from firmware while calling "Initialize" message
  Device_FwException: '',
  // generic FirmwareException type
  Device_ModeException: '',
  // generic Device.UnexpectedMode type
  Device_Disconnected: 'Device disconnected',
  // device disconnected during call
  Device_UsedElsewhere: 'Device is used in another window',
  // interruption: current session toked by other application
  Device_InvalidState: 'Passphrase is incorrect',
  // authorization error (device state comparison)
  Device_CallInProgress: 'Device call in progress' // thrown when trying to make another call while current is still running

};
exports.ERROR_CODES = ERROR_CODES;

var TrezorError = /*#__PURE__*/function (_Error) {
  (0, _inheritsLoose2["default"])(TrezorError, _Error);

  function TrezorError(code, message) {
    var _this;

    _this = _Error.call(this, message) || this;
    _this.code = code;
    _this.message = message;
    return _this;
  }

  return TrezorError;
}( /*#__PURE__*/(0, _wrapNativeSuper2["default"])(Error));

exports.TrezorError = TrezorError;

var TypedError = function TypedError(id, message) {
  return new TrezorError(id, message || ERROR_CODES[id]);
}; // a slight hack
// this error string is hard-coded
// in both bridge and extension


exports.TypedError = TypedError;
var WRONG_PREVIOUS_SESSION_ERROR_MESSAGE = 'wrong previous session';
exports.WRONG_PREVIOUS_SESSION_ERROR_MESSAGE = WRONG_PREVIOUS_SESSION_ERROR_MESSAGE;
var INVALID_PIN_ERROR_MESSAGE = 'PIN invalid';
exports.INVALID_PIN_ERROR_MESSAGE = INVALID_PIN_ERROR_MESSAGE;
var WEBUSB_ERROR_MESSAGE = 'NetworkError: Unable to claim interface.'; // trezord error prefix.
// user has insufficient permissions. may occur in Linux (missing udev rules), Windows and MacOS.

exports.WEBUSB_ERROR_MESSAGE = WEBUSB_ERROR_MESSAGE;
var LIBUSB_ERROR_MESSAGE = 'LIBUSB_ERROR';
exports.LIBUSB_ERROR_MESSAGE = LIBUSB_ERROR_MESSAGE;