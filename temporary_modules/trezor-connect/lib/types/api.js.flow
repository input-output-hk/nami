/* @flow */
import * as CONSTANTS from '../constants';
import * as P from './params';
import * as Device from './trezor/device';
import * as Mgmnt from './trezor/management';
import * as Protobuf from './trezor/protobuf';
import * as Account from './account';

import * as Bitcoin from './networks/bitcoin';
import * as Binance from './networks/binance';
import * as Cardano from './networks/cardano';
import * as CoinInfo from './networks/coinInfo';
import * as EOS from './networks/eos';
import * as Ethereum from './networks/ethereum';
import * as NEM from './networks/nem';
import * as Ripple from './networks/ripple';
import * as Stellar from './networks/stellar';
import * as Tezos from './networks/tezos';
import * as Misc from './misc';

import * as Events from './events';
import * as Blockchain from './backend/blockchain';

interface Bundled<Parm, Resp> {
    (params: $Exact<{ ...$Exact<P.CommonParams>, ...$Exact<P.NoBundle<Parm>> }>): P.Response<Resp>;
    (
        params: $Exact<{ ...$Exact<P.CommonParams>, ...$Exact<P.Bundle<Parm>> }>,
    ): P.BundledResponse<Resp>;
}

interface Mixed<P1, P2, R1, R2> {
    (params: $Exact<{ ...$Exact<P.CommonParams>, ...$Exact<P1> }>): P.Response<R1>;
    (params: $Exact<{ ...$Exact<P.CommonParams>, ...$Exact<P2> }>): P.Response<R2>;
}

// type Method<T, R> = (params: P.CommonParams & T) => P.Response<R>;
type Method<Parm, Resp> = (
    params: $Exact<{ ...$Exact<P.CommonParams>, ...$Exact<Parm> }>,
) => P.Response<Resp>;

interface Emitter {
    (type: typeof CONSTANTS.DEVICE_EVENT, cb: (event: Device.DeviceEvent) => void): void;
    (type: typeof CONSTANTS.TRANSPORT_EVENT, cb: (event: Events.TransportEvent) => void): void;
    (type: typeof CONSTANTS.UI_EVENT, cb: (event: Events.UiEvent) => void): void;
    (
        type: typeof CONSTANTS.BLOCKCHAIN_EVENT,
        cb: (event: Blockchain.BlockchainEvent) => void,
    ): void;

    (
        type: $PropertyType<Device.DeviceEvent, 'type'>,
        cb: (event: $PropertyType<Device.DeviceEvent, 'payload'>) => void,
    ): void;

    (type: $PropertyType<Events.MessageWithoutPayload, 'type'>, cb: () => void): void;
    (
        type: $PropertyType<Events.DeviceMessage, 'type'>,
        cb: (event: $PropertyType<Events.DeviceMessage, 'payload'>) => void,
    ): void;
    (
        type: $PropertyType<Events.ButtonRequestMessage, 'type'>,
        cb: (event: $PropertyType<Events.ButtonRequestMessage, 'payload'>) => void,
    ): void;
    (
        type: $PropertyType<Events.AddressValidationMessage, 'type'>,
        cb: (event: $PropertyType<Events.AddressValidationMessage, 'payload'>) => void,
    ): void;
    (
        type: $PropertyType<Events.RequestPermission, 'type'>,
        cb: (event: $PropertyType<Events.RequestPermission, 'payload'>) => void,
    ): void;
    (
        type: $PropertyType<Events.RequestConfirmation, 'type'>,
        cb: (event: $PropertyType<Events.RequestConfirmation, 'payload'>) => void,
    ): void;
    (
        type: $PropertyType<Events.UnexpectedDeviceMode, 'type'>,
        cb: (event: $PropertyType<Events.UnexpectedDeviceMode, 'payload'>) => void,
    ): void;
    (
        type: $PropertyType<Events.FirmwareException, 'type'>,
        cb: (event: $PropertyType<Events.FirmwareException, 'payload'>) => void,
    ): void;
    <R>(
        type: typeof CONSTANTS.UI.BUNDLE_PROGRESS,
        cb: (event: $PropertyType<Events.BundleProgress<R>, 'payload'>) => void,
    ): void;
    (
        type: $PropertyType<Events.FirmwareProgress, 'type'>,
        cb: (event: $PropertyType<Events.FirmwareProgress, 'payload'>) => void,
    ): void;
    (
        type: $PropertyType<Events.CustomMessageRequest, 'type'>,
        cb: (event: $PropertyType<Events.CustomMessageRequest, 'payload'>) => void,
    ): void;
}

