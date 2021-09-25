"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _config = require("./config");

// import secrets from 'secrets';
var _default = {
  api: {
    ipfs: 'https://ipfs.blockfrost.dev/ipfs',
    base: function base() {
      var node = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _config.NODE.mainnet;
      return node;
    },
    key: function key() {
      var network = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'mainnet';
      return {
        project_id: network === _config.NETWORK_ID.mainnet // ? secrets.PROJECT_ID_MAINNET
        // : secrets.PROJECT_ID_TESTNET,
        ? 'aGdrHxUPKUeqT7QUc68yuuRjBHio0XpP' : 'aGdrHxUPKUeqT7QUc68yuuRjBHio0XpP'
      };
    },
    price: function price() {
      var currency = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'usd';
      return fetch("https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=".concat(currency)).then(function (res) {
        return res.json();
      }).then(function (res) {
        return res.cardano[currency];
      });
    }
  }
};
exports["default"] = _default;