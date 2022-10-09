"use strict";

exports.__esModule = true;
exports.PROTOCOL_MAGICS = exports.POOL_RELAY_TYPE = exports.NETWORK_IDS = exports.CERTIFICATE_TYPE = exports.ADDRESS_TYPE = void 0;
var PROTOCOL_MAGICS = Object.freeze({
  mainnet: 764824073,
  testnet: 1097911063
});
exports.PROTOCOL_MAGICS = PROTOCOL_MAGICS;
var NETWORK_IDS = Object.freeze({
  mainnet: 1,
  testnet: 0
}); // constants below are deprecated
// use `CardanoAddressType`, `CardanoCertificateType` and `CardanoPoolRelayType` from protobuf instead

exports.NETWORK_IDS = NETWORK_IDS;
var ADDRESS_TYPE = Object.freeze({
  Base: 0,
  Pointer: 4,
  Enterprise: 6,
  Byron: 8,
  Reward: 14
});
exports.ADDRESS_TYPE = ADDRESS_TYPE;
var CERTIFICATE_TYPE = Object.freeze({
  StakeRegistration: 0,
  StakeDeregistration: 1,
  StakeDelegation: 2,
  StakePoolRegistration: 3
});
exports.CERTIFICATE_TYPE = CERTIFICATE_TYPE;
var POOL_RELAY_TYPE = Object.freeze({
  SingleHostIp: 0,
  SingleHostName: 1,
  MultipleHostName: 2
});
exports.POOL_RELAY_TYPE = POOL_RELAY_TYPE;