export type API = {
    /**
     * Set TrezorConnect manifest.
     */
    manifest: (params: P.Manifest) => void,

    /**
     * Initializes TrezorConnect.
     * `manifest` is required
     */
    init: (settings: { manifest: P.Manifest } & $Shape<P.ConnectSettings>) => Promise<void>,

    /**
     * Retrieves the settings that TrezorConnect was initialized with.
     */
    getSettings: () => P.Response<P.ConnectSettings>,

    dispose: () => void,

    cancel: (params?: string) => void,

    renderWebUSBButton: () => void,

    disableWebUSB: () => void,

    /**
     * Event listeners
     */
    on: Emitter,
    off: Emitter,
    removeAllListeners: () => void,

    uiResponse: (response: Events.UiResponse) => void,

    /**
     * Backend operations
     */
    blockchainEstimateFee: Method<
        Blockchain.BlockchainEstimateFee,
        Blockchain.BlockchainEstimatedFee,
    >,
    blockchainGetAccountBalanceHistory: Method<
        Blockchain.BlockchainGetAccountBalanceHistory,
        Blockchain.BlockchainAccountBalanceHistory[],
    >,
    blockchainGetCurrentFiatRates: Method<
        Blockchain.BlockchainGetCurrentFiatRates,
        Blockchain.BlockchainTimestampedFiatRates,
    >,
    blockchainGetFiatRatesForTimestamps: Method<
        Blockchain.BlockchainGetFiatRatesForTimestamps,
        Blockchain.BlockchainFiatRatesForTimestamps,
    >,
    blockchainGetTransactions: Method<
        Blockchain.BlockchainGetTransactions,
        Blockchain.BlockchainTransactions,
    >,
    blockchainSetCustomBackend: Method<Blockchain.BlockchainSetCustomBackend, boolean>,
    blockchainSubscribe: Method<Blockchain.BlockchainSubscribe, Blockchain.BlockchainSubscribed>,
    blockchainSubscribeFiatRates: Method<
        Blockchain.BlockchainSubscribeFiatRates,
        Blockchain.BlockchainSubscribed,
    >,
    blockchainUnsubscribe: Method<Blockchain.BlockchainSubscribe, Blockchain.BlockchainSubscribed>,
    blockchainUnsubscribeFiatRates: Method<
        Blockchain.BlockchainSubscribeFiatRates,
        Blockchain.BlockchainSubscribed,
    >,
    blockchainDisconnect: Method<
        Blockchain.BlockchainDisconnect,
        Blockchain.BlockchainDisconnected,
    >,

    /**
     * Bitcoin and Bitcoin-like
     * Display requested address derived by given BIP32 path on device and
     * returns it to caller. User is asked to confirm the export on Trezor.
     */
    getAddress: Bundled<Bitcoin.GetAddress, Bitcoin.Address>,

    /**
     * Bitcoin and Bitcoin-like
     * Retrieves BIP32 extended public derived by given BIP32 path.
     * User is presented with a description of the requested key and asked to
     * confirm the export.
     */
    getPublicKey: Bundled<Bitcoin.GetPublicKey, Bitcoin.HDNodeResponse>,

    /**
     * Bitcoin and Bitcoin-like
     * Asks device to sign given inputs and outputs of pre-composed transaction.
     * User is asked to confirm all transaction details on Trezor.
     */
    signTransaction: Method<Bitcoin.SignTransaction, Bitcoin.SignedTransaction>,

    /**
     * Bitcoin, Bitcoin-like, Ethereum-like, Ripple
     * Broadcasts the transaction to the selected network.
     */
    pushTransaction: Method<Bitcoin.PushTransaction, Bitcoin.PushedTransaction>,

    /**
     * Bitcoin and Bitcoin-like
     * Requests a payment from the users wallet to a set of given outputs.
     * Internally a BIP-0044 account discovery is performed and user is presented
     * with a list of accounts. After account selection user is presented with
     * list of fee selection. After selecting a fee transaction is signed and
     * returned in hexadecimal format. Change output is added automatically, if
     * needed.
     */
    composeTransaction: Mixed<
        Account.ComposeParams,
        Account.PrecomposeParams,
        Bitcoin.SignedTransaction,
        Account.PrecomposedTransaction[],
    >,

    /**
     * Bitcoin, Bitcoin-like, Ethereum-like, Ripple
     * Gets an info of specified account.
     */
    getAccountInfo: Bundled<Account.GetAccountInfo, Account.AccountInfo>,

    /**
     * Bitcoin and Bitcoin-like
     * Asks device to sign a message using the private key derived by given BIP32
     * path.
     */
    signMessage: Method<Bitcoin.SignMessage, Protobuf.MessageSignature>,

    /**
     * Bitcoin and Bitcoin-like
     * Asks device to verify a message using the signer address and signature.
     */
    verifyMessage: Method<Bitcoin.VerifyMessage, P.DefaultMessage>,

    // Binance
    binanceGetAddress: Bundled<Binance.BinanceGetAddress, Binance.BinanceAddress>,
    binanceGetPublicKey: Bundled<Binance.BinanceGetPublicKey, Binance.BinancePublicKey>,
    binanceSignTransaction: Method<Binance.BinanceSignTransaction, Protobuf.BinanceSignedTx>,

    // Cardano (ADA)
    cardanoGetAddress: Bundled<Cardano.CardanoGetAddress, Cardano.CardanoAddress>,
    cardanoGetNativeScriptHash: Method<
        Cardano.CardanoGetNativeScriptHash,
        Cardano.CardanoNativeScriptHash,
    >,
    cardanoGetPublicKey: Bundled<Cardano.CardanoGetPublicKey, Cardano.CardanoPublicKey>,
    cardanoSignTransaction: Method<Cardano.CardanoSignTransaction, Cardano.CardanoSignedTxData>,

    // EOS
    eosGetPublicKey: Bundled<EOS.EosGetPublicKey, EOS.EosPublicKey>,
    eosSignTransaction: Method<EOS.EosSignTransaction, Protobuf.EosSignedTx>,

    // Ethereum and Ethereum-like
    ethereumGetAddress: Bundled<Ethereum.EthereumGetAddress, Ethereum.EthereumAddress>,
    ethereumGetPublicKey: Bundled<Ethereum.EthereumGetPublicKey, Bitcoin.HDNodeResponse>,
    ethereumSignTransaction: Method<Ethereum.EthereumSignTransaction, Ethereum.EthereumSignedTx>,
    ethereumSignMessage: Method<Ethereum.EthereumSignMessage, Protobuf.EthereumMessageSignature>,
    ethereumSignTypedData: Method<
        Ethereum.EthereumSignTypedData | Ethereum.EthereumSignTypedHashAndData,
        Protobuf.EthereumTypedDataSignature,
    >,

    ethereumVerifyMessage: Method<Ethereum.EthereumVerifyMessage, P.DefaultMessage>,

    // NEM
    nemGetAddress: Bundled<NEM.NEMGetAddress, NEM.NEMAddress>,
    nemSignTransaction: Method<NEM.NEMSignTransaction, Protobuf.NEMSignedTx>,

    // Ripple
    rippleGetAddress: Bundled<Ripple.RippleGetAddress, Ripple.RippleAddress>,
    rippleSignTransaction: Method<Ripple.RippleSignTransaction, Ripple.RippleSignedTx>,

    // Stellar
    stellarGetAddress: Bundled<Stellar.StellarGetAddress, Stellar.StellarAddress>,
    stellarSignTransaction: Method<Stellar.StellarSignTransaction, Stellar.StellarSignedTx>,

    // // Tezos
    tezosGetAddress: Bundled<Tezos.TezosGetAddress, Tezos.TezosAddress>,
    tezosGetPublicKey: Bundled<Tezos.TezosGetPublicKey, Tezos.TezosPublicKey>,
    tezosSignTransaction: Method<Tezos.TezosSignTransaction, Protobuf.TezosSignedTx>,

    /**
     * Challenge-response authentication via Trezor.
     * To protect against replay attacks you should use a server-side generated
     * and randomized challengeHidden for every attempt. You can also provide a
     * visual challenge that will be shown on the device.
     */
    requestLogin: Mixed<Misc.RequestLoginAsync, Misc.LoginChallenge, Misc.Login, Misc.Login>,

    /**
     * Asks device to encrypt value using the private key derived by given BIP32
     * path and the given key. IV is always computed automatically.
     */
    cipherKeyValue: Bundled<Misc.CipherKeyValue, Misc.CipheredValue>,

    /**
     * Retrieves the set of features associated with the device.
     */
    getFeatures: Method<{}, Device.Features>,

    /**
     * Retrieves device state associated with passphrase.
     */
    getDeviceState: Method<{}, Device.DeviceStateResponse>,

    /**
     * Resets device to factory defaults and removes all private data.
     */
    wipeDevice: Method<{}, P.DefaultMessage>,

    /**
     * Performs device setup and generates a new seed.
     */
    resetDevice: Method<Mgmnt.ResetDevice, P.DefaultMessage>,

    /**
     * Applies device setup
     */
    applySettings: Method<Protobuf.ApplySettings, P.DefaultMessage>,

    /**
     * Increment saved flag on device
     */
    applyFlags: Method<Mgmnt.ApplyFlags, P.DefaultMessage>,

    /**
     * Change pin
     */
    changePin: Method<Mgmnt.ChangePin, P.DefaultMessage>,

    /**
     * Sends FirmwareErase message followed by FirmwareUpdate message
     */
    firmwareUpdate: Mixed<
        Mgmnt.FirmwareUpdate,
        Mgmnt.FirmwareUpdateBinary,
        P.DefaultMessage,
        P.DefaultMessage,
    >,

    /**
     * Asks device to initiate seed backup procedure
     */
    backupDevice: Method<{}, P.DefaultMessage>,

    /**
     * Ask device to initiate recovery procedure
     */
    recoveryDevice: Method<Mgmnt.RecoveryDevice, P.DefaultMessage>,

    /**
     * Get static coin info
     */
    getCoinInfo: Method<CoinInfo.GetCoinInfo, CoinInfo.CoinInfo>,

    /**
     * Reboots device (currently only T1 with fw >= 1.10.0) in bootloader mode
     */
    rebootToBootloader: Method<{}, P.DefaultMessage>,

    /**
     * Set tor proxy for @trezor/blockchain-link connections
     */
    setProxy: Method<Misc.SetProxy, Protobuf.Success>,

    // // Developer mode
    customMessage: Method<Misc.CustomMessage, any>,
};
