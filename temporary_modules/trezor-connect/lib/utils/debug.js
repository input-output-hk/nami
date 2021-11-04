"use strict";

exports.__esModule = true;
exports.initLog = exports.getLog = exports.enableLogByPrefix = exports.enableLog = void 0;

/* eslint-disable no-console */
var colors = {
  // green
  DescriptorStream: 'color: #77ab59',
  DeviceList: 'color: #36802d',
  Device: 'color: #bada55',
  Core: 'color: #c9df8a',
  IFrame: 'color: #FFFFFF; background: #f4a742;',
  Popup: 'color: #f48a00'
};
var MAX_ENTRIES = 100;

var Log = /*#__PURE__*/function () {
  function Log(prefix, enabled) {
    this.prefix = prefix;
    this.enabled = enabled;
    this.messages = [];
    this.css = colors[prefix] || 'color: #000000; background: #FFFFFF;';
  }

  var _proto = Log.prototype;

  _proto.addMessage = function addMessage(level, prefix) {
    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    this.messages.push({
      level: level,
      prefix: prefix,
      message: args,
      timestamp: new Date().getTime()
    });

    if (this.messages.length > MAX_ENTRIES) {
      this.messages.shift();
    }
  };

  _proto.log = function log() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    this.addMessage.apply(this, ['log', this.prefix].concat(args));

    if (this.enabled) {
      var _console;

      (_console = console).log.apply(_console, [this.prefix].concat(args));
    }
  };

  _proto.error = function error() {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    this.addMessage.apply(this, ['error', this.prefix].concat(args));

    if (this.enabled) {
      var _console2;

      (_console2 = console).error.apply(_console2, [this.prefix].concat(args));
    }
  };

  _proto.warn = function warn() {
    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    this.addMessage.apply(this, ['warn', this.prefix].concat(args));

    if (this.enabled) {
      var _console3;

      (_console3 = console).warn.apply(_console3, [this.prefix].concat(args));
    }
  };

  _proto.debug = function debug() {
    for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      args[_key5] = arguments[_key5];
    }

    this.addMessage.apply(this, ['debug', this.prefix].concat(args));

    if (this.enabled) {
      var _console4;

      (_console4 = console).log.apply(_console4, ["%c" + this.prefix, this.css].concat(args));
    }
  };

  return Log;
}();

var _logs = {};

var initLog = function initLog(prefix, enabled) {
  var instance = new Log(prefix, !!enabled);
  _logs[prefix] = instance;
  return instance;
};

exports.initLog = initLog;

var enableLog = function enableLog(enabled) {
  Object.keys(_logs).forEach(function (key) {
    _logs[key].enabled = enabled;
  });
};

exports.enableLog = enableLog;

var enableLogByPrefix = function enableLogByPrefix(prefix, enabled) {
  if (_logs[prefix]) {
    _logs[prefix].enabled = enabled;
  }
};

exports.enableLogByPrefix = enableLogByPrefix;

var getLog = function getLog() {
  var logs = [];
  Object.keys(_logs).forEach(function (key) {
    logs = logs.concat(_logs[key].messages);
  });
  logs.sort(function (a, b) {
    return a.timestamp - b.timestamp;
  });
  return logs;
};

exports.getLog = getLog;