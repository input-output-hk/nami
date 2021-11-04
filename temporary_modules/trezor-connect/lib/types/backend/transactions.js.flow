/* @flow */

// copy-paste from blockchain-link

export type VinVout = {
    n: number,
    addresses?: string[],
    isAddress: boolean,
    value?: string,
    coinbase?: string,
    txid?: string,
    vout?: number,
    sequence?: number,
    hex?: string,
};

export type BlockbookTransaction = {
    txid: string,
    version?: number,
    vin: VinVout[],
    vout: VinVout[],
    blockHeight: number,
    blockHash?: string,
    confirmations: number,
    blockTime: number,
    lockTime?: number,
    value: string,
    valueIn: string,
    fees: string,
    hex: string,
    ethereumSpecific?: {
        status: number,
        nonce: number,
        data?: string,
        gasLimit: number,
        gasUsed?: number,
        gasPrice: string,
    },
    tokenTransfers?: {
        from?: string,
        to?: string,
        value: string,
        token: string,
        name: string,
        symbol: string,
        decimals?: number,
    }[],
};

// ripple-lib

type RippleLibAmount = {
    value: string,
    currency: string,
    issuer?: string,
    counterparty?: string,
};

type RippleLibAdjustment = {
    address: string,
    amount: RippleLibAmount,
    tag?: number,
};

type RippleLibMemo = {
    type?: string,
    format?: string,
    data?: string,
};

type RippleLibOutcome = {
    result: string,
    ledgerVersion: number,
    indexInLedger: number,
    fee: string,
    balanceChanges: {
        [key: string]: RippleLibAmount[],
    },
    orderbookChanges: any,
    timestamp?: string,
};

export type RippleLibTransaction = {
    type: string,
    specification: {
        source: RippleLibAdjustment,
        destination: RippleLibAdjustment,
        paths?: string,
        memos?: RippleLibMemo[],
        invoiceID?: string,
        allowPartialPayment?: boolean,
        noDirectRipple?: boolean,
        limitQuality?: boolean,
    },
    outcome: RippleLibOutcome,
    id: string,
    address: string,
    sequence: number,
};

export type TypedRawTransaction =
    | {
          type: 'blockbook',
          tx: BlockbookTransaction,
      }
    | {
          type: 'ripple',
          tx: RippleLibTransaction,
      };
