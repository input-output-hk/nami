"use strict";

exports.__esModule = true;

var _api = require("./api");

Object.keys(_api).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _api[key]) return;
  exports[key] = _api[key];
});

var _events = require("./events");

Object.keys(_events).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _events[key]) return;
  exports[key] = _events[key];
});

var _misc = require("./misc");

Object.keys(_misc).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _misc[key]) return;
  exports[key] = _misc[key];
});

var _params = require("./params");

Object.keys(_params).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _params[key]) return;
  exports[key] = _params[key];
});

var _account = require("./account");

Object.keys(_account).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _account[key]) return;
  exports[key] = _account[key];
});

var _device = require("./trezor/device");

Object.keys(_device).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _device[key]) return;
  exports[key] = _device[key];
});

var _management = require("./trezor/management");

Object.keys(_management).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _management[key]) return;
  exports[key] = _management[key];
});

var _bitcoin = require("./networks/bitcoin");

Object.keys(_bitcoin).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _bitcoin[key]) return;
  exports[key] = _bitcoin[key];
});

var _binance = require("./networks/binance");

Object.keys(_binance).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _binance[key]) return;
  exports[key] = _binance[key];
});

var _cardano = require("./networks/cardano");

Object.keys(_cardano).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _cardano[key]) return;
  exports[key] = _cardano[key];
});

var _coinInfo = require("./networks/coinInfo");

Object.keys(_coinInfo).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _coinInfo[key]) return;
  exports[key] = _coinInfo[key];
});

var _eos = require("./networks/eos");

Object.keys(_eos).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _eos[key]) return;
  exports[key] = _eos[key];
});

var _ethereum = require("./networks/ethereum");

Object.keys(_ethereum).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _ethereum[key]) return;
  exports[key] = _ethereum[key];
});

var _nem = require("./networks/nem");

Object.keys(_nem).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _nem[key]) return;
  exports[key] = _nem[key];
});

var _ripple = require("./networks/ripple");

Object.keys(_ripple).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _ripple[key]) return;
  exports[key] = _ripple[key];
});

var _stellar = require("./networks/stellar");

Object.keys(_stellar).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _stellar[key]) return;
  exports[key] = _stellar[key];
});

var _tezos = require("./networks/tezos");

Object.keys(_tezos).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _tezos[key]) return;
  exports[key] = _tezos[key];
});

var _blockchain = require("./backend/blockchain");

Object.keys(_blockchain).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _blockchain[key]) return;
  exports[key] = _blockchain[key];
});

var _transactions = require("./backend/transactions");

Object.keys(_transactions).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _transactions[key]) return;
  exports[key] = _transactions[key];
});