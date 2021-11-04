"use strict";

exports.__esModule = true;
exports.WORD = exports.WAIT_FOR_SELECTION = exports.USED_ELSEWHERE = exports.RELEASED = exports.RELEASE = exports.PIN = exports.PASSPHRASE_ON_DEVICE = exports.PASSPHRASE = exports.LOADING = exports.DISCONNECT = exports.CONNECT_UNACQUIRED = exports.CONNECT = exports.CHANGED = exports.BUTTON = exports.ACQUIRED = exports.ACQUIRE = void 0;
// device list events
var CONNECT = 'device-connect';
exports.CONNECT = CONNECT;
var CONNECT_UNACQUIRED = 'device-connect_unacquired';
exports.CONNECT_UNACQUIRED = CONNECT_UNACQUIRED;
var DISCONNECT = 'device-disconnect';
exports.DISCONNECT = DISCONNECT;
var CHANGED = 'device-changed';
exports.CHANGED = CHANGED;
var ACQUIRE = 'device-acquire';
exports.ACQUIRE = ACQUIRE;
var RELEASE = 'device-release';
exports.RELEASE = RELEASE;
var ACQUIRED = 'device-acquired';
exports.ACQUIRED = ACQUIRED;
var RELEASED = 'device-released';
exports.RELEASED = RELEASED;
var USED_ELSEWHERE = 'device-used_elsewhere';
exports.USED_ELSEWHERE = USED_ELSEWHERE;
var LOADING = 'device-loading'; // trezor-link events in protobuf format

exports.LOADING = LOADING;
var BUTTON = 'button';
exports.BUTTON = BUTTON;
var PIN = 'pin';
exports.PIN = PIN;
var PASSPHRASE = 'passphrase';
exports.PASSPHRASE = PASSPHRASE;
var PASSPHRASE_ON_DEVICE = 'passphrase_on_device';
exports.PASSPHRASE_ON_DEVICE = PASSPHRASE_ON_DEVICE;
var WORD = 'word'; // custom

exports.WORD = WORD;
var WAIT_FOR_SELECTION = 'device-wait_for_selection';
exports.WAIT_FOR_SELECTION = WAIT_FOR_SELECTION;