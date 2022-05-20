/* @flow */
import { BLOCKCHAIN } from '../../constants';
import type { CoinInfo } from '../networks/coinInfo';
import type { AccountAddresses, AccountTransaction, FeeLevel } from '../account';
import type { TypedRawTransaction } from './transactions';
import type { CoreMessage } from '../params';

export type BlockchainInfo = {
    coin: CoinInfo,
    url: string,
    cleanUrl?: string,
    blockHash: string,
    blockHeight: number,
    decimals: number,
    name: string,
    shortcut: string,
    testnet: boolean,
    version: string,
    misc?: {
        reserve?: string,
    },
};

export type BlockchainBlock = {
    blockHash: string,
    blockHeight: number,
    coin: CoinInfo,
};

export type BlockchainError = {
    coin: CoinInfo,
    error: string,
    code?: string,
};
export type BlockchainNotification = {
    coin: CoinInfo,
    notification: {
        descriptor: string,
        tx: AccountTransaction,
    },
};

export type BlockchainFiatRates = {
    [string]: ?number,
};

export type BlockchainFiatRatesUpdate = {
    coin: CoinInfo,
    rates: BlockchainFiatRates,
};

export type BlockchainSubscribeAccount = {
    descriptor: string,
    addresses?: AccountAddresses, // bitcoin addresses
};

export type BlockchainSubscribeFiatRates = {
    currency?: string,
    coin: string,
};

export type BlockchainSubscribe = {
    accounts?: BlockchainSubscribeAccount[],
    coin: string,
};

export type BlockchainSubscribed = {
    subscribed: boolean,
};

export type BlockchainDisconnect = {
    coin: string,
};

export type BlockchainDisconnected = {
    disconnected: boolean,
};

export type BlockchainGetTransactions = {
    coin: string,
    txs: string[],
};

export type BlockchainGetCurrentFiatRates = {
    coin: string,
    currencies?: string[],
};

export type BlockchainTimestampedFiatRates = {
    ts: number,
    rates: BlockchainFiatRates,
};

export type BlockchainGetFiatRatesForTimestamps = {
    coin: string,
    timestamps: number[],
};

export type BlockchainFiatRatesForTimestamps = {
    tickers: BlockchainTimestampedFiatRates[],
};

export type BlockchainGetAccountBalanceHistory = {
    coin: string,
    descriptor: string,
    from?: number,
    to?: number,
    groupBy?: number,
};

export type BlockchainAccountBalanceHistory = {
    time: number,
    txs: number,
    received: string,
    sent: string,
    sentToSelf?: string,
    rates: BlockchainFiatRates,
};

export type BlockchainTransactions = TypedRawTransaction[];

export type BlockchainEstimateFee = {
    coin: string,
    request?: {
        blocks?: number[],
        specific?: {
            conservative?: boolean,
            data?: string,
            from?: string,
            to?: string,
            value?: string,
            txsize?: number,
        },
        feeLevels?: 'preloaded' | 'smart',
    },
};

export type BlockchainEstimatedFee = {
    blockTime: number,
    minFee: number,
    maxFee: number,
    levels: FeeLevel[],
    dustLimit?: number,
};

export type BlockchainSetCustomBackend = {
    coin: string,
    blockchainLink?: $PropertyType<CoinInfo, 'blockchainLink'>,
};

export type BlockchainEvent =
    | {
          type: typeof BLOCKCHAIN.CONNECT,
          payload: BlockchainInfo,
      }
    | {
          type: typeof BLOCKCHAIN.ERROR,
          payload: BlockchainError,
      }
    | {
          type: typeof BLOCKCHAIN.BLOCK,
          payload: BlockchainBlock,
      }
    | {
          type: typeof BLOCKCHAIN.NOTIFICATION,
          payload: BlockchainNotification,
      }
    | {
          type: typeof BLOCKCHAIN.FIAT_RATES_UPDATE,
          payload: BlockchainFiatRatesUpdate,
      };

export interface BlockchainMessageBuilder {
    (type: typeof BLOCKCHAIN.CONNECT, payload: BlockchainInfo): CoreMessage;
    (type: typeof BLOCKCHAIN.BLOCK, payload: BlockchainBlock): CoreMessage;
    (type: typeof BLOCKCHAIN.NOTIFICATION, payload: BlockchainNotification): CoreMessage;
    (type: typeof BLOCKCHAIN.ERROR, payload: BlockchainError): CoreMessage;
    (type: typeof BLOCKCHAIN.FIAT_RATES_UPDATE, payload: BlockchainFiatRatesUpdate): CoreMessage;
}
