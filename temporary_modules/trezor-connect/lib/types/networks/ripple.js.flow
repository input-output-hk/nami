/* @flow */

// get address

export type RippleGetAddress = {
    path: string | number[],
    address?: string,
    showOnTrezor?: boolean,
    useEventListener?: boolean, // set automatically if UI.ADDRESS_VALIDATION listener is used
};

export type RippleAddress = {
    address: string,
    path: number[],
    serializedPath: string,
};

// sign transaction

type Payment = {
    amount: string,
    destination: string,
    destinationTag?: number,
};

export type RippleTransaction = {
    fee: string,
    flags?: number,
    sequence: number,
    maxLedgerVersion?: number, // Proto: "last_ledger_sequence"
    payment: Payment,
};

export type RippleSignTransaction = {
    path: string | number[],
    transaction: RippleTransaction,
};

export type RippleSignedTx = {
    serializedTx: string,
    signature: string,
};
