"use strict";

exports.__esModule = true;
exports.Enum_WordRequestType = exports.Enum_TezosContractType = exports.Enum_TezosBallotType = exports.Enum_StellarSignerType = exports.Enum_StellarMemoType = exports.Enum_StellarAssetType = exports.Enum_SdProtectOperationType = exports.Enum_SafetyCheckLevel = exports.Enum_RequestType = exports.Enum_RecoveryDeviceType = exports.Enum_PinMatrixRequestType = exports.Enum_OutputScriptType = exports.Enum_NEMSupplyChangeType = exports.Enum_NEMMosaicLevy = exports.Enum_NEMModificationType = exports.Enum_NEMImportanceTransferMode = exports.Enum_InputScriptType = exports.Enum_FailureType = exports.Enum_EthereumDataType = exports.Enum_DecredStakingSpendType = exports.Enum_DebugButton = exports.Enum_CardanoTxWitnessType = exports.Enum_CardanoTxSigningMode = exports.Enum_CardanoTxOutputSerializationFormat = exports.Enum_CardanoTxAuxiliaryDataSupplementType = exports.Enum_CardanoPoolRelayType = exports.Enum_CardanoNativeScriptType = exports.Enum_CardanoNativeScriptHashDisplayFormat = exports.Enum_CardanoDerivationType = exports.Enum_CardanoCertificateType = exports.Enum_CardanoAddressType = exports.Enum_Capability = exports.Enum_ButtonRequestType = exports.Enum_BinanceTimeInForce = exports.Enum_BinanceOrderType = exports.Enum_BinanceOrderSide = exports.Enum_BackupType = exports.Enum_AmountUnit = void 0;
// This file is auto generated from data/messages/message.json
// custom type uint32/64 may be represented as string
// BinanceGetAddress
// BinanceAddress
// BinanceGetPublicKey
// BinancePublicKey
// BinanceSignTx
// BinanceTxRequest
// BinanceTransferMsg
var Enum_BinanceOrderType = Object.freeze({
  OT_UNKNOWN: 0,
  MARKET: 1,
  LIMIT: 2,
  OT_RESERVED: 3
});
exports.Enum_BinanceOrderType = Enum_BinanceOrderType;
var Enum_BinanceOrderSide = Object.freeze({
  SIDE_UNKNOWN: 0,
  BUY: 1,
  SELL: 2
});
exports.Enum_BinanceOrderSide = Enum_BinanceOrderSide;
var Enum_BinanceTimeInForce = Object.freeze({
  TIF_UNKNOWN: 0,
  GTE: 1,
  TIF_RESERVED: 2,
  IOC: 3
});
exports.Enum_BinanceTimeInForce = Enum_BinanceTimeInForce;
var Enum_InputScriptType = Object.freeze({
  SPENDADDRESS: 0,
  SPENDMULTISIG: 1,
  EXTERNAL: 2,
  SPENDWITNESS: 3,
  SPENDP2SHWITNESS: 4,
  SPENDTAPROOT: 5
});
exports.Enum_InputScriptType = Enum_InputScriptType;
var Enum_OutputScriptType = Object.freeze({
  PAYTOADDRESS: 0,
  PAYTOSCRIPTHASH: 1,
  PAYTOMULTISIG: 2,
  PAYTOOPRETURN: 3,
  PAYTOWITNESS: 4,
  PAYTOP2SHWITNESS: 5,
  PAYTOTAPROOT: 6
});
exports.Enum_OutputScriptType = Enum_OutputScriptType;
var Enum_DecredStakingSpendType = Object.freeze({
  SSGen: 0,
  SSRTX: 1
});
exports.Enum_DecredStakingSpendType = Enum_DecredStakingSpendType;
var Enum_AmountUnit = Object.freeze({
  BITCOIN: 0,
  MILLIBITCOIN: 1,
  MICROBITCOIN: 2,
  SATOSHI: 3
});
exports.Enum_AmountUnit = Enum_AmountUnit;
var Enum_RequestType = Object.freeze({
  TXINPUT: 0,
  TXOUTPUT: 1,
  TXMETA: 2,
  TXFINISHED: 3,
  TXEXTRADATA: 4,
  TXORIGINPUT: 5,
  TXORIGOUTPUT: 6,
  TXPAYMENTREQ: 7
});
exports.Enum_RequestType = Enum_RequestType;
var Enum_CardanoDerivationType = Object.freeze({
  LEDGER: 0,
  ICARUS: 1,
  ICARUS_TREZOR: 2
});
exports.Enum_CardanoDerivationType = Enum_CardanoDerivationType;
var Enum_CardanoAddressType = Object.freeze({
  BASE: 0,
  BASE_SCRIPT_KEY: 1,
  BASE_KEY_SCRIPT: 2,
  BASE_SCRIPT_SCRIPT: 3,
  POINTER: 4,
  POINTER_SCRIPT: 5,
  ENTERPRISE: 6,
  ENTERPRISE_SCRIPT: 7,
  BYRON: 8,
  REWARD: 14,
  REWARD_SCRIPT: 15
});
exports.Enum_CardanoAddressType = Enum_CardanoAddressType;
var Enum_CardanoNativeScriptType = Object.freeze({
  PUB_KEY: 0,
  ALL: 1,
  ANY: 2,
  N_OF_K: 3,
  INVALID_BEFORE: 4,
  INVALID_HEREAFTER: 5
});
exports.Enum_CardanoNativeScriptType = Enum_CardanoNativeScriptType;
var Enum_CardanoNativeScriptHashDisplayFormat = Object.freeze({
  HIDE: 0,
  BECH32: 1,
  POLICY_ID: 2
});
exports.Enum_CardanoNativeScriptHashDisplayFormat = Enum_CardanoNativeScriptHashDisplayFormat;
var Enum_CardanoCertificateType = Object.freeze({
  STAKE_REGISTRATION: 0,
  STAKE_DEREGISTRATION: 1,
  STAKE_DELEGATION: 2,
  STAKE_POOL_REGISTRATION: 3
});
exports.Enum_CardanoCertificateType = Enum_CardanoCertificateType;
var Enum_CardanoPoolRelayType = Object.freeze({
  SINGLE_HOST_IP: 0,
  SINGLE_HOST_NAME: 1,
  MULTIPLE_HOST_NAME: 2
});
exports.Enum_CardanoPoolRelayType = Enum_CardanoPoolRelayType;
var Enum_CardanoTxAuxiliaryDataSupplementType = Object.freeze({
  NONE: 0,
  CATALYST_REGISTRATION_SIGNATURE: 1
});
exports.Enum_CardanoTxAuxiliaryDataSupplementType = Enum_CardanoTxAuxiliaryDataSupplementType;
var Enum_CardanoTxSigningMode = Object.freeze({
  ORDINARY_TRANSACTION: 0,
  POOL_REGISTRATION_AS_OWNER: 1,
  MULTISIG_TRANSACTION: 2,
  PLUTUS_TRANSACTION: 3
});
exports.Enum_CardanoTxSigningMode = Enum_CardanoTxSigningMode;
var Enum_CardanoTxWitnessType = Object.freeze({
  BYRON_WITNESS: 0,
  SHELLEY_WITNESS: 1
});
exports.Enum_CardanoTxWitnessType = Enum_CardanoTxWitnessType;
var Enum_CardanoTxOutputSerializationFormat = Object.freeze({
  ARRAY_LEGACY: 0,
  MAP_BABBAGE: 1
});
exports.Enum_CardanoTxOutputSerializationFormat = Enum_CardanoTxOutputSerializationFormat;
var Enum_FailureType = Object.freeze({
  Failure_UnexpectedMessage: 1,
  Failure_ButtonExpected: 2,
  Failure_DataError: 3,
  Failure_ActionCancelled: 4,
  Failure_PinExpected: 5,
  Failure_PinCancelled: 6,
  Failure_PinInvalid: 7,
  Failure_InvalidSignature: 8,
  Failure_ProcessError: 9,
  Failure_NotEnoughFunds: 10,
  Failure_NotInitialized: 11,
  Failure_PinMismatch: 12,
  Failure_WipeCodeMismatch: 13,
  Failure_InvalidSession: 14,
  Failure_FirmwareError: 99
});
exports.Enum_FailureType = Enum_FailureType;
var Enum_ButtonRequestType = Object.freeze({
  ButtonRequest_Other: 1,
  ButtonRequest_FeeOverThreshold: 2,
  ButtonRequest_ConfirmOutput: 3,
  ButtonRequest_ResetDevice: 4,
  ButtonRequest_ConfirmWord: 5,
  ButtonRequest_WipeDevice: 6,
  ButtonRequest_ProtectCall: 7,
  ButtonRequest_SignTx: 8,
  ButtonRequest_FirmwareCheck: 9,
  ButtonRequest_Address: 10,
  ButtonRequest_PublicKey: 11,
  ButtonRequest_MnemonicWordCount: 12,
  ButtonRequest_MnemonicInput: 13,
  _Deprecated_ButtonRequest_PassphraseType: 14,
  ButtonRequest_UnknownDerivationPath: 15,
  ButtonRequest_RecoveryHomepage: 16,
  ButtonRequest_Success: 17,
  ButtonRequest_Warning: 18,
  ButtonRequest_PassphraseEntry: 19,
  ButtonRequest_PinEntry: 20
});
exports.Enum_ButtonRequestType = Enum_ButtonRequestType;
var Enum_PinMatrixRequestType = Object.freeze({
  PinMatrixRequestType_Current: 1,
  PinMatrixRequestType_NewFirst: 2,
  PinMatrixRequestType_NewSecond: 3,
  PinMatrixRequestType_WipeCodeFirst: 4,
  PinMatrixRequestType_WipeCodeSecond: 5
});
exports.Enum_PinMatrixRequestType = Enum_PinMatrixRequestType;
var Enum_DebugButton = Object.freeze({
  NO: 0,
  YES: 1,
  INFO: 2
});
exports.Enum_DebugButton = Enum_DebugButton;
var Enum_EthereumDataType = Object.freeze({
  UINT: 1,
  INT: 2,
  BYTES: 3,
  STRING: 4,
  BOOL: 5,
  ADDRESS: 6,
  ARRAY: 7,
  STRUCT: 8
});
exports.Enum_EthereumDataType = Enum_EthereumDataType;
var Enum_BackupType = Object.freeze({
  Bip39: 0,
  Slip39_Basic: 1,
  Slip39_Advanced: 2
});
exports.Enum_BackupType = Enum_BackupType;
var Enum_SafetyCheckLevel = Object.freeze({
  Strict: 0,
  PromptAlways: 1,
  PromptTemporarily: 2
});
exports.Enum_SafetyCheckLevel = Enum_SafetyCheckLevel;
var Enum_Capability = Object.freeze({
  Capability_Bitcoin: 1,
  Capability_Bitcoin_like: 2,
  Capability_Binance: 3,
  Capability_Cardano: 4,
  Capability_Crypto: 5,
  Capability_EOS: 6,
  Capability_Ethereum: 7,
  Capability_Lisk: 8,
  Capability_Monero: 9,
  Capability_NEM: 10,
  Capability_Ripple: 11,
  Capability_Stellar: 12,
  Capability_Tezos: 13,
  Capability_U2F: 14,
  Capability_Shamir: 15,
  Capability_ShamirGroups: 16,
  Capability_PassphraseEntry: 17
});
exports.Enum_Capability = Enum_Capability;
var Enum_SdProtectOperationType = Object.freeze({
  DISABLE: 0,
  ENABLE: 1,
  REFRESH: 2
});
exports.Enum_SdProtectOperationType = Enum_SdProtectOperationType;
var Enum_RecoveryDeviceType = Object.freeze({
  RecoveryDeviceType_ScrambledWords: 0,
  RecoveryDeviceType_Matrix: 1
});
exports.Enum_RecoveryDeviceType = Enum_RecoveryDeviceType;
var Enum_WordRequestType = Object.freeze({
  WordRequestType_Plain: 0,
  WordRequestType_Matrix9: 1,
  WordRequestType_Matrix6: 2
});
exports.Enum_WordRequestType = Enum_WordRequestType;
var Enum_NEMMosaicLevy = Object.freeze({
  MosaicLevy_Absolute: 1,
  MosaicLevy_Percentile: 2
});
exports.Enum_NEMMosaicLevy = Enum_NEMMosaicLevy;
var Enum_NEMSupplyChangeType = Object.freeze({
  SupplyChange_Increase: 1,
  SupplyChange_Decrease: 2
});
exports.Enum_NEMSupplyChangeType = Enum_NEMSupplyChangeType;
var Enum_NEMModificationType = Object.freeze({
  CosignatoryModification_Add: 1,
  CosignatoryModification_Delete: 2
});
exports.Enum_NEMModificationType = Enum_NEMModificationType;
var Enum_NEMImportanceTransferMode = Object.freeze({
  ImportanceTransfer_Activate: 1,
  ImportanceTransfer_Deactivate: 2
});
exports.Enum_NEMImportanceTransferMode = Enum_NEMImportanceTransferMode;
var Enum_StellarAssetType = Object.freeze({
  NATIVE: 0,
  ALPHANUM4: 1,
  ALPHANUM12: 2
});
exports.Enum_StellarAssetType = Enum_StellarAssetType;
var Enum_StellarMemoType = Object.freeze({
  NONE: 0,
  TEXT: 1,
  ID: 2,
  HASH: 3,
  RETURN: 4
});
exports.Enum_StellarMemoType = Enum_StellarMemoType;
var Enum_StellarSignerType = Object.freeze({
  ACCOUNT: 0,
  PRE_AUTH: 1,
  HASH: 2
});
exports.Enum_StellarSignerType = Enum_StellarSignerType;
var Enum_TezosContractType = Object.freeze({
  Implicit: 0,
  Originated: 1
});
exports.Enum_TezosContractType = Enum_TezosContractType;
var Enum_TezosBallotType = Object.freeze({
  Yay: 0,
  Nay: 1,
  Pass: 2
});
exports.Enum_TezosBallotType = Enum_TezosBallotType;