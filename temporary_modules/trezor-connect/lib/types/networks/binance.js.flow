/* @flow */
import type { BinanceTransferMsg, BinanceOrderMsg, BinanceCancelMsg } from '../trezor/protobuf';

// get address
export type BinanceGetAddress = {
    path: string | number[],
    address?: string,
    showOnTrezor?: boolean,
};

export type BinanceAddress = {
    address: string,
    path: number[],
    serializedPath: string,
};

// get public key
export type BinanceGetPublicKey = {
    path: string | number[],
    showOnTrezor?: boolean,
};

export type BinancePublicKey = {
    publicKey: string,
    path: number[],
    serializedPath: string,
};

// sign transaction
// fields taken from https://github.com/binance-chain/javascript-sdk/blob/master/src/tx/index.js

export type BinanceSDKTransaction = {
    chain_id: string,
    account_number?: number, // default 0
    memo?: string,
    sequence?: number, // default 0
    source?: number, // default 0

    transfer?: BinanceTransferMsg,
    placeOrder?: BinanceOrderMsg,
    cancelOrder?: BinanceCancelMsg,
};

export type BinancePreparedMessage =
    | (BinanceTransferMsg & {
          type: 'BinanceTransferMsg',
      })
    | (BinanceOrderMsg & {
          type: 'BinanceOrderMsg',
      })
    | (BinanceCancelMsg & {
          type: 'BinanceCancelMsg',
      });

export type BinancePreparedTransaction = BinanceSDKTransaction & {
    messages: BinancePreparedMessage[],
};

export type BinanceSignTransaction = {
    path: string | number[],
    transaction: BinanceSDKTransaction,
};